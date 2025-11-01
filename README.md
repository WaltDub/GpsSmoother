# Gps Smoother

GpsSmoother.js is a lightweight JavaScript class for smoothing noisy GPS data in real time. It calculates stabilized bearing, altitude, and speed using a configurable sliding window and exponential smoothing. Ideal for mapping, tracking, and telemetry applications.

## Support This Project
If you find GpsSmoother.js useful, consider supporting its development:

[![Donate via Stripe](https://img.shields.io/badge/Donate-Stripe-blue)](https://donate.stripe.com/7sYbJ2de5eHX4gO5BZbbG00)

## Features
Each feature in GpsSmoother.js is designed for practical, real-world GPS workflows:

- **Bearing smoothing using vector averaging**  
  Prevents wraparound errors near 0°/360° and reduces jitter in heading.  
  Essential for stable directional indicators and map rotation.

- **Altitude smoothing with median and exponential filter**  
  Combines outlier rejection (median) with responsiveness (exponential).  
  Produces reliable elevation data for terrain profiles and vertical movement.

- **Speed smoothing based on haversine distance and time delta**  
  Avoids noisy GPS speed readings by computing actual distance over time.  
  Critical for speed compliance, fitness tracking, and motion analysis.

- **Stability metrics for bearing and altitude**  
  Measures consistency of movement and vertical signal quality.  
  Useful for confidence scoring, UI feedback, and conditional logic.

- **GeoJSON export for easy mapping and integration**  
  Outputs standardized geometry and telemetry for use in Leaflet, Mapbox, PostGIS, etc.  
  Enables direct visualization and spatial analysis without transformation.

- **Configurable window size and smoothing factor**  
  Lets developers tune the smoother for responsiveness vs. stability.  
  Adapts to different use cases like drones, hiking, or vehicle tracking.

- **Stateless, dependency-free, and easy to integrate**  
  No external libraries or shared state.  
  Works in browser, Node.js, or embedded systems with minimal setup.

## Getting Started

You can include GpsSmoother.js directly in your HTML using jsDelivr:
```html
<script type="module">
import GpsSmoother from 'https://cdn.jsdelivr.net/gh/WaltDub/GpsSmoother/GpsSmoother.js';

const smoother = new GpsSmoother(5, 0.3);
smoother.addPosition(57.05, 9.92, 12.3);
console.log(smoother.getSmoothedData());
</script>
```
## Overview

### `new GpsSmoother(windowSize = 5, alpha = 0.3)`

Creates a new smoother instance.

- `windowSize`: Number of recent positions to use for smoothing  
- `alpha`: Smoothing factor (0 = slow response, 1 = fast response)

### `.addPosition(lat, lon, altitude, timestamp?)`

Adds a new GPS point to the smoother.

- `lat`, `lon`: Latitude and longitude in decimal degrees  
- `altitude`: Altitude in meters  
- `timestamp`: Optional Unix timestamp in milliseconds (defaults to `Date.now()`)

### `.getSmoothedData()`

Returns an object containing the smoothed telemetry and stability metrics:

{ bearing: 123.4, altitude: 15.2, speed: 3.7, bearing_stability: 1.1, altitude_variance: 0.6 }

Code

### `.toGeoJSON()`

Returns a GeoJSON `Feature` with `LineString` geometry and smoothed telemetry in `properties`.

### `.reset()`

Clears all stored positions and resets the internal smoothing state.

### `.setWindowSize(size)`  
### `.setAlpha(alpha)`

Dynamically update smoothing parameters.

## GeoJSON Output Example
```html
{
  "type": "Feature",
  "geometry": { "type": "LineString", "coordinates": [ [9.92, 57.05], [9.93, 57.06] ] },
  "properties": { "bearing": 45.2, "altitude": 12.8, "speed": 3.4, "bearing_stability": 1.2, "altitude_variance": 0.6 }
}
```

## Use Cases

- Real-time GPS tracking  
- Map visualizations  
- Speed compliance systems  
- Drone telemetry  
- Fitness and mobility apps  
- GeoJSON-based data pipelines

## License

This project is licensed under the **GNU General Public License v3.0 (GPL-3.0)**.  
See the [LICENSE](./LICENSE) file for full details.
