import Modal, { PrimaryButton } from "./Modal";

const fmt = ([lat, lng]) => `${lat.toFixed(5)}, ${lng.toFixed(5)}`;

function Row({ label, children }) {
  return (
    <p className="text-sm text-slate-600">
      <span className="font-bold text-[#16394a]">{label}:</span> {children}
    </p>
  );
}

// Final step: review everything, then export
export default function ReviewModal({ open, controlNumber, features, onExport, onBack, onRestart }) {
  const fgPoints = features.filter((f) => f.kind === "fgpoint");
  const hazards = features.filter((f) => f.kind === "hazard");
  const routeOf = (id) => features.find((f) => f.kind === "route" && f.linkedPointId === id);
  const empty = !fgPoints.length && !hazards.length;

  return (
    <Modal open={open} title="Review All Data" onBack={onBack}>
      <p className="-mt-2 mb-3 text-center text-xs text-slate-500">Control number: {controlNumber}</p>

      <div className="divide-y divide-slate-200 rounded-xl border border-slate-200">
        {empty && <p className="p-3 text-sm text-slate-500">Nothing has been mapped yet.</p>}

        {fgPoints.map((f, i) => (
          <div key={f.id} className="space-y-0.5 p-3">
            <p className="text-sm font-bold text-[#16394a]">FG {i + 1}: {f.timeOfDay}</p>
            <Row label="Days">{f.days.join(", ")}</Row>
            <Row label="Months">{f.months.join(", ")}</Row>
            <Row label="Coords">{fmt(f.points[0])}</Row>
            <Row label="Route">{routeOf(f.id) ? "Drawn" : "None"}</Row>
            {f.remarks && <Row label="Remarks">{f.remarks}</Row>}
            {routeOf(f.id)?.remarks && <Row label="Route remarks">{routeOf(f.id).remarks}</Row>}
          </div>
        ))}

        {hazards.map((h, i) => (
          <div key={h.id} className="space-y-0.5 p-3">
            <p className="text-sm font-bold text-[#16394a]">DA {i + 1}: {h.hazardType}</p>
            <Row label="Coords">{fmt(h.points[0])}</Row>
            {h.remarks && <Row label="Remarks">{h.remarks}</Row>}
          </div>
        ))}
      </div>

      <PrimaryButton onClick={onExport} disabled={empty}>Export GeoJSON</PrimaryButton>
      <button
        type="button"
        onClick={onRestart}
        className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
      >
        Start a new entry
      </button>
    </Modal>
  );
}
