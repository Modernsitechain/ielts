import { AiCoach } from "../components/ai-coach";
import { FeatureGrid } from "../components/feature-grid";
import { FinalCta } from "../components/final-cta";
import { Hero } from "../components/hero";
import { HowItWorks } from "../components/how-it-works";

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeatureGrid />
      <HowItWorks />
      <AiCoach />
      <FinalCta />
    </>
  );
}
