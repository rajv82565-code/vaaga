import Preloader from "@/components/Preloader";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Showcase from "@/components/Showcase";
import Events from "@/components/Events";
import Gallery from "@/components/Gallery";
import Host from "@/components/Host";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";

export default function Home() {
  return (
    <>
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
    </>
  );
}
