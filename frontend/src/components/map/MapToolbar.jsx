import {
  Compass, Hexagon, Route, TriangleAlert, Flag,
  TreePalm, Sprout, Trash2, Fish, Warehouse, Shell,
} from "lucide-react";

const tools = [
  { id: "pan", label: "Explore", icon: Compass, help: "Move around the map" },
  { id: "ground", label: "Fishing ground", icon: Hexagon, help: "Tap points to draw an area, then Finish" },
  { id: "route", label: "Fishing route", icon: Route, help: "Tap points to trace a route, then Finish" },
  { id: "hazard", label: "Hazard", icon: TriangleAlert, help: "Tap the map to mark a hazard" },
  { id: "incident", label: "Incident", icon: Flag, help: "Tap the map to mark an incident" },
  { id: "mangrove", label: "Mangrove", icon: TreePalm, help: "Tap points to draw a mangrove area, then Finish" },
  { id: "vegetation", label: "Kelp", icon: Sprout, help: "Tap points to draw a kelp area, then Finish" },
  { id: "trash", label: "Trash", icon: Trash2, help: "Tap points to draw a trash area, then Finish" },
  { id: "fish", label: "Fish", icon: Fish, help: "Enter the species, then tap the map" },
  { id: "farm", label: "Farm", icon: Warehouse, help: "Tap points to draw a farm area, then Finish" },
  { id: "coral", label: "Coral Reef", icon: Shell, help: "Tap points to draw a coral area, then Finish" },
];

// Tools that are drawn with multiple taps and need a Finish button
const drawingTools = ["ground", "route", "mangrove", "vegetation", "trash", "farm", "coral"];

const finishLabels = {
  ground: "area",
  route: "route",
  mangrove: "mangrove area",
  vegetation: "kelp area",
  trash: "trash area",
  farm: "farm area",
  coral: "coral area",
};

// Tools that ask for a species. `required` ones block saving without it.
const speciesConfig = {
  fish:   { required: true,  label: "Fish species seen", placeholder: "e.g. Bangus, Tilapia" },
  farm:   { required: true,  label: "Fish species in this farm", placeholder: "e.g. Bangus, Tilapia" },
  ground: { required: false, label: "Fish species seen here (optional)", placeholder: "e.g. Tuna, Galunggong" },
};

export default function MapToolbar({
  activeTool,
  onChange,
  onFinish,
  canFinish,
  onCancel,
  observedMonth,
  onObservedMonthChange,
  fishSpecies,
  onFishSpeciesChange,
}) {
  const species = speciesConfig[activeTool];
  const isDrawing = drawingTools.includes(activeTool);
  const speciesMissing = species?.required && !fishSpecies.trim();

  return (
    <div className="space-y-2">
      <p className="px-1 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Map tools</p>

      <div>
        <label htmlFor="observed-month" className="block p-2 text-sm font-semibold text-slate-700">
          Observed month and year <span className="text-red-600">*</span>
        </label>
        <input
          id="observed-month"
          type="month"
          required
          value={observedMonth}
          onChange={(event) => onObservedMonthChange(event.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
        />
        <p className="mt-4 mb-2 p-2 text-xs text-slate-500">Enter when the observation was made.</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <button
              key={tool.id}
              type="button"
              onClick={() => onChange(tool.id)}
              title={tool.help}
              className={`rounded-xl border px-3 py-3 text-left transition ${
                activeTool === tool.id
                  ? "border-teal-700 bg-teal-50 text-teal-900 ring-1 ring-teal-700"
                  : "border-slate-200 bg-white text-slate-700 hover:border-teal-300 hover:bg-teal-50"
              }`}
            >
              <span className="flex items-center gap-2 font-semibold">
                <Icon size={20} strokeWidth={2} aria-hidden="true" className="shrink-0" />
                {tool.label}
              </span>
            </button>
          );
        })}
      </div>

      {activeTool !== "pan" && (
        <p className="px-1 text-xs text-slate-500">
          {tools.find((t) => t.id === activeTool)?.help}
        </p>
      )}

      {/* Species text input */}
      {species && (
        <div className="rounded-xl border border-teal-200 bg-teal-50/60 p-3">
          <label htmlFor="fish-species" className="block text-xs font-semibold text-slate-700">
            {species.label}
            {species.required && <span className="text-red-600"> *</span>}
          </label>
          <input
            id="fish-species"
            type="text"
            value={fishSpecies}
            onChange={(event) => onFishSpeciesChange(event.target.value)}
            placeholder={species.placeholder}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
          />
          <p className="mt-1 text-[11px] text-slate-500">Separate several species with commas.</p>
        </div>
      )}

      {activeTool !== "pan" && !observedMonth && (
        <p className="px-1 text-xs font-semibold text-red-600">
          Choose the observed month and year before marking the map.
        </p>
      )}
      {speciesMissing && observedMonth && (
        <p className="px-1 text-xs font-semibold text-red-600">Enter the fish species first.</p>
      )}

      {isDrawing && (
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            disabled={!canFinish || !observedMonth || speciesMissing}
            onClick={onFinish}
            className="rounded-lg bg-teal-700 px-3 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Finish {finishLabels[activeTool]}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}