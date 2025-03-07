
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Facebook, Instagram, Linkedin, X, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { lessonData } from "@/data/lessons";
import { LessonType } from "@/types/lesson";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [bonusLesson, setBonusLesson] = useState<LessonType | null>(null);

  useEffect(() => {
    // Find the lesson marked as bonusLesson
    const lessonOfTheDay = lessonData.find(lesson => lesson.bonusLesson === true);
    
    // If no lesson is marked as bonus, default to the first lesson
    setBonusLesson(lessonOfTheDay || lessonData[0]);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log("Submitted email:", email);
    setEmail("");
  };

  const socialLinks = [
    { icon: <Facebook size={32} />, url: "https://facebook.com", label: "Facebook" },
    { icon: <Instagram size={32} />, url: "https://instagram.com", label: "Instagram" },
    { icon: <Linkedin size={32} />, url: "https://linkedin.com", label: "LinkedIn" },
    { icon: <X size={32} />, url: "https://x.com", label: "X" }
  ];

  return (
    <footer className="border-t border-white/10 bg-black/80 backdrop-blur-lg mt-16">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Column 1: Subscription Form */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-white">Become an Educator</h3>
            <p className="text-white/70 mb-4">
              Join our platform as a course creator or sponsor and reach thousands of crypto enthusiasts.
            </p>
            <form onSubmit={handleSubmit} className="space-y-3">
              <Input
                type="email"
                placeholder="Your email address"
                className="bg-white/10 border-white/20 text-white"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:opacity-90 text-white"
              >
                Get Started
              </Button>
            </form>
          </div>

          {/* Column 2: Social Media Links */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-white">Connect With Us</h3>
            <div className="grid grid-cols-2 gap-4">
              {socialLinks.map((social, index) => (
                <a 
                  key={index} 
                  href={social.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
                  aria-label={social.label}
                >
                  {social.icon}
                  <span>{social.label}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Column 3: Bonus Lesson */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-white">Bonus Lesson of the Day</h3>
            {bonusLesson && (
              <div className="dark-glass rounded-lg p-4 bg-gradient-to-br from-[#9945FF]/10 to-[#14F195]/10">
                <div className="flex items-center gap-3 mb-3">
                  <Sparkles className="text-[#14F195]" size={24} />
                  <h4 className="text-lg font-medium text-white">{bonusLesson.title}</h4>
                </div>
                <p className="text-white/70 mb-4">{bonusLesson.description.substring(0, 100)}...</p>
                <div className="flex justify-between items-center">
                  <span className="text-white/70 text-sm">10 mins • +{bonusLesson.points} points</span>
                  <Link to={`/lesson/${bonusLesson.id}`}>
                    <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                      Start Now
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-12 pt-6 border-t border-white/10 text-center text-white/50 text-sm">
          © {new Date().getFullYear()} SolStudy. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
