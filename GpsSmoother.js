class GpsSmoother {
  constructor(windowSize = 5, alpha = 0.3) {
    this.windowSize = windowSize;
    this.alpha = alpha;
    this.reset();
  }

  reset() {
    this.positions = []; // {lat, lon, altitude, timestamp}
    this.bearings = [];
    this.altitudes = [];
    this.speeds = [];
    this.smoothed = {
      bearing: null,
      altitude: null,
      speed: null,
    };
  }

  setWindowSize(size) {
    this.windowSize = size;
    if (this.positions.length > size) {
      this.positions = this.positions.slice(-size);
    }
  }

  setAlpha(alpha) {
    this.alpha = alpha;
  }

  addPosition(lat, lon, altitude, timestamp = Date.now()) {
    this.positions.push({ lat, lon, altitude, timestamp });
    if (this.positions.length > this.windowSize) this.positions.shift();

    this._updateBearing();
    this._updateAltitude();
    this._updateSpeed();
  }

  _updateBearing() {
    if (this.positions.length < 2) return;

    this.bearings = [];
    for (let i = 1; i < this.positions.length; i++) {
      const b = this._calculateBearing(this.positions[i - 1], this.positions[i]);
      this.bearings.push(b);
    }

    let sumX = 0, sumY = 0;
    for (let b of this.bearings) {
      sumX += Math.cos(b * Math.PI / 180);
      sumY += Math.sin(b * Math.PI / 180);
    }
    let avg = Math.atan2(sumY, sumX) * 180 / Math.PI;
    this.smoothed.bearing = (avg + 360) % 360;
  }

  _updateAltitude() {
    this.altitudes = this.positions.map(p => p.altitude);
    const sorted = [...this.altitudes].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];

    this.smoothed.altitude = this.smoothed.altitude === null
      ? median
      : this.alpha * median + (1 - this.alpha) * this.smoothed.altitude;
  }

  _updateSpeed() {
    this.speeds = [];
    for (let i = 1; i < this.positions.length; i++) {
      const d = this._haversine(this.positions[i - 1], this.positions[i]);
      const dt = (this.positions[i].timestamp - this.positions[i - 1].timestamp) / 1000;
      if (dt > 0) this.speeds.push(d / dt);
    }

    const avgSpeed = this.speeds.reduce((a, b) => a + b, 0) / this.speeds.length || 0;
    this.smoothed.speed = this.smoothed.speed === null
      ? avgSpeed
      : this.alpha * avgSpeed + (1 - this.alpha) * this.smoothed.speed;
  }

  _calculateBearing(p1, p2) {
    const toRad = deg => deg * Math.PI / 180;
    const lat1 = toRad(p1.lat), lat2 = toRad(p2.lat);
    const dLon = toRad(p2.lon - p1.lon);

    const y = Math.sin(dLon) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) -
              Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
    return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
  }

  _haversine(p1, p2) {
    const R = 6371000;
    const toRad = deg => deg * Math.PI / 180;
    const dLat = toRad(p2.lat - p1.lat);
    const dLon = toRad(p2.lon - p1.lon);
    const lat1 = toRad(p1.lat), lat2 = toRad(p2.lat);

    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  _stdDev(arr) {
    if (arr.length === 0) return 0;
    const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
    const variance = arr.reduce((a, b) => a + (b - mean) ** 2, 0) / arr.length;
    return Math.sqrt(variance);
  }

  getSmoothedData() {
    return {
      bearing: this.smoothed.bearing,
      altitude: this.smoothed.altitude,
      speed: this.smoothed.speed,
      bearing_stability: this._stdDev(this.bearings),
      altitude_variance: this._stdDev(this.altitudes),
    };
  }

  toGeoJSON() {
    return {
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: this.positions.map(p => [p.lon, p.lat])
      },
      properties: this.getSmoothedData()
    };
  }
}

window.GpsSmoother = GpsSmoother;


