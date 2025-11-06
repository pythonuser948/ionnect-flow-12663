import { useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Rocket, Code, Users, ArrowRight, Sparkles } from "lucide-react";

const Launchpad = () => {
  const [ideaTitle, setIdeaTitle] = useState("");
  const [ideaDescription, setIdeaDescription] = useState("");

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-gradient-to-r from-accent to-warning text-accent-foreground p-6 elevation-3">
        <div className="max-w-screen-xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Rocket className="w-8 h-8" />
            <h1 className="text-2xl font-bold">Launchpad</h1>
          </div>
          <p className="text-accent-foreground/80">Transform your idea into reality</p>
        </div>
      </header>

      <div className="max-w-screen-xl mx-auto px-4 py-6 space-y-6">
        {/* New Idea Form */}
        <Card className="p-6 elevation-2">
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-accent" />
                Submit Your Idea
              </h2>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Idea Title</label>
                <Input
                  value={ideaTitle}
                  onChange={(e) => setIdeaTitle(e.target.value)}
                  placeholder="What's your big idea?"
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">
                  Brief Description
                </label>
                <Textarea
                  value={ideaDescription}
                  onChange={(e) => setIdeaDescription(e.target.value)}
                  placeholder="Describe your idea in a few lines..."
                  className="w-full min-h-[120px]"
                />
              </div>

              <Button className="w-full" size="lg" variant="accent">
                Generate Scaffold & Pitch
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </div>
        </Card>

        {/* What You'll Get */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-foreground">What You'll Get</h3>
          <div className="grid gap-3">
            <Card className="p-4 elevation-1">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Code className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-sm">GitHub Scaffold</h4>
                  <p className="text-xs text-muted-foreground">
                    Instantly generate a starter repository with basic project structure
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4 elevation-1">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h4 className="font-medium text-sm">One-Page Pitch</h4>
                  <p className="text-xs text-muted-foreground">
                    AI-generated pitch summary highlighting key features and market fit
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4 elevation-1">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-success" />
                </div>
                <div>
                  <h4 className="font-medium text-sm">Mentor Match</h4>
                  <p className="text-xs text-muted-foreground">
                    Get connected with alumni mentors in your domain
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Recent Ideas */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-foreground">Your Ideas</h3>
          <Card className="p-4 elevation-1">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-sm">Campus Food Delivery App</h4>
                  <p className="text-xs text-muted-foreground">Submitted 3 days ago</p>
                </div>
                <span className="text-xs bg-success/10 text-success px-2 py-1 rounded-full font-medium">
                  Active
                </span>
              </div>
              <Button variant="outline" size="sm" className="w-full">
                View Details
              </Button>
            </div>
          </Card>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Launchpad;
