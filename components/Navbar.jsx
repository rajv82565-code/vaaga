"use client";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          const y = window.scrollY;
          const scrolled = y > 40;
          setIsScrolled((prev) => (prev !== scrolled ? scrolled : prev));

          if (Math.abs(y - lastY) > 6) {
            const hidden = y > lastY && y > window.innerHeight * 0.8 && !menuOpen;
            setIsHidden((prev) => (prev !== hidden ? hidden : prev));
            lastY = y;
          }
          ticking = false;
        });
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    // Active section intersection observer
    const sections = document.querySelectorAll("section[id]");
    const secIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting || (e.intersectionRatio < 0.4 && e.intersectionRect.height < window.innerHeight * 0.6)) return;
          setActiveSection(e.target.id);
        });
      },
      { threshold: [0, 0.2, 0.4, 0.6, 0.8, 1] }
    );
    sections.forEach((s) => secIO.observe(s));

    return () => {
      window.removeEventListener("scroll", onScroll);
      secIO.disconnect();
    };
  }, [menuOpen]);

  const toggleMenu = () => {
    const next = !menuOpen;
    setMenuOpen(next);
    document.body.classList.toggle("menu-open", next);
  };

  const closeMenu = () => {
    setMenuOpen(false);
    document.body.classList.remove("menu-open");
  };

  return (
    <>
      <header className={`nav ${isScrolled ? "is-scrolled" : ""} ${isHidden ? "is-hidden" : ""}`}>
        <a href="#home" className="nav__logo" onClick={closeMenu}>
          VAAGA&apos;26.2.0
        </a>
        <nav className="nav__links">
          <a href="#home" className={activeSection === "home" ? "is-active" : ""}>Home</a>
          <a href="#about" className={activeSection === "about" ? "is-active" : ""}>About</a>
          <a href="#exhibition" className={activeSection === "exhibition" ? "is-active" : ""}>Showcase</a>
          <a href="#auctions" className={activeSection === "auctions" ? "is-active" : ""}>Events</a>
          <a href="#gallery" className={activeSection === "gallery" ? "is-active" : ""}>Gallery</a>
          <a href="#host" className={activeSection === "host" ? "is-active" : ""}>Register</a>
        </nav>
        <div className="nav__status">
          <div className="nav-switcher" role="group" aria-label="Switch between sites">
            <a
              href="http://localhost:3000"
              className="nav-switcher__item"
              aria-label="Go to Yukthi"
            >
              <span className="nav-switcher__dot nav-switcher__dot--yukthi" />
              YUKTHI
            </a>
            <span className="nav-switcher__item nav-switcher__item--active" aria-current="page">
              <span className="nav-switcher__dot nav-switcher__dot--vaaga" />
              VAAGA
            </span>
          </div>
        </div>
        <button
          className="nav__burger"
          aria-label="Toggle menu"
          onClick={toggleMenu}
        >
          <span></span>
          <span></span>
        </button>
      </header>

      <div className="menu" style={{ clipPath: menuOpen ? "inset(0 0 0 0)" : "inset(0 0 100% 0)" }}>
        <a href="#home" onClick={closeMenu}>Home</a>
        <a href="#about" onClick={closeMenu}>About</a>
        <a href="#exhibition" onClick={closeMenu}>Showcase</a>
        <a href="#auctions" onClick={closeMenu}>Events</a>
        <a href="#gallery" onClick={closeMenu}>Gallery</a>
        <a href="#host" onClick={closeMenu}>Take the <em>Stage</em></a>
      </div>
    </>
  );
}
