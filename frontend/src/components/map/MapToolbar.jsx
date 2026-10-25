const tools = [
  { id: "pan", label: "Explore", icon: "⌖", help: "Move around the map" },
  { id: "ground", label: "Fishing ground", icon: "⬡", help: "Tap points to draw an area" },
  { id: "route", label: "Fishing route", icon: "↗", help: "Tap points to trace a route" },
  { id: "hazard", label: "Hazard", icon: "!", help: "Tap to mark a hazard" },
  { id: "incident", label: "Incident", icon: "⚑", help: "Tap to mark an incident" },
];

export default function MapToolbar({ activeTool, onChange, onFinish, canFinish, onCancel }) {
  return (
    <div className="space-y-2">
      <p className="px-1 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Map tools</p>
      <div className="grid grid-cols-2 gap-2">
        {tools.map((tool) => (
          <button key={tool.id} type="button" onClick={() => onChange(tool.id)}
            title={tool.help}
            className={`rounded-xl border px-3 py-3 text-left transition ${activeTool === tool.id
              ? "border-teal-700 bg-teal-50 text-teal-900 ring-1 ring-teal-700"
              : "border-slate-200 bg-white text-slate-700 hover:border-teal-300 hover:bg-teal-50"}`}>
            <span className="flex items-center gap-2 font-semibold"><span className="text-lg">{tool.icon}</span>{tool.label}</span>
          </button>
        ))}
      </div>
      {(activeTool === "ground" || activeTool === "route") && (
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button type="button" disabled={!canFinish} onClick={onFinish}
            className="rounded-lg bg-teal-700 px-3 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40">
            Finish {activeTool === "ground" ? "area" : "route"}
          </button>
          <button type="button" onClick={onCancel}
            className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
