

import { useState } from "react";
import { useNavigate } from "react-router";

import {
  MapContainer,
  TileLayer,
  ZoomControl
} from "react-leaflet";

import MenuBar from "../components/menubar";

import "leaflet/dist/leaflet.css";

// Approximate Western Visayas display bounds
const WESTERN_VISAYAS_BOUNDS = [
  [9.5, 121.0],   // Southwest
  [12.5, 124.0]   // Northeast
];

export default function MapPage() {
  const [activeTool, setActiveTool] = useState("map");
  const navigate = useNavigate();

  return (
    <main className="mapping-page">
      <MenuBar
        activeTool={activeTool}
        onToolChange={setActiveTool}
        onHome={() => navigate("/")}
      />

      <section className="mapping-content">
        <MapContainer
          bounds={WESTERN_VISAYAS_BOUNDS}
          boundsOptions={{ padding: [20, 20] }}
          minZoom={5}
          maxZoom={18}
          zoomControl={false}
          className="leaflet-map"
          preferCanvas={true}
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />

          <ZoomControl position="bottomright" />
        </MapContainer>
      </section>
    </main>
  );
}