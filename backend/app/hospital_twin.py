from datetime import datetime, timezone
import uuid
from typing import List, Dict, Any, Optional
from app.models import (
    Patient, Bed, TransferRecommendation, Alert, WardSummary, HospitalState, HospitalKPIs, Vitals
)
from app.mock_patients import get_initial_hospital_data
from app.clinical_engine import evaluate_patient_clinical_status
from app.bed_allocator import BedAllocationOptimizer

class HospitalDigitalTwin:
    def __init__(self):
        beds, patients = get_initial_hospital_data()
        self.beds: List[Bed] = beds
        self.patients: List[Patient] = patients
        self.recommendations: List[TransferRecommendation] = []
        self.active_alerts: List[Alert] = []
        self.alert_history: List[Alert] = []
        self.simulation_running: bool = True
        self.simulation_speed: float = 1.0
        self.tick_counter: int = 0
        self.alerts_today_count: int = 7  # Initialized to match Slide 07

        # Seed initial alert history
        self.seed_initial_alerts()

        # Run bed optimizer
        self.run_bed_optimizer()

    def seed_initial_alerts(self):
        now_str = datetime.now(timezone.utc).isoformat()
        initial_samples = [
            ("SIM-104", "Arthur Pendelton", "WA-04", "Ward-A", "CRITICAL", "HIGH", "Acute deterioration (NEWS2: 18, ↑ worsening). Urgent clinical review required.", "NEWS2_DECOMPENSATION", 18),
            ("SIM-117", "Eleanor Vance", "WB-04", "Ward-B", "WARNING", "MEDIUM", "Progressive tachypnea & fever (NEWS2: 6, ↗ rising). Repeat observations within 1 hour.", "NEWS2_ELEVATION", 6),
            ("SIM-109", "Robert MacIntyre", "ICU-01", "ICU", "CRITICAL", "HIGH", "Ventilated ARDS inotropic requirement (NEWS2: 12). ICU care plan active.", "VENTILATOR_TELEMETRY", 12),
            ("SIM-111", "Tariq Al-Mansoor", "ICU-03", "ICU", "CRITICAL", "HIGH", "Post-trauma respiratory fatigue (NEWS2: 9). Flail chest management.", "ACUTE_TRAUMA", 9),
            ("SIM-105", "Clara Higgins", "WB-01", "Ward-B", "WARNING", "MEDIUM", "Pyelonephritis tachycardia spike (NEWS2: 5). IV fluid response monitoring.", "FEBRILE_EPISODE", 5),
            ("SIM-102", "Beatrice Thorne", "WA-02", "Ward-A", "WARNING", "MEDIUM", "COPD Scale 2 baseline desaturation (NEWS2: 5). Target 88-92% maintained.", "PULMONARY_MONITORING", 5),
            ("SIM-123", "Grace Hopper", "HDU-04", "HDU", "WARNING", "MEDIUM", "Contact isolation bed occupied. Fluid balance protocol active.", "ISOLATION_AUDIT", 5),
        ]
        for pid, name, bid, ward, sev, risk, msg, trig, score in initial_samples:
            a = Alert(
                id=f"ALT-{uuid.uuid4().hex[:6].upper()}",
                timestamp=now_str,
                patient_id=pid,
                patient_name=name,
                bed_id=bid,
                ward=ward,
                severity=sev,
                risk_band=risk,
                message=msg,
                trigger=trig,
                inputs_changed=["Respiration Rate", "Heart Rate"],
                recommendation_summary="Urgent review" if risk == "HIGH" else "Repeat observations",
                news2_score=score
            )
            self.active_alerts.append(a)
            self.alert_history.append(a)

    def get_patient(self, patient_id: str) -> Optional[Patient]:
        return next((p for p in self.patients if p.id == patient_id), None)

    def get_bed(self, bed_id: str) -> Optional[Bed]:
        return next((b for b in self.beds if b.id == bed_id), None)

    def apply_degradation_slider(self, patient_id: str, slider_val: float, scenario: Optional[str] = None) -> Patient:
        patient = self.get_patient(patient_id)
        if not patient:
            raise ValueError(f"Patient {patient_id} not found")

        patient.degradation_slider_value = slider_val
        patient.is_synthetic_degraded = (slider_val > 0.0)
        patient.degradation_scenario = scenario

        factor = slider_val / 100.0

        if scenario == "Silent Sepsis":
            target_hr = 74 + (58 * factor)
            target_sbp = 124 - (42 * factor)
            target_dbp = 78 - (28 * factor)
            target_rr = 15 + (15 * factor)
            target_spo2 = 98 - (12 * factor)
            target_temp = 36.8 + (2.6 * factor)
            consciousness = "A" if factor < 0.4 else ("C" if factor < 0.75 else "V")
            on_o2 = factor > 0.3
            o2_liters = round(factor * 6.0, 1)

        elif scenario == "Sudden ARDS":
            target_hr = 74 + (46 * factor)
            target_sbp = 124 - (18 * factor)
            target_dbp = 78 - (12 * factor)
            target_rr = 15 + (22 * factor)
            target_spo2 = 98 - (20 * factor)
            target_temp = 37.0 + (1.2 * factor)
            consciousness = "A" if factor < 0.5 else "C"
            on_o2 = True
            o2_liters = round(max(2.0, factor * 10.0), 1)

        elif scenario == "Post-Op Hemorrhage":
            target_hr = 74 + (65 * factor)
            target_sbp = 124 - (54 * factor)
            target_dbp = 78 - (40 * factor)
            target_rr = 15 + (12 * factor)
            target_spo2 = 98 - (8 * factor)
            target_temp = 36.8 - (1.6 * factor)
            consciousness = "A" if factor < 0.35 else ("C" if factor < 0.7 else "P")
            on_o2 = factor > 0.25
            o2_liters = round(factor * 4.0, 1)

        else: # Standard / Recovery
            target_hr = 74 + (52 * factor)
            target_sbp = 124 - (38 * factor)
            target_dbp = 78 - (24 * factor)
            target_rr = 15 + (14 * factor)
            target_spo2 = 98 - (10 * factor)
            target_temp = 36.8 + (2.0 * factor)
            consciousness = "A" if factor < 0.4 else ("C" if factor < 0.75 else "V")
            on_o2 = factor > 0.3
            o2_liters = round(factor * 4.0, 1)

        new_vitals = Vitals(
            heart_rate=round(target_hr, 1),
            systolic_bp=round(target_sbp, 1),
            diastolic_bp=round(target_dbp, 1),
            respiration_rate=round(target_rr, 1),
            spo2=round(max(70.0, min(100.0, target_spo2)), 1),
            temperature=round(target_temp, 1),
            consciousness=consciousness,
            on_supplemental_oxygen=on_o2,
            oxygen_liters=o2_liters,
            use_scale2=patient.current_vitals.use_scale2,
            timestamp=datetime.now(timezone.utc).isoformat()
        )

        patient.current_vitals = new_vitals
        patient.vitals_history.append(new_vitals)
        if len(patient.vitals_history) > 30:
            patient.vitals_history.pop(0)

        patient.clinical_status = evaluate_patient_clinical_status(
            patient.current_vitals, patient.vitals_history
        )

        self.run_bed_optimizer()
        return patient

    def replay_benchmark_scenario(self, scenario_key: str):
        """Replays standardized clinical validation scenarios from Slide 09."""
        if scenario_key == "baseline_stable":
            for p in self.patients:
                self.apply_degradation_slider(p.id, 0.0, None)

        elif scenario_key == "sepsis_progression":
            # Slide 07: SIM-104 acute sepsis progression
            self.apply_degradation_slider("SIM-104", 85.0, "Silent Sepsis")

        elif scenario_key == "ards_collapse":
            self.apply_degradation_slider("SIM-117", 80.0, "Sudden ARDS")

        elif scenario_key == "hemorrhagic_shock":
            self.apply_degradation_slider("SIM-121", 85.0, "Post-Op Hemorrhage")

        elif scenario_key == "recovery":
            self.apply_degradation_slider("SIM-104", 0.0, None)
            self.apply_degradation_slider("SIM-117", 0.0, None)

    def run_bed_optimizer(self):
        recs, alerts = BedAllocationOptimizer.evaluate_allocations(
            self.patients, self.beds, self.recommendations
        )
        self.recommendations = recs
        for a in alerts:
            self.active_alerts.insert(0, a)
            self.alert_history.insert(0, a)
            self.alerts_today_count += 1

        if len(self.active_alerts) > 30:
            self.active_alerts = self.active_alerts[:30]

    def execute_bed_transfer(self, recommendation_id: str) -> Dict[str, Any]:
        rec = next((r for r in self.recommendations if r.id == recommendation_id), None)
        if not rec:
            raise ValueError(f"Recommendation {recommendation_id} not found")

        patient = self.get_patient(rec.patient_id)
        if not patient:
            raise ValueError(f"Patient {rec.patient_id} not found")

        old_bed = self.get_bed(patient.current_bed_id)
        target_bed = self.get_bed(rec.target_bed_id)
        now_str = datetime.now(timezone.utc).isoformat()

        cascading_info = None
        if rec.cascading_stepdown:
            stepdown = rec.cascading_stepdown
            stepdown_p = self.get_patient(stepdown.source_patient_id)
            stepdown_bed = self.get_bed(stepdown.recommended_target_bed_id)

            if stepdown_p and stepdown_bed:
                stepdown_p.current_bed_id = stepdown_bed.id
                stepdown_p.current_ward = stepdown_bed.ward
                stepdown_bed.current_patient_id = stepdown_p.id
                stepdown_bed.status = "occupied"
                cascading_info = {
                    "stepdown_patient": stepdown_p.name,
                    "from_bed": stepdown.current_bed_id,
                    "to_bed": stepdown_bed.id,
                    "ward": stepdown_bed.ward
                }

        if old_bed:
            old_bed.current_patient_id = None
            old_bed.status = "available"

        if target_bed:
            target_bed.current_patient_id = patient.id
            target_bed.status = "occupied"

        patient.current_bed_id = rec.target_bed_id
        patient.current_ward = rec.target_ward
        rec.status = "COMPLETED"

        completion_alert = Alert(
            id=f"ALT-{uuid.uuid4().hex[:6].upper()}",
            timestamp=now_str,
            patient_id=patient.id,
            patient_name=patient.name,
            bed_id=patient.current_bed_id,
            ward=patient.current_ward,
            severity="INFO",
            risk_band=patient.clinical_status.news2.risk_level,
            message=f"TRANSFER CONFIRMED: {patient.name} safely relocated to {patient.current_bed_id} ({patient.current_ward}).",
            trigger="BED_TRANSFER_COMPLETED",
            inputs_changed=[],
            recommendation_summary="Transfer executed with clinical & bed manager oversight",
            news2_score=patient.clinical_status.news2.total_score,
            acknowledged=True
        )
        self.active_alerts.insert(0, completion_alert)
        self.alert_history.insert(0, completion_alert)

        return {
            "success": True,
            "patient_id": patient.id,
            "new_bed_id": patient.current_bed_id,
            "new_ward": patient.current_ward,
            "cascading_completed": cascading_info is not None,
            "cascading_details": cascading_info
        }

    def calculate_ward_summaries(self) -> List[WardSummary]:
        ward_names = {
            "Ward-A": ("Ward-A (Surgical & Post-Op)", "General"),
            "Ward-B": ("Ward-B (Acute Medical & Pulmonary)", "General"),
            "HDU": ("High Dependency Unit (HDU)", "HDU"),
            "ICU": ("Intensive Care Unit (ICU)", "ICU")
        }
        summaries = []
        for ward_id, (name, tier) in ward_names.items():
            ward_beds = [b for b in self.beds if b.ward == ward_id]
            total = len(ward_beds)
            occupied = len([b for b in ward_beds if b.status == "occupied"])
            available = len([b for b in ward_beds if b.status == "available"])
            occ_rate = round((occupied / total * 100), 1) if total > 0 else 0.0

            ward_patients = [p for p in self.patients if p.current_ward == ward_id]
            crit_count = sum(1 for p in ward_patients if p.clinical_status.news2.risk_level in ["HIGH", "MEDIUM"])
            avg_news2 = (
                round(sum(p.clinical_status.news2.total_score for p in ward_patients) / len(ward_patients), 1)
                if ward_patients else 0.0
            )

            summaries.append(WardSummary(
                ward_id=ward_id,
                ward_name=name,
                tier=tier,
                total_beds=total,
                occupied_beds=occupied,
                available_beds=available,
                occupancy_rate=occ_rate,
                critical_patients_count=crit_count,
                average_news2=avg_news2
            ))
        return summaries

    def compute_kpis(self) -> HospitalKPIs:
        high = sum(1 for p in self.patients if p.clinical_status.news2.risk_level == "HIGH")
        medium = sum(1 for p in self.patients if p.clinical_status.news2.risk_level == "MEDIUM")
        low = sum(1 for p in self.patients if p.clinical_status.news2.risk_level == "LOW")
        avail = sum(1 for b in self.beds if b.status == "available")
        icu_beds = [b for b in self.beds if b.ward == "ICU"]
        icu_occ = (len([b for b in icu_beds if b.status == "occupied"]) / len(icu_beds) * 100) if icu_beds else 0.0

        return HospitalKPIs(
            total_patients=len(self.patients),
            high_risk_count=high,
            medium_risk_count=medium,
            low_risk_count=low,
            beds_available=avail,
            alerts_today=self.alerts_today_count,
            icu_occupancy_pct=round(icu_occ, 1),
            detection_latency_ms=380.0
        )

    def compute_bottleneck_forecast(self) -> Dict[str, Any]:
        icu_beds = [b for b in self.beds if b.ward == "ICU"]
        icu_occupied = len([b for b in icu_beds if b.status == "occupied"])
        icu_total = len(icu_beds)

        deteriorating = [
            p for p in self.patients
            if p.current_ward in ["Ward-A", "Ward-B"]
            and (p.clinical_status.news2.total_score >= 5 or p.clinical_status.trend_signals.trend_symbol == "↑ worsening")
        ]

        if icu_occupied >= icu_total and deteriorating:
            risk = "CRITICAL_BOTTLENECK"
            headline = f"ICU at 100% Capacity ({icu_occupied}/{icu_total}). {len(deteriorating)} acute ward patient(s) need escalation."
            eta = "Immediate / 30 mins"
        elif deteriorating:
            risk = "MODERATE_WARNING"
            headline = f"Ward Decompensation Detected ({len(deteriorating)} acute cases). Available ICU beds: {icu_total - icu_occupied}."
            eta = "45 mins"
        else:
            risk = "BALANCED"
            headline = "Bed Capacity & Patient Flows Balanced."
            eta = "Stable"

        return {
            "bottleneck_risk": risk,
            "headline": headline,
            "estimated_time_to_gridlock": eta,
            "icu_occupancy_pct": round(icu_occupied / icu_total * 100, 1),
            "deteriorating_ward_patients": len(deteriorating),
            "stepdown_candidates": len([
                p for p in self.patients
                if p.current_ward in ["ICU", "HDU"] and p.clinical_status.news2.total_score <= 1
            ])
        }

    def get_state(self) -> HospitalState:
        return HospitalState(
            timestamp=datetime.now(timezone.utc).isoformat(),
            simulation_running=self.simulation_running,
            simulation_speed=self.simulation_speed,
            kpis=self.compute_kpis(),
            wards=self.calculate_ward_summaries(),
            beds=self.beds,
            patients=self.patients,
            recommendations=[r for r in self.recommendations if r.status == "PENDING"],
            active_alerts=self.active_alerts[:15],
            bottleneck_forecast=self.compute_bottleneck_forecast()
        )
