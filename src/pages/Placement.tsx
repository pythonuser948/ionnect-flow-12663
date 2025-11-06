import { BottomNav } from "@/components/BottomNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, Target, TrendingUp } from "lucide-react";

const Placement = () => {
  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-gradient-to-r from-warning to-accent text-warning-foreground p-6 elevation-3">
        <div className="max-w-screen-xl mx-auto">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Briefcase className="w-7 h-7" />
            Placement Advisor
          </h1>
          <p className="text-warning-foreground/90">Your career guidance companion</p>
        </div>
      </header>

      <div className="max-w-screen-xl mx-auto px-4 py-6 space-y-6">
        <Card className="p-5 elevation-2">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Top-Fit Companies
          </h3>
          <div className="space-y-3">
            {["Google", "Microsoft", "Amazon"].map((company) => (
              <div key={company} className="p-3 bg-secondary rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{company}</p>
                    <p className="text-xs text-muted-foreground">Match: 85%</p>
                  </div>
                  <Button size="sm" variant="outline">View</Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5 elevation-1">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-success" />
            Skills to Develop
          </h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">System Design</span>
              <Button size="sm" variant="ghost">Learn</Button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">React Advanced</span>
              <Button size="sm" variant="ghost">Learn</Button>
            </div>
          </div>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
};

export default Placement;
