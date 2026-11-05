// Shared shell for every wizard step. z-[2000] keeps it above the Leaflet panes and the header.
export default function Modal({ open, title, onBack, children }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-900/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="wizard-modal-title"
    >
      <div className="relative max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            aria-label="Go back"
            className="absolute left-4 top-4 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            ←
          </button>
        )}
        <h2
          id="wizard-modal-title"
          className={`text-center text-xl font-extrabold text-[#16394a] ${onBack ? "mt-8" : ""}`}
        >
          {title}
        </h2>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}

export function CheckOption({ checked, onChange, label, children }) {
  return (
    <label
      className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-3 transition ${
        checked ? "border-teal-700 bg-teal-50" : "border-slate-200 hover:bg-slate-50"
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-5 w-5 shrink-0 accent-teal-700"
      />
      <span className="text-sm font-bold text-[#16394a]">{label}</span>
      {children}
    </label>
  );
}

export function PrimaryButton({ children, ...props }) {
  return (
    <button
      type="button"
      {...props}
      className="mt-6 w-full rounded-xl bg-[#16394a] px-4 py-3 text-sm font-bold text-white hover:bg-[#10303f] disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}
