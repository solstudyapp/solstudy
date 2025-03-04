
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Award, Gift, Share2, Trophy, Users } from "lucide-react";
import Header from "@/components/Header";
import { lessonData } from "@/data/lessons";

const Dashboard = () => {
  // This would come from your auth/user context
  const userData = {
    name: "Alex Johnson",
    points: 750,
    completedLessons: 3,
    completedQuizzes: 8,
    level: 5,
    nextLevelPoints: 1000,
    referrals: 2,
    rewards: [
      { id: 1, name: "First Quiz Completed", icon: <Award size={16} /> },
      { id: 2, name: "Blockchain Expert", icon: <Trophy size={16} /> },
      { id: 3, name: "Referral Champion", icon: <Users size={16} /> },
    ],
  };

  // Get in-progress lessons
  const inProgressLessons = lessonData
    .filter(lesson => lesson.progress && lesson.progress > 0 && lesson.progress < 100)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#9945FF] to-[#14F195]">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - User stats */}
          <div className="space-y-6">
            <Card className="backdrop-blur-md bg-white/10 border-0 text-white">
              <CardHeader className="pb-2">
                <CardTitle>Your Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-white/70">Total Points</p>
                    <p className="text-3xl font-bold">{userData.points}</p>
                  </div>
                  <Badge className="bg-[#14F195] text-[#1A1F2C] text-xs py-1">Level {userData.level}</Badge>
                </div>
                <div className="space-y-1 mb-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress to Level {userData.level + 1}</span>
                    <span>{userData.points}/{userData.nextLevelPoints}</span>
                  </div>
                  <Progress value={(userData.points / userData.nextLevelPoints) * 100} className="h-2 bg-white/20" />
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-md bg-white/10 border-0 text-white">
              <CardHeader className="pb-2">
                <CardTitle>Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3">
                  {userData.rewards.map((reward) => (
                    <div key={reward.id} className="flex items-center p-3 rounded-md bg-white/10">
                      <div className="mr-3 p-2 rounded-full bg-white/10">
                        {reward.icon}
                      </div>
                      <span>{reward.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Middle and right columns */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="backdrop-blur-md bg-white/10 border-0 text-white">
              <CardHeader>
                <CardTitle>In Progress</CardTitle>
                <CardDescription className="text-white/70">Continue where you left off</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {inProgressLessons.length > 0 ? (
                    inProgressLessons.map((lesson) => (
                      <div key={lesson.id} className="p-4 rounded-md bg-white/10 hover:bg-white/20 transition-colors cursor-pointer">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center">
                            <div className="p-2 rounded-md bg-white/10 mr-3">
                              {lesson.icon}
                            </div>
                            <div>
                              <h4 className="font-medium">{lesson.title}</h4>
                              <p className="text-sm text-white/70">Section {lesson.completedSections} of {lesson.sections}</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="border-white/20 text-white/70">
                            {lesson.category}
                          </Badge>
                        </div>
                        <Progress value={lesson.progress} className="h-1.5 bg-white/20" />
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-white/70">No lessons in progress</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-md bg-white/10 border-0 text-white overflow-hidden">
              <CardHeader>
                <CardTitle>Refer Friends, Earn Rewards</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <p className="mb-2">Share your unique link and both you and your friend will receive 50 points when they complete their first lesson.</p>
                  <div className="flex items-center">
                    <input
                      type="text"
                      value="https://solstudy.com/ref/alex123"
                      readOnly
                      className="flex-1 bg-white/10 border-0 rounded-l-md text-white h-10 px-3 focus-visible:ring-0"
                    />
                    <button className="h-10 px-4 rounded-r-md bg-[#9945FF] text-white flex items-center">
                      <Share2 size={16} className="mr-2" /> Copy
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 rounded-md bg-white/10">
                  <div className="flex items-center">
                    <div className="mr-3 p-2 rounded-full bg-[#9945FF]/30">
                      <Users size={20} />
                    </div>
                    <div>
                      <p className="font-medium">Successful Referrals</p>
                      <p className="text-sm text-white/70">{userData.referrals} friends joined</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{userData.referrals * 50} points</p>
                    <p className="text-sm text-white/70">earned from referrals</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
