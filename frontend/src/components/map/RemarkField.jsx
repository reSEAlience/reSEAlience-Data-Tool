// Optional remark for ONE specific point or route.
export default function RemarkField({ label, value, onChange, rows = 2, id }) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-bold text-[#16394a]">
        {label} <span className="font-semibold text-slate-400">(optional)</span>
      </label>
      <textarea
        id={id}
        rows={rows}
        maxLength={300}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Add a note"
        className="mt-1 w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
      />
    </div>
  );
}
