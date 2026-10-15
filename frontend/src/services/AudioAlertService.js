class AudioAlertService {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.lastAlertTime = 0;
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  playBeep(freq = 880, duration = 0.15, type = 'sine') {
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      // Audio might be blocked until user interacts
    }
  }

  playWarningChime() {
    const now = Date.now();
    if (now - this.lastAlertTime < 2500) return; // rate limit
    this.lastAlertTime = now;

    this.playBeep(659.25, 0.18, 'triangle'); // E5
    setTimeout(() => this.playBeep(523.25, 0.22, 'triangle'), 150); // C5
  }

  playEmergencyAlarm() {
    const now = Date.now();
    if (now - this.lastAlertTime < 2500) return; // rate limit
    this.lastAlertTime = now;

    // Authentic hospital telemetry 3-tone urgency chime
    this.playBeep(880, 0.12, 'sine');
    setTimeout(() => this.playBeep(880, 0.12, 'sine'), 140);
    setTimeout(() => this.playBeep(987.77, 0.25, 'sine'), 280);
  }

  playSuccessChime() {
    this.playBeep(523.25, 0.12, 'triangle');
    setTimeout(() => this.playBeep(659.25, 0.12, 'triangle'), 120);
    setTimeout(() => this.playBeep(783.99, 0.25, 'triangle'), 240);
  }
}

export const audioAlerts = new AudioAlertService();
