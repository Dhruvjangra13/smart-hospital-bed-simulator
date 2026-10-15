from datetime import datetime, timezone
import random
from typing import List, Tuple
from app.models import Patient, Vitals, Bed
from app.clinical_engine import evaluate_patient_clinical_status

def create_vitals(
    hr: float, sbp: float, dbp: float, rr: float, spo2: float, temp: float,
    consciousness: str = "A", on_o2: bool = False, o2_liters: float = 0.0, use_scale2: bool = False
) -> Vitals:
    return Vitals(
        heart_rate=hr,
        systolic_bp=sbp,
        diastolic_bp=dbp,
        respiration_rate=rr,
        spo2=spo2,
        temperature=temp,
        consciousness=consciousness,
        on_supplemental_oxygen=on_o2,
        oxygen_liters=o2_liters,
        use_scale2=use_scale2,
        timestamp=datetime.now(timezone.utc).isoformat()
    )

def generate_history(base: Vitals, count: int = 15) -> List[Vitals]:
    hist = []
    for _ in range(count):
        v = Vitals(
            heart_rate=round(max(40, base.heart_rate + random.uniform(-2, 2)), 1),
            systolic_bp=round(max(70, base.systolic_bp + random.uniform(-3, 3)), 1),
            diastolic_bp=round(max(40, base.diastolic_bp + random.uniform(-2, 2)), 1),
            respiration_rate=round(max(8, base.respiration_rate + random.uniform(-1, 1)), 1),
            spo2=round(min(100.0, max(80.0, base.spo2 + random.uniform(-0.5, 0.5))), 1),
            temperature=round(base.temperature + random.uniform(-0.1, 0.1), 1),
            consciousness=base.consciousness,
            on_supplemental_oxygen=base.on_supplemental_oxygen,
            oxygen_liters=base.oxygen_liters,
            use_scale2=base.use_scale2,
            timestamp=datetime.now(timezone.utc).isoformat()
        )
        hist.append(v)
    return hist

def get_initial_hospital_data() -> Tuple[List[Bed], List[Patient]]:
    # 29 Beds across 4 units (5 Available, 24 Occupied)
    beds = [
        # ICU - 4 beds (3 occupied, 1 available negative pressure isolation)
        Bed(id="ICU-01", ward="ICU", name="ICU Pod 1", tier="ICU", status="occupied", current_patient_id="SIM-109", has_ventilator=True, has_telemetry=True, isolation_capable="Standard"),
        Bed(id="ICU-02", ward="ICU", name="ICU Pod 2", tier="ICU", status="occupied", current_patient_id="SIM-110", has_ventilator=True, has_telemetry=True, isolation_capable="Standard"),
        Bed(id="ICU-03", ward="ICU", name="ICU Pod 3", tier="ICU", status="occupied", current_patient_id="SIM-111", has_ventilator=True, has_telemetry=True, isolation_capable="Standard"),
        Bed(id="ICU-04", ward="ICU", name="ICU Pod 4 (Neg Press)", tier="ICU", status="available", current_patient_id=None, has_ventilator=True, has_telemetry=True, isolation_capable="Airborne/Negative Pressure"),

        # HDU / Step-Down - 5 beds (4 occupied, 1 available)
        Bed(id="HDU-01", ward="HDU", name="HDU Bed 1", tier="HDU", status="occupied", current_patient_id="SIM-107", has_ventilator=False, has_telemetry=True, isolation_capable="Standard"),
        Bed(id="HDU-02", ward="HDU", name="HDU Bed 2", tier="HDU", status="occupied", current_patient_id="SIM-108", has_ventilator=False, has_telemetry=True, isolation_capable="Standard"),
        Bed(id="HDU-03", ward="HDU", name="HDU Bed 3", tier="HDU", status="available", current_patient_id=None, has_ventilator=False, has_telemetry=True, isolation_capable="Standard"),
        Bed(id="HDU-04", ward="HDU", name="HDU Bed 4", tier="HDU", status="occupied", current_patient_id="SIM-123", has_ventilator=False, has_telemetry=True, isolation_capable="Contact"),
        Bed(id="HDU-05", ward="HDU", name="HDU Bed 5", tier="HDU", status="occupied", current_patient_id="SIM-124", has_ventilator=False, has_telemetry=True, isolation_capable="Standard"),

        # Ward A (Surgical & Post-Op) - 10 beds (8 occupied, 2 available)
        Bed(id="WA-01", ward="Ward-A", name="Ward A - Bed 1", tier="General", status="occupied", current_patient_id="SIM-101", has_telemetry=True),
        Bed(id="WA-02", ward="Ward-A", name="Ward A - Bed 2", tier="General", status="occupied", current_patient_id="SIM-102", has_telemetry=True),
        Bed(id="WA-03", ward="Ward-A", name="Ward A - Bed 3", tier="General", status="occupied", current_patient_id="SIM-103", has_telemetry=True),
        Bed(id="WA-04", ward="Ward-A", name="Ward A - Bed 4", tier="General", status="occupied", current_patient_id="SIM-104", has_telemetry=True),
        Bed(id="WA-05", ward="Ward-A", name="Ward A - Bed 5", tier="General", status="available", current_patient_id=None, has_telemetry=True),
        Bed(id="WA-06", ward="Ward-A", name="Ward A - Bed 6", tier="General", status="available", current_patient_id=None, has_telemetry=True),
        Bed(id="WA-07", ward="Ward-A", name="Ward A - Bed 7", tier="General", status="occupied", current_patient_id="SIM-112", has_telemetry=True),
        Bed(id="WA-08", ward="Ward-A", name="Ward A - Bed 8", tier="General", status="occupied", current_patient_id="SIM-113", has_telemetry=True),
        Bed(id="WA-09", ward="Ward-A", name="Ward A - Bed 9", tier="General", status="occupied", current_patient_id="SIM-114", has_telemetry=True),
        Bed(id="WA-10", ward="Ward-A", name="Ward A - Bed 10", tier="General", status="occupied", current_patient_id="SIM-115", has_telemetry=True),

        # Ward B (Acute Medical & Pulmonary) - 10 beds (9 occupied, 1 available)
        Bed(id="WB-01", ward="Ward-B", name="Ward B - Bed 1", tier="General", status="occupied", current_patient_id="SIM-105", has_telemetry=True),
        Bed(id="WB-02", ward="Ward-B", name="Ward B - Bed 2", tier="General", status="occupied", current_patient_id="SIM-106", has_telemetry=True),
        Bed(id="WB-03", ward="Ward-B", name="Ward B - Bed 3", tier="General", status="occupied", current_patient_id="SIM-116", has_telemetry=True),
        Bed(id="WB-04", ward="Ward-B", name="Ward B - Bed 4", tier="General", status="occupied", current_patient_id="SIM-117", has_telemetry=True),
        Bed(id="WB-05", ward="Ward-B", name="Ward B - Bed 5 (Iso)", tier="General", status="available", current_patient_id=None, has_telemetry=True, isolation_capable="Airborne/Negative Pressure"),
        Bed(id="WB-06", ward="Ward-B", name="Ward B - Bed 6", tier="General", status="occupied", current_patient_id="SIM-118", has_telemetry=True),
        Bed(id="WB-07", ward="Ward-B", name="Ward B - Bed 7", tier="General", status="occupied", current_patient_id="SIM-119", has_telemetry=True),
        Bed(id="WB-08", ward="Ward-B", name="Ward B - Bed 8", tier="General", status="occupied", current_patient_id="SIM-120", has_telemetry=True),
        Bed(id="WB-09", ward="Ward-B", name="Ward B - Bed 9", tier="General", status="occupied", current_patient_id="SIM-121", has_telemetry=True),
        Bed(id="WB-10", ward="Ward-B", name="Ward B - Bed 10", tier="General", status="occupied", current_patient_id="SIM-122", has_telemetry=True),
    ]

    # 24 Patients (Exactly matching Slide 07: SIM-104 HIGH, SIM-117 MEDIUM, SIM-121 LOW)
    raw = [
        # Slide 07 Featured Patients
        {"id": "SIM-104", "name": "Arthur Pendelton", "age": 72, "gender": "Male", "mrn": "MRN-10492", "adm": "2026-10-13", "diag": "Post-Op Colectomy - Acute Sepsis", "ward": "Ward-A", "bed": "WA-04", "iso": "Standard", "spec": ["Telemetry"], "v": create_vitals(124, 88, 52, 26, 92, 38.9, "C", True, 4.0)},
        {"id": "SIM-117", "name": "Eleanor Vance", "age": 64, "gender": "Female", "mrn": "MRN-11781", "adm": "2026-10-14", "diag": "Community-Acquired Lobar Pneumonia", "ward": "Ward-B", "bed": "WB-04", "iso": "Airborne/Negative Pressure", "spec": ["Telemetry"], "v": create_vitals(92, 114, 72, 21, 95, 38.2, "A", False)},
        {"id": "SIM-121", "name": "David K. Chen", "age": 45, "gender": "Male", "mrn": "MRN-12154", "adm": "2026-10-12", "diag": "Acute Pancreatitis (Resolving)", "ward": "Ward-B", "bed": "WB-09", "iso": "Standard", "spec": [], "v": create_vitals(74, 122, 78, 15, 98, 36.9, "A", False)},

        # Additional Patients
        {"id": "SIM-101", "name": "George Harrison", "age": 68, "gender": "Male", "mrn": "MRN-10101", "adm": "2026-10-14", "diag": "Elective Total Knee Arthroplasty", "ward": "Ward-A", "bed": "WA-01", "iso": "Standard", "spec": [], "v": create_vitals(72, 128, 80, 14, 98, 36.8)},
        {"id": "SIM-102", "name": "Beatrice Thorne", "age": 81, "gender": "Female", "mrn": "MRN-10219", "adm": "2026-10-13", "diag": "COPD Exacerbation", "ward": "Ward-A", "bed": "WA-02", "iso": "Standard", "spec": ["Telemetry"], "v": create_vitals(88, 132, 82, 21, 90, 37.1, "A", True, 1.5, True)},
        {"id": "SIM-103", "name": "Marcus Aurel", "age": 52, "gender": "Male", "mrn": "MRN-10382", "adm": "2026-10-15", "diag": "Post-Appendectomy Recovery", "ward": "Ward-A", "bed": "WA-03", "iso": "Standard", "spec": [], "v": create_vitals(76, 118, 74, 16, 99, 36.7)},
        {"id": "SIM-105", "name": "Clara Higgins", "age": 59, "gender": "Female", "mrn": "MRN-10521", "adm": "2026-10-14", "diag": "Acute Pyelonephritis", "ward": "Ward-B", "bed": "WB-01", "iso": "Standard", "spec": [], "v": create_vitals(96, 106, 68, 21, 95, 38.4, "A", False)},
        {"id": "SIM-106", "name": "Samuel Jackson", "age": 70, "gender": "Male", "mrn": "MRN-10639", "adm": "2026-10-12", "diag": "Congestive Heart Failure NYHA II", "ward": "Ward-B", "bed": "WB-02", "iso": "Standard", "spec": ["Telemetry"], "v": create_vitals(78, 134, 84, 17, 96, 36.8)},

        # HDU Patients
        {"id": "SIM-107", "name": "James R. Wilson", "age": 69, "gender": "Male", "mrn": "MRN-10702", "adm": "2026-10-10", "diag": "Post CABG x3 (Day 4)", "ward": "HDU", "bed": "HDU-01", "iso": "Standard", "spec": ["Telemetry"], "v": create_vitals(80, 126, 76, 16, 97, 37.0, "A", True, 2.0)},
        {"id": "SIM-108", "name": "Linda Taylor", "age": 74, "gender": "Female", "mrn": "MRN-10843", "adm": "2026-10-11", "diag": "Status Asthmaticus (Post-BiPAP)", "ward": "HDU", "bed": "HDU-02", "iso": "Standard", "spec": ["Telemetry"], "v": create_vitals(78, 128, 78, 16, 97, 36.8)},
        {"id": "SIM-123", "name": "Grace Hopper", "age": 83, "gender": "Female", "mrn": "MRN-12349", "adm": "2026-10-11", "diag": "C. Difficile Enteritis & Dehydration", "ward": "HDU", "bed": "HDU-04", "iso": "Contact", "spec": ["Telemetry"], "v": create_vitals(92, 104, 66, 21, 96, 38.1, "A", False)},
        {"id": "SIM-124", "name": "Frank Castle", "age": 57, "gender": "Male", "mrn": "MRN-12490", "adm": "2026-10-12", "diag": "Acute Coronary Syndrome (Stabilized)", "ward": "HDU", "bed": "HDU-05", "iso": "Standard", "spec": ["Telemetry"], "v": create_vitals(72, 124, 76, 15, 98, 36.7)},

        # ICU Patients
        {"id": "SIM-109", "name": "Robert MacIntyre", "age": 55, "gender": "Male", "mrn": "MRN-10911", "adm": "2026-10-13", "diag": "Severe ARDS / Septic Shock", "ward": "ICU", "bed": "ICU-01", "iso": "Standard", "spec": ["Ventilator", "Telemetry"], "v": create_vitals(120, 92, 54, 28, 91, 39.1, "V", True, 8.0)},
        {"id": "SIM-110", "name": "Sarah Jenkins", "age": 67, "gender": "Female", "mrn": "MRN-11082", "adm": "2026-10-09", "diag": "Post VF Arrest - Extubated & Stable", "ward": "ICU", "bed": "ICU-02", "iso": "Standard", "spec": ["Telemetry"], "v": create_vitals(66, 124, 78, 14, 98, 36.6, "A", False)},
        {"id": "SIM-111", "name": "Tariq Al-Mansoor", "age": 61, "gender": "Male", "mrn": "MRN-11145", "adm": "2026-10-11", "diag": "Polytrauma & Flail Chest", "ward": "ICU", "bed": "ICU-03", "iso": "Standard", "spec": ["Ventilator", "Telemetry"], "v": create_vitals(112, 98, 62, 25, 93, 37.8, "C", True, 6.0)},

        # Wards Continuation
        {"id": "SIM-112", "name": "Hannah Abbott", "age": 42, "gender": "Female", "mrn": "MRN-11234", "adm": "2026-10-14", "diag": "Laparoscopic Cholecystectomy", "ward": "Ward-A", "bed": "WA-07", "iso": "Standard", "spec": [], "v": create_vitals(68, 116, 72, 14, 99, 36.6)},
        {"id": "SIM-113", "name": "Oliver Twist", "age": 31, "gender": "Male", "mrn": "MRN-11390", "adm": "2026-10-15", "diag": "Cellulitis Right Lower Leg", "ward": "Ward-A", "bed": "WA-08", "iso": "Standard", "spec": [], "v": create_vitals(74, 120, 76, 15, 98, 37.2)},
        {"id": "SIM-114", "name": "Penelope Cruz", "age": 50, "gender": "Female", "mrn": "MRN-11488", "adm": "2026-10-13", "diag": "Simple Bowel Obstruction (Resolved)", "ward": "Ward-A", "bed": "WA-09", "iso": "Standard", "spec": [], "v": create_vitals(70, 122, 78, 14, 98, 36.7)},
        {"id": "SIM-115", "name": "Victor Creed", "age": 62, "gender": "Male", "mrn": "MRN-11561", "adm": "2026-10-14", "diag": "Deep Vein Thrombosis on Anticoagulation", "ward": "Ward-A", "bed": "WA-10", "iso": "Standard", "spec": [], "v": create_vitals(76, 126, 80, 16, 97, 36.9)},
        {"id": "SIM-116", "name": "Wanda Maximoff", "age": 38, "gender": "Female", "mrn": "MRN-11623", "adm": "2026-10-14", "diag": "Severe Migraine with Dehydration", "ward": "Ward-B", "bed": "WB-03", "iso": "Standard", "spec": [], "v": create_vitals(66, 114, 72, 13, 99, 36.6)},
        {"id": "SIM-118", "name": "Xavier Hernandez", "age": 77, "gender": "Male", "mrn": "MRN-11894", "adm": "2026-10-12", "diag": "Subacute Bacterial Endocarditis", "ward": "Ward-B", "bed": "WB-06", "iso": "Standard", "spec": ["Telemetry"], "v": create_vitals(82, 118, 74, 17, 96, 37.4)},
        {"id": "SIM-119", "name": "Yasmine Bleeth", "age": 48, "gender": "Female", "mrn": "MRN-11902", "adm": "2026-10-14", "diag": "Gastroenteritis", "ward": "Ward-B", "bed": "WB-07", "iso": "Standard", "spec": [], "v": create_vitals(70, 116, 74, 14, 98, 36.8)},
        {"id": "SIM-120", "name": "Zachary Taylor", "age": 85, "gender": "Male", "mrn": "MRN-12019", "adm": "2026-10-10", "diag": "Aspiration Pneumonia (Recovering)", "ward": "Ward-B", "bed": "WB-08", "iso": "Standard", "spec": ["Telemetry"], "v": create_vitals(78, 124, 76, 16, 96, 36.9, "A", True, 1.0)},
        {"id": "SIM-122", "name": "Albert Einstein", "age": 73, "gender": "Male", "mrn": "MRN-12241", "adm": "2026-10-11", "diag": "Abdominal Aortic Aneurysm (Observation)", "ward": "Ward-B", "bed": "WB-10", "iso": "Standard", "spec": ["Telemetry"], "v": create_vitals(68, 126, 78, 15, 97, 36.7)},
    ]

    patients = []
    for item in raw:
        hist = generate_history(item["v"], count=12)
        status = evaluate_patient_clinical_status(item["v"], hist)
        patients.append(Patient(
            id=item["id"],
            name=item["name"],
            age=item["age"],
            gender=item["gender"],
            mrn=item["mrn"],
            admission_date=item["adm"],
            diagnosis=item["diag"],
            comorbidities=["Hypertension", "Dyslipidemia"] if item["age"] > 60 else [],
            current_ward=item["ward"],
            current_bed_id=item["bed"],
            isolation_needed=item["iso"],
            required_specialties=item["spec"],
            current_vitals=item["v"],
            clinical_status=status,
            is_synthetic_degraded=(item["id"] == "SIM-104"),
            degradation_slider_value=75.0 if item["id"] == "SIM-104" else 0.0,
            degradation_scenario="Silent Sepsis" if item["id"] == "SIM-104" else None,
            vitals_history=hist
        ))

    return beds, patients
