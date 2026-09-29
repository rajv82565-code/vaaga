"use client";
import { useEffect, useRef } from "react";

export default function Footer() {
  const wordRef = useRef(null);

  useEffect(() => {
    const el = wordRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("in");
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  return (
    <footer className="footer">
      <div className="footer__top">
        <span>⌖ College of Engineering Payyanur, Kannur, Kerala</span>
        <span>◷ VAAGA&apos;26.2.0 · Official Arts Day of CETP</span>
        <span className="footer__social">
          <a href="#">◎ Instagram</a>
          <a href="#">✉ Contact the Arts Club</a>
        </span>
      </div>

      <div className="footer__word" id="footerWord" ref={wordRef} aria-label="VAAGA'26">
        <span style={{ "--i": 0 }}>V</span>
        <span style={{ "--i": 1 }}>A</span>
        <span style={{ "--i": 2 }}>A</span>
        <span style={{ "--i": 3 }}>G</span>
        <span style={{ "--i": 4 }}>A</span>
        <span style={{ "--i": 5 }}>&apos;</span>
        <span style={{ "--i": 6 }}>2</span>
        <span style={{ "--i": 7 }}>6</span>
      </div>

      <div className="footer__bottom">
        <a href="#">Rules &amp; Guidelines</a>
        <span>© 2026 VAAGA · College of Engineering Payyanur</span>
        <div className="site-switcher" role="group" aria-label="Switch site">
          <a
            href="http://localhost:3000"
            className="site-switcher__item"
            aria-label="Go to Yukthi"
          >
            <span className="site-switcher__dot site-switcher__dot--yukthi" />
            YUKTHI
          </a>
          <span className="site-switcher__item site-switcher__item--active" aria-current="page">
            <span className="site-switcher__dot site-switcher__dot--vaaga" />
            VAAGA
          </span>
        </div>
        <a href="#">Code of Conduct</a>
      </div>
    </footer>
  );
}
