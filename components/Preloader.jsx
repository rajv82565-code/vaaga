"use client";
import { useEffect, useState } from "react";

export default function Preloader() {
  const [count, setCount] = useState(0);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const DUR = reduced ? 200 : 1500;
    const start = performance.now();

    document.body.classList.add("is-loading");

    const tick = (now) => {
      const p = Math.min(1, Math.max(0, (now - start) / DUR));
      const val = Math.round((1 - Math.pow(1 - p, 3)) * 100);
      setCount(val);

      if (p < 1) {
        requestAnimationFrame(tick);
      } else {
        setIsDone(true);
        document.body.classList.remove("is-loading");
        setTimeout(() => document.body.classList.add("is-ready"), 350);
        setTimeout(() => document.body.classList.add("is-intro-done"), 350 + 1600);
      }
    };

    const id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div className={`loader ${isDone ? "is-done" : ""}`} aria-hidden="true">
      <div className="loader__word">
        <span style={{ "--i": 0 }}>V</span>
        <span style={{ "--i": 1 }}>A</span>
        <span style={{ "--i": 2 }}>A</span>
        <span style={{ "--i": 3 }}>G</span>
        <span style={{ "--i": 4 }}>A</span>
        <span style={{ "--i": 5 }}>&apos;</span>
        <span style={{ "--i": 6 }}>2</span>
        <span style={{ "--i": 7 }}>6</span>
      </div>
      <div className="loader__count">
        <span>{count}</span>%
      </div>
    </div>
  );
}
