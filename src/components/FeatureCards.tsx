
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
      gradient: "from-[#14F195] to-[#0EA5E9]" // Green to Blue
    },
    {
      icon: <ShieldCheck className="h-10 w-10" />,
      title: "Scam Protection",
      description: "Learn to identify and avoid common cryptocurrency scams and protect your assets.",
      gradient: "from-[#0EA5E9] to-[#9945FF]" // Blue to Purple
    },
    {
      icon: <MessageSquare className="h-10 w-10" />,
      title: "Provide Feedback",
      description: "Provide valuable feedback about course content and help SolStudy evolve for future users.",
      gradient: "from-[#9945FF] to-[#F97316]" // Purple to Orange
    },
    {
      icon: <LineChart className="h-10 w-10" />,
      title: "Track Progress",
      description: "Monitor your learning journey with a personalized dashboard and progress tracking.",
      gradient: "from-[#F97316] to-[#9945FF]" // Orange to Purple
    },
    {
      icon: <BookText className="h-10 w-10" />,
      title: "Interactive Quizzes",
      description: "Test your knowledge with interactive quizzes and get immediate feedback.",
      gradient: "from-[#9945FF] to-[#14F195]" // Purple to Green
    },
    {
      icon: <Users className="h-10 w-10" />,
      title: "Community Learning",
      description: "Join a community of crypto enthusiasts and learn together through shared experiences.",
      gradient: "from-[#14F195] to-[#0EA5E9]" // Green to Blue
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
            className="relative rounded-xl p-6 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg"
          >
            {/* Gradient border container */}
            <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${feature.gradient} opacity-60 animate-spin-slow-4s`}></div>
            {/* Card content */}
            <div className="relative bg-black/80 rounded-xl p-6 z-10">
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-4">
                  <div className={`absolute -inset-1 rounded-full bg-gradient-to-r ${feature.gradient} opacity-70 animate-spin-slow-4s`}></div>
                  <div className="relative bg-black p-4 rounded-full z-10">
                    <div className="text-white">{feature.icon}</div>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-white/80">{feature.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeatureCards;
