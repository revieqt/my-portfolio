import Certifications from "@/components/sections/Certifications";
import Hero from "@/components/sections/Hero";
import Projects from "@/components/sections/Projects";
import Skills from "@/components/sections/Skills";

function Home() {
  return (
    <>
      <Hero/>
      <Skills/>
      <Certifications/>
      <Projects/>
    </>
  );
}

export default Home;