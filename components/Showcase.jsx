"use client";

export default function Showcase() {
  return (
    <section className="expo section" id="exhibition">
      <div className="expo__left">
        <h2 className="h2" data-split>The Main <em>Stage</em></h2>
        <div className="expo__artists" data-reveal>
          <h4>The Contenders</h4>
          <p>CSE, ECE, EEE, ME, IT and the Department of Architecture (B.Arch). Six departments with one crown at stake and no one holding back.</p>
          <div className="avatars">
            <img src="/images/estrella-11.jpg" alt="Team CSE" title="Team CSE" />
            <img src="/images/estrella-06.jpg" alt="Team ECE" title="Team ECE" />
            <img src="/images/estrella-05.jpg" alt="Team EEE" title="Team EEE" />
            <img src="/images/estrella-08.jpg" alt="Team ME" title="Team ME" />
            <img src="/images/estrella-02.jpg" alt="Team IT" title="Team IT" />
            <img src="/images/estrella-04.jpg" alt="Team B.Arch" title="Team B.Arch" />
          </div>
        </div>
      </div>

      <div className="expo__media img-reveal in" data-cursor="Enter">
        <img data-speed="-0.08" src="/images/theyyam-dancer.webp" alt="A dancer in Theyyam-inspired costume and makeup performing on stage" />
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
