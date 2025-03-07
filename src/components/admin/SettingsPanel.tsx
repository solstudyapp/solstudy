
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Save, RefreshCw, Database, LucideGlobe, Bell, Lock, Users, Paintbrush } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const SettingsPanel = () => {
  const [siteName, setSiteName] = useState("Crypto Academy");
  const [siteDescription, setSiteDescription] = useState("Learn blockchain and cryptocurrency");
  const [enableRegistration, setEnableRegistration] = useState(true);
  const [enableNotifications, setEnableNotifications] = useState(true);
  const [enableAutoSave, setEnableAutoSave] = useState(true);
  const [pageSize, setPageSize] = useState("10");
  
  const handleSaveSettings = () => {
    toast({
      title: "Settings Saved",
      description: "Your settings have been updated successfully.",
    });
  };
  
  return (
    <div className="space-y-6">
      <Card className="backdrop-blur-md bg-white/10 border-white/10 text-white">
        <CardHeader>
          <CardTitle>Admin Settings</CardTitle>
          <CardDescription className="text-white/70">
            Configure platform settings and preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="general">
            <TabsList className="bg-black/20 border-b border-white/10 w-full justify-start">
              <TabsTrigger value="general" className="data-[state=active]:bg-white/10">
                <LucideGlobe size={16} className="mr-2" />
                General
              </TabsTrigger>
              <TabsTrigger value="users" className="data-[state=active]:bg-white/10">
                <Users size={16} className="mr-2" />
                Users
              </TabsTrigger>
              <TabsTrigger value="appearance" className="data-[state=active]:bg-white/10">
                <Paintbrush size={16} className="mr-2" />
                Appearance
              </TabsTrigger>
              <TabsTrigger value="notifications" className="data-[state=active]:bg-white/10">
                <Bell size={16} className="mr-2" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="security" className="data-[state=active]:bg-white/10">
                <Lock size={16} className="mr-2" />
                Security
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="general" className="pt-6 space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="siteDescription">Site Description</Label>
                  <Input
                    id="siteDescription"
                    value={siteDescription}
                    onChange={(e) => setSiteDescription(e.target.value)}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="pageSize">Items Per Page</Label>
                  <Input
                    id="pageSize"
                    type="number"
                    min="5"
                    max="100"
                    value={pageSize}
                    onChange={(e) => setPageSize(e.target.value)}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
                
                <div className="flex items-center space-x-2 pt-6">
                  <Switch
                    id="autoSave"
                    checked={enableAutoSave}
                    onCheckedChange={setEnableAutoSave}
                  />
                  <Label htmlFor="autoSave">Enable Auto-Save</Label>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="users" className="pt-6 space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="enableRegistration"
                    checked={enableRegistration}
                    onCheckedChange={setEnableRegistration}
                  />
                  <Label htmlFor="enableRegistration">Allow User Registration</Label>
                </div>
                
                <div className="pt-2">
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                    <RefreshCw size={16} className="mr-2" />
                    Sync User Data
                  </Button>
                </div>
                
                <div className="pt-2">
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                    <Database size={16} className="mr-2" />
                    Export User Database
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="notifications" className="pt-6 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="enableNotifications"
                    checked={enableNotifications}
                    onCheckedChange={setEnableNotifications}
                  />
                  <Label htmlFor="enableNotifications">Enable System Notifications</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="emailNotifications"
                    checked={true}
                  />
                  <Label htmlFor="emailNotifications">Email Notifications</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="achievementNotifications"
                    checked={true}
                  />
                  <Label htmlFor="achievementNotifications">Achievement Notifications</Label>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="appearance" className="pt-6">
              <div className="text-white/70">
                Appearance settings coming soon
              </div>
            </TabsContent>
            
            <TabsContent value="security" className="pt-6">
              <div className="text-white/70">
                Security settings coming soon
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-end mt-8 pt-4 border-t border-white/10">
            <Button 
              onClick={handleSaveSettings}
              className="bg-[#14F195] text-[#1A1F2C] hover:bg-[#14F195]/90"
            >
              <Save size={16} className="mr-2" />
              Save Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPanel;
