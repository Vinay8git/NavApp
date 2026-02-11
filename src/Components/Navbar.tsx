import React, { useEffect, useState } from "react";
import "./navbar.css";

type NavLink = {
  label: string;
  url: string;
};

const LINKS: NavLink[] = [
  { label: "Home", url: "/" },
  { label: "Features", url: "/features" },
  { label: "Pricing", url: "/pricing" },
  { label: "About", url: "/about" },
];

const Navbar: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const saved = window.localStorage.getItem("nav-theme");
    const initial = saved === "dark" || saved === "light" ? saved : "light";
    setTheme(initial);
    document.documentElement.setAttribute("data-theme", initial);
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    window.localStorage.setItem("nav-theme", next);
  };

  const handleLinkClick = () => setMenuOpen(false);

  return (
    <>
    <header className="nav-header">
      <nav className="nav">
        <div className="nav__brand">
          <span className="nav__logo-dot" aria-hidden>
            ● 
          </span>
          <a href="/" className="nav__brand-text" aria-label="NavApp Home">
            NavApp
          </a>
        </div>

        <div className="nav__right">
          <ul className="nav__links">
            {LINKS.map((link) => (
              <li key={link.url} className="nav__item">
                <a href={link.url} className="nav__link" onClick={handleLinkClick}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <button
            type="button"
            className="nav__theme-toggle"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            title="Toggle theme"
          >
            {theme === "light" ? "🌑" : "☀️"}
          </button>

          <button
            type="button"
            className="nav__burger"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-expanded={menuOpen}
            aria-label="Toggle navigation menu"
            title="Menu"
          >
            <span className={`burger-line ${menuOpen ? "open" : ""}`} />
            <span className={`burger-line ${menuOpen ? "open" : ""}`} />
            <span className={`burger-line ${menuOpen ? "open" : ""}`} />
          </button>
        </div>
      </nav>

      <div className={`mobile-menu ${menuOpen ? "mobile-menu--open" : ""}`}>
        <ul className="mobile-menu__links">
          {LINKS.map((link) => (
            <li key={link.url} className="mobile-menu__item">
              <a href={link.url} className="mobile-menu__link" onClick={handleLinkClick}>
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </header>
    <div className="nav-spacer" />
    </>
  );
};

export default Navbar;