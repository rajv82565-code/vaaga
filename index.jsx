"use client";

import React, { useEffect, useRef, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";

/* =========================================================
   SITE SWITCHER
   Switch between YUKTHI (/) and VAAGA (/vaaga)
   ========================================================= */
function SiteSwitcher({
  currentSite = "vaaga",
  vaagaUrl = "/vaaga",
  yukthiUrl = "/",
  onSwitch,
}) {
  const router = typeof useRouter === "function" ? useRouter() : null;
  const [activeSite, setActiveSite] = useState(currentSite);
  const [isSwitching, setIsSwitching] = useState(false);

  useEffect(() => {
    if (!router || !router.pathname) return;
    const site = router.pathname.startsWith("/vaaga") ? "vaaga" : "yukthi";
    setActiveSite(site);
  }, [router?.pathname]);

  const handleSwitch = (site) => {
    if (isSwitching) return;

    // Detect if running standalone or within Yukthi
    const isStandalone =
      typeof window !== "undefined" &&
      !router?.pathname?.startsWith("/vaaga") &&
      !router?.pathname?.startsWith("/tech") &&
      window.location.port !== "3000";

    const target =
      site === "vaaga"
        ? vaagaUrl
        : isStandalone
        ? "http://localhost:3000"
        : yukthiUrl;

    if (router && router.asPath === target) return;

    setActiveSite(site);
    setIsSwitching(true);
    onSwitch?.(site);

    window.setTimeout(() => {
      if (router && router.push && !target.startsWith("http")) {
        router.push(target).finally(() => {
          setIsSwitching(false);
        });
      } else {
        window.location.href = target;
      }
    }, 220);
  };

  return (
    <div
      className="nav-switcher"
      role="tablist"
      aria-label="Switch between YUKTHI and VAAGA"
    >
      <div
        className={`nav-switcher__glider ${
          activeSite === "vaaga"
            ? "nav-switcher__glider--vaaga"
            : "nav-switcher__glider--yukthi"
        }`}
        aria-hidden="true"
      />

      <button
        type="button"
        role="tab"
        aria-selected={activeSite === "yukthi"}
        className={`nav-switcher__item ${
          activeSite === "yukthi" ? "nav-switcher__item--active" : ""
        }`}
        onClick={() => handleSwitch("yukthi")}
      >
        <span className="nav-switcher__dot nav-switcher__dot--yukthi" />
        YUKTHI
      </button>

      <button
        type="button"
        role="tab"
        aria-selected={activeSite === "vaaga"}
        className={`nav-switcher__item ${
          activeSite === "vaaga" ? "nav-switcher__item--active" : ""
        }`}
        onClick={() => handleSwitch("vaaga")}
      >
        <span className="nav-switcher__dot nav-switcher__dot--vaaga" />
        VAAGA
        <span className="switcher-arrow" aria-hidden="true">
          ↗
        </span>
      </button>
    </div>
  );
}

/* =========================================================
   PRELOADER
   ========================================================= */
function Preloader() {
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

/* =========================================================
   NAVBAR
   ========================================================= */
function Navbar() {
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
          if (
            !e.isIntersecting ||
            (e.intersectionRatio < 0.4 && e.intersectionRect.height < window.innerHeight * 0.6)
          )
            return;
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
          <SiteSwitcher currentSite="vaaga" />
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
        <div className="menu__switcher-wrap">
          <SiteSwitcher currentSite="vaaga" onSwitch={closeMenu} />
        </div>
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

/* =========================================================
   HERO
   ========================================================= */
function Hero() {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const ctx = canvas.getContext("2d");
    const portrait = new Image();
    portrait.src = "/images/theyyam-deity.png";

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isMobile = window.innerWidth <= 900 || window.matchMedia("(hover: none)").matches;
    const dpr = isMobile ? 1 : Math.min(window.devicePixelRatio || 1, 1.5);
    const ASSEMBLE_MS = 2200;

    let particles = [];
    let rawPts = [];
    let stars = [];
    let fw = 0;
    let fh = 0;
    let ready = false;
    let isVisible = true;
    let isScrolledOut = false;
    let assembleStart = 0;
    let tFrame = 0;
    let pmx = 0;
    let pmy = 0;
    let mouse = { nx: 0, ny: 0 };
    let rafId = null;

    const makeStars = () => {
      stars = [];
      const count = isMobile ? 18 : Math.floor((fw * fh) / 9000);
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * fw,
          y: Math.random() * fh,
          r: isMobile ? Math.random() * 1.2 + 0.5 : Math.random() * 1.4 + 0.3,
          base: Math.random() * 0.5 + 0.15,
          speed: Math.random() * 0.02 + 0.005,
          phase: Math.random() * Math.PI * 2,
          big: Math.random() < 0.03,
        });
      }
    };

    const sampleImage = () => {
      const off = document.createElement("canvas");
      // Scale down image sampling on mobile for optimal particle density and fast processing
      const targetW = isMobile ? 110 : 340;
      const scale = targetW / portrait.naturalWidth;
      const targetH = Math.round(portrait.naturalHeight * scale);
      off.width = targetW;
      off.height = targetH;
      const octx = off.getContext("2d");
      octx.imageSmoothingEnabled = true;
      octx.drawImage(portrait, 0, 0, targetW, targetH);
      let data;
      try {
        data = octx.getImageData(0, 0, targetW, targetH).data;
      } catch (err) {
        return [];
      }

      let pts = [];
      const step = isMobile ? 2 : 1;
      for (let y = 0; y < targetH; y += step) {
        for (let x = 0; x < targetW; x += step) {
          const idx = (y * targetW + x) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          const a = data[idx + 3];
          const lum = 0.299 * r + 0.587 * g + 0.114 * b;
          if (a < 40 || lum < 14) continue;
          const skipProb = lum < 45 ? (isMobile ? 0.70 : 0.35) : (isMobile ? 0.35 : 0.06);
          if (Math.random() < skipProb) continue;
          pts.push({ u: x / targetW, v: y / targetH, r, g, b, lum });
        }
      }

      // Cap maximum particle count on mobile to ~850 for butter-smooth 60-120fps
      if (isMobile && pts.length > 850) {
        const stride = Math.ceil(pts.length / 850);
        pts = pts.filter((_, idx) => idx % stride === 0);
      }

      return pts;
    };

    const layoutParticles = () => {
      if (!ready || !fw || !fh) return;
      if (!rawPts.length) rawPts = sampleImage();
      if (!rawPts.length) return;

      const targetH = isMobile ? Math.min(fh * 0.90, fw * 1.65) : fh * 0.90;
      const aspect = portrait.naturalWidth / (portrait.naturalHeight || 1);
      const targetW = targetH * aspect;
      // The lit face and crown of the deity in theyyam-deity.png is centered at u ≈ 0.573
      const offsetX = fw * 0.5 - targetW * 0.573;
      const offsetY = fh * (isMobile ? 0.48 : 0.50) - targetH / 2;

      particles = rawPts.map((p) => {
        const px = offsetX + p.u * targetW;
        const py = offsetY + p.v * targetH;
        const pSize = isMobile ? (Math.random() * 1.1 + 0.85) : (Math.random() * 1.05 + 0.45);
        return {
          tx: px,
          ty: py,
          x: fw / 2 + (Math.random() - 0.5) * fw * 1.4,
          y: fh / 2 + (Math.random() - 0.5) * fh * 1.4,
          size: pSize,
          halfSize: pSize * 0.5,
          color: `rgb(${p.r},${p.g},${p.b})`,
          lum: p.lum,
          phase: Math.random() * Math.PI * 2,
          speed: Math.random() * 0.015 + 0.006,
          drift: isMobile ? (Math.random() * 1.4 + 0.4) : (Math.random() * 2.0 + 0.5),
          twinkleSpeed: Math.random() * 0.03 + 0.01,
        };
      });

      makeStars();
      assembleStart = performance.now();
    };

    const sizeFigure = () => {
      const rect = wrap.getBoundingClientRect();
      fw = rect.width;
      fh = rect.height;
      if (!fw || !fh) return;
      canvas.width = Math.round(fw * dpr);
      canvas.height = Math.round(fh * dpr);
      canvas.style.width = fw + "px";
      canvas.style.height = fh + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      layoutParticles();
    };

    portrait.onload = () => {
      ready = true;
      sizeFigure();
    };
    if (portrait.complete && portrait.naturalWidth) {
      ready = true;
      sizeFigure();
    }

    const reassemble = () => {
      if (particles.length) {
        assembleStart = performance.now();
        particles.forEach((p) => {
          p.x = fw / 2 + (Math.random() - 0.5) * fw * 1.4;
          p.y = fh / 2 + (Math.random() - 0.5) * fh * 1.4;
        });
      } else {
        layoutParticles();
      }
    };

    wrap.addEventListener("click", reassemble);

    const onPointerMove = (e) => {
      mouse.nx = e.clientX / window.innerWidth - 0.5;
      mouse.ny = e.clientY / window.innerHeight - 0.5;
    };
    if (!isMobile) {
      window.addEventListener("pointermove", onPointerMove, { passive: true });
    }

    let resizeTimer = null;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        sizeFigure();
      }, 100);
    };
    window.addEventListener("resize", onResize, { passive: true });

    // Scroll tracking to suspend hero loop immediately when scrolled away
    const handleScroll = () => {
      const scrolledAway = window.scrollY > (fh || window.innerHeight) * 1.05;
      if (scrolledAway !== isScrolledOut) {
        isScrolledOut = scrolledAway;
        if (!isScrolledOut && isVisible && !rafId) {
          rafId = requestAnimationFrame(loop);
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    const loop = (now) => {
      if (!isVisible || isScrolledOut) {
        rafId = null;
        return;
      }

      if (ready && fw && particles.length) {
        tFrame++;
        const elapsed = now - assembleStart;
        const prog = reduced ? 1 : Math.min(1, elapsed / ASSEMBLE_MS);
        const ease = 1 - Math.pow(1 - prog, 3);

        if (!isMobile) {
          pmx += (mouse.nx * 14 - pmx) * 0.05;
          pmy += (mouse.ny * 10 - pmy) * 0.05;
        }

        ctx.clearRect(0, 0, fw, fh);

        // Radial background warmth
        const grad = ctx.createRadialGradient(
          fw * 0.5,
          fh * 0.5,
          10,
          fw * 0.5,
          fh * 0.5,
          Math.max(fw, fh) * 0.6
        );
        grad.addColorStop(0, "rgba(45, 15, 10, 0.35)");
        grad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, fw, fh);

        // Batch render stars with single draw path
        ctx.fillStyle = "rgba(255, 230, 200, 0.7)";
        ctx.beginPath();
        for (let i = 0; i < stars.length; i++) {
          const s = stars[i];
          const r = s.big ? s.r * 1.8 : s.r;
          if (isMobile) {
            ctx.rect(s.x, s.y, r * 1.4, r * 1.4);
          } else {
            ctx.moveTo(s.x + r, s.y);
            ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
          }
        }
        ctx.fill();

        // Deity particles
        const numParticles = particles.length;
        if (isMobile) {
          // Blit-based rendering on mobile for 5x to 10x higher GPU efficiency
          for (let i = 0; i < numParticles; i++) {
            const p = particles[i];
            const cx = p.x + (p.tx - p.x) * ease;
            const cy = p.y + (p.ty - p.y) * ease;
            const wobbleX = Math.sin(tFrame * p.speed + p.phase) * p.drift * ease;
            const wobbleY = Math.cos(tFrame * p.speed * 1.3 + p.phase) * p.drift * ease;
            const flick = 0.6 + Math.sin(tFrame * p.twinkleSpeed + p.phase) * 0.4;
            ctx.globalAlpha = Math.max(0.1, flick) * (0.4 + 0.6 * ease);
            ctx.fillStyle = p.color;
            ctx.fillRect(cx + wobbleX - p.halfSize, cy + wobbleY - p.halfSize, p.size, p.size);
          }
        } else {
          // Path-based circular arcs for desktop
          for (let i = 0; i < numParticles; i++) {
            const p = particles[i];
            const cx = p.x + (p.tx - p.x) * ease + pmx * ease;
            const cy = p.y + (p.ty - p.y) * ease + pmy * ease;
            const wobbleX = Math.sin(tFrame * p.speed + p.phase) * p.drift * ease;
            const wobbleY = Math.cos(tFrame * p.speed * 1.3 + p.phase) * p.drift * ease;
            const flick = 0.6 + Math.sin(tFrame * p.twinkleSpeed + p.phase) * 0.4;
            ctx.globalAlpha = Math.max(0.05, flick) * (0.4 + 0.6 * ease);
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(cx + wobbleX, cy + wobbleY, p.size, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        ctx.globalAlpha = 1;
      }
      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible && !isScrolledOut && !rafId) {
          rafId = requestAnimationFrame(loop);
        }
      },
      { threshold: 0.05 }
    );
    observer.observe(wrap);

    return () => {
      wrap.removeEventListener("click", reassemble);
      if (!isMobile) {
        window.removeEventListener("pointermove", onPointerMove);
      }
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(resizeTimer);
      observer.disconnect();
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <section className="hero" id="home">
      <div className="hero__ambient" id="heroAmbient" aria-hidden="true"></div>
      <div className="hero__embers" id="heroEmbers" aria-hidden="true"></div>

      <div className="hero__inner">
        <div className="hero__figure" id="heroFigure" ref={wrapRef}>
          <canvas
            ref={canvasRef}
            id="figureCanvas"
            aria-label="Theyyam deity interactive particle artwork"
          ></canvas>
        </div>

        <div className="hero__content">
          <h1 className="hero__title">
            <span className="line"><span>One Campus.</span></span>
            <span className="line"><span>Endless <em>Expressions.</em></span></span>
          </h1>
          <p className="hero__sub fade-in">
            VAAGA&apos;26.2.0 is the official Arts Day of College of Engineering Payyanur.<br />
            Dance, music, theatre and colour, all on one stage.
          </p>
          <a href="#host" className="link-arrow fade-in">Claim Your Spotlight <i>↗</i></a>
        </div>
      </div>

      <div className="hero__scroll fade-in">
        <span>Scroll</span><i></i>
      </div>
    </section>
  );
}

/* =========================================================
   ABOUT
   ========================================================= */
function About() {
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

/* =========================================================
   SHOWCASE
   ========================================================= */
function Showcase() {
  return (
    <section className="expo section" id="exhibition">
      <div className="expo__left">
        <h2 className="h2" data-split>The Main <em>Stage</em></h2>
        <div className="expo__artists" data-reveal>
          <h4>The Contenders</h4>
          <p>CSE, ECE, EEE, ME, IT and the Department of Architecture (B.Arch). Six departments with one crown at stake and no one holding back.</p>
          <div className="avatars">
            <img src="/images/estrella-11.jpg" alt="Team CSE" title="Team CSE" loading="lazy" decoding="async" />
            <img src="/images/estrella-06.jpg" alt="Team ECE" title="Team ECE" loading="lazy" decoding="async" />
            <img src="/images/estrella-05.jpg" alt="Team EEE" title="Team EEE" loading="lazy" decoding="async" />
            <img src="/images/estrella-08.jpg" alt="Team ME" title="Team ME" loading="lazy" decoding="async" />
            <img src="/images/estrella-02.jpg" alt="Team IT" title="Team IT" loading="lazy" decoding="async" />
            <img src="/images/estrella-04.jpg" alt="Team B.Arch" title="Team B.Arch" loading="lazy" decoding="async" />
          </div>
        </div>
      </div>

      <div className="expo__media img-reveal in" data-cursor="Enter">
        <img
          data-speed="-0.08"
          src="/images/theyyam-dancer.webp"
          alt="A dancer in Theyyam-inspired costume and makeup performing on stage"
          loading="lazy"
          decoding="async"
        />
      </div>

      <div className="expo__right">
        <a href="#auctions" className="link-arrow" data-reveal>See All Events <i>↗</i></a>
        <div className="expo__info" data-reveal>
          <h3>From Theyyam to Techno</h3>
          <time>Date to be announced · CETP Campus</time>
          <p>A full day of performance that moves from Thiruvathira and Oppana to beatbox, fusion bands and street dance. It honours where we come from while making room for what comes next.</p>
          <a href="#host" className="link-arrow">Register Now <i>↗</i></a>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   EVENTS
   ========================================================= */
const AUCTIONS = [
  { t: "Thiruvathira", a: "Group · On Stage", bid: "Classical Roots", img: "08" },
  { t: "Mohiniyattam", a: "Solo · On Stage", bid: "Grace in Motion", img: "06" },
  { t: "Battle of Bands", a: "Group · On Stage", bid: "Turn It Up", img: "05" },
  { t: "Street Dance", a: "Group · On Stage", bid: "Own the Floor", img: "11" },
  { t: "Mappila Pattu", a: "Solo · On Stage", bid: "Voice of Malabar", img: "12" },
  { t: "Canvas Live", a: "Solo · Off Stage", bid: "Paint the Moment", img: "09" },
];

function Events() {
  const carouselRef = useRef(null);
  const trackRef = useRef(null);
  const progressRef = useRef(null);

  useEffect(() => {
    const carousel = carouselRef.current;
    const track = trackRef.current;
    const progress = progressRef.current;
    if (!carousel || !track || !progress) return;

    let cx = 0;
    let tx = 0;
    let drag = null;
    let moved = 0;
    let rafId = null;
    let cachedMaxX = 0;

    const updateMaxX = () => {
      cachedMaxX = Math.max(0, track.scrollWidth - carousel.clientWidth + 24);
    };
    updateMaxX();

    const maxX = () => cachedMaxX;
    const step = () => (track.children[0]?.clientWidth || 280) + 12;

    const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

    const requestTick = () => {
      if (!rafId) {
        rafId = requestAnimationFrame(loop);
      }
    };

    const loop = () => {
      if (Math.abs(tx - cx) >= 0.05) {
        cx += (tx - cx) * 0.12;
        track.style.transform = `translate3d(${-cx.toFixed(1)}px,0,0)`;
        const m = maxX() || 1;
        progress.style.transform = `scaleX(${0.2 + 0.8 * clamp(cx / m, 0, 1)})`;
        rafId = requestAnimationFrame(loop);
      } else {
        cx = tx;
        track.style.transform = `translate3d(${-cx.toFixed(1)}px,0,0)`;
        const m = maxX() || 1;
        progress.style.transform = `scaleX(${0.2 + 0.8 * clamp(cx / m, 0, 1)})`;
        rafId = null; // Sleep when settled to free 100% of mobile CPU/GPU
      }
    };

    const onNext = () => {
      updateMaxX();
      tx = clamp(tx + step(), 0, maxX());
      requestTick();
    };
    const onPrev = () => {
      updateMaxX();
      tx = clamp(tx - step(), 0, maxX());
      requestTick();
    };

    const onPointerDown = (e) => {
      updateMaxX();
      drag = { x: e.clientX, start: tx };
      moved = 0;
      carousel.classList.add("is-drag");
      carousel.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e) => {
      if (!drag) return;
      moved = Math.abs(e.clientX - drag.x);
      tx = clamp(drag.start - (e.clientX - drag.x) * 1.3, -80, maxX() + 80);
      requestTick();
    };

    const endDrag = () => {
      if (!drag) return;
      drag = null;
      carousel.classList.remove("is-drag");
      tx = clamp(tx, 0, maxX());
      requestTick();
    };

    const onClick = (e) => {
      if (moved > 6) e.preventDefault();
    };

    carousel.addEventListener("pointerdown", onPointerDown);
    carousel.addEventListener("pointermove", onPointerMove);
    carousel.addEventListener("pointerup", endDrag);
    carousel.addEventListener("pointercancel", endDrag);
    carousel.addEventListener("click", onClick, true);

    const prevBtn = document.getElementById("prev");
    const nextBtn = document.getElementById("next");
    if (prevBtn) prevBtn.addEventListener("click", onPrev);
    if (nextBtn) nextBtn.addEventListener("click", onNext);

    const onResize = () => {
      updateMaxX();
      requestTick();
    };
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      carousel.removeEventListener("pointerdown", onPointerDown);
      carousel.removeEventListener("pointermove", onPointerMove);
      carousel.removeEventListener("pointerup", endDrag);
      carousel.removeEventListener("pointercancel", endDrag);
      carousel.removeEventListener("click", onClick, true);
      window.removeEventListener("resize", onResize);
      if (prevBtn) prevBtn.removeEventListener("click", onPrev);
      if (nextBtn) nextBtn.removeEventListener("click", onNext);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <section className="auctions section" id="auctions">
      <div className="auctions__head">
        <h2 className="h2" data-split>On &amp; Off <em>Stage</em></h2>
        <p className="small muted" data-reveal>
          From classical footwork to spoken word,<br />
          pick your stage and find your people.
        </p>
      </div>

      <div className="carousel" id="carousel" ref={carouselRef} style={{ touchAction: "pan-y" }}>
        <div className="carousel__track" id="track" ref={trackRef}>
          {AUCTIONS.map((x, i) => (
            <article key={i} className="card" data-cursor="Join">
              <div className="card__img">
                <img
                  alt={`${x.t}, ${x.a}`}
                  loading="lazy"
                  decoding="async"
                  draggable="false"
                  src={`/images/estrella-${x.img}.jpg`}
                />
                <span className="card__lot">EVENT {String(i + 1).padStart(2, "0")}</span>
                <span className="card__bid">{x.bid}</span>
              </div>
              <div className="card__meta">
                <div>
                  <h3>{x.t}</h3>
                  <p>{x.a}</p>
                </div>
                <i>↗</i>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="carousel__nav">
        <button className="arrow" id="prev" aria-label="Previous">←</button>
        <div className="carousel__progress"><i id="progress" ref={progressRef}></i></div>
        <button className="arrow" id="next" aria-label="Next">→</button>
      </div>
    </section>
  );
}

/* =========================================================
   GALLERY
   ========================================================= */
const MOMENTS = [
  {
    title: "The lights go up",
    desc: "Opening night on the main stage. The rig comes alive, the first voice finds the mic, and a campus forgets it has classes tomorrow.",
    imgA: "/images/solo-singer-black-shirt.png",
    altA: "A singer in a black shirt performing under purple stage lights",
    imgB: "/images/estrella-03.jpg",
    altB: "The main stage rig lit up on opening night"
  },
  {
    title: "Own the floor",
    desc: "Mundus hitched, shades on, sequins catching every light. The dance crews didn't just perform on the floor, they took it.",
    imgA: "/images/group-dance-mundu.png",
    altA: "Three dancers in black shirts, mundus and sunglasses on a red-lit stage",
    imgB: "/images/dance-retro-sequin.png",
    altB: "A dancer in a sequin shirt and green shades mid-move"
  },
  {
    title: "Sing it back",
    desc: "A duet that turned the auditorium into a choir. Two voices on stage and a few hundred more singing along from the seats.",
    imgA: "/images/duet-singing-stage.png",
    altA: "Two students singing a duet on stage",
    imgB: "/images/estrella-07.jpg",
    altB: "Students in the auditorium singing along"
  },
  {
    title: "Colour everywhere",
    desc: "Crimson on the ramp, red satin under the lasers. Arts Day has never done quiet colours.",
    imgA: "/images/dance-solo-red-dress.png",
    altA: "A dancer in a red satin dress under blue stage lights",
    imgB: "/images/estrella-10.jpg",
    altB: "A model in a red and gold lehenga on the ramp"
  },
  {
    title: "Every corner a stage",
    desc: "A classical solo under the main rig, a jersey-clad crew in the courtyard. Some of the best moments never needed a spotlight.",
    imgA: "/images/estrella-01.jpg",
    altA: "Students in football jerseys dancing in the courtyard",
    imgB: "/images/estrella-12.jpg",
    altB: "A classical dancer performing a solo on the main stage"
  },
  {
    title: "Fire and roots",
    desc: "The Theyyam tribute that closed the night, then the honours. Crimson, flame and drums, and a stage that remembered where it all began.",
    imgA: "/images/award-ceremony.webp",
    altA: "Guests and faculty on stage during the award ceremony",
    imgB: "/images/estrella-09.jpg",
    altB: "Theyyam tribute performers in red costume and headdresses"
  }
];

function Gallery() {
  const [activeIdx, setActiveIdx] = useState(0);
  const galleryRef = useRef(null);
  const barRef = useRef(null);
  const itemsRef = useRef([]);

  useEffect(() => {
    const gallery = galleryRef.current;
    const bar = barRef.current;
    if (!gallery || !bar) return;

    const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
    const isMobile = window.innerWidth <= 900 || window.matchMedia("(hover: none)").matches;

    let galLast = -1;
    let inView = false;
    let galTop = 0;
    let galRun = 1;
    let vh = window.innerHeight;

    // Pre-cache DOM elements once instead of calling querySelectorAll on every scroll frame
    const cachedItems = itemsRef.current.map((el) => {
      if (!el) return null;
      const figs = Array.from(el.querySelectorAll(".gallery__fig")).map((f) => ({
        el: f,
        img: f.querySelector("img"),
      }));
      return { el, figs };
    });

    const measureGallery = () => {
      vh = window.innerHeight;
      const gr = gallery.getBoundingClientRect();
      galTop = gr.top + window.scrollY;
      galRun = Math.max(1, gr.height - vh);
    };
    measureGallery();

    const updateGallery = () => {
      const sy = window.scrollY;
      const p = clamp((sy - galTop) / galRun, 0, 1);

      if (Math.abs(p - galLast) >= 0.0005) {
        galLast = p;
        const n = MOMENTS.length;
        const raw = p * (n - 1);
        const k = Math.min(n - 2, Math.floor(raw));
        const w = clamp((raw - k - 0.15) / 0.7, 0, 1);
        const pos = k + w * w * (3 - 2 * w);
        const currentShown = Math.min(n - 1, Math.round(pos));

        cachedItems.forEach((item, i) => {
          if (!item) return;

          // On mobile, skip processing elements far outside the transition window
          if (isMobile && Math.abs(i - currentShown) > 1) {
            item.el.style.opacity = "0";
            return;
          }

          const t = i === 0 ? 1 : clamp(pos - (i - 1), 0, 1);
          const outP = clamp(pos - i, 0, 1);
          item.el.style.transform = `scale(${(1 - outP * 0.05).toFixed(4)})`;
          item.el.style.opacity = (1 - clamp((outP - 0.05) / 0.45, 0, 1)).toFixed(3);

          item.figs.forEach((fig, j) => {
            const inP = i === 0 ? 1 : clamp((t - j * 0.22) / 0.78, 0, 1);
            const r = ((1 - inP) * 100).toFixed(2);
            if (i > 0) {
              fig.el.style.clipPath = j ? `inset(0 0 ${r}% 0)` : `inset(${r}% 0 0 0)`;
            }
            if (fig.img) {
              fig.img.style.transform = `scale(${(1.18 - inP * 0.18 + outP * 0.04).toFixed(4)})`;
            }
          });
        });

        bar.style.transform = `scaleX(${p.toFixed(4)})`;
        setActiveIdx(currentShown);
      }
    };

    let scrollTicking = false;
    const onScroll = () => {
      if (!inView) return;
      if (!scrollTicking) {
        scrollTicking = true;
        requestAnimationFrame(() => {
          updateGallery();
          scrollTicking = false;
        });
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    let resizeTimer = null;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        measureGallery();
        updateGallery();
      }, 100);
    };
    window.addEventListener("resize", onResize, { passive: true });

    const galleryObserver = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        if (inView) {
          measureGallery();
          updateGallery();
        }
      },
      { rootMargin: "150px 0px 150px 0px", threshold: 0 }
    );
    galleryObserver.observe(gallery);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      clearTimeout(resizeTimer);
      galleryObserver.disconnect();
    };
  }, []);

  return (
    <section className="gallery" id="gallery" style={{ "--n": 6 }} ref={galleryRef}>
      <div className="gallery__pin">
        <div className="gallery__head">
          <h2 className="h2" data-split>Moments from <em>VAAGA</em></h2>
          <div className="gallery__count">
            <span id="galleryIdx">{String(activeIdx + 1).padStart(2, "0")}</span> / 06
          </div>
        </div>
        <div className="gallery__stage">
          <div className="gallery__copy">
            <p className="small muted">Arts Day, through the lens</p>
            <div className="gallery__texts">
              {MOMENTS.map((m, i) => (
                <div key={i} className={`gallery__text ${i === activeIdx ? "is-active" : ""}`}>
                  <h3>{m.title}</h3>
                  <p>{m.desc}</p>
                </div>
              ))}
            </div>
            <ol className="gallery__list">
              {MOMENTS.map((m, i) => (
                <li key={i} className={i === activeIdx ? "is-active" : ""}>
                  {m.title}
                </li>
              ))}
            </ol>
          </div>

          <div className="gallery__frame" data-cursor="View">
            {MOMENTS.map((m, i) => (
              <div
                key={i}
                className="gallery__item"
                ref={(el) => (itemsRef.current[i] = el)}
              >
                <figure className="gallery__fig gallery__fig--a">
                  <img src={m.imgA} alt={m.altA} loading="lazy" decoding="async" />
                </figure>
                <figure className="gallery__fig gallery__fig--b">
                  <img src={m.imgB} alt={m.altB} loading="lazy" decoding="async" />
                </figure>
              </div>
            ))}
          </div>
        </div>
        <div className="gallery__bar"><i id="galleryBar" ref={barRef}></i></div>
      </div>
    </section>
  );
}

/* =========================================================
   HOST
   ========================================================= */
function Host() {
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
        {
          ref: img1Ref,
          speed: 0.12,
          top: img1Ref.current?.parentElement ? img1Ref.current.parentElement.getBoundingClientRect().top + sy : 0,
          h: img1Ref.current?.parentElement?.clientHeight || 300,
        },
        {
          ref: img2Ref,
          speed: -0.1,
          top: img2Ref.current?.parentElement ? img2Ref.current.parentElement.getBoundingClientRect().top + sy : 0,
          h: img2Ref.current?.parentElement?.clientHeight || 300,
        },
        {
          ref: img3Ref,
          speed: 0.18,
          top: img3Ref.current?.parentElement ? img3Ref.current.parentElement.getBoundingClientRect().top + sy : 0,
          h: img3Ref.current?.parentElement?.clientHeight || 300,
        },
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

/* =========================================================
   FOOTER
   ========================================================= */
function Footer() {
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
        <SiteSwitcher currentSite="vaaga" />
        <a href="#">Code of Conduct</a>
      </div>
    </footer>
  );
}

/* =========================================================
   SCROLL REVEAL
   ========================================================= */
function ScrollReveal() {
  useEffect(() => {
    // Word split on elements with [data-split]
    const splitEls = document.querySelectorAll("[data-split]");
    splitEls.forEach((el) => {
      let i = 0;
      const walk = (node) => {
        [...node.childNodes].forEach((n) => {
          if (n.nodeType === 3) {
            const frag = document.createDocumentFragment();
            n.textContent.split(/(\s+)/).forEach((part) => {
              if (!part) return;
              if (/^\s+$/.test(part)) return frag.appendChild(document.createTextNode(" "));
              const w = document.createElement("span");
              w.className = "w";
              w.innerHTML = `<span style="--i:${i++}">${part}</span>`;
              frag.appendChild(w);
            });
            n.replaceWith(frag);
          } else if (n.nodeType === 1) walk(n);
        });
      };
      walk(el);
    });

    const isMobile = window.innerWidth <= 900 || window.matchMedia("(hover: none)").matches;
    // Reveal on scroll IntersectionObserver
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.classList.add("in");
          e.target.querySelectorAll(".img-reveal").forEach((c) => c.classList.add("in"));
          io.unobserve(e.target);
        });
      },
      {
        threshold: isMobile ? 0.05 : 0.12,
        rootMargin: isMobile ? "0px 0px 60px 0px" : "0px 0px -8% 0px",
      }
    );

    document.querySelectorAll("[data-split], [data-reveal]").forEach((el) => io.observe(el));

    // Stagger delay for outro reveals
    document.querySelectorAll(".about__outro [data-reveal]").forEach((el, i) => {
      el.style.setProperty("--d", i * 0.12 + "s");
    });

    return () => io.disconnect();
  }, []);

  return null;
}

/* =========================================================
   VAAGA PAGE EXPORT
   ========================================================= */
export default function VaagaPage() {
  return (
    <div className="vaaga-page">
      <Head>
        <title>VAAGA&apos;26.2.0 — Arts Day at CET Payyanur</title>
        <meta
          name="description"
          content="VAAGA&apos;26.2.0 is the official Arts Day of College of Engineering Payyanur (CETP), a day of dance, music, theatre and art rooted in Kerala's culture."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <Preloader />
      <Navbar />

      <main>
        <Hero />
        <About />
        <Showcase />
        <Events />
        <Gallery />
        <Host />
      </main>

      <Footer />
      <ScrollReveal />
    </div>
  );
}

export {
  SiteSwitcher,
  Preloader,
  Navbar,
  Hero,
  About,
  Showcase,
  Events,
  Gallery,
  Host,
  Footer,
  ScrollReveal,
};
