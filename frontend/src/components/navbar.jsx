
import { useState } from "react";
import logo_white from "../assets/Logo-w.png";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="relative z-50 w-full border-b border-gray-200 bg-white">
      <div className="mx-auto flex min-h-14 w-full max-w-7xl items-center justify-between px-4 py-2 sm:px-6">
        {/* Logo */}
        <a href="/" aria-label="reSEAlience homepage" className="shrink-0">
          <img
            src={logo_white}
            alt="reSEAlience"
            className="h-10 w-auto object-contain sm:h-12"
          />
        </a>

        {/* Hamburger menu */}
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          className="flex h-11 w-11 shrink-0 flex-col items-center justify-center gap-1.5 rounded-lg text-[#194568] transition hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4e9a83]"
        >
          <span
            className={`h-1 w-7 rounded-full bg-current transition-transform ${
              menuOpen ? "translate-y-2 rotate-45" : ""
            }`}
          />
          <span
            className={`h-1 w-7 rounded-full bg-current transition-opacity ${
              menuOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`h-1 w-7 rounded-full bg-current transition-transform ${
              menuOpen ? "-translate-y-3 -rotate-45" : ""
            }`}
          />
        </button>
      </div>

      {/* Dropdown menu */}
      {menuOpen && (
        <div className="absolute right-3 top-full mt-1 w-56 overflow-hidden rounded-xl border border-gray-200 bg-white p-2 shadow-lg sm:right-6">
          <a
            href="/"
            className="block rounded-lg px-4 py-3 text-sm font-medium text-[#194568] hover:bg-gray-100"
          >
            Home
          </a>
          <a
            href="/map"
            className="block rounded-lg px-4 py-3 text-sm font-medium text-[#194568] hover:bg-gray-100"
          >
            Open Map
          </a>
          <a
            href="/observations"
            className="block rounded-lg px-4 py-3 text-sm font-medium text-[#194568] hover:bg-gray-100"
          >
            My Observations
          </a>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
