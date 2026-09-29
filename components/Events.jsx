"use client";
import { useEffect, useRef } from "react";

const AUCTIONS = [
  { t: "Thiruvathira", a: "Group · On Stage", bid: "Classical Roots", img: "08" },
  { t: "Mohiniyattam", a: "Solo · On Stage", bid: "Grace in Motion", img: "06" },
  { t: "Battle of Bands", a: "Group · On Stage", bid: "Turn It Up", img: "05" },
  { t: "Street Dance", a: "Group · On Stage", bid: "Own the Floor", img: "11" },
  { t: "Mappila Pattu", a: "Solo · On Stage", bid: "Voice of Malabar", img: "12" },
  { t: "Canvas Live", a: "Solo · Off Stage", bid: "Paint the Moment", img: "09" },
];

export default function Events() {
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

    const maxX = () => Math.max(0, track.scrollWidth - carousel.clientWidth + 24);
    const step = () => (track.children[0]?.getBoundingClientRect().width || 300) + 10;

    const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

    const onNext = () => {
      tx = clamp(tx + step(), 0, maxX());
    };
    const onPrev = () => {
      tx = clamp(tx - step(), 0, maxX());
    };

    const onPointerDown = (e) => {
      drag = { x: e.clientX, start: tx };
      moved = 0;
      carousel.classList.add("is-drag");
      carousel.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e) => {
      if (!drag) return;
      moved = Math.abs(e.clientX - drag.x);
      tx = clamp(drag.start - (e.clientX - drag.x) * 1.3, -80, maxX() + 80);
    };

    const endDrag = () => {
      if (!drag) return;
      drag = null;
      carousel.classList.remove("is-drag");
      tx = clamp(tx, 0, maxX());
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

    const loop = () => {
      if (Math.abs(tx - cx) >= 0.05) {
        cx += (tx - cx) * 0.1;
        track.style.transform = `translate3d(${-cx}px,0,0)`;
        const m = maxX() || 1;
        progress.style.transform = `scaleX(${0.2 + 0.8 * clamp(cx / m, 0, 1)})`;
      }
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);

    return () => {
      carousel.removeEventListener("pointerdown", onPointerDown);
      carousel.removeEventListener("pointermove", onPointerMove);
      carousel.removeEventListener("pointerup", endDrag);
      carousel.removeEventListener("pointercancel", endDrag);
      carousel.removeEventListener("click", onClick, true);
      if (prevBtn) prevBtn.removeEventListener("click", onPrev);
      if (nextBtn) nextBtn.removeEventListener("click", onNext);
      cancelAnimationFrame(rafId);
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

      <div className="carousel" id="carousel" ref={carouselRef}>
        <div className="carousel__track" id="track" ref={trackRef}>
          {AUCTIONS.map((x, i) => (
            <article key={i} className="card" data-cursor="Join">
              <div className="card__img">
                <img
                  alt={`${x.t}, ${x.a}`}
                  loading="lazy"
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
