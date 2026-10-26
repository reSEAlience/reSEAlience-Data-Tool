
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

      </div>
    
    </nav>

   
  );
};

export default Navbar;