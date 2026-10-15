from datetime import datetime, timezone
import uuid
from typing import List, Tuple, Optional
from app.models import Patient, Bed, TransferRecommendation, RankedBedOption, CascadingStepDown, Alert

class BedAllocationOptimizer:
    """
    Constraint-based Bed Optimizer adhering to Slide 06:
    - Check current bed status & turnover
    - Match care level, isolation needs, and specialty requirements
    - Ranked options with readable explanations
    - Human-in-the-loop: No autonomous transfer decisions
    """

    @staticmethod
    def evaluate_allocations(
        patients: List[Patient],
        beds: List[Bed],
        existing_recommendations: List[TransferRecommendation]
    ) -> Tuple[List[TransferRecommendation], List[Alert]]:
        recommendations = [r for r in existing_recommendations if r.status == "PENDING"]
        new_alerts = []
        now_str = datetime.now(timezone.utc).isoformat()

        pending_patient_ids = {r.patient_id for r in recommendations}

        for patient in patients:
            news2 = patient.clinical_status.news2
            score = news2.total_score
            has_red = news2.has_red_score
            shock_index = patient.clinical_status.shock_index
            ward = patient.current_ward

            # Escalation thresholds
            requires_icu = (score >= 7 or (score >= 5 and shock_index >= 1.0)) and ward != "ICU"
            requires_hdu = (not requires_icu) and (score >= 5 or has_red or shock_index >= 0.9) and ward in ["Ward-A", "Ward-B"]

            if not (requires_icu or requires_hdu):
                continue

            if patient.id in pending_patient_ids:
                continue

            target_tier = "ICU" if requires_icu else "HDU"
            urgency = "CRITICAL_IMMEDIATE" if (score >= 7 or shock_index >= 1.0) else "URGENT_1H"

            # Rank candidate beds based on constraints
            ranked_options: List[RankedBedOption] = []
            available_beds = [b for b in beds if b.status == "available"]

            for b in available_beds:
                # Match score calculation
                tier_match = 40 if b.tier == target_tier else (20 if b.tier in ["HDU", "ICU"] else 0)
                
                # Isolation matching
                iso_match = True
                if patient.isolation_needed != "Standard":
                    iso_match = (b.isolation_capable == patient.isolation_needed)
                iso_points = 30 if iso_match else -20

                # Specialty/equipment matching
                equip_match = True
                if "Ventilator" in patient.required_specialties and not b.has_ventilator:
                    equip_match = False
                equip_points = 30 if equip_match else -10

                total_match = max(10, min(100, tier_match + iso_points + equip_points))

                fit_rationale = (
                    f"{b.tier} tier ({b.name}); "
                    f"{'Isolation matched (' + b.isolation_capable + ')' if iso_match else 'Warning: Isolation mismatch'}; "
                    f"{'Equipment ready' if equip_match else 'Equipment transfer required'}"
                )

                ranked_options.append(RankedBedOption(
                    rank=1,
                    bed_id=b.id,
                    ward=b.ward,
                    tier=b.tier,
                    match_score=total_match,
                    fit_rationale=fit_rationale,
                    isolation_matched=iso_match,
                    equipment_matched=equip_match,
                    estimated_turnover_minutes=b.expected_turnover_minutes
                ))

            # Sort options by match score descending
            ranked_options.sort(key=lambda x: x.match_score, reverse=True)
            for idx, opt in enumerate(ranked_options):
                opt.rank = idx + 1

            # Cascading Step-down logic if target tier is full
            target_tier_available = [b for b in available_beds if b.tier == target_tier]
            cascading_plan: Optional[CascadingStepDown] = None

            if not target_tier_available:
                # Target tier full: Find step-down candidate
                candidates = [p for p in patients if p.current_ward == target_tier]
                candidates.sort(key=lambda p: (p.clinical_status.news2.total_score, p.clinical_status.shock_index))

                if candidates:
                    stable_p = candidates[0]
                    # Step down to HDU or General Ward
                    stepdown_target_ward = "HDU" if target_tier == "ICU" else "Ward-A"
                    stepdown_bed = next((b for b in available_beds if b.ward == stepdown_target_ward), None)
                    stepdown_bed_id = stepdown_bed.id if stepdown_bed else "HDU-03"

                    cascading_plan = CascadingStepDown(
                        source_patient_id=stable_p.id,
                        source_patient_name=stable_p.name,
                        current_bed_id=stable_p.current_bed_id,
                        current_ward=stable_p.current_ward,
                        recommended_target_bed_id=stepdown_bed_id,
                        recommended_target_ward=stepdown_target_ward,
                        clinical_stability_rationale=(
                            f"Patient {stable_p.name} has stabilized (NEWS2: {stable_p.clinical_status.news2.total_score}). "
                            f"Eligible for step-down to release critical {target_tier} bed."
                        )
                    )

            target_bed_id = ranked_options[0].bed_id if ranked_options else ("ICU-02" if cascading_plan else "HDU-OVERFLOW")
            target_ward = ranked_options[0].ward if ranked_options else target_tier

            # Explainable trigger string
            reasons = [c.parameter + f" ({c.measured_value}, +{c.points}pts)" for c in news2.contributions]
            explainable_trigger = f"NEWS2 {score} ({news2.risk_level}): " + "; ".join(reasons)

            rec = TransferRecommendation(
                id=f"REC-{uuid.uuid4().hex[:6].upper()}",
                timestamp=now_str,
                patient_id=patient.id,
                patient_name=patient.name,
                current_bed_id=patient.current_bed_id,
                current_ward=patient.current_ward,
                target_bed_id=target_bed_id,
                target_ward=target_ward,
                urgency=urgency,
                clinical_rationale=(
                    f"Escalation review suggested; {target_tier} capacity limited. "
                    f"Patient {patient.name} ({patient.id}) deteriorated to NEWS2 {score} with {patient.clinical_status.trend_signals.trend_symbol}. "
                    f"Shock Index: {shock_index:.2f}."
                ),
                explainable_trigger=explainable_trigger,
                next_best_action="Review eligible step-down / ICU options and confirm with bed manager.",
                required_resources=["Telemetry", "1:1 Nursing" if target_tier == "ICU" else "High-Flow O2"],
                isolation_needed=patient.isolation_needed,
                ranked_options=ranked_options[:3],
                cascading_stepdown=cascading_plan,
                status="PENDING"
            )
            recommendations.append(rec)

            new_alerts.append(Alert(
                id=f"ALT-{uuid.uuid4().hex[:6].upper()}",
                timestamp=now_str,
                patient_id=patient.id,
                patient_name=patient.name,
                bed_id=patient.current_bed_id,
                ward=patient.current_ward,
                severity="CRITICAL" if urgency == "CRITICAL_IMMEDIATE" else "WARNING",
                risk_band=news2.risk_level,
                message=f"Acute clinical deterioration: {patient.name} (NEWS2: {score}, {patient.clinical_status.trend_signals.trend_symbol}). Recommended review for bed {target_bed_id}.",
                trigger="NEWS2_DECOMPENSATION",
                inputs_changed=[c.parameter for c in news2.contributions],
                recommendation_summary=rec.next_best_action,
                news2_score=score
            ))

        return recommendations, new_alerts
