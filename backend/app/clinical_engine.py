import numpy as np
import pandas as pd
from typing import List, Dict, Any, Tuple
from app.models import Vitals, NEWS2Detail, ScoreContribution, TrendSignals, ClinicalStatus

def calculate_news2(vitals: Vitals) -> NEWS2Detail:
    """
    Transparent Royal College of Physicians NEWS2 Calculator.
    Generates explainable score contributions for each input parameter.
    """
    contributions: List[ScoreContribution] = []

    # 1. Respiration Rate (breaths/min)
    rr = vitals.respiration_rate
    if rr <= 8:
        rr_score = 3
        contributions.append(ScoreContribution(parameter="Respiration Rate", measured_value=f"{rr:.0f} /min", points=3, rationale="Severe bradypnea (≤8)"))
    elif 9 <= rr <= 11:
        rr_score = 1
        contributions.append(ScoreContribution(parameter="Respiration Rate", measured_value=f"{rr:.0f} /min", points=1, rationale="Mild bradypnea (9-11)"))
    elif 12 <= rr <= 20:
        rr_score = 0
    elif 21 <= rr <= 24:
        rr_score = 2
        contributions.append(ScoreContribution(parameter="Respiration Rate", measured_value=f"{rr:.0f} /min", points=2, rationale="Moderate tachypnea (21-24)"))
    else:  # >= 25
        rr_score = 3
        contributions.append(ScoreContribution(parameter="Respiration Rate", measured_value=f"{rr:.0f} /min", points=3, rationale="Severe tachypnea (≥25)"))

    # 2. Oxygen Saturation (%)
    spo2 = vitals.spo2
    if vitals.use_scale2:
        if spo2 <= 83:
            spo2_score = 3
            contributions.append(ScoreContribution(parameter="SpO2 (Scale 2 - Hypercapnic)", measured_value=f"{spo2:.0f}%", points=3, rationale="Severe hypoxemia (≤83%)"))
        elif 84 <= spo2 <= 85:
            spo2_score = 2
            contributions.append(ScoreContribution(parameter="SpO2 (Scale 2 - Hypercapnic)", measured_value=f"{spo2:.0f}%", points=2, rationale="Moderate hypoxemia (84-85%)"))
        elif 86 <= spo2 <= 87:
            spo2_score = 1
            contributions.append(ScoreContribution(parameter="SpO2 (Scale 2 - Hypercapnic)", measured_value=f"{spo2:.0f}%", points=1, rationale="Mild hypoxemia (86-87%)"))
        elif 88 <= spo2 <= 92:
            spo2_score = 0
        elif 93 <= spo2 <= 94:
            spo2_score = 1 if vitals.on_supplemental_oxygen else 0
            if spo2_score:
                contributions.append(ScoreContribution(parameter="SpO2 (Scale 2 on O2)", measured_value=f"{spo2:.0f}%", points=1, rationale="Elevated saturation on supplemental O2"))
        elif 95 <= spo2 <= 96:
            spo2_score = 2 if vitals.on_supplemental_oxygen else 0
            if spo2_score:
                contributions.append(ScoreContribution(parameter="SpO2 (Scale 2 on O2)", measured_value=f"{spo2:.0f}%", points=2, rationale="High saturation on supplemental O2"))
        else:  # >= 97
            spo2_score = 3 if vitals.on_supplemental_oxygen else 0
            if spo2_score:
                contributions.append(ScoreContribution(parameter="SpO2 (Scale 2 on O2)", measured_value=f"{spo2:.0f}%", points=3, rationale="Excess oxygenation in chronic hypercapnia"))
    else:
        if spo2 <= 91:
            spo2_score = 3
            contributions.append(ScoreContribution(parameter="SpO2 Oxygen Saturation", measured_value=f"{spo2:.0f}%", points=3, rationale="Severe hypoxemia (≤91%)"))
        elif 92 <= spo2 <= 93:
            spo2_score = 2
            contributions.append(ScoreContribution(parameter="SpO2 Oxygen Saturation", measured_value=f"{spo2:.0f}%", points=2, rationale="Moderate hypoxemia (92-93%)"))
        elif 94 <= spo2 <= 95:
            spo2_score = 1
            contributions.append(ScoreContribution(parameter="SpO2 Oxygen Saturation", measured_value=f"{spo2:.0f}%", points=1, rationale="Mild hypoxemia (94-95%)"))
        else:
            spo2_score = 0

    # 3. Supplemental Oxygen
    if vitals.on_supplemental_oxygen:
        o2_score = 2
        contributions.append(ScoreContribution(parameter="Supplemental Oxygen", measured_value=f"{vitals.oxygen_liters:.1f} L/min", points=2, rationale="Requires oxygen therapy"))
    else:
        o2_score = 0

    # 4. Systolic Blood Pressure (mmHg)
    sbp = vitals.systolic_bp
    if sbp <= 90:
        sbp_score = 3
        contributions.append(ScoreContribution(parameter="Systolic Blood Pressure", measured_value=f"{sbp:.0f} mmHg", points=3, rationale="Severe hypotension (≤90 mmHg)"))
    elif 91 <= sbp <= 100:
        sbp_score = 2
        contributions.append(ScoreContribution(parameter="Systolic Blood Pressure", measured_value=f"{sbp:.0f} mmHg", points=2, rationale="Moderate hypotension (91-100 mmHg)"))
    elif 101 <= sbp <= 110:
        sbp_score = 1
        contributions.append(ScoreContribution(parameter="Systolic Blood Pressure", measured_value=f"{sbp:.0f} mmHg", points=1, rationale="Mild hypotension (101-110 mmHg)"))
    elif 111 <= sbp <= 219:
        sbp_score = 0
    else:  # >= 220
        sbp_score = 3
        contributions.append(ScoreContribution(parameter="Systolic Blood Pressure", measured_value=f"{sbp:.0f} mmHg", points=3, rationale="Severe hypertension (≥220 mmHg)"))

    # 5. Pulse / Heart Rate (bpm)
    hr = vitals.heart_rate
    if hr <= 40:
        hr_score = 3
        contributions.append(ScoreContribution(parameter="Heart Rate", measured_value=f"{hr:.0f} bpm", points=3, rationale="Severe bradycardia (≤40 bpm)"))
    elif 41 <= hr <= 50:
        hr_score = 1
        contributions.append(ScoreContribution(parameter="Heart Rate", measured_value=f"{hr:.0f} bpm", points=1, rationale="Mild bradycardia (41-50 bpm)"))
    elif 51 <= hr <= 90:
        hr_score = 0
    elif 91 <= hr <= 110:
        hr_score = 1
        contributions.append(ScoreContribution(parameter="Heart Rate", measured_value=f"{hr:.0f} bpm", points=1, rationale="Mild tachycardia (91-110 bpm)"))
    elif 111 <= hr <= 130:
        hr_score = 2
        contributions.append(ScoreContribution(parameter="Heart Rate", measured_value=f"{hr:.0f} bpm", points=2, rationale="Moderate tachycardia (111-130 bpm)"))
    else:  # >= 131
        hr_score = 3
        contributions.append(ScoreContribution(parameter="Heart Rate", measured_value=f"{hr:.0f} bpm", points=3, rationale="Severe tachycardia (≥131 bpm)"))

    # 6. Consciousness (ACVPU)
    c = vitals.consciousness.upper()
    if c == "A":
        consciousness_score = 0
    else:
        consciousness_score = 3
        c_label = {"C": "New Confusion", "V": "Voice Responsive", "P": "Pain Responsive", "U": "Unresponsive"}.get(c, "Altered Mentation")
        contributions.append(ScoreContribution(parameter="Consciousness (ACVPU)", measured_value=f"'{c}' - {c_label}", points=3, rationale="Altered consciousness or acute confusion"))

    # 7. Body Temperature (°C)
    t = vitals.temperature
    if t <= 35.0:
        temp_score = 3
        contributions.append(ScoreContribution(parameter="Body Temperature", measured_value=f"{t:.1f}°C", points=3, rationale="Severe hypothermia (≤35.0°C)"))
    elif 35.1 <= t <= 36.0:
        temp_score = 1
        contributions.append(ScoreContribution(parameter="Body Temperature", measured_value=f"{t:.1f}°C", points=1, rationale="Mild hypothermia (35.1-36.0°C)"))
    elif 36.1 <= t <= 38.0:
        temp_score = 0
    elif 38.1 <= t <= 39.0:
        temp_score = 1
        contributions.append(ScoreContribution(parameter="Body Temperature", measured_value=f"{t:.1f}°C", points=1, rationale="Mild pyrexia / fever (38.1-39.0°C)"))
    else:  # >= 39.1
        temp_score = 2
        contributions.append(ScoreContribution(parameter="Body Temperature", measured_value=f"{t:.1f}°C", points=2, rationale="High pyrexia (≥39.1°C)"))

    scores = [rr_score, spo2_score, sbp_score, hr_score, consciousness_score, temp_score]
    has_red_score = any(s == 3 for s in scores)
    total_score = sum([rr_score, spo2_score, o2_score, sbp_score, hr_score, consciousness_score, temp_score])

    # Standard RCP NEWS2 Risk Bands
    if total_score >= 7:
        risk_level = "HIGH"
        clinical_action = "EMERGENCY: Urgent critical care team (ICU Outreach) assessment. Consider immediate step-up."
    elif total_score >= 5 or has_red_score:
        risk_level = "MEDIUM"
        clinical_action = "URGENT: Urgent clinical review by competent physician/team. Optimize ward care or prep HDU step-up."
    else:
        risk_level = "LOW"
        clinical_action = "Routine ward-based care; continue simulated monitoring."

    return NEWS2Detail(
        rr_score=rr_score,
        spo2_score=spo2_score,
        o2_score=o2_score,
        sbp_score=sbp_score,
        hr_score=hr_score,
        consciousness_score=consciousness_score,
        temp_score=temp_score,
        total_score=total_score,
        risk_level=risk_level,
        has_red_score=has_red_score,
        clinical_action=clinical_action,
        contributions=contributions
    )

def calculate_trend_signals(history: List[Vitals], current_vitals: Vitals) -> TrendSignals:
    """
    Computes rate of change, repeated abnormal values, and trend direction.
    Symbols matching Slide 07: '↑ worsening', '↗ rising', '→ stable', '↓ improving'
    """
    if not history or len(history) < 2:
        return TrendSignals(
            trend_symbol="→ stable",
            trend_text="Stable baseline observations",
            repeated_abnormal_count=0,
            rate_of_change={"dHR": 0.0, "dSBP": 0.0, "dSpO2": 0.0, "dRR": 0.0},
            missing_data_flag=False,
            anomaly_velocity=0.0
        )

    # Rates of change over recent history
    prev = history[-1]
    d_hr = current_vitals.heart_rate - prev.heart_rate
    d_sbp = current_vitals.systolic_bp - prev.systolic_bp
    d_spo2 = current_vitals.spo2 - prev.spo2
    d_rr = current_vitals.respiration_rate - prev.respiration_rate

    # Anomaly velocity: rising HR + falling BP + falling SpO2 + rising RR
    velocity = (d_hr * 0.3) - (d_sbp * 0.4) - (d_spo2 * 0.5) + (d_rr * 0.3)

    # Count consecutive abnormal readings in recent window
    repeated_abnormal = 0
    for v in reversed(history[-10:]):
        is_abnormal = (v.heart_rate > 100 or v.systolic_bp < 100 or v.respiration_rate >= 22 or v.spo2 < 94)
        if is_abnormal:
            repeated_abnormal += 1
        else:
            break

    if velocity > 3.0:
        trend_symbol = "↑ worsening"
        trend_text = "Rapid acute decompensation"
    elif velocity > 0.8:
        trend_symbol = "↗ rising"
        trend_text = "Mild progressive deterioration"
    elif velocity < -1.5:
        trend_symbol = "↓ improving"
        trend_text = "Stabilizing towards baseline"
    else:
        trend_symbol = "→ stable"
        trend_text = "Physiological steady state"

    return TrendSignals(
        trend_symbol=trend_symbol,
        trend_text=trend_text,
        repeated_abnormal_count=repeated_abnormal,
        rate_of_change={"dHR": round(d_hr, 1), "dSBP": round(d_sbp, 1), "dSpO2": round(d_spo2, 1), "dRR": round(d_rr, 1)},
        missing_data_flag=False,
        anomaly_velocity=round(velocity, 2)
    )

def evaluate_patient_clinical_status(vitals: Vitals, history: List[Vitals]) -> ClinicalStatus:
    """
    Evaluates NEWS2, Shock Index, qSOFA, Trend Signals, and recommended action.
    Recommended actions match Slide 07:
    - High: 'Urgent clinical review'
    - Medium: 'Repeat observations'
    - Low: 'Continue simulated monitoring'
    """
    news2 = calculate_news2(vitals)
    trends = calculate_trend_signals(history, vitals)

    # Shock Index
    sbp = max(1.0, vitals.systolic_bp)
    shock_index = round(vitals.heart_rate / sbp, 2)
    if shock_index > 0.9:
        shock_status = "Shock Risk"
    elif shock_index >= 0.7:
        shock_status = "Borderline"
    else:
        shock_status = "Normal"

    # qSOFA
    qsofa = 0
    if vitals.respiration_rate >= 22: qsofa += 1
    if vitals.systolic_bp <= 100: qsofa += 1
    if vitals.consciousness.upper() != "A": qsofa += 1

    sepsis_risk = "High Sepsis Alert" if qsofa >= 2 or (news2.total_score >= 7 and shock_index > 0.9) else ("Moderate" if qsofa == 1 or news2.total_score >= 5 else "Low")

    # Match exact Slide 07 recommended action
    if news2.risk_level == "HIGH":
        rec_action = "Urgent clinical review"
        prob_1h = min(0.98, max(0.70, 0.5 + (news2.total_score * 0.03)))
    elif news2.risk_level == "MEDIUM":
        rec_action = "Repeat observations"
        prob_1h = min(0.65, max(0.25, 0.2 + (news2.total_score * 0.03)))
    else:
        rec_action = "Continue simulated monitoring"
        prob_1h = 0.05

    return ClinicalStatus(
        news2=news2,
        shock_index=shock_index,
        shock_status=shock_status,
        qsofa_score=qsofa,
        sepsis_risk=sepsis_risk,
        trend_signals=trends,
        recommended_action=rec_action,
        deterioration_probability_1h=round(prob_1h, 2)
    )
