
import { useState } from "react";
import { useNavigate } from "react-router";

import {
  MapContainer,
  TileLayer,
  ZoomControl
} from "react-leaflet";

import MenuBar from "../components/menubar";

import "leaflet/dist/leaflet.css";

const MAP_CENTER = [11.0, 122.7];
const MAP_ZOOM = 7;

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
          center={MAP_CENTER}
          zoom={MAP_ZOOM}
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
