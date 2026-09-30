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

    const isMobile = window.innerWidth <= 900 || window.matchMedia("(hover: none)").matches;

    if (!isMobile) {
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
    }

    // Parallax on images - only enabled for desktop to eliminate mobile scroll lag
    let inView = false;
    let cachedOffsets = [];
    let vh = window.innerHeight;

    const measureOffsets = () => {
      vh = window.innerHeight;
      const sy = window.scrollY;
      cachedOffsets = [
        { ref: img1Ref, speed: 0.12, top: img1Ref.current?.parentElement ? img1Ref.current.parentElement.getBoundingClientRect().top + sy : 0, h: img1Ref.current?.parentElement?.clientHeight || 300 },
        { ref: img2Ref, speed: -0.1, top: img2Ref.current?.parentElement ? img2Ref.current.parentElement.getBoundingClientRect().top + sy : 0, h: img2Ref.current?.parentElement?.clientHeight || 300 },
        { ref: img3Ref, speed: 0.18, top: img3Ref.current?.parentElement ? img3Ref.current.parentElement.getBoundingClientRect().top + sy : 0, h: img3Ref.current?.parentElement?.clientHeight || 300 },
      ];
    };

    const updateParallax = () => {
      if (isMobile) return;
      const sy = window.scrollY;
      cachedOffsets.forEach((item) => {
        if (!item.ref.current) return;
        const d = item.top + item.h / 2 - sy - vh / 2;
        item.ref.current.style.transform = `translate3d(0, ${(d * item.speed).toFixed(2)}px, 0)`;
      });
    };

    let scrollTicking = false;
    const onScroll = () => {
      if (!inView || isMobile) return;
      if (!scrollTicking) {
        scrollTicking = true;
        requestAnimationFrame(() => {
          updateParallax();
          scrollTicking = false;
        });
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    const hostObserver = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        if (inView && !isMobile) {
          measureOffsets();
          updateParallax();
        }
      },
      { rootMargin: "100px 0px 100px 0px", threshold: 0 }
    );
    if (sectionRef.current) hostObserver.observe(sectionRef.current);

    return () => {
      window.removeEventListener("scroll", onScroll);
      hostObserver.disconnect();
    };
  }, []);

  return (
    <section className="host section" id="host" ref={sectionRef}>
      <div className="host__img host__img--1" ref={img1Ref}>
        <img src="/images/estrella-02.jpg" alt="" loading="lazy" decoding="async" />
      </div>
      <div className="host__img host__img--2" ref={img2Ref}>
        <img src="/images/estrella-03.jpg" alt="" loading="lazy" decoding="async" />
      </div>
      <div className="host__img host__img--3" ref={img3Ref}>
        <img src="/images/estrella-07.jpg" alt="" loading="lazy" decoding="async" />
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
