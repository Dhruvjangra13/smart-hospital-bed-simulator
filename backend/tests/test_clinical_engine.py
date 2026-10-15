from datetime import datetime, timezone
import pytest
from app.models import Vitals
from app.clinical_engine import (
    calculate_news2,
    evaluate_patient_clinical_status
)
from app.hospital_twin import HospitalDigitalTwin

def test_news2_normal():
    vitals = Vitals(
        heart_rate=72,
        systolic_bp=120,
        diastolic_bp=80,
        respiration_rate=16,
        spo2=98,
        temperature=37.0,
        consciousness="A",
        on_supplemental_oxygen=False,
        oxygen_liters=0.0,
        use_scale2=False,
        timestamp=datetime.now(timezone.utc).isoformat()
    )
    res = calculate_news2(vitals)
    assert res.total_score == 0
    assert res.risk_level == "LOW"
    assert not res.has_red_score
    assert len(res.contributions) == 0

def test_news2_extreme_septic_shock():
    vitals = Vitals(
        heart_rate=135,
        systolic_bp=85,
        diastolic_bp=50,
        respiration_rate=28,
        spo2=88,
        temperature=39.4,
        consciousness="V",
        on_supplemental_oxygen=True,
        oxygen_liters=6.0,
        use_scale2=False,
        timestamp=datetime.now(timezone.utc).isoformat()
    )
    res = calculate_news2(vitals)
    assert res.total_score >= 18
    assert res.risk_level == "HIGH"
    assert res.has_red_score
    # Verify explainable contributions were generated
    assert len(res.contributions) >= 5

def test_slide_07_patients_baseline():
    hospital = HospitalDigitalTwin()
    p104 = hospital.get_patient("SIM-104")
    p117 = hospital.get_patient("SIM-117")
    p121 = hospital.get_patient("SIM-121")

    assert p104 is not None
    assert p117 is not None
    assert p121 is not None

    # SIM-104 is HIGH, SIM-117 is MEDIUM, SIM-121 is LOW
    assert p104.clinical_status.news2.risk_level == "HIGH"
    assert p104.clinical_status.recommended_action == "Urgent clinical review"

    assert p117.clinical_status.news2.risk_level == "MEDIUM"
    assert p117.clinical_status.recommended_action == "Repeat observations"

    assert p121.clinical_status.news2.risk_level == "LOW"
    assert p121.clinical_status.recommended_action == "Continue simulated monitoring"

def test_slide_07_kpis():
    hospital = HospitalDigitalTwin()
    kpis = hospital.compute_kpis()

    assert kpis.total_patients == 24
    assert kpis.high_risk_count == 3
    assert kpis.beds_available == 5
    assert kpis.alerts_today >= 7

def test_ranked_bed_optimizer():
    hospital = HospitalDigitalTwin()
    recs = hospital.recommendations
    assert len(recs) > 0
    rec = recs[0]
    assert len(rec.ranked_options) > 0
    # Check that ranked options have match scores and rationale
    top_option = rec.ranked_options[0]
    assert top_option.match_score > 0
    assert "tier" in top_option.fit_rationale.lower()
