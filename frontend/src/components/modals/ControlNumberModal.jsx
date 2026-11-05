import { useState } from "react";
import Modal, { CheckOption, PrimaryButton } from "./Modal";

// Page 2: control number + what will be plotted (FG / DA / both)
export default function ControlNumberModal({ open, initial, onSubmit }) {
  const [controlNumber, setControlNumber] = useState(initial?.controlNumber || "");
  const [mapFG, setMapFG] = useState(initial?.mapFG || false);
  const [mapDA, setMapDA] = useState(initial?.mapDA || false);
  const [error, setError] = useState("");

  function submit() {
    if (!controlNumber.trim()) return setError("Enter your control number.");
    if (!mapFG && !mapDA) return setError("Select at least one feature to map.");
    setError("");
    onSubmit({ controlNumber: controlNumber.trim(), mapFG, mapDA });
  }

  return (
    <Modal open={open} title="Enter Control Number">
      <input
        value={controlNumber}
        onChange={(e) => setControlNumber(e.target.value)}
        aria-label="Control number"
        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
      />

      <h3 className="mt-6 text-center text-lg font-extrabold text-[#16394a]">Which feature will you map?</h3>
      <div className="mt-3 space-y-2">
        <CheckOption checked={mapFG} onChange={setMapFG} label="Fishing Grounds" />
        <CheckOption checked={mapDA} onChange={setMapDA} label="Dangerous Areas" />
      </div>
      <p className="mt-2 text-center text-xs text-slate-500">*Select all that apply</p>

      {error && <p className="mt-3 text-center text-xs font-semibold text-red-600">{error}</p>}
      <PrimaryButton onClick={submit}>Proceed</PrimaryButton>
    </Modal>
  );
}
