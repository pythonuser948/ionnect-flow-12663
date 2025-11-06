import { useState, useEffect } from "react";
import { BottomNav } from "@/components/BottomNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User, Mail, GraduationCap, TrendingUp, Award, Settings, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";
import avatarImage from "@/assets/ionconnect-avatar.png";

const Profile = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { role } = useUserRole();
  const [userEmail, setUserEmail] = useState<string>("");

  useEffect(() => {
    const getUserEmail = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setUserEmail(user.email);
      }
    };
    getUserEmail();
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged out",
        description: "See you soon!",
      });
      navigate("/auth");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out",
        variant: "destructive",
      });
    }
  };
  
  const isFaculty = role === 'faculty';

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary to-primary-dark text-primary-foreground p-6 elevation-3">
        <div className="max-w-screen-xl mx-auto text-center">
          <div className="w-24 h-24 mx-auto mb-4">
            <Avatar className="w-full h-full">
              <AvatarImage src={avatarImage} alt="User avatar" />
              <AvatarFallback>
                <User className="w-12 h-12" />
              </AvatarFallback>
            </Avatar>
          </div>
          <h1 className="text-2xl font-bold">My Profile</h1>
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-center gap-3 text-primary-foreground/90">
              <Mail className="w-4 h-4" />
              <span className="text-sm">{userEmail || 'Loading...'}</span>
            </div>
            {!isFaculty && (
              <div className="flex items-center justify-center gap-3 text-primary-foreground/90">
                <GraduationCap className="w-4 h-4" />
                <span className="text-sm">Student</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-screen-xl mx-auto px-4 py-6 space-y-6">
        {!isFaculty && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <Card className="p-4 text-center elevation-1">
                <div className="text-2xl font-bold text-primary">24</div>
                <div className="text-xs text-muted-foreground">Study Hours</div>
              </Card>
              <Card className="p-4 text-center elevation-1">
                <div className="text-2xl font-bold text-accent">12</div>
                <div className="text-xs text-muted-foreground">Approvals</div>
              </Card>
              <Card className="p-4 text-center elevation-1">
                <div className="text-2xl font-bold text-success">8</div>
                <div className="text-xs text-muted-foreground">Ideas</div>
              </Card>
            </div>

            {/* Student Twin History */}
            <Card className="p-5 elevation-2">
              <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Your Progress
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Study Consistency</span>
                  <span className="text-sm font-semibold text-foreground">92%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: "92%" }} />
                </div>

                <div className="flex items-center justify-between mt-4">
                  <span className="text-sm text-muted-foreground">Goals Achieved</span>
                  <span className="text-sm font-semibold text-foreground">15/20</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div className="bg-success h-2 rounded-full" style={{ width: "75%" }} />
                </div>
              </div>
            </Card>

            {/* Badges */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Award className="w-5 h-5 text-accent" />
                Achievements
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <Card className="p-4 text-center elevation-1">
                  <div className="w-12 h-12 bg-accent/10 rounded-full mx-auto mb-2 flex items-center justify-center">
                    <Award className="w-6 h-6 text-accent" />
                  </div>
                  <p className="text-xs font-medium">Early Bird</p>
                </Card>
                <Card className="p-4 text-center elevation-1">
                  <div className="w-12 h-12 bg-success/10 rounded-full mx-auto mb-2 flex items-center justify-center">
                    <Award className="w-6 h-6 text-success" />
                  </div>
                  <p className="text-xs font-medium">Consistent</p>
                </Card>
                <Card className="p-4 text-center elevation-1">
                  <div className="w-12 h-12 bg-primary/10 rounded-full mx-auto mb-2 flex items-center justify-center">
                    <Award className="w-6 h-6 text-primary" />
                  </div>
                  <p className="text-xs font-medium">Innovator</p>
                </Card>
              </div>
            </div>

            {/* Settings */}
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start" size="lg">
                <Settings className="mr-3 w-5 h-5" />
                Settings
              </Button>
            </div>
          </>
        )}
        
        {/* Logout button for all users */}
        <Button 
          variant="outline" 
          className="w-full justify-start text-destructive" 
          size="lg"
          onClick={handleLogout}
        >
          <LogOut className="mr-3 w-5 h-5" />
          Logout
        </Button>
      </div>

      <BottomNav />
    </div>
  );
};

export default Profile;
