import Modal, { PrimaryButton } from "./Modal";

// Page 7: save / export
export default function ExportModal({ open, controlNumber, counts, onExport, onBack, onRestart }) {
  return (
    <Modal open={open} title="Save / Export Data" onBack={onBack}>
      <p className="text-center text-sm text-slate-600">
        Control number: <span className="font-bold text-[#16394a]">{controlNumber}</span>
      </p>
      <ul className="mt-4 space-y-1 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
        <li>Fishing points: <b>{counts.points}</b></li>
        <li>Routes: <b>{counts.routes}</b></li>
        <li>Hazard points: <b>{counts.hazards}</b></li>
      </ul>
      <PrimaryButton onClick={onExport}>Export GeoJSON</PrimaryButton>
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
