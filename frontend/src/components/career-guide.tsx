"use client";
import { CareerGuideResponse, utils_service } from "@/type";
import { ArrowRight, Loader, Sparkles, Target, X } from "lucide-react";
import { useServerInsertedHTML } from "next/navigation";
import React, { useState } from "react";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";

const CareerGuide = () => {
  const [open, setOpen] = useState(false);
  const [skills, setSkills] = useState<string[]>([]);
  const [currentSkill, setCurrentSkill] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<CareerGuideResponse | null>(null);
  const addSkill = () => {
    if (currentSkill.trim() && !skills.includes(currentSkill.trim())) {
      setSkills([...skills, currentSkill.trim()]);
      setCurrentSkill("");
    }
  };
  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      addSkill();
    }
  };
  const getCareerGuidance = async () => {
    if (skills.length === 0) {
      alert("Please add at leat one skill");
      return;
    }
    setLoading(true);
    try {
      const { data } = await axios.post(`${utils_service}/api/utils/career`, {
        skills: skills,
      });
      setResponse(data);
      alert("Career guidance generated");
    } catch (error: any) {
      alert(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  const resetDialog = () => {
    setSkills([]);
    setCurrentSkill("");
    setResponse(null);
    setOpen(false);
  };
  console.log(skills);
  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border bg-blue-50 dark:bg-blue-950 mb-4">
          <Sparkles size={16} className="text-blue-600" />
          <span className="text-sm font-medium">
            AI-Powered Career Guidance
          </span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Discover Your Career Path
        </h2>
        <p className="text-lg opacity-70 max-w-2xl mx-auto mb-8">
          Get personalised job recommendations and learnings roadmaps based on
          your skills.
        </p>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size={"lg"} className="gap-2 h-12 px-8">
              <Sparkles size={18} />
              Get Career Guidance
              <ArrowRight size={18} />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {!response ? (
              <>
                <DialogHeader>
                  <DialogTitle className="text-2xl flex items-center gap-2">
                    <Sparkles className="text-blue-600" />
                    Tell us about your skills
                  </DialogTitle>
                  <DialogDescription>
                    Add your technical skills to receive personalized career
                    recommendations
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="skill">Add Skills</Label>
                    <div className="flex gap-2">
                      <Input
                        id="skill"
                        placeholder="e.g., React, Node.js, Python..."
                        value={currentSkill}
                        onChange={(e) => setCurrentSkill(e.target.value)}
                        className="h-11"
                        onKeyPress={handleKeyPress}
                      />
                      <Button onClick={addSkill} className="gap-2">
                        Add
                      </Button>
                    </div>
                  </div>
                  {skills.length > 0 && (
                    <div className="space-y-2">
                      <Label>Your Skills ({skills.length})</Label>
                      <div className="flex flex-wrap gap-2">
                        {skills.map((s) => (
                          <div
                            key={s}
                            className="inline-flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800"
                          >
                            <span className="text-sm font-medium">{s}</span>
                            <button
                              onClick={() => removeSkill(s)}
                              className="h-5 w-5 rounded-full bg-red-500 text-white flex in-checked:justify-center"
                            >
                              <X size={13} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <Button
                    onCanPlay={getCareerGuidance}
                    disabled={loading || skills.length === 0}
                    className="w-full h-11 gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader size={18} className="animate-spin" />
                        Analysing Your Skills...
                      </>
                    ) : (
                      <>
                        <Sparkles size={18} />
                        Generate Career Guidance
                      </>
                    )}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <DialogHeader>
                  <DialogTitle className="text-2xl flex items-center gap-2">
                    <Target className="text-blue-600" />
                    Your Personalized Career Guide
                  </DialogTitle>
                </DialogHeader>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default CareerGuide;
