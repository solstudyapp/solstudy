
import { useState, useEffect } from "react";
import { 
  Settings, 
  Bell, 
  Moon, 
  Sun, 
  Monitor, 
  EyeOff, 
  Mail,
  Globe,
  Clock,
  Activity,
  MessageSquare
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { useToast } from "@/hooks/use-toast";
import { secureLocalStore, secureLocalRetrieve } from "@/services/securityService";

interface NotificationSettings {
  email: boolean;
  activity: boolean;
  updates: boolean;
  marketing: boolean;
}

interface DashboardSettings {
  theme: "dark" | "light" | "system";
  notifications: NotificationSettings;
}

const DEFAULT_SETTINGS: DashboardSettings = {
  theme: "system",
  notifications: {
    email: true,
    activity: true,
    updates: true,
    marketing: false
  }
};

export function SettingsTab() {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [settings, setSettings] = useState<DashboardSettings>(DEFAULT_SETTINGS);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Load settings from secure storage
    const savedSettings = secureLocalRetrieve("dashboardSettings");
    if (savedSettings) {
      setSettings(savedSettings);
    } else {
      // Initialize with current theme as default
      setSettings({
        ...DEFAULT_SETTINGS,
        theme: theme as "dark" | "light" | "system"
      });
    }
  }, [theme]);

  const handleThemeChange = (newTheme: "dark" | "light" | "system") => {
    setTheme(newTheme);
    setSettings({
      ...settings,
      theme: newTheme
    });
  };

  const handleNotificationToggle = (key: keyof NotificationSettings) => {
    setSettings({
      ...settings,
      notifications: {
        ...settings.notifications,
        [key]: !settings.notifications[key]
      }
    });
  };

  const saveSettings = () => {
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      // Save to secure local storage
      secureLocalStore("dashboardSettings", settings, 60 * 24 * 365); // Store for a year
      
      toast({
        title: "Settings saved",
        description: "Your dashboard preferences have been updated."
      });
      
      setIsSaving(false);
    }, 600);
  };

  return (
    <div className="space-y-6">
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="mr-2 h-5 w-5 text-[#14F195]" />
            Theme Settings
          </CardTitle>
          <CardDescription>
            Customize how your dashboard looks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              className={`p-4 rounded-lg border cursor-pointer transition hover:border-[#14F195] hover:bg-muted/5 ${
                settings.theme === "light" ? "border-[#14F195] bg-muted/10" : "border-border"
              }`}
              onClick={() => handleThemeChange("light")}
            >
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 bg-gradient-to-br from-[#0EA5E9] to-[#6366F1] rounded-full">
                  <Sun className="h-6 w-6 text-white" />
                </div>
              </div>
              <h3 className="text-lg font-medium text-center">Light Mode</h3>
              <p className="text-sm text-muted-foreground text-center mt-1">
                Bright theme with light colors
              </p>
            </div>
            
            <div
              className={`p-4 rounded-lg border cursor-pointer transition hover:border-[#14F195] hover:bg-muted/5 ${
                settings.theme === "dark" ? "border-[#14F195] bg-muted/10" : "border-border"
              }`}
              onClick={() => handleThemeChange("dark")}
            >
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 bg-gradient-to-br from-[#8B5CF6] to-[#D946EF] rounded-full">
                  <Moon className="h-6 w-6 text-white" />
                </div>
              </div>
              <h3 className="text-lg font-medium text-center">Dark Mode</h3>
              <p className="text-sm text-muted-foreground text-center mt-1">
                Dark theme with reduced brightness
              </p>
            </div>
            
            <div
              className={`p-4 rounded-lg border cursor-pointer transition hover:border-[#14F195] hover:bg-muted/5 ${
                settings.theme === "system" ? "border-[#14F195] bg-muted/10" : "border-border"
              }`}
              onClick={() => handleThemeChange("system")}
            >
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 bg-gradient-to-br from-[#F97316] to-[#FBBF24] rounded-full">
                  <Monitor className="h-6 w-6 text-white" />
                </div>
              </div>
              <h3 className="text-lg font-medium text-center">System Default</h3>
              <p className="text-sm text-muted-foreground text-center mt-1">
                Follow your system preferences
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="mr-2 h-5 w-5 text-[#14F195]" />
            Notification Settings
          </CardTitle>
          <CardDescription>
            Control what notifications you receive
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center">
                  <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="text-base font-medium">Email Notifications</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Receive notifications about your account by email
                </p>
              </div>
              <Switch 
                checked={settings.notifications.email}
                onCheckedChange={() => handleNotificationToggle("email")}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center">
                  <Activity className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="text-base font-medium">Activity Feed</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  See activity from other users in your dashboard
                </p>
              </div>
              <Switch 
                checked={settings.notifications.activity}
                onCheckedChange={() => handleNotificationToggle("activity")}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center">
                  <Globe className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="text-base font-medium">Product Updates</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Receive notifications about new features and updates
                </p>
              </div>
              <Switch 
                checked={settings.notifications.updates}
                onCheckedChange={() => handleNotificationToggle("updates")}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center">
                  <MessageSquare className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="text-base font-medium">Marketing Messages</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Receive marketing and promotional messages
                </p>
              </div>
              <Switch 
                checked={settings.notifications.marketing}
                onCheckedChange={() => handleNotificationToggle("marketing")}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button 
          variant="gradient" 
          size="lg" 
          onClick={saveSettings} 
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <Clock className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Settings'
          )}
        </Button>
      </div>
    </div>
  );
}
