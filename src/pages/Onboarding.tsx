import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GraduationCap, UserCheck, Users, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const roles = [
  {
    id: "student",
    title: "Student",
    icon: GraduationCap,
    description: "Access personalized mentoring, study planning, and placement guidance",
  },
  {
    id: "faculty",
    title: "Faculty",
    icon: UserCheck,
    description: "Monitor student progress and provide academic support",
  },
  {
    id: "alumnus",
    title: "Alumnus",
    icon: Users,
    description: "Mentor current students and share industry insights",
  },
];

const Onboarding = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/home');
      } else {
        setCheckingAuth(false);
      }
    };
    checkAuth();
  }, [navigate]);

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleRoleSelect = (roleId: string) => {
    setSelectedRole(roleId);
  };

  const handleContinue = () => {
    if (step === 1 && selectedRole) {
      setStep(2);
    } else if (step === 2) {
      navigate("/auth");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30 p-6 flex flex-col">
      <div className="max-w-md mx-auto w-full flex-1 flex flex-col justify-center">
        {step === 1 ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-right duration-500">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold text-foreground">Welcome to IONCONNECT</h2>
              <p className="text-muted-foreground">Select your role to get started</p>
            </div>

            <div className="space-y-3">
              {roles.map(({ id, title, icon: Icon, description }) => (
                <Card
                  key={id}
                  className={`p-4 cursor-pointer transition-smooth border-2 ${
                    selectedRole === id
                      ? "border-primary bg-primary-light/50"
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => handleRoleSelect(id)}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg ${selectedRole === id ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-1">{title}</h3>
                      <p className="text-sm text-muted-foreground">{description}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <Button
              size="lg"
              className="w-full"
              onClick={handleContinue}
              disabled={!selectedRole}
            >
              Continue
              <ChevronRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-right duration-500">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold text-foreground">Enable Permissions</h2>
              <p className="text-muted-foreground">Help us provide a personalized experience</p>
            </div>

            <div className="space-y-4">
              <Card className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Notifications</h4>
                      <p className="text-sm text-muted-foreground">Get timely reminders and updates</p>
                    </div>
                    <div className="w-12 h-6 bg-primary rounded-full relative">
                      <div className="absolute right-1 top-1 w-4 h-4 bg-primary-foreground rounded-full" />
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Calendar Access (Optional)</h4>
                      <p className="text-sm text-muted-foreground">Sync with your academic calendar</p>
                    </div>
                    <div className="w-12 h-6 bg-muted rounded-full relative">
                      <div className="absolute left-1 top-1 w-4 h-4 bg-background rounded-full" />
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            <div className="space-y-3">
              <Button size="lg" className="w-full" onClick={handleContinue}>
                Get Started
              </Button>
              <Button size="lg" variant="ghost" className="w-full" onClick={handleContinue}>
                Skip for now
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
