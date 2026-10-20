
import { useState } from "react";
import {
  Menu,
  X,
  Map,
  Route,
  Fish,
  MapPin,
  House
} from "lucide-react";

import logo from "../assets/Logo-w.png";


const MENU_ITEMS = [
  {
    id: "map",
    label: "Map",
    Icon: Map
  },
  {
    id: "route",
    label: "Draw Route",
    Icon: Route
  },
  {
    id: "fishing",
    label: "Paint Fishing Ground",
    Icon: Fish
  },
  {
    id: "special",
    label: "Map Special Areas",
    Icon: MapPin
  }
];

export default function MenuBar({
  activeTool = "map",
  onToolChange = () => {},
  onHome = () => {}
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <aside
      className={`map-menubar ${expanded ? "expanded" : ""}`}
      aria-label="Map navigation"
    >
      <button
        type="button"
        className="map-menu-toggle"
        onClick={() => setExpanded((value) => !value)}
        aria-label={expanded ? "Collapse menu" : "Expand menu"}
        aria-expanded={expanded}
      >
        {expanded ? <X size={27} /> : <Menu size={27} />}
      </button>

      <nav className="map-menu-items">
        {MENU_ITEMS.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            className={`map-menu-item ${
              activeTool === id ? "active" : ""
            }`}
            onClick={() => onToolChange(id)}
            aria-pressed={activeTool === id}
            title={label}
          >
            <Icon size={27} strokeWidth={2.3} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <div className="map-menu-bottom">
        <button
          type="button"
          className="map-menu-home"
          onClick={onHome}
          title="Return to homepage"
          aria-label="Return to homepage"
        >
          <House size={22} />
          {expanded && <span>Home</span>}
        </button>

        <img
          src={logo}
          alt="reSEAlience logo"
          className="map-menu-logo"
        />
      </div>
    </aside>
  );
}
