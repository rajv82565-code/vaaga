"use client";
import { useEffect, useRef } from "react";

export default function Host() {
  const btnRef = useRef(null);
  const img1Ref = useRef(null);
  const img2Ref = useRef(null);
  const img3Ref = useRef(null);
  const sectionRef = useRef(null);

  useEffect(() => {
    const btn = btnRef.current;
    if (!btn) return;

    const onPointerMove = (e) => {
      const r = btn.getBoundingClientRect();
      const ox = (e.clientX - r.left - r.width / 2) * 0.3;
      const oy = (e.clientY - r.top - r.height / 2) * 0.4;
      btn.style.transform = `translate(${ox}px, ${oy}px)`;
    };

    const onPointerLeave = () => {
      btn.style.transform = "";
    };

    btn.addEventListener("pointermove", onPointerMove);
    btn.addEventListener("pointerleave", onPointerLeave);

    // Parallax on images
    let rafId = null;
    let inView = false;

    const onScrollLoop = () => {
      if (!inView) {
        rafId = null;
        return;
      }

      const vh = window.innerHeight;
      const sy = window.scrollY;

      const parallax = (ref, speed) => {
        if (!ref.current) return;
        const el = ref.current;
        const r = el.parentElement.getBoundingClientRect();
        const top = r.top + sy;
        const d = top + r.height / 2 - sy - vh / 2;
        el.style.transform = `translate3d(0, ${(d * speed).toFixed(2)}px, 0)`;
      };

      parallax(img1Ref, 0.12);
      parallax(img2Ref, -0.1);
      parallax(img3Ref, 0.18);

      rafId = requestAnimationFrame(onScrollLoop);
    };

    const hostObserver = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        if (inView && !rafId) {
          rafId = requestAnimationFrame(onScrollLoop);
        }
      },
      { rootMargin: "250px 0px 250px 0px", threshold: 0 }
    );
    if (sectionRef.current) hostObserver.observe(sectionRef.current);

    return () => {
      btn.removeEventListener("pointermove", onPointerMove);
      btn.removeEventListener("pointerleave", onPointerLeave);
      hostObserver.disconnect();
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <section className="host section" id="host" ref={sectionRef}>
      <div className="host__img host__img--1" ref={img1Ref}>
        <img src="/images/estrella-02.jpg" alt="" />
      </div>
      <div className="host__img host__img--2" ref={img2Ref}>
        <img src="/images/estrella-03.jpg" alt="" />
      </div>
      <div className="host__img host__img--3" ref={img3Ref}>
        <img src="/images/estrella-07.jpg" alt="" />
      </div>

      <div className="host__content">
        <p className="small muted" data-reveal>Rehearsed in hostel corridors, ready for the lights?</p>
        <h2 className="host__title" data-split>Your Stage Awaits at <em>VAAGA</em></h2>
        <a href="#host" className="btn-pill" ref={btnRef} data-reveal data-magnetic>
          <span>Register Now</span> <i>↗</i>
        </a>
      </div>
    </section>
  );
}
