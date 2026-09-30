(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const touch = matchMedia("(hover: none)").matches;
  const u = (n) => `images/estrella-${n}.jpg`;

  const AUCTIONS = [
    { t: "Thiruvathira", a: "Group · On Stage", bid: "Classical Roots", img: "08" },
    { t: "Mohiniyattam", a: "Solo · On Stage", bid: "Grace in Motion", img: "06" },
    { t: "Battle of Bands", a: "Group · On Stage", bid: "Turn It Up", img: "05" },
    { t: "Street Dance", a: "Group · On Stage", bid: "Own the Floor", img: "11" },
    { t: "Mappila Pattu", a: "Solo · On Stage", bid: "Voice of Malabar", img: "12" },
    { t: "Canvas Live", a: "Solo · Off Stage", bid: "Paint the Moment", img: "09" },
  ];

  // Graceful fallback if any remote image fails: generative gradient artwork
  const fallback = (seed) => {
    const h = (seed * 67) % 360;
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='hsl(${h},80%,60%)'/><stop offset='1' stop-color='hsl(${(h + 140) % 360},70%,30%)'/></linearGradient><filter id='n'><feTurbulence baseFrequency='0.012' numOctaves='3' seed='${seed}'/><feDisplacementMap in='SourceGraphic' scale='120'/></filter></defs><rect width='400' height='400' fill='url(#g)'/><circle cx='200' cy='200' r='120' fill='hsl(${(h + 60) % 360},90%,70%)' filter='url(#n)' opacity='.85'/></svg>`;
    return "data:image/svg+xml," + encodeURIComponent(svg);
  };
  let seed = 1;
  const guard = (img) => {
    const s = seed++;
    img.addEventListener("error", () => { img.src = fallback(s); }, { once: true });
  };
  $$("img").forEach(guard);

  /* ---------- Build auction cards ---------- */
  const track = $("#track");
  AUCTIONS.forEach((x, i) => {
    const el = document.createElement("article");
    el.className = "card";
    el.dataset.cursor = "Join";
    el.innerHTML = `
      <div class="card__img">
        <img alt="${x.t}, ${x.a}" loading="lazy" draggable="false" src="${u(x.img)}" />
        <span class="card__lot">EVENT ${String(i + 1).padStart(2, "0")}</span>
        <span class="card__bid">${x.bid}</span>
      </div>
      <div class="card__meta">
        <div><h3>${x.t}</h3><p>${x.a}</p></div>
        <i>↗</i>
      </div>`;
    guard($("img", el));
    track.appendChild(el);
  });

  /* ---------- Split text ---------- */
  $$("[data-split]").forEach((el) => {
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
  $$(".loader__word span, .footer__word span").forEach((s, i, all) => s.style.setProperty("--i", i % 8));

  /* ---------- Preloader ---------- */
  const countEl = $("#loaderCount");
  const start = performance.now();
  const DUR = reduced ? 200 : 1500;
  const tickLoader = (now) => {
    const p = clamp((now - start) / DUR, 0, 1);
    countEl.textContent = Math.round((1 - Math.pow(1 - p, 3)) * 100);
    if (p < 1) return requestAnimationFrame(tickLoader);
    $(".loader").classList.add("is-done");
    document.body.classList.remove("is-loading");
    setTimeout(() => document.body.classList.add("is-ready"), 350);
    // Once the headline has risen, stop clipping its lines so the text-shadow isn't cut into a hard box
    setTimeout(() => document.body.classList.add("is-intro-done"), 350 + 1600);
  };
  requestAnimationFrame(tickLoader);

  /* ---------- Pointer ---------- */
  const mouse = { x: innerWidth / 2, y: innerHeight / 2, nx: 0, ny: 0 };
  addEventListener("pointermove", (e) => {
    mouse.x = e.clientX; mouse.y = e.clientY;
    mouse.nx = e.clientX / innerWidth - 0.5;
    mouse.ny = e.clientY / innerHeight - 0.5;
  });

  const cursor = $(".cursor");
  const cur = { x: mouse.x, y: mouse.y };
  const label = $(".cursor__label");
  if (cursor) {
    document.addEventListener("pointerover", (e) => {
      const view = e.target.closest("[data-cursor]");
      const link = e.target.closest("a, button");
      cursor.classList.toggle("is-view", !!view);
      cursor.classList.toggle("is-hover", !view && !!link);
      if (view && label) label.textContent = view.dataset.cursor;
    });
  }

  /* ---------- Hero figure: the Theyyam portrait assembles itself out of embers ----------
     Instead of a static <img>, the artwork is sampled into thousands of coloured cells.
     Near-black background pixels are skipped by luminance, so only the lit face, gold
     ornaments and headdress become particles — no manual cutout needed. On load they
     fly in from a scatter and settle into the portrait; once settled they flicker like
     embers, and a small fraction continually break away and drift upward before fading,
     looping forever. */
  /* ---------- Hero figure: deity particle-jet assemble effect ----------
     Directly adapted from deity_jet_particle_demo.html.
     Pure particles with cubic easing assembly, organic drift/wobble,
     twinkling stars, and interactive color modes (Original fire / Cyan-Gold). */
  const heroFigureWrap = $("#heroFigure");
  const figureCanvas = $("#figureCanvas");
  let figureLoopFn = null;
  if (heroFigureWrap && figureCanvas) {
    const fctx = figureCanvas.getContext("2d");
    const portrait = new Image();
    portrait.src = "images/theyyam-deity.png";

    let particles = [];
    let rawPts = [];
    let stars = [];
    let fw = 0, fh = 0;
    const isMobile = window.innerWidth <= 900 || touch;
    const dpr = isMobile ? 1 : Math.min(devicePixelRatio || 1, 1.5);
    let ready = false;
    let assembleStart = 0;
    const ASSEMBLE_MS = 2200;
    let tFrame = 0;
    let pmx = 0, pmy = 0;
    let colorMode = "original";

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
          const r = data[idx], g = data[idx + 1], b = data[idx + 2], a = data[idx + 3];
          const lum = 0.299 * r + 0.587 * g + 0.114 * b;
          if (a < 40 || lum < 14) continue;
          const skipProb = lum < 45 ? (isMobile ? 0.70 : 0.35) : (isMobile ? 0.35 : 0.06);
          if (Math.random() < skipProb) continue;
          pts.push({ u: x / targetW, v: y / targetH, r, g, b, lum });
        }
      }

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
      // The lit face and crown of the deity in theyyam-deity.png is centered at u ≈ 0.573.
      // Align this visual center directly with canvas horizontal center (fw * 0.5)
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
          r: p.r,
          g: p.g,
          b: p.b,
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
      const rect = heroFigureWrap.getBoundingClientRect();
      fw = rect.width;
      fh = rect.height;
      if (!fw || !fh) return;
      figureCanvas.width = Math.round(fw * dpr);
      figureCanvas.height = Math.round(fh * dpr);
      figureCanvas.style.width = fw + "px";
      figureCanvas.style.height = fh + "px";
      fctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      layoutParticles();
    };

    portrait.onload = () => {
      ready = true;
      sizeFigure();
    };
    portrait.onerror = () => { /* graceful fallback */ };
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

    heroFigureWrap.addEventListener("click", () => {
      reassemble();
    });

    const themeColor = (p) => {
      const warm = (p.r > p.g && p.r > 90);
      const t = p.lum / 255;
      return warm ? `rgba(232, 178, 74, ${0.55 + t * 0.45})` : `rgba(45, 224, 216, ${0.5 + t * 0.5})`;
    };
    const originalColor = (p) => `rgba(${p.r},${p.g},${p.b},0.92)`;

    figureLoopFn = (now) => {
      if (!ready || !fw || !particles.length || scrollY > vh * 1.1) return;
      tFrame++;
      const elapsed = now - assembleStart;
      const prog = reduced ? 1 : Math.min(1, elapsed / ASSEMBLE_MS);
      const ease = 1 - Math.pow(1 - prog, 3);

      if (!isMobile) {
        pmx = lerp(pmx, mouse.nx * 14, 0.05);
        pmy = lerp(pmy, mouse.ny * 10, 0.05);
      }

      fctx.clearRect(0, 0, fw, fh);

      // Radial background gradient
      const grad = fctx.createRadialGradient(fw * 0.5, fh * 0.5, 10, fw * 0.5, fh * 0.5, Math.max(fw, fh) * 0.6);
      grad.addColorStop(0, "rgba(45, 15, 10, 0.35)");
      grad.addColorStop(1, "rgba(0, 0, 0, 0)");
      fctx.fillStyle = grad;
      fctx.fillRect(0, 0, fw, fh);

      // Batch render stars with single draw path
      fctx.fillStyle = "rgba(255, 230, 200, 0.7)";
      fctx.beginPath();
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        const r = s.big ? s.r * 1.8 : s.r;
        if (isMobile) {
          fctx.rect(s.x, s.y, r * 1.4, r * 1.4);
        } else {
          fctx.moveTo(s.x + r, s.y);
          fctx.arc(s.x, s.y, r, 0, Math.PI * 2);
        }
      }
      fctx.fill();

      // Deity particles
      const numParticles = particles.length;
      if (isMobile) {
        for (let i = 0; i < numParticles; i++) {
          const p = particles[i];
          const cx = p.x + (p.tx - p.x) * ease;
          const cy = p.y + (p.ty - p.y) * ease;
          const wobbleX = Math.sin(tFrame * p.speed + p.phase) * p.drift * ease;
          const wobbleY = Math.cos(tFrame * p.speed * 1.3 + p.phase) * p.drift * ease;
          const flick = 0.6 + Math.sin(tFrame * p.twinkleSpeed + p.phase) * 0.4;
          fctx.globalAlpha = Math.max(0.1, flick) * (0.4 + 0.6 * ease);
          fctx.fillStyle = colorMode === "theme" ? themeColor(p) : p.color;
          fctx.fillRect(cx + wobbleX - p.halfSize, cy + wobbleY - p.halfSize, p.size, p.size);
        }
      } else {
        fctx.save();
        for (let i = 0; i < numParticles; i++) {
          const p = particles[i];
          const cx = p.x + (p.tx - p.x) * ease + pmx * ease;
          const cy = p.y + (p.ty - p.y) * ease + pmy * ease;
          const wobbleX = Math.sin(tFrame * p.speed + p.phase) * p.drift * ease;
          const wobbleY = Math.cos(tFrame * p.speed * 1.3 + p.phase) * p.drift * ease;
          const flick = 0.6 + Math.sin(tFrame * p.twinkleSpeed + p.phase) * 0.4;
          fctx.globalAlpha = Math.max(0.05, flick) * (0.4 + 0.6 * ease);
          fctx.fillStyle = colorMode === "theme" ? themeColor(p) : originalColor(p);
          fctx.beginPath();
          fctx.arc(cx + wobbleX, cy + wobbleY, p.size, 0, Math.PI * 2);
          fctx.fill();
        }
        fctx.restore();
      }
      fctx.globalAlpha = 1;
    };

    let figResizeQueued = false;
    addEventListener("resize", () => {
      if (figResizeQueued) return;
      figResizeQueued = true;
      requestAnimationFrame(() => {
        figResizeQueued = false;
        sizeFigure();
      });
    });
  }

  /* ---------- Scroll state ---------- */
  let scrollY = window.scrollY, lastY = scrollY, velocity = 0;
  const nav = $(".nav");
  addEventListener("scroll", () => {
    scrollY = window.scrollY;
    nav.classList.toggle("is-scrolled", scrollY > 40);
    nav.classList.toggle("is-hidden", scrollY > lastY && scrollY > innerHeight * 0.8 && !document.body.classList.contains("menu-open"));
    lastY = scrollY;
  }, { passive: true });

  const heroContent = $(".hero__content");
  // Where supported, the headline's scroll-out runs as a CSS scroll-driven animation on the compositor (no main-thread lag)
  const cssHero = !reduced && !!window.CSS?.supports?.("animation-timeline: scroll()");
  let heroLast = -1;

  /* ---------- Cached geometry (avoid layout reads inside the rAF loop) ---------- */
  const speedEls = $$("[data-speed]").map((el) => ({ el, speed: parseFloat(el.dataset.speed), top: 0, h: 0 }));
  let vh = innerHeight;
  const measure = () => {
    vh = innerHeight;
    const sy = window.scrollY;
    speedEls.forEach((s) => {
      const r = s.el.parentElement.getBoundingClientRect();
      s.top = r.top + sy; s.h = r.height;
    });
    maxXCache = Math.max(0, track.scrollWidth - carousel.clientWidth + 24);
    const gr = gallery.getBoundingClientRect();
    gal.top = gr.top + sy; gal.run = Math.max(1, gr.height - vh);
    const rr = reel.getBoundingClientRect();
    rl.top = rr.top + sy; rl.run = Math.max(1, rr.height - vh);
    rl.fw = frame.offsetWidth; rl.fh = frame.offsetHeight; // untransformed size
    rl.ww = words.map((w) => w.offsetWidth);
    rl.narrow = innerWidth <= 900;
    rl.pad = clamp(innerWidth * 0.034, 16, 48);
    rlLast = -1;
  };
  let maxXCache = 0;
  const gallery = $("#gallery");
  const gal = { top: 0, run: 1 };
  const reel = $("#aboutReel");
  const frame = $("#aboutFrame");
  const words = $$(".about__word");
  const rl = { top: 0, run: 1, fw: 0, fh: 0, ww: [0, 0], narrow: false, pad: 16 };
  let rlLast = -1;
  let measureQueued = false;
  const queueMeasure = () => {
    if (measureQueued) return;
    measureQueued = true;
    requestAnimationFrame(() => { measureQueued = false; measure(); });
  };
  // Mobile browsers fire resize while the URL bar slides in/out during scroll; re-laying out then makes the hero jump
  let lastW = innerWidth;
  addEventListener("resize", () => {
    if (touch && innerWidth === lastW && Math.abs(innerHeight - vh) < 160) return;
    lastW = innerWidth;
    queueMeasure();
  });
  addEventListener("load", queueMeasure);
  if ("ResizeObserver" in window) new ResizeObserver(queueMeasure).observe(document.body);
  document.fonts?.ready.then(queueMeasure);

  /* ---------- Main loop ---------- */
  let prevT = performance.now(), prevScroll = scrollY, smoothY = scrollY;
  const loop = (t) => {
    const dt = Math.min(0.05, (t - prevT) / 1000);
    prevT = t;

    const sv = (scrollY - prevScroll) / Math.max(dt, 0.001);
    prevScroll = scrollY;
    velocity = lerp(velocity, clamp(Math.abs(sv), 0, 3000), 0.08);

    // Eased scroll value for scroll-linked motion (framerate independent)
    smoothY = lerp(smoothY, scrollY, 1 - Math.pow(0.001, dt * 1.2));
    if (Math.abs(smoothY - scrollY) < 0.1) smoothY = scrollY;

    // Headline scroll-out follows the real scroll position (smoothing it made the text trail behind, most visibly on the way back up)
    if (!cssHero && (scrollY < vh * 1.2 || heroLast !== 1)) {
      const p = clamp(scrollY / vh, 0, 1);
      if (p !== heroLast) {
        heroLast = p;
        heroContent.style.transform = `translate3d(0,${(p * 120).toFixed(2)}px,0) scale(${(1 - p * 0.12).toFixed(4)})`;
        heroContent.style.opacity = Math.max(0, 1 - p * 1.3).toFixed(3);
      }
    }

    if (figureLoopFn && scrollY < vh * 1.3) figureLoopFn(t);

    // Parallax (pure math on cached positions — no getBoundingClientRect per frame)
    speedEls.forEach((s) => {
      const top = s.top - smoothY;
      if (top + s.h < -200 || top > vh + 200) return;
      const d = top + s.h / 2 - vh / 2;
      s.el.style.transform = `translate3d(0,${(d * s.speed).toFixed(2)}px,0)`;
    });

    // Cursor
    if (cursor) {
      cur.x = lerp(cur.x, mouse.x, 0.2);
      cur.y = lerp(cur.y, mouse.y, 0.2);
      cursor.style.transform = `translate3d(${cur.x}px,${cur.y}px,0)`;
    }

    carouselTick();
    galleryTick();
    reelTick(t);
    requestAnimationFrame(loop);
  };

  /* ---------- About reel ---------- */
  const video = $("#aboutVideo");
  const glow = $("#aboutGlow");
  const gctx = glow.getContext("2d");
  const soundBtn = $("#aboutSound");
  const soundTxt = $("b", soundBtn);
  if ("filter" in gctx) gctx.filter = "blur(3px)"; else glow.classList.add("is-soft");
  let reelSeen = false, glowT = 0;

  // Grows from when the reel is half on screen until ~60% through the pin, then holds full size
  const reelTick = (t) => {
    const start = rl.top - vh * 0.5;
    const inView = smoothY > rl.top - vh && smoothY < rl.top + rl.run + vh;
    const p = reduced ? 1 : clamp((smoothY - start) / (vh * 0.5 + rl.run * 0.6), 0, 1);

    if (!touch && inView && !video.paused && t - glowT > 80) { // skip on mobile to prevent GPU video stall
      glowT = t;
      gctx.drawImage(video, 0, 0, glow.width, glow.height);
    }
    if (Math.abs(p - rlLast) < 0.0005) return;
    rlLast = p;

    const e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(2 - 2 * p, 3) / 2; // ease in-out
    const s = 0.42 + 0.58 * e;
    frame.style.transform = `scale(${s.toFixed(4)})`;
    frame.style.setProperty("--p", e.toFixed(3));
    glow.style.opacity = (e * 0.9).toFixed(3);

    if (rl.narrow) {
      const oy = (rl.fh * s) / 2 + 14;
      words[0].style.transform = `translate3d(-50%, calc(-100% - ${oy.toFixed(1)}px), 0)`;
      words[1].style.transform = `translate3d(-50%, ${oy.toFixed(1)}px, 0)`;
    } else {
      // Hug the frame's edges; once it outgrows the gap they stop at the page margin and blend over it
      words.forEach((w, i) => {
        const o = Math.min((rl.fw * s) / 2 + 28, innerWidth / 2 - rl.pad - rl.ww[i]);
        w.style.transform = `translate3d(${(i ? o : -o).toFixed(1)}px, -50%, 0)`;
      });
    }
  };

  const setSound = (on) => {
    video.muted = !on;
    frame.classList.toggle("is-on", on);
    soundBtn.setAttribute("aria-pressed", on);
    soundTxt.textContent = on ? "Sound on" : "Sound off";
    frame.dataset.cursor = on ? "Mute" : "Sound on";
    if (cursor.classList.contains("is-view")) label.textContent = frame.dataset.cursor;
  };
  if (reduced) soundTxt.textContent = "Play";
  frame.addEventListener("click", () => {
    if (video.paused) { reelSeen = true; video.play().catch(() => { }); setSound(true); return; }
    setSound(video.muted);
  });

  // Only decode while the reel is on screen; reduced-motion visitors start it themselves
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting && (!reduced || reelSeen)) video.play().catch(() => { });
    else if (!e.isIntersecting) video.pause();
  }, { threshold: 0.1 }).observe(frame);

  /* ---------- Carousel ---------- */
  const carousel = $("#carousel");
  const progress = $("#progress");
  let cx = 0, tx = 0, drag = null, moved = 0;
  const maxX = () => maxXCache;
  const step = () => (track.children[0]?.getBoundingClientRect().width || 300) + 10;
  $("#next").addEventListener("click", () => { tx = clamp(tx + step(), 0, maxX()); });
  $("#prev").addEventListener("click", () => { tx = clamp(tx - step(), 0, maxX()); });
  carousel.addEventListener("pointerdown", (e) => {
    drag = { x: e.clientX, start: tx }; moved = 0;
    carousel.classList.add("is-drag");
    carousel.setPointerCapture(e.pointerId);
  });
  carousel.addEventListener("pointermove", (e) => {
    if (!drag) return;
    moved = Math.abs(e.clientX - drag.x);
    tx = clamp(drag.start - (e.clientX - drag.x) * 1.3, -80, maxX() + 80);
  });
  const endDrag = () => { if (!drag) return; drag = null; carousel.classList.remove("is-drag"); tx = clamp(tx, 0, maxX()); };
  carousel.addEventListener("pointerup", endDrag);
  carousel.addEventListener("pointercancel", endDrag);
  carousel.addEventListener("click", (e) => { if (moved > 6) e.preventDefault(); }, true);
  const carouselTick = () => {
    if (Math.abs(tx - cx) < 0.05) return; // settled — skip style writes
    cx = lerp(cx, tx, 0.1);
    track.style.transform = `translate3d(${-cx}px,0,0)`;
    const m = maxX() || 1;
    progress.style.transform = `scaleX(${0.2 + 0.8 * clamp(cx / m, 0, 1)})`;
  };

  /* ---------- Pinned gallery ---------- */
  // Section is sticky for (n-1) screens of scroll; progress 0→1 across that run wipes each pair of photos in over the last
  const galItems = $$(".gallery__item").map((el) => ({ el, figs: $$(".gallery__fig", el).map((f) => ({ el: f, img: $("img", f) })) }));
  const galIdx = $("#galleryIdx");
  const galBar = $("#galleryBar");
  const galTexts = $$(".gallery__text");
  const galList = $$(".gallery__list li");
  let galLast = -1, galShown = -1;
  const galleryTick = () => {
    const p = clamp((smoothY - gal.top) / gal.run, 0, 1);
    if (Math.abs(p - galLast) < 0.0005) return; // unchanged — skip style writes
    galLast = p;
    const n = galItems.length;
    // 0 … n-1: which pair is on top, fractional during a wipe. Each moment holds briefly so scrolling rarely rests mid-wipe
    const raw = p * (n - 1), k = Math.min(n - 2, Math.floor(raw));
    const w = clamp((raw - k - 0.15) / 0.7, 0, 1);
    const pos = k + w * w * (3 - 2 * w);
    galItems.forEach((g, i) => {
      const t = i === 0 ? 1 : clamp(pos - (i - 1), 0, 1); // how far this pair has come in
      const outP = clamp(pos - i, 0, 1); // how far the next pair has covered it
      // The wide shot alternates high/low, so the outgoing pair fades rather than peeking through the gaps
      g.el.style.transform = `scale(${(1 - outP * 0.05).toFixed(4)})`;
      g.el.style.opacity = (1 - clamp((outP - 0.05) / 0.45, 0, 1)).toFixed(3);
      g.figs.forEach((f, j) => {
        const inP = i === 0 ? 1 : clamp((t - j * 0.22) / 0.78, 0, 1); // second photo trails the first
        const r = ((1 - inP) * 100).toFixed(2);
        if (i > 0) f.el.style.clipPath = j ? `inset(0 0 ${r}% 0)` : `inset(${r}% 0 0 0)`; // wipe up, then down
        f.img.style.transform = `scale(${(1.18 - inP * 0.18 + outP * 0.04).toFixed(4)})`;
      });
    });
    galBar.style.transform = `scaleX(${p.toFixed(4)})`;
    const shown = Math.min(n - 1, Math.round(pos));
    if (shown !== galShown) {
      galShown = shown;
      galIdx.textContent = String(shown + 1).padStart(2, "0");
      galTexts.forEach((t, i) => t.classList.toggle("is-active", i === shown));
      galList.forEach((t, i) => t.classList.toggle("is-active", i === shown));
    }
  };

  measure();
  cx = -1; // force first carousel write
  requestAnimationFrame(loop);

  /* ---------- Reveal on scroll ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("in");
      // clip-path'd reveals are observed through their parent (a fully clipped box never "intersects")
      $$(":scope > .img-reveal", e.target).forEach((c) => c.classList.add("in"));
      if (e.target.matches("[data-count]")) countUp(e.target);
      io.unobserve(e.target);
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });
  $$("[data-split], [data-reveal], #footerWord, [data-count]").forEach((el) => io.observe(el));
  $$(".img-reveal").forEach((el) => io.observe(el.parentElement));

  $$(".about__outro [data-reveal]").forEach((el, i) => el.style.setProperty("--d", i * 0.12 + "s"));

  const countUp = (el) => {
    const end = +el.dataset.count;
    const t0 = performance.now();
    const f = (t) => {
      const p = clamp((t - t0) / 1600, 0, 1);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 4)));
      if (p < 1) requestAnimationFrame(f);
    };
    requestAnimationFrame(f);
  };

  /* ---------- Magnetic button ---------- */
  $$("[data-magnetic]").forEach((el) => {
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.3}px, ${(e.clientY - r.top - r.height / 2) * 0.4}px)`;
    });
    el.addEventListener("pointerleave", () => { el.style.transform = ""; });
  });

  /* ---------- Nav: active link + mobile menu ---------- */
  /* ---------- Nav: active link + mobile menu ---------- */
  const links = $$(".nav__links a");
  const secIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      // Tall sections (the pinned gallery) never reach 40% visible, so also accept "fills most of the screen"
      if (!e.isIntersecting || (e.intersectionRatio < 0.4 && e.intersectionRect.height < innerHeight * 0.6)) return;
      links.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === "#" + e.target.id));
    });
  }, { threshold: [0, 0.2, 0.4, 0.6, 0.8, 1] });
  $$("section[id]").forEach((s) => secIO.observe(s));

  $(".nav__burger").addEventListener("click", () => document.body.classList.toggle("menu-open"));
  $$(".menu a").forEach((a) => a.addEventListener("click", () => document.body.classList.remove("menu-open")));
})();
