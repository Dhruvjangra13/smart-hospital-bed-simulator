class WebSocketService {
  constructor() {
    this.ws = null;
    this.listeners = new Set();
    this.statusListeners = new Set();
    this.reconnectTimeout = null;
    this.reconnectAttempts = 0;
    this.isConnected = false;
  }

  connect() {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const envWsUrl = import.meta.env.VITE_WS_URL;
    let wsUrl = envWsUrl;
    if (!wsUrl) {
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      if (isLocal) {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const portStr = window.location.port === '5173' ? ':8000' : (window.location.port ? `:${window.location.port}` : '');
        wsUrl = `${protocol}//${window.location.hostname}${portStr}/ws`;
      } else {
        wsUrl = 'wss://smart-hospital-bed-simulator.onrender.com/ws';
      }
    }

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.notifyStatus(true);
      };

      this.ws.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          this.notifyListeners(parsed);
        } catch (e) {
          console.error("Failed to parse WS message", e);
        }
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        this.notifyStatus(false);
        this.scheduleReconnect();
      };

      this.ws.onerror = () => {
        this.isConnected = false;
        this.notifyStatus(false);
      };
    } catch (e) {
      this.scheduleReconnect();
    }
  }

  scheduleReconnect() {
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    const delay = Math.min(4000, 1000 * Math.pow(1.4, this.reconnectAttempts));
    this.reconnectAttempts++;
    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, delay);
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  subscribeStatus(callback) {
    this.statusListeners.add(callback);
    callback(this.isConnected);
    return () => this.statusListeners.delete(callback);
  }

  notifyListeners(data) {
    this.listeners.forEach((cb) => {
      try { cb(data); } catch (err) {}
    });
  }

  notifyStatus(status) {
    this.statusListeners.forEach((cb) => {
      try { cb(status); } catch (err) {}
    });
  }

  send(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  sendSliderUpdate(patientId, sliderValue, scenario = null) {
    this.send({
      type: "SLIDER_UPDATE",
      patient_id: patientId,
      slider_value: sliderValue,
      scenario: scenario
    });
  }

  sendTransferExecute(recommendationId) {
    this.send({
      type: "EXECUTE_TRANSFER",
      recommendation_id: recommendationId
    });
  }

  toggleSim() {
    this.send({ type: "TOGGLE_SIM" });
  }

  setSimSpeed(speed) {
    this.send({ type: "SET_SIM_SPEED", speed: speed });
  }

  ackAlert(alertId) {
    this.send({ type: "ACK_ALERT", alert_id: alertId });
  }

  dismissAlert(alertId) {
    this.send({ type: "DISMISS_ALERT", alert_id: alertId });
  }

  resetAll() {
    this.send({ type: "RESET_ALL" });
  }
}

export const wsService = new WebSocketService();
