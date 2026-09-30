"use client";
import { useEffect, useRef, useState } from "react";

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
    altB: "Students in the audience smiling during a performance"
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

export default function Gallery() {
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
