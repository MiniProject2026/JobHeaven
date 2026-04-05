import CareerGuide from "@/components/career-guide";
import Hero from "@/components/hero";
import ResumeAnalyzer from "@/components/resume-analyser";
import { Button } from "@/components/ui/button";
import React from "react";

const Home = () => {
  return (
    <div>
      <Hero />
      <CareerGuide />
      <ResumeAnalyzer />
    </div>
  );
};

export default Home;
