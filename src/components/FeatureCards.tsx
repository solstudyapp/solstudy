import {
  BookOpen,
  ShieldCheck,
  MessageSquare,
  LineChart,
  BookText,
  Coins,
} from "lucide-react"

const FeatureCards = () => {
  const features = [
    {
      icon: <BookOpen className="h-10 w-10" />,
      title: "Structured Learning",
      description:
        "Progress through beginner, intermediate, and advanced lessons at your own pace.",
      gradient: "from-[#14F195] to-[#0EA5E9]", // Green to Blue
    },
    {
      icon: <ShieldCheck className="h-10 w-10" />,
      title: "Scam Protection",
      description:
        "Learn to identify and avoid common cryptocurrency scams and protect your assets.",
      gradient: "from-[#0EA5E9] to-[#9945FF]", // Blue to Purple
    },
    {
      icon: <MessageSquare className="h-10 w-10" />,
      title: "Provide Feedback",
      description:
        "Provide valuable feedback about course content and help SolStudy evolve for future users.",
      gradient: "from-[#9945FF] to-[#F97316]", // Purple to Orange
    },
    {
      icon: <LineChart className="h-10 w-10" />,
      title: "Track Progress",
      description:
        "Monitor your learning journey with a personalized dashboard and progress tracking.",
      gradient: "from-[#F97316] to-[#9945FF]", // Orange to Purple
    },
    {
      icon: <BookText className="h-10 w-10" />,
      title: "Interactive Quizzes",
      description:
        "Test your knowledge with interactive quizzes after each section and end of course test for immediate feedback.",
      gradient: "from-[#9945FF] to-[#14F195]", // Purple to Green
    },
    {
      icon: <Coins className="h-10 w-10" />,
      title: "Learn and Earn",
      description:
        "Earn rewards for learning and referring users to SolStudy. Rewards points converted to SocialFiLy tokens on TGE.",
      gradient: "from-[#14F195] to-[#0EA5E9]", // Green to Blue
    },
  ]

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
            {/* Gradient border/outline for the card */}
            <div
              className={`absolute inset-0 rounded-xl bg-gradient-to-r ${feature.gradient} opacity-70`}
            ></div>
            {/* Content background */}
            <div className="absolute inset-[1px] rounded-xl bg-background"></div>

            <div className="relative flex flex-col items-center text-center z-10">
              <div className="relative mb-4">
                <div
                  className={`absolute -inset-1 rounded-full bg-gradient-to-r ${feature.gradient} opacity-70 animate-spin-slow`}
                ></div>
                <div className="relative bg-background p-4 rounded-full z-10">
                  <div className="text-foreground">{feature.icon}</div>
                </div>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default FeatureCards
