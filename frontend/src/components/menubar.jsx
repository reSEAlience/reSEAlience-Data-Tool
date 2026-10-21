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
    Icon: Map,
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Explore the marine environment and discover important locations across Western Visayas."
  },
  {
    id: "route",
    label: "Draw Route",
    Icon: Route,
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mark your fishing routes and identify the paths you commonly travel at sea."
  },
  {
    id: "fishing",
    label: "Paint Fishing Ground",
    Icon: Fish,
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Select areas on the map to identify fishing grounds and important fishing locations."
  },
  {
    id: "special",
    label: "Map Special Areas",
    Icon: MapPin,
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Identify important marine areas, habitats, and locations of local significance."
  }
];

export default function MenuBar({
  activeTool = "map",
  onToolChange = () => {},
  onHome = () => {}
}) {
  const [expanded, setExpanded] = useState(false);

  const selectedTool =
    MENU_ITEMS.find((item) => item.id === activeTool) ||
    MENU_ITEMS[0];

  const SelectedIcon = selectedTool.Icon;

  return (
    <aside
      className={`map-menubar ${expanded ? "expanded" : ""}`}
      aria-label="Map navigation"
    >
      {/* Header */}
      <div className="map-menu-header">

        {expanded && (
          <span className="map-menu-title">
            BakodDagat
          </span>
        )}

        <button
          type="button"
          className="map-menu-toggle"
          onClick={() => setExpanded((value) => !value)}
          aria-label={expanded ? "Collapse menu" : "Expand menu"}
          aria-expanded={expanded}
        >
          {expanded ? <X size={27} /> : <Menu size={27} />}
        </button>
      </div>

      {/* Expanded tool information */}
      {expanded && (
        <div className="map-tool-info">
          <div className="map-tool-heading">
            <SelectedIcon size={26} />
            <span>{selectedTool.label}</span>
          </div>

          <p className="map-tool-description">
            {selectedTool.description}
          </p>
        </div>
      )}

      {/* Navigation tools */}
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

      {/* Bottom section */}
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
