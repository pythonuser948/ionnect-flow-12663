import { useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Calendar, FileText, Rocket, Briefcase } from "lucide-react";
import ionConnectAvatar from "@/assets/ionconnect-avatar.png";

const Chat = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "assistant",
      content: "Hi Alex! I've reviewed your schedule. Today's main focus is recursion practice. Ready to start?",
      timestamp: "10:30 AM",
    },
  ]);

  const quickActions = [
    { icon: Calendar, label: "Plan", color: "bg-primary" },
    { icon: Rocket, label: "Launchpad", color: "bg-accent" },
    { icon: FileText, label: "Proof", color: "bg-success" },
    { icon: Briefcase, label: "Career", color: "bg-warning" },
  ];

  const handleSend = () => {
    if (!message.trim()) return;
    
    setMessages([
      ...messages,
      {
        id: messages.length + 1,
        role: "user",
        content: message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setMessage("");
    
    // Simulate response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          role: "assistant",
          content: "I understand. Let me help you with that!",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border p-4 elevation-1">
        <div className="max-w-screen-xl mx-auto flex items-center gap-3">
          <img src={ionConnectAvatar} alt="IONCONNECT" className="w-10 h-10 rounded-full" />
          <div>
            <h1 className="font-semibold text-foreground">IONCONNECT</h1>
            <p className="text-xs text-success">● Online</p>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 pb-32">
        <div className="max-w-screen-xl mx-auto">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 mb-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              {msg.role === "assistant" && (
                <img src={ionConnectAvatar} alt="IONCONNECT" className="w-8 h-8 rounded-full flex-shrink-0" />
              )}
              <div className={`flex flex-col ${msg.role === "user" ? "items-end" : ""}`}>
                <Card
                  className={`p-3 max-w-[280px] ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-card"
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                </Card>
                <span className="text-xs text-muted-foreground mt-1">{msg.timestamp}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="border-t border-border bg-card px-4 py-3">
        <div className="max-w-screen-xl mx-auto">
          <div className="flex gap-2 mb-3 overflow-x-auto">
            {quickActions.map(({ icon: Icon, label, color }) => (
              <Button key={label} variant="outline" size="sm" className="flex-shrink-0">
                <div className={`w-4 h-4 rounded ${color} flex items-center justify-center mr-2`}>
                  <Icon className="w-3 h-3 text-white" />
                </div>
                {label}
              </Button>
            ))}
          </div>

          {/* Input */}
          <div className="flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask IONCONNECT anything..."
              className="flex-1"
            />
            <Button size="icon" onClick={handleSend}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Chat;
