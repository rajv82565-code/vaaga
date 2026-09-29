"use client";
import { useEffect, useRef } from "react";

export default function Hero() {
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
    const isMobile = window.innerWidth <= 900;
    const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2);
    const ASSEMBLE_MS = 2200;

    let particles = [];
    let rawPts = [];
    let stars = [];
    let fw = 0;
    let fh = 0;
    let ready = false;
    let isVisible = true;
    let assembleStart = 0;
    let tFrame = 0;
    let pmx = 0;
    let pmy = 0;
    let mouse = { nx: 0, ny: 0 };
    let rafId = null;

    const makeStars = () => {
      stars = [];
      const count = Math.floor((fw * fh) / (isMobile ? 14000 : 9000));
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * fw,
          y: Math.random() * fh,
          r: Math.random() * 1.4 + 0.3,
          base: Math.random() * 0.5 + 0.15,
          speed: Math.random() * 0.02 + 0.005,
          phase: Math.random() * Math.PI * 2,
          big: Math.random() < 0.02,
        });
      }
    };

    const sampleImage = () => {
      const off = document.createElement("canvas");
      const targetW = isMobile ? 190 : 340;
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

      const pts = [];
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
          const skipProb = lum < 45 ? (isMobile ? 0.45 : 0.35) : (isMobile ? 0.15 : 0.06);
          if (Math.random() < skipProb) continue;
          pts.push({ u: x / targetW, v: y / targetH, r, g, b, lum });
        }
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
        return {
          tx: px,
          ty: py,
          x: fw / 2 + (Math.random() - 0.5) * fw * 1.4,
          y: fh / 2 + (Math.random() - 0.5) * fh * 1.4,
          size: Math.random() * 1.05 + 0.45,
          color: `rgb(${p.r},${p.g},${p.b})`,
          lum: p.lum,
          phase: Math.random() * Math.PI * 2,
          speed: Math.random() * 0.015 + 0.006,
          drift: Math.random() * 2.0 + 0.5,
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
      canvas.width = fw * dpr;
      canvas.height = fh * dpr;
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
    window.addEventListener("pointermove", onPointerMove);

    const onResize = () => {
      sizeFigure();
    };
    window.addEventListener("resize", onResize);

    const loop = (now) => {
      if (!isVisible) {
        rafId = null;
        return;
      }

      if (ready && fw && particles.length) {
        tFrame++;
        const elapsed = now - assembleStart;
        const prog = reduced ? 1 : Math.min(1, elapsed / ASSEMBLE_MS);
        const ease = 1 - Math.pow(1 - prog, 3);

        pmx += (mouse.nx * 14 - pmx) * 0.05;
        pmy += (mouse.ny * 10 - pmy) * 0.05;

        ctx.clearRect(0, 0, fw, fh);

        // Radial background warmth
        const grad = ctx.createRadialGradient(fw * 0.5, fh * 0.5, 10, fw * 0.5, fh * 0.5, Math.max(fw, fh) * 0.6);
        grad.addColorStop(0, "rgba(45, 15, 10, 0.35)");
        grad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, fw, fh);

        // Twinkling stars
        for (let i = 0; i < stars.length; i++) {
          const s = stars[i];
          const tw = s.base + Math.sin(tFrame * s.speed + s.phase) * 0.25;
          ctx.beginPath();
          ctx.fillStyle = s.big ? `rgba(255, 150, 90, ${Math.max(0, tw).toFixed(2)})` : `rgba(255, 255, 255, ${Math.max(0, tw).toFixed(2)})`;
          const r = s.big ? s.r * 2.2 : s.r;
          ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
          ctx.fill();
        }

        // Deity particles
        ctx.save();
        for (let i = 0; i < particles.length; i++) {
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
        ctx.restore();
      }
      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible && !rafId) {
          rafId = requestAnimationFrame(loop);
        }
      },
      { threshold: 0.02 }
    );
    observer.observe(wrap);

    return () => {
      wrap.removeEventListener("click", reassemble);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("resize", onResize);
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
          <canvas ref={canvasRef} id="figureCanvas" aria-label="Theyyam deity interactive particle artwork"></canvas>
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
