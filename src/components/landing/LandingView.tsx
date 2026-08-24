"use client";

import React, { useEffect, useState } from "react";
import { LandingNav } from "./LandingNav";
import { HeroSection } from "./HeroSection";
import { FeaturesSection } from "./FeaturesSection";
import { PricingSection } from "./PricingSection";
import { StepsSection } from "./StepsSection";
import { FAQSection } from "./FAQSection";
import { AboutSection } from "./AboutSection";
import { LandingFooter } from "./LandingFooter";
import { contentService } from "@/services/content.service";
import { AppContent } from "@/types";
import { DEFAULT_CONTENT } from "@/lib/constants";

export const LandingView: React.FC = () => {
  const [content, setContent] = useState<AppContent>(DEFAULT_CONTENT);

  useEffect(() => {
    contentService.get().then((c) => setContent(c));
  }, []);

  return (
    <div className="bg-dark-green text-white min-h-screen">
      <LandingNav />
      <HeroSection tagline={content.tagline} sub={content.sub} />
      <FeaturesSection />
      <PricingSection />
      <StepsSection />
      <FAQSection faqs={content.faq} />
      <AboutSection content={content} />
      <LandingFooter />
    </div>
  );
};
