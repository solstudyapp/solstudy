
import { format, subDays } from "date-fns";

// Function to generate dates for the last 30 days
export const generateDateData = () => {
  const data = [];
  const today = new Date();
  
  // Generate data for the last 30 days
  for (let i = 30; i >= 0; i -= 5) {
    const date = subDays(today, i);
    const formattedDate = format(date, "MMM d");
    
    data.push({
      date: formattedDate,
      day: i === 0 ? "Today" : `${i}d ago`,
      users: Math.floor(Math.random() * 15) + 3, // Random data between 3-18
      lessons: Math.floor(Math.random() * 30) + 10, // Random data between 10-40
      points: Math.floor(Math.random() * 800) + 150, // Random data between 150-950
    });
  }
  
  return data;
};

// Mock data for dashboard stats
export const mockStats = {
  totalUsers: 126,
  activeUsers: 89,
  totalLessons: 24,
  completedLessons: 187,
  totalPointsEarned: 15750,
  lastMonthPointsEarned: 4250,
  userGrowth: 12,
  lessonCompletionGrowth: 8,
  pointsGrowth: 15,
};
