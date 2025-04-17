
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { DashboardTabs } from "@/components/dashboard/DashboardTabs";
import { OverviewTab } from "@/components/dashboard/OverviewTab";
import { ReferralsTab } from "@/components/dashboard/ReferralsTab";
import { CoursesTab } from "@/components/dashboard/CoursesTab";
import { SettingsTab } from "@/components/dashboard/SettingsTab";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

const Dashboard = () => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        // Simulate loading of dashboard data
        setTimeout(() => {
          setLoading(false);
        }, 800);
      } catch (error) {
        console.error("Error initializing dashboard:", error);
        toast({
          title: "Error loading dashboard",
          description:
            "There was a problem loading your dashboard data. Please try again later.",
          variant: "destructive",
        });
      }
    };

    initializeDashboard();
  }, [toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#14F195] mx-auto mb-4" />
          <p className="text-foreground text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewTab />;
      case "referrals":
        return <ReferralsTab />;
      case "courses":
        return <CoursesTab />;
      case "settings":
        return <SettingsTab />;
      default:
        return <OverviewTab />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8 pb-24">
        <h1 className="text-3xl font-bold text-foreground mb-6">
          Your Dashboard
        </h1>

        <DashboardTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        
        {renderActiveTabContent()}
      </div>
    </div>
  );
};

export default Dashboard;
