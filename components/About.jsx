"use client";
import { useEffect, useRef, useState } from "react";

export default function About() {
  const videoRef = useRef(null);
  const glowRef = useRef(null);
  const frameRef = useRef(null);
  const wordLRef = useRef(null);
  const wordRRef = useRef(null);
  const reelRef = useRef(null);

  const [soundOn, setSoundOn] = useState(false);
  const [stats, setStats] = useState({ events: 0, depts: 0, days: 0 });

  useEffect(() => {
    const video = videoRef.current;
    const glow = glowRef.current;
    const frame = frameRef.current;
    const reel = reelRef.current;
    const wordL = wordLRef.current;
    const wordR = wordRRef.current;

    if (!video || !glow || !frame || !reel || !wordL || !wordR) return;

    const isMobile = window.innerWidth <= 900 || window.matchMedia("(hover: none)").matches;
    const gctx = !isMobile ? glow.getContext("2d") : null;
    if (gctx) {
      if ("filter" in gctx) gctx.filter = "blur(3px)";
      else glow.classList.add("is-soft");
    }

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let glowT = 0;
    let rlLast = -1;
    let rafId = null;
    let inView = false;
    let reelTop = 0;
    let reelRun = 1;
    let vh = window.innerHeight;

    const measureReel = () => {
      vh = window.innerHeight;
      const rr = reel.getBoundingClientRect();
      reelTop = rr.top + window.scrollY;
      reelRun = Math.max(1, rr.height - vh);
    };
    measureReel();

    const updateReel = (t = performance.now()) => {
      const sy = window.scrollY;
      const start = reelTop - vh * 0.5;
      const isReelInView = sy > reelTop - vh && sy < reelTop + reelRun + vh;
      const p = reduced ? 1 : Math.min(1, Math.max(0, (sy - start) / (vh * 0.5 + reelRun * 0.6)));

      // Skip heavy video frame-to-canvas drawImage on mobile phones to prevent GPU pipeline stalls
      if (!isMobile && gctx && isReelInView && !video.paused && t - glowT > 80) {
        glowT = t;
        gctx.drawImage(video, 0, 0, glow.width, glow.height);
      }

      if (Math.abs(p - rlLast) >= 0.0005) {
        rlLast = p;
        const e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(2 - 2 * p, 3) / 2;
        const s = 0.42 + 0.58 * e;
        frame.style.transform = `scale(${s.toFixed(4)})`;
        frame.style.setProperty("--p", e.toFixed(3));
        glow.style.opacity = (e * 0.9).toFixed(3);

        const isNarrow = window.innerWidth <= 900;
        if (isNarrow) {
          const oy = (frame.offsetHeight * s) / 2 + 14;
          wordL.style.transform = `translate3d(-50%, calc(-100% - ${oy.toFixed(1)}px), 0)`;
          wordR.style.transform = `translate3d(-50%, ${oy.toFixed(1)}px, 0)`;
        } else {
          const pad = Math.min(48, Math.max(16, window.innerWidth * 0.034));
          const o1 = Math.min((frame.offsetWidth * s) / 2 + 28, window.innerWidth / 2 - pad - wordL.offsetWidth);
          const o2 = Math.min((frame.offsetWidth * s) / 2 + 28, window.innerWidth / 2 - pad - wordR.offsetWidth);
          wordL.style.transform = `translate3d(-${o1.toFixed(1)}px, -50%, 0)`;
          wordR.style.transform = `translate3d(${o2.toFixed(1)}px, -50%, 0)`;
        }
      }
    };

    let scrollTicking = false;
    const onScroll = () => {
      if (!inView) return;
      if (!scrollTicking) {
        scrollTicking = true;
        requestAnimationFrame((now) => {
          updateReel(now);
          scrollTicking = false;
        });
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    let resizeTimer = null;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        measureReel();
        updateReel();
      }, 100);
    };
    window.addEventListener("resize", onResize, { passive: true });

    // Video glow loop only when in view and on desktop
    const tickVideo = (t) => {
      if (!inView || isMobile) {
        rafId = null;
        return;
      }
      updateReel(t);
      rafId = requestAnimationFrame(tickVideo);
    };

    const reelObserver = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        if (inView) {
          measureReel();
          updateReel();
          if (!isMobile && !rafId) {
            rafId = requestAnimationFrame(tickVideo);
          }
        } else if (rafId) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
      },
      { rootMargin: "150px 0px 150px 0px", threshold: 0 }
    );
    reelObserver.observe(reel);

    // Auto play when intersecting
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(frame);

    // Counter animation when stats in view
    let counted = false;
    const statsObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !counted) {
          counted = true;
          const t0 = performance.now();
          const countLoop = (now) => {
            const progress = Math.min(1, Math.max(0, (now - t0) / 1600));
            const ease = 1 - Math.pow(1 - progress, 4);
            setStats({
              events: Math.round(50 * ease),
              depts: Math.round(6 * ease),
              days: Math.round(1 * ease),
            });
            if (progress < 1) requestAnimationFrame(countLoop);
          };
          requestAnimationFrame(countLoop);
        }
      },
      { threshold: 0.2 }
    );
    const statsEl = document.querySelector(".about__outro .stats");
    if (statsEl) statsObserver.observe(statsEl);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      clearTimeout(resizeTimer);
      if (rafId) cancelAnimationFrame(rafId);
      observer.disconnect();
      reelObserver.disconnect();
      statsObserver.disconnect();
    };
  }, []);

  const toggleSound = (e) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    const next = !soundOn;
    video.muted = !next;
    setSoundOn(next);
  };

  const onFrameClick = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
      video.muted = false;
      setSoundOn(true);
    } else {
      toggleSound({ stopPropagation: () => {} });
    }
  };

  return (
    <section className="about" id="about">
      <div className="about__intro">
        <p className="about__label small" data-reveal><span>(01)</span> The Arts Day of CETP</p>
        <h2 className="h2 about__title" data-split>About <em>VAAGA</em></h2>
        <p className="about__lead" data-reveal>
          Once a year, the engineers and architects of CETP put their lab records and drafting sheets away and pick up chilankas, microphones and paintbrushes.{" "}
          <span className="muted">VAAGA is a celebration of every beat, brushstroke and verse our campus has been saving for this stage.</span>
        </p>
      </div>

      <div className="about__reel" id="aboutReel" ref={reelRef}>
        <div className="about__pin">
          <canvas ref={glowRef} className="about__glow" id="aboutGlow" width="40" height="46" aria-hidden="true"></canvas>
          <span ref={wordLRef} className="about__word about__word--l" aria-hidden="true">Tradition</span>
          <span ref={wordRRef} className="about__word about__word--r" aria-hidden="true"><em>Reinvention</em></span>
          <figure
            ref={frameRef}
            className={`about__frame ${soundOn ? "is-on" : ""}`}
            id="aboutFrame"
            data-cursor={soundOn ? "Mute" : "Sound on"}
            onClick={onFrameClick}
          >
            <video
              ref={videoRef}
              id="aboutVideo"
              src="/videos/vaaga-reel.mp4"
              poster="/images/vaaga-reel-poster.jpg"
              muted
              loop
              playsInline
              preload="metadata"
              aria-label="Performers in festive costume walking the ramp on the CETP main stage"
            ></video>
            <figcaption className="about__cap">
              <span><i className="dot"></i> Live from the CETP stage</span>
              <button
                className="about__sound"
                id="aboutSound"
                type="button"
                aria-pressed={soundOn}
                onClick={toggleSound}
              >
                <span className="eq" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
                <b>{soundOn ? "Sound on" : "Sound off"}</b>
              </button>
            </figcaption>
          </figure>
        </div>
      </div>

      <div className="about__outro">
        <p className="about__note muted" data-reveal>
          Version 26.2.0 goes further. It draws on the Theyyam heartland we call home and brings those roots together with the sound of a new generation, so tradition and reinvention share one spotlight.
        </p>
        <div className="stats" data-reveal>
          <div><strong>{stats.events}</strong><span>+ Events</span></div>
          <div><strong>{stats.depts}</strong><span>Departments, One Stage</span></div>
          <div><strong>{stats.days}</strong><span>Unforgettable Day</span></div>
        </div>
        <a href="#auctions" className="link-arrow about__more" data-reveal>Explore Events <i>↗</i></a>
      </div>
    </section>
  );
}
