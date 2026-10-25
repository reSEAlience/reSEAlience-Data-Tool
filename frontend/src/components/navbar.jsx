
import { useState } from "react";
import { Link, useLocation } from "react-router";
import logo_white from "../assets/Logo-w.png";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const closeMenu = () => setMenuOpen(false);

  const links = [
    { name: "Home", to: "/" },
    { name: "Open Map", to: "/map" },
  ];

  const isActive = (path) => location.pathname === path;

  const linkStyle = (path) =>
    `block rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
      isActive(path)
        ? "bg-[#e8f1e9] text-[#126c80]"
        : "text-[#16394a] hover:bg-[#e8f1e9] hover:text-[#126c80]"
    }`;

  return (
    <nav className="relative z-50 w-full border-b border-[#e3e8e1] bg-[#fffdf9] pt-[env(safe-area-inset-top)]">
      <div className="mx-auto flex min-h-16 w-full max-w-7xl items-center justify-between px-4 py-2 sm:px-6">
        {/* Logo */}
        <Link
          to="/"
          aria-label="reSEAlience homepage"
          className="shrink-0"
          onClick={closeMenu}
        >
          <img
            src={logo_white}
            alt="reSEAlience"
            className="h-10 w-auto object-contain sm:h-12"
          />
        </Link>

        {/* Desktop navigation */}
        <div className="hidden items-center gap-2 sm:flex">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={linkStyle(link.to)}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Mobile hamburger button */}
        <button
          type="button"
          className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-lg text-[#16394a] transition-colors hover:bg-[#e8f1e9] sm:hidden"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
          aria-controls="homepage-navigation-menu"
        >
          <span
            className={`h-0.5 w-6 rounded-full bg-current transition-transform ${
              menuOpen ? "translate-y-2 rotate-45" : ""
            }`}
          />
          <span
            className={`h-0.5 w-6 rounded-full bg-current transition-opacity ${
              menuOpen ? "opacity-0" : "opacity-100"
            }`}
          />
          <span
            className={`h-0.5 w-6 rounded-full bg-current transition-transform ${
              menuOpen ? "-translate-y-2 -rotate-45" : ""
            }`}
          />
        </button>
      </div>

      {/* Mobile navigation dropdown */}
      {menuOpen && (
        <div
          id="homepage-navigation-menu"
          className="absolute right-3 top-full mt-1 w-56 rounded-xl border border-[#e3e8e1] bg-[#fffdf9] p-2 shadow-lg sm:hidden"
        >
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={linkStyle(link.to)}
              onClick={closeMenu}
            >
              {link.name}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
};

export default Navbar;