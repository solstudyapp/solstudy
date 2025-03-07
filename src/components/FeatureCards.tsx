
import {
  BookOpen,
  ShieldCheck,
  MessageSquare,
  LineChart,
  BookText,
  Users
} from "lucide-react";

const FeatureCards = () => {
  const features = [
    {
      icon: <BookOpen className="h-10 w-10" />,
      title: "Structured Learning",
      description: "Progress through beginner, intermediate, and advanced lessons at your own pace.",
      color: "from-green-400/10 to-emerald-500/20" // Beginner color scheme
    },
    {
      icon: <ShieldCheck className="h-10 w-10" />,
      title: "Scam Protection",
      description: "Learn to identify and avoid common cryptocurrency scams and protect your assets.",
      color: "from-blue-400/10 to-purple-500/20" // Intermediate color scheme
    },
    {
      icon: <MessageSquare className="h-10 w-10" />,
      title: "Provide Feedback",
      description: "Provide valuable feedback about course content and help SolStudy evolve for future users.",
      color: "from-green-400/10 to-emerald-500/20" // Changed to Beginner color scheme (green)
    },
    {
      icon: <LineChart className="h-10 w-10" />,
      title: "Track Progress",
      description: "Monitor your learning journey with a personalized dashboard and progress tracking.",
      color: "from-blue-400/10 to-purple-500/20" // Intermediate color scheme
    },
    {
      icon: <BookText className="h-10 w-10" />,
      title: "Interactive Quizzes",
      description: "Test your knowledge with interactive quizzes and get immediate feedback.",
      color: "from-green-400/10 to-emerald-500/20" // Beginner color scheme
    },
    {
      icon: <Users className="h-10 w-10" />,
      title: "Community Learning",
      description: "Join a community of crypto enthusiasts and learn together through shared experiences.",
      color: "from-blue-400/10 to-purple-500/20" // Changed to Intermediate color scheme (blue/purple)
    }
  ];

  return (
    <div className="mb-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <div 
            key={index} 
            className={`dark-glass rounded-xl p-6 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg bg-gradient-to-br ${feature.color}`}
          >
            <div className="flex flex-col items-center text-center">
              <div className="bg-gradient-to-r from-[#9945FF]/20 to-[#14F195]/20 p-4 rounded-full mb-4">
                <div className="text-white">{feature.icon}</div>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-white/80">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeatureCards;
