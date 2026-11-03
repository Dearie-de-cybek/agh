import { Belief } from "../components/home/Belief";
import { FinalCta } from "../components/home/FinalCta";
import { Hero } from "../components/home/Hero";
import { Models } from "../components/home/Models";
import { Packages } from "../components/home/Packages";
import { SiteFooter } from "../components/home/SiteFooter";
import { SiteHeader } from "../components/home/SiteHeader";
import { Trusted } from "../components/home/Trusted";

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <SiteHeader />
      <main id="main">
        <Hero />
        <Models />
        <Belief />
        <Packages />
        <Trusted />
        <FinalCta />
      </main>
      <SiteFooter />
    </>
  );
}
