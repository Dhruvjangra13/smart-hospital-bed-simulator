from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class Vitals(BaseModel):
    heart_rate: float = Field(..., description="Heart rate in beats per minute (bpm)")
    systolic_bp: float = Field(..., description="Systolic blood pressure in mmHg")
    diastolic_bp: float = Field(..., description="Diastolic blood pressure in mmHg")
    respiration_rate: float = Field(..., description="Respiration rate in breaths per minute")
    spo2: float = Field(..., description="Oxygen saturation in %")
    temperature: float = Field(..., description="Core body temperature in Celsius")
    consciousness: str = Field(default="A", description="ACVPU scale: 'A', 'C', 'V', 'P', 'U'")
    on_supplemental_oxygen: bool = Field(default=False, description="Supplemental oxygen administration")
    oxygen_liters: float = Field(default=0.0, description="Oxygen flow in L/min")
    use_scale2: bool = Field(default=False, description="Use NEWS2 Scale 2 for hypercapnic respiratory failure")
    timestamp: str = Field(..., description="ISO 8601 timestamp")

class ScoreContribution(BaseModel):
    parameter: str
    measured_value: str
    points: int
    rationale: str

class NEWS2Detail(BaseModel):
    rr_score: int
    spo2_score: int
    o2_score: int
    sbp_score: int
    hr_score: int
    consciousness_score: int
    temp_score: int
    total_score: int
    risk_level: str  # "LOW", "MEDIUM", "HIGH"
    has_red_score: bool
    clinical_action: str
    contributions: List[ScoreContribution] = []

class TrendSignals(BaseModel):
    trend_symbol: str  # "↑ worsening", "↗ rising", "→ stable", "↓ improving"
    trend_text: str
    repeated_abnormal_count: int
    rate_of_change: Dict[str, float]
    missing_data_flag: bool = False
    anomaly_velocity: float

class ClinicalStatus(BaseModel):
    news2: NEWS2Detail
    shock_index: float
    shock_status: str
    qsofa_score: int
    sepsis_risk: str
    trend_signals: TrendSignals
    recommended_action: str  # "Urgent clinical review", "Repeat observations", "Continue simulated monitoring"
    deterioration_probability_1h: float

class Patient(BaseModel):
    id: str  # e.g. "SIM-104"
    name: str
    age: int
    gender: str
    mrn: str
    admission_date: str
    diagnosis: str
    comorbidities: List[str] = []
    current_ward: str  # "Ward-A", "Ward-B", "HDU", "ICU"
    current_bed_id: str
    isolation_needed: str = "Standard"  # "Standard", "Airborne/Negative Pressure", "Contact"
    required_specialties: List[str] = []  # e.g. ["Telemetry", "Ventilator"]
    current_vitals: Vitals
    clinical_status: ClinicalStatus
    is_synthetic_degraded: bool = False
    degradation_slider_value: float = 0.0
    degradation_scenario: Optional[str] = None
    vitals_history: List[Vitals] = []

class Bed(BaseModel):
    id: str
    ward: str  # "Ward-A", "Ward-B", "HDU", "ICU"
    name: str
    tier: str  # "General", "HDU", "ICU"
    status: str  # "occupied", "available", "reserved", "cleaning"
    current_patient_id: Optional[str] = None
    isolation_capable: str = "Standard"  # "Standard", "Airborne/Negative Pressure", "Contact"
    has_ventilator: bool = False
    has_telemetry: bool = True
    has_dialysis_hookup: bool = False
    expected_turnover_minutes: int = 0

class RankedBedOption(BaseModel):
    rank: int
    bed_id: str
    ward: str
    tier: str
    match_score: int  # 0 to 100%
    fit_rationale: str
    isolation_matched: bool
    equipment_matched: bool
    estimated_turnover_minutes: int

class CascadingStepDown(BaseModel):
    source_patient_id: str
    source_patient_name: str
    current_bed_id: str
    current_ward: str
    recommended_target_bed_id: str
    recommended_target_ward: str
    clinical_stability_rationale: str

class TransferRecommendation(BaseModel):
    id: str
    timestamp: str
    patient_id: str
    patient_name: str
    current_bed_id: str
    current_ward: str
    target_bed_id: str
    target_ward: str
    urgency: str  # "CRITICAL_IMMEDIATE", "URGENT_1H", "HIGH_PRIORITY", "ROUTINE_STEP_DOWN"
    clinical_rationale: str
    explainable_trigger: str
    next_best_action: str
    required_resources: List[str]
    isolation_needed: str
    ranked_options: List[RankedBedOption] = []
    cascading_stepdown: Optional[CascadingStepDown] = None
    human_in_the_loop_disclaimer: str = (
        "Human-in-the-loop: The system recommends; clinical and bed-management teams decide. "
        "No autonomous transfer, discharge or treatment decisions."
    )
    status: str = "PENDING"  # "PENDING", "ACCEPTED", "DECLINED", "COMPLETED"

class WardSummary(BaseModel):
    ward_id: str
    ward_name: str
    tier: str
    total_beds: int
    occupied_beds: int
    available_beds: int
    occupancy_rate: float
    critical_patients_count: int
    average_news2: float

class Alert(BaseModel):
    id: str
    timestamp: str
    patient_id: str
    patient_name: str
    bed_id: str
    ward: str
    severity: str  # "INFO", "WARNING", "CRITICAL"
    risk_band: str  # "LOW", "MEDIUM", "HIGH"
    message: str
    trigger: str
    inputs_changed: List[str] = []
    recommendation_summary: str
    news2_score: int
    acknowledged: bool = False

class HospitalKPIs(BaseModel):
    total_patients: int = 24
    high_risk_count: int = 3
    medium_risk_count: int = 4
    low_risk_count: int = 17
    beds_available: int = 5
    alerts_today: int = 7
    icu_occupancy_pct: float
    detection_latency_ms: float = 380.0

class HospitalState(BaseModel):
    timestamp: str
    simulation_running: bool
    simulation_speed: float
    kpis: HospitalKPIs
    wards: List[WardSummary]
    beds: List[Bed]
    patients: List[Patient]
    recommendations: List[TransferRecommendation]
    active_alerts: List[Alert]
    bottleneck_forecast: Dict[str, Any]
    safety_disclaimer: str = (
        "EDUCATIONAL SIMULATION ONLY — Synthetic data only. Alerts and bed suggestions support, "
        "not replace, clinical and operational judgment. Not a validated clinical decision tool."
    )
