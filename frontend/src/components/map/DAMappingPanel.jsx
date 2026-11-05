import RemarkField from "./RemarkField";

// Page 6: DA point plotting. One group per hazard picked in page 5.
// Every placed point is listed under its hazard with its own optional remark and a remove button.
export default function DAMappingPanel({
  hazards, points, activeHazard, selectedId,
  onSelectHazard, onSelectPoint, onRemovePoint, onRemarkChange,
  canProceed, onProceed,
}) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-800">Mapping workspace</p>
        <p className="mt-2 text-lg font-extrabold text-[#16394a]">Dangerous areas</p>
        <p className="mt-1 text-xs text-slate-500">
          Choose a hazard, then tap the map to add a point for it. Each point can have its own remark. Use ✕ to remove a point.
        </p>
      </div>

      <ul className="space-y-2">
        {hazards.map((h) => {
          const list = points.filter((p) => p.hazardType === h);
          const active = activeHazard === h;
          return (
            <li
              key={h}
              className={`rounded-xl border transition ${
                active ? "border-teal-700 bg-teal-50 ring-1 ring-teal-700" : "border-slate-200 bg-white"
              }`}
            >
              <button
                type="button"
                onClick={() => onSelectHazard(h)}
                className="flex w-full items-center justify-between px-3 py-3 text-left text-sm font-bold"
              >
                <span>{h}</span>
                <span className={`text-xs ${list.length ? "text-emerald-700" : "text-slate-400"}`}>
                  {list.length ? `✓ ${list.length} point(s)` : "No point yet"}
                </span>
              </button>

              {list.length > 0 && (
                <ul className="space-y-2 border-t border-slate-200/70 px-2 py-2">
                  {list.map((p, i) => (
                    <li
                      key={p.id}
                      className={`space-y-1.5 rounded-lg p-2 ${selectedId === p.id ? "bg-white ring-1 ring-teal-600" : ""}`}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <button
                          type="button"
                          onClick={() => onSelectPoint(p)}
                          className="flex-1 text-left font-semibold text-slate-700"
                          title="Show on map"
                        >
                          Point {i + 1} · {p.points[0][0].toFixed(3)}, {p.points[0][1].toFixed(3)}
                        </button>
                        <button
                          type="button"
                          onClick={() => onRemovePoint(p.id)}
                          aria-label={`Remove ${h} point ${i + 1}`}
                          className="ml-2 rounded-md px-2 py-0.5 font-bold text-red-700 hover:bg-red-50"
                        >
                          ✕
                        </button>
                      </div>
                      <RemarkField
                        id={`remark-${p.id}`}
                        label="Remarks about this point"
                        rows={1}
                        value={p.remarks}
                        onChange={(value) => onRemarkChange(p.id, value)}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>

      <div className="space-y-2">
        <button type="button" disabled={!canProceed} onClick={onProceed}
          className="w-full rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-teal-800 disabled:opacity-40">
          Proceed
        </button>
        {!canProceed && <p className="text-xs text-slate-500">Add at least one point for every hazard to continue.</p>}
      </div>
    </div>
  );
}
