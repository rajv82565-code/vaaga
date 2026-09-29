"use client";
import { useEffect } from "react";

export default function ScrollReveal() {
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
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
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
