import { useState } from "react";
import Modal, { CheckOption, PrimaryButton } from "./Modal";

// Add or rename hazards here. (The mockup had a "hazard3" placeholder.)
const OPTIONS = ["High Waves", "Ship Collisions"];

// Page 5: which hazards do you know about
export default function HazardSelectModal({ open, initial = [], onSubmit, onBack }) {
  const [selected, setSelected] = useState(initial.filter((h) => OPTIONS.includes(h)));
  const otherInitial = initial.find((h) => h.startsWith("Other: "));
  const [otherChecked, setOtherChecked] = useState(Boolean(otherInitial));
  const [otherText, setOtherText] = useState(otherInitial ? otherInitial.slice(7) : "");
  const [error, setError] = useState("");

  const toggle = (label, on) =>
    setSelected((cur) => (on ? [...cur, label] : cur.filter((h) => h !== label)));

  function submit() {
    const hazards = OPTIONS.filter((o) => selected.includes(o));
    if (otherChecked) {
      if (!otherText.trim()) return setError("Please specify the other hazard.");
      hazards.push(`Other: ${otherText.trim()}`);
    }
    if (!hazards.length) return setError("Select at least one hazard.");
    setError("");
    onSubmit(hazards);
  }

  return (
    <Modal open={open} title="What hazards / accident-prone areas are you mapping?" onBack={onBack}>
      <div className="space-y-2">
        {OPTIONS.map((o) => (
          <CheckOption key={o} label={o} checked={selected.includes(o)} onChange={(on) => toggle(o, on)} />
        ))}
        <CheckOption label="Others:" checked={otherChecked} onChange={setOtherChecked}>
          <input
            value={otherText}
            onChange={(e) => setOtherText(e.target.value)}
            disabled={!otherChecked}
            placeholder="Specify"
            className="min-w-0 flex-1 border-b border-slate-300 bg-transparent text-sm outline-none disabled:opacity-40"
          />
        </CheckOption>
      </div>
      <p className="mt-3 text-center text-xs text-slate-500">*Select all that apply</p>
      {error && <p className="mt-3 text-center text-xs font-semibold text-red-600">{error}</p>}
      <PrimaryButton onClick={submit}>Proceed to Mapping</PrimaryButton>
    </Modal>
  );
}
