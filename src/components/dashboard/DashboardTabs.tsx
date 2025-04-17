
import { useState, useEffect } from "react";
import { Home, Users, BookOpen, Settings } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";

interface DashboardTabsProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
}

export function DashboardTabs({ activeTab, setActiveTab }: DashboardTabsProps) {
  const isMobile = useIsMobile();

  return (
    <div className={`${isMobile ? "fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background pb-2 pt-2" : "mb-8"}`}>
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className={`w-full ${isMobile ? "px-2" : ""}`}
      >
        <TabsList className={`w-full ${isMobile ? "grid grid-cols-4 gap-1" : "justify-start rounded-lg p-1 bg-muted/10 border-b border-border"}`}>
          <TabsTrigger 
            value="overview" 
            className={`rounded-md data-[state=active]:bg-muted/20 data-[state=active]:text-foreground text-muted-foreground ${isMobile ? "flex flex-col items-center justify-center py-2" : ""}`}
          >
            <Home className={`${isMobile ? "h-5 w-5 mb-1" : "mr-2 h-4 w-4"}`} />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger 
            value="referrals" 
            className={`rounded-md data-[state=active]:bg-muted/20 data-[state=active]:text-foreground text-muted-foreground ${isMobile ? "flex flex-col items-center justify-center py-2" : ""}`}
          >
            <Users className={`${isMobile ? "h-5 w-5 mb-1" : "mr-2 h-4 w-4"}`} />
            <span>Referrals</span>
          </TabsTrigger>
          <TabsTrigger 
            value="courses" 
            className={`rounded-md data-[state=active]:bg-muted/20 data-[state=active]:text-foreground text-muted-foreground ${isMobile ? "flex flex-col items-center justify-center py-2" : ""}`}
          >
            <BookOpen className={`${isMobile ? "h-5 w-5 mb-1" : "mr-2 h-4 w-4"}`} />
            <span>Courses</span>
          </TabsTrigger>
          <TabsTrigger 
            value="settings" 
            className={`rounded-md data-[state=active]:bg-muted/20 data-[state=active]:text-foreground text-muted-foreground ${isMobile ? "flex flex-col items-center justify-center py-2" : ""}`}
          >
            <Settings className={`${isMobile ? "h-5 w-5 mb-1" : "mr-2 h-4 w-4"}`} />
            <span>Settings</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
