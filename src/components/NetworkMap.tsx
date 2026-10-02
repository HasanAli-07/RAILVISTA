import { useEffect, useRef } from "react";

declare const L: any;

interface NetworkNode {
  code: string;
  name: string;
  lat: number;
  lng: number;
  activeTrains: number;
  status: "normal" | "warning" | "critical";
}

const NETWORK_NODES: NetworkNode[] = [
  { code: "DELHI", name: "Delhi", lat: 28.6431, lng: 77.2197, activeTrains: 482, status: "normal" },
  { code: "AGRA", name: "Agra", lat: 27.1577, lng: 78.0081, activeTrains: 194, status: "warning" },
  { code: "KANPUR", name: "Kanpur", lat: 26.4542, lng: 80.3507, activeTrains: 236, status: "normal" },
  { code: "LUCKNOW", name: "Lucknow", lat: 26.8322, lng: 80.9234, activeTrains: 156, status: "critical" },
  { code: "JAIPUR", name: "Jaipur", lat: 26.9196, lng: 75.7878, activeTrains: 188, status: "normal" },
  { code: "BHOPAL", name: "Bhopal", lat: 23.2599, lng: 77.4126, activeTrains: 214, status: "normal" },
  { code: "NAGPUR", name: "Nagpur", lat: 21.1524, lng: 79.0882, activeTrains: 174, status: "normal" }
];

const CORRIDOR_LINES = [
  { from: "DELHI", to: "AGRA", status: "normal", color: "#5aa1f9" },
  { from: "AGRA", to: "KANPUR", status: "normal", color: "#5aa1f9" },
  { from: "KANPUR", to: "LUCKNOW", status: "severe", color: "#dc5656" },
  { from: "DELHI", to: "JAIPUR", status: "moderate", color: "#edac42" },
  { from: "AGRA", to: "BHOPAL", status: "moderate", color: "#edac42" },
  { from: "BHOPAL", to: "NAGPUR", status: "normal", color: "#5aa1f9" }
];

export default function NetworkMap() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (typeof L === "undefined") return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [25.5, 78.5],
        zoom: 6,
        zoomControl: false,
        attributionControl: false
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      L.control.zoom({ position: "bottomright" }).addTo(map);
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Draw Network Corridor Lines
    CORRIDOR_LINES.forEach(line => {
      const nodeA = NETWORK_NODES.find(n => n.code === line.from);
      const nodeB = NETWORK_NODES.find(n => n.code === line.to);
      if (nodeA && nodeB) {
        L.polyline([[nodeA.lat, nodeA.lng], [nodeB.lat, nodeB.lng]], {
          color: line.color,
          weight: line.status === "severe" ? 6 : 4,
          opacity: 0.9,
          dashArray: line.status === "severe" ? "8, 8" : undefined
        }).addTo(map);
      }
    });

    // Add Network Nodes
    NETWORK_NODES.forEach(node => {
      const dotColor = node.status === "critical" ? "#d34141" : (node.status === "warning" ? "#d97706" : "#0969e8");
      
      const iconHtml = `
        <div style="
          display: flex;
          flex-direction: column;
          align-items: center;
          font-family: 'DM Sans', sans-serif;
        ">
          <span style="
            width: 14px;
            height: 14px;
            border-radius: 50%;
            background: ${dotColor};
            border: 3px solid #ffffff;
            box-shadow: 0 3px 10px rgba(9, 105, 232, 0.3);
          "></span>
          <div style="
            margin-top: 3px;
            padding: 3px 7px;
            border-radius: 6px;
            background: rgba(255, 255, 255, 0.92);
            border: 1px solid #d9e3f0;
            box-shadow: 0 2px 8px rgba(37, 65, 105, 0.1);
            text-align: center;
          ">
            <strong style="display: block; color: #10213d; font-size: 10px;">${node.name}</strong>
            <small style="color: #718096; font-size: 8px;">${node.activeTrains} trains</small>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: "network-node-marker",
        iconSize: [80, 42],
        iconAnchor: [40, 7]
      });

      const marker = L.marker([node.lat, node.lng], { icon: customIcon }).addTo(map);
      marker.bindPopup(`<b>${node.name} Hub</b><br/>Active Trains: <b>${node.activeTrains}</b><br/>Status: <b>${node.status.toUpperCase()}</b>`);
    });

  }, []);

  return (
    <div style={{ position: "relative", width: "100%", height: "445px", borderRadius: "16px", overflow: "hidden" }}>
      <div ref={mapContainerRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}
