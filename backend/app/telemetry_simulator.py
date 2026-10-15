import asyncio
import random
from datetime import datetime, timezone
from typing import Callable, Coroutine, Any
from app.hospital_twin import HospitalDigitalTwin
from app.models import Vitals
from app.clinical_engine import evaluate_patient_clinical_status

class TelemetrySimulator:
    def __init__(self, hospital: HospitalDigitalTwin, broadcast_callback: Callable[[dict], Coroutine[Any, Any, None]]):
        self.hospital = hospital
        self.broadcast_callback = broadcast_callback
        self.is_running = False
        self._task = None

    def start(self):
        if not self.is_running:
            self.is_running = True
            self._task = asyncio.create_task(self._simulation_loop())

    def stop(self):
        self.is_running = False
        if self._task:
            self._task.cancel()

    async def _simulation_loop(self):
        while self.is_running:
            try:
                # Interval scaled by simulation speed
                base_sleep = 2.0 / max(0.2, self.hospital.simulation_speed)
                await asyncio.sleep(base_sleep)

                if not self.hospital.simulation_running:
                    continue

                self.hospital.tick_counter += 1
                now_str = datetime.now(timezone.utc).isoformat()

                # Update vitals for each patient
                for patient in self.hospital.patients:
                    cur = patient.current_vitals

                    # Physiological noise jitter
                    if patient.is_synthetic_degraded:
                        # Degradation jitter is slightly more volatile
                        hr_jitter = random.uniform(-1.5, 1.8)
                        sbp_jitter = random.uniform(-2.0, 1.5)
                        rr_jitter = random.uniform(-0.8, 1.0)
                        spo2_jitter = random.uniform(-0.8, 0.4)
                        temp_jitter = random.uniform(-0.05, 0.08)
                    else:
                        # Natural subtle physiological sinus arrhythmia
                        hr_jitter = random.uniform(-1.0, 1.0)
                        sbp_jitter = random.uniform(-1.5, 1.5)
                        rr_jitter = random.uniform(-0.5, 0.5)
                        spo2_jitter = random.uniform(-0.3, 0.3)
                        temp_jitter = random.uniform(-0.02, 0.02)

                    new_hr = round(max(35.0, min(190.0, cur.heart_rate + hr_jitter)), 1)
                    new_sbp = round(max(55.0, min(240.0, cur.systolic_bp + sbp_jitter)), 1)
                    new_dbp = round(max(30.0, min(140.0, cur.diastolic_bp + sbp_jitter * 0.6)), 1)
                    new_rr = round(max(6.0, min(50.0, cur.respiration_rate + rr_jitter)), 1)
                    new_spo2 = round(max(65.0, min(100.0, cur.spo2 + spo2_jitter)), 1)
                    new_temp = round(max(33.0, min(42.0, cur.temperature + temp_jitter)), 1)

                    new_vitals = Vitals(
                        heart_rate=new_hr,
                        systolic_bp=new_sbp,
                        diastolic_bp=new_dbp,
                        respiration_rate=new_rr,
                        spo2=new_spo2,
                        temperature=new_temp,
                        consciousness=cur.consciousness,
                        on_supplemental_oxygen=cur.on_supplemental_oxygen,
                        oxygen_liters=cur.oxygen_liters,
                        use_scale2=cur.use_scale2,
                        timestamp=now_str
                    )

                    patient.current_vitals = new_vitals
                    patient.vitals_history.append(new_vitals)
                    if len(patient.vitals_history) > 30:
                        patient.vitals_history.pop(0)

                    # Update clinical score
                    patient.clinical_status = evaluate_patient_clinical_status(
                        patient.current_vitals, patient.vitals_history
                    )

                # Periodic bed optimizer run (every 2 ticks)
                if self.hospital.tick_counter % 2 == 0:
                    self.hospital.run_bed_optimizer()

                # Broadcast live hospital state
                state = self.hospital.get_state().model_dump()
                await self.broadcast_callback({
                    "type": "TELEMETRY_UPDATE",
                    "data": state
                })

            except asyncio.CancelledError:
                break
            except Exception as e:
                print(f"Error in telemetry loop: {e}")
                await asyncio.sleep(2.0)
