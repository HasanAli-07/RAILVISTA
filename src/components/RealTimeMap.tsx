import { useEffect, useRef } from "react";

declare const L: any;

interface StationCoord {
  code: string;
  name: string;
  lat: number;
  lng: number;
  status?: string;
}

const STATION_COORDINATES: Record<string, StationCoord> = {
  NDLS: { code: "NDLS", name: "New Delhi", lat: 28.6431, lng: 77.2197 },
  NZM: { code: "NZM", name: "Hazrat Nizamuddin", lat: 28.5888, lng: 77.2536 },
  MTJ: { code: "MTJ", name: "Mathura Jn", lat: 27.4924, lng: 77.6737 },
  AGC: { code: "AGC", name: "Agra Cantt", lat: 27.1577, lng: 78.0081 },
  AF: { code: "AF", name: "Agra Fort", lat: 27.1812, lng: 78.0163 },
  GWL: { code: "GWL", name: "Gwalior Jn", lat: 26.2183, lng: 78.1828 },
  VGLJ: { code: "VGLJ", name: "Jhansi Jn", lat: 25.4484, lng: 78.5685 },
  BPL: { code: "BPL", name: "Bhopal Jn", lat: 23.2599, lng: 77.4126 },
  RKMP: { code: "RKMP", name: "Rani Kamlapati", lat: 23.2205, lng: 77.4395 },
  CNB: { code: "CNB", name: "Kanpur Central", lat: 26.4542, lng: 80.3507 },
  LKO: { code: "LKO", name: "Lucknow Charbagh", lat: 26.8322, lng: 80.9234 },
  JP: { code: "JP", name: "Jaipur Jn", lat: 26.9196, lng: 75.7878 },
  NGP: { code: "NGP", name: "Nagpur Jn", lat: 21.1524, lng: 79.0882 },
  MMCT: { code: "MMCT", name: "Mumbai Central", lat: 18.9696, lng: 72.8193 }
};

interface RealTimeMapProps {
  trainNumber?: string;
  stops?: Array<{ code: string; city: string; time: string; state: string }>;
  currentStationCode?: string;
}

export default function RealTimeMap({ stops = [], currentStationCode = "AGC" }: RealTimeMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Check if Leaflet script loaded
    if (typeof L === "undefined") {
      console.warn("Leaflet script not loaded yet");
      return;
    }

    // Initialize Map if not already created
    if (!mapInstanceRef.current) {
      const initialLat = 27.1577;
      const initialLng = 78.0081;

      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: 7,
        zoomControl: false,
        attributionControl: false
      });

      // OpenStreetMap standard tile layer (free, no API key required)
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      // Add Zoom Control at bottom right
      L.control.zoom({ position: "bottomright" }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Collect route polyline points from stops or defaults
    const routeCoords: [number, number][] = [];
    const validStops = stops.length > 0 ? stops : [
      { code: "NDLS", city: "New Delhi", time: "06:15", state: "passed" },
      { code: "MTJ", city: "Mathura Jn", time: "07:42", state: "passed" },
      { code: "AGC", city: "Agra Cantt", time: "08:37", state: "current" },
      { code: "GWL", city: "Gwalior Jn", time: "10:06", state: "next" },
      { code: "VGLJ", city: "Jhansi Jn", time: "11:31", state: "future" }
    ];

    validStops.forEach(stop => {
      const coord = STATION_COORDINATES[stop.code];
      if (coord) {
        routeCoords.push([coord.lat, coord.lng]);
      }
    });

    // Clear previous markers & polylines
    map.eachLayer((layer: any) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        map.removeLayer(layer);
      }
    });

    if (routeCoords.length > 1) {
      // Draw Railway Route Line
      L.polyline(routeCoords, {
        color: "#0969e8",
        weight: 4,
        opacity: 0.85,
        smoothFactor: 1
      }).addTo(map);

      // Shadow glow line behind
      L.polyline(routeCoords, {
        color: "#0756c9",
        weight: 8,
        opacity: 0.2
      }).addTo(map);
    }

    // Add Station Markers & Live Train Marker
    let liveTrainPos: [number, number] = [27.25, 77.90]; // Default location between Mathura and Agra

    validStops.forEach((stop, index) => {
      const coord = STATION_COORDINATES[stop.code];
      if (!coord) return;

      const isCurrent = stop.state === "current" || stop.code === currentStationCode;
      const isPassed = stop.state === "passed";

      const nodeBg = isPassed ? "#14966c" : (isCurrent ? "#0969e8" : "#718096");

      const iconHtml = `
        <div style="
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 4px 8px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.94);
          border: 1px solid #d9e3f0;
          box-shadow: 0 4px 12px rgba(37, 65, 105, 0.15);
          font-family: 'DM Sans', sans-serif;
          font-size: 11px;
          font-weight: 700;
          color: #10213d;
          white-space: nowrap;
        ">
          <span style="width: 8px; height: 8px; border-radius: 50%; background: ${nodeBg}; display: inline-block;"></span>
          <span>${stop.city} (${stop.code})</span>
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: "custom-station-marker",
        iconSize: [110, 30],
        iconAnchor: [55, 15]
      });

      const marker = L.marker([coord.lat, coord.lng], { icon: customIcon }).addTo(map);
      marker.bindPopup(`<b>${stop.city} (${stop.code})</b><br/>Predicted Arrival: <b>${stop.time}</b>`);

      if (isCurrent && index > 0 && routeCoords[index - 1]) {
        // Calculate train current location slightly before the current station
        const prevCoord = routeCoords[index - 1];
        liveTrainPos = [
          prevCoord[0] + (coord.lat - prevCoord[0]) * 0.75,
          prevCoord[1] + (coord.lng - prevCoord[1]) * 0.75
        ];
      }
    });

    // Add Live Moving Train Animated Marker
    const trainIconHtml = `
      <div style="
        position: relative;
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 10px;
        border-radius: 20px;
        background: #0969e8;
        color: #ffffff;
        box-shadow: 0 6px 20px rgba(9, 105, 232, 0.4);
        border: 2px solid #ffffff;
        font-family: 'DM Sans', sans-serif;
        font-size: 10px;
        font-weight: 700;
      ">
        <span style="display: flex; align-items: center;">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="5" y="3" width="14" height="15" rx="3"/><path d="M8 7h8M8 12h.01M16 12h.01M8 18l-2 3M16 18l2 3M8 21h8"/></svg>
        </span>
        <span>At km 194 · 84 km/h</span>
      </div>
    `;

    const liveTrainIcon = L.divIcon({
      html: trainIconHtml,
      className: "live-train-marker-wrapper",
      iconSize: [160, 34],
      iconAnchor: [80, 17]
    });

    L.marker(liveTrainPos, { icon: liveTrainIcon, zIndexOffset: 1000 }).addTo(map);

    // Fit map bounds to show full route comfortably
    if (routeCoords.length > 0) {
      map.fitBounds(routeCoords, { padding: [40, 40] });
    }

  }, [stops, currentStationCode]);

  return (
    <div style={{ position: "relative", width: "100%", height: "322px", borderRadius: "16px", overflow: "hidden" }}>
      <div ref={mapContainerRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}
