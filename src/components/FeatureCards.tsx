
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
      color: "from-[#9945FF]/20 to-[#14F195]/20" // Purple to green
    },
    {
      icon: <ShieldCheck className="h-10 w-10" />,
      title: "Scam Protection",
      description: "Learn to identify and avoid common cryptocurrency scams and protect your assets.",
      color: "from-[#14F195]/20 to-[#0EA5E9]/20" // Green to blue
    },
    {
      icon: <MessageSquare className="h-10 w-10" />,
      title: "Provide Feedback",
      description: "Provide valuable feedback about course content and help SolStudy evolve for future users.",
      color: "from-[#0EA5E9]/20 to-[#9945FF]/20" // Blue to purple
    },
    {
      icon: <LineChart className="h-10 w-10" />,
      title: "Track Progress",
      description: "Monitor your learning journey with a personalized dashboard and progress tracking.",
      color: "from-[#9945FF]/20 to-[#14F195]/20" // Purple to green
    },
    {
      icon: <BookText className="h-10 w-10" />,
      title: "Interactive Quizzes",
      description: "Test your knowledge with interactive quizzes and get immediate feedback.",
      color: "from-[#14F195]/20 to-[#0EA5E9]/20" // Green to blue
    },
    {
      icon: <Users className="h-10 w-10" />,
      title: "Community Learning",
      description: "Join a community of crypto enthusiasts and learn together through shared experiences.",
      color: "from-[#0EA5E9]/20 to-[#9945FF]/20" // Blue to purple
    }
  ];

  return (
    <div className="mb-12">
      <h2 className="text-3xl font-bold mb-6 text-center">
        <span className="bg-gradient-to-r from-[#9945FF] to-[#14F195] bg-clip-text text-transparent">
          Benefits of SolStudy
        </span>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <div 
            key={index} 
            className="dark-glass rounded-xl p-6 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg bg-gradient-to-br from-black/40 to-black/40"
          >
            <div className="flex flex-col items-center text-center">
              <div className={`bg-gradient-to-r ${feature.color} p-4 rounded-full mb-4`}>
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
