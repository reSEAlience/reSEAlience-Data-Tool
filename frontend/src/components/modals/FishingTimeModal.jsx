import { useState } from "react";
import Modal, { CheckOption, PrimaryButton } from "./Modal";

const OPTIONS = ["Early Morning", "Afternoon", "Night"];

// Page 3: what time of day do you fish (FG / BOTH only)
export default function FishingTimeModal({ open, initial = [], onSubmit, onBack }) {
  const [selected, setSelected] = useState(initial.filter((t) => OPTIONS.includes(t)));
  const otherInitial = initial.find((t) => t.startsWith("Other: "));
  const [otherChecked, setOtherChecked] = useState(Boolean(otherInitial));
  const [otherText, setOtherText] = useState(otherInitial ? otherInitial.slice(7) : "");
  const [error, setError] = useState("");

  const toggle = (label, on) =>
    setSelected((cur) => (on ? [...cur, label] : cur.filter((t) => t !== label)));

  function submit() {
    const times = OPTIONS.filter((o) => selected.includes(o)); // keep a consistent order
    if (otherChecked) {
      if (!otherText.trim()) return setError("Please specify the other time of day.");
      times.push(`Other: ${otherText.trim()}`);
    }
    if (!times.length) return setError("Select at least one time of day.");
    setError("");
    onSubmit(times);
  }

  return (
    <Modal open={open} title="What time of day do you frequently fish?" onBack={onBack}>
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
