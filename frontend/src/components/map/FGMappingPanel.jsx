import RemarkField from "./RemarkField";

const DAYS = ["Mon", "Tue", "Wed", "Thur", "Fri", "Sat", "Sun"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const btnDark = "w-full rounded-xl bg-[#16394a] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#10303f] disabled:cursor-not-allowed disabled:opacity-40";
const btnLight = "w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-800 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40";

function CheckGrid({ items, selected, onToggle, cols }) {
  return (
    <div className={`mt-2 grid gap-y-2 ${cols}`}>
      {items.map((item) => (
        <label key={item} className="flex items-center gap-2 text-sm font-semibold">
          <input
            type="checkbox"
            checked={selected.includes(item)}
            onChange={() => onToggle(item)}
            className="h-4 w-4 accent-teal-700"
          />
          {item}
        </label>
      ))}
    </div>
  );
}

// Page 4: FG point plotting (shown in the sidebar so the map stays usable)
export default function FGMappingPanel({
  timeOfDay, progress, days, months, onToggleDay, onToggleMonth,
  isDrawingRoute, canDrawRoute, canFinishRoute, hasSelectedPoint,
  isPlacingPoint, onAddPoint, onRemovePoint,
  onDrawRoute, onFinishRoute, onCancelRoute, onDeleteRoute, onProceed,
  selectedPoint, selectedRoute, onPointRemarkChange, onRouteRemarkChange,
}) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-800">Mapping workspace</p>
        <p className="mt-2 text-lg font-extrabold text-[#16394a]">Time of day: {timeOfDay}</p>
        <p className="text-xs text-slate-500">{progress}</p>
      </div>

      <div>
        <h3 className="text-sm font-extrabold text-[#16394a]">Days:</h3>
        <CheckGrid items={DAYS} selected={days} onToggle={onToggleDay} cols="grid-cols-3" />
      </div>

      <div>
        <h3 className="text-sm font-extrabold text-[#16394a]">Months:</h3>
        <CheckGrid items={MONTHS} selected={months} onToggle={onToggleMonth} cols="grid-cols-3" />
      </div>

      <p className="text-xs text-slate-500">
        Pick the days and months you fish at a point, then tap <b>Add New Point</b> and tap the map. Select a point to draw its route.
      </p>

      {/* Remarks belong to the selected point (and its route), not to the whole dataset */}
      {selectedPoint && (
        <div className="space-y-3 rounded-xl border border-teal-200 bg-teal-50/60 p-3">
          <p className="text-sm font-extrabold text-[#16394a]">{selectedPoint.name}</p>
          <RemarkField
            id={`remark-${selectedPoint.id}`}
            label="Remarks about this point"
            value={selectedPoint.remarks}
            onChange={onPointRemarkChange}
          />
          {selectedRoute && (
            <RemarkField
              id={`remark-${selectedRoute.id}`}
              label="Remarks about this route"
              value={selectedRoute.remarks}
              onChange={onRouteRemarkChange}
            />
          )}
        </div>
      )}

      <div className="space-y-2">
        {isDrawingRoute ? (
          <div className="grid grid-cols-2 gap-2">
            <button type="button" className={btnDark} disabled={!canFinishRoute} onClick={onFinishRoute}>Finish Route</button>
            <button type="button" className={btnLight} onClick={onCancelRoute}>Cancel</button>
          </div>
        ) : (
          <button type="button" className={btnDark} disabled={!canDrawRoute} onClick={onDrawRoute}>Draw Route</button>
        )}
        <button type="button" className={btnLight} disabled={!hasSelectedPoint} onClick={onDeleteRoute}>Delete Route</button>
        <button type="button" className={btnDark} disabled={isDrawingRoute} onClick={onAddPoint}>
          {isPlacingPoint ? "Tap the map…" : "Add New Point"}
        </button>
        <button type="button" className={btnLight} disabled={!hasSelectedPoint} onClick={onRemovePoint}>Remove Point</button>
        <button type="button" disabled={isDrawingRoute} onClick={onProceed}
          className="w-full rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-teal-800 disabled:opacity-40">
          Proceed
        </button>
      </div>
    </div>
  );
}
