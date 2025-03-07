
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  ChevronLeft, 
  ChevronRight,
  BookOpen,
  CheckCircle,
  Trophy
} from "lucide-react";
import Header from "@/components/Header";
import { DifficultyBadge } from "@/components/DifficultyBadge";
import { lessonData } from "@/data/lessons";
import { toast } from "@/hooks/use-toast";

const LessonView = () => {
  const { lessonId } = useParams();
  const [currentSection, setCurrentSection] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [progress, setProgress] = useState(0);
  const [completedSections, setCompletedSections] = useState<string[]>([]);
  
  // Find the lesson based on the URL param
  const lesson = lessonData.find(l => l.id === lessonId);
  
  // Mock sections data - in real app, this would come from an API
  const sections = [
    {
      id: "section1",
      title: "Getting Started",
      pages: [
        { id: "page1", title: "Introduction", content: "<h1>Welcome to this lesson!</h1><p>In this section, you'll learn the basics of cryptocurrency and blockchain technology.</p>" },
        { id: "page2", title: "What is Blockchain?", content: "<h1>Blockchain Technology</h1><p>Blockchain is a distributed ledger technology that enables secure, transparent, and immutable record-keeping without central authority.</p>" },
        { id: "page3", title: "Key Concepts", content: "<h1>Key Blockchain Concepts</h1><p>Let's explore decentralization, consensus mechanisms, and cryptographic security - the foundations of blockchain technology.</p>" },
        { id: "page4", title: "History of Blockchain", content: "<h1>A Brief History</h1><p>From Bitcoin's creation in 2009 to the modern blockchain ecosystem - understanding how we got here helps predict where we're going.</p>" },
      ],
      quiz: { id: "section1-quiz" }
    },
    {
      id: "section2",
      title: "Core Components",
      pages: [
        { id: "page5", title: "Cryptography Basics", content: "<h1>Cryptography in Blockchain</h1><p>Public/private keys, hash functions, and digital signatures are the building blocks of blockchain security.</p>" },
        { id: "page6", title: "Consensus Mechanisms", content: "<h1>How Blockchains Agree</h1><p>Proof of Work, Proof of Stake, and other mechanisms ensure that all participants can trust the blockchain's state.</p>" },
        { id: "page7", title: "Transactions & Blocks", content: "<h1>The Anatomy of Blockchain</h1><p>Understanding how transactions are created, validated, and permanently recorded in blocks.</p>" },
        { id: "page8", title: "Smart Contracts", content: "<h1>Self-Executing Agreements</h1><p>Smart contracts are programs stored on the blockchain that run when predetermined conditions are met.</p>" },
      ],
      quiz: { id: "section2-quiz" }
    },
    {
      id: "section3",
      title: "Applications & Future",
      pages: [
        { id: "page9", title: "DeFi Overview", content: "<h1>Decentralized Finance</h1><p>DeFi aims to recreate and improve traditional financial systems using blockchain technology.</p>" },
        { id: "page10", title: "NFTs Explained", content: "<h1>Non-Fungible Tokens</h1><p>NFTs represent unique digital assets, enabling new forms of digital ownership and creator economies.</p>" },
        { id: "page11", title: "DAOs & Governance", content: "<h1>Decentralized Autonomous Organizations</h1><p>DAOs enable community governance of blockchain protocols and projects through token voting.</p>" },
        { id: "page12", title: "Future Trends", content: "<h1>Where Blockchain Is Heading</h1><p>Scalability solutions, institutional adoption, and emerging use cases are shaping the future of blockchain.</p>" },
      ],
      quiz: { id: "section3-quiz" }
    }
  ];
  
  // Check if all sections are completed to enable the final test
  const allSectionsCompleted = sections.length === completedSections.length;
  
  useEffect(() => {
    if (!lesson) return;
    
    // Load completed sections from localStorage
    const savedProgress = localStorage.getItem(`lesson_progress_${lessonId}`);
    if (savedProgress) {
      const parsedProgress = JSON.parse(savedProgress);
      setCompletedSections(parsedProgress.completedSections || []);
      
      // If there's a currentSection and currentPage in localStorage, use those
      if (parsedProgress.currentSection !== undefined) {
        setCurrentSection(parsedProgress.currentSection);
      }
      if (parsedProgress.currentPage !== undefined) {
        setCurrentPage(parsedProgress.currentPage);
      }
    }
  }, [lessonId, lesson]);
  
  // Calculate progress in a separate useEffect to avoid infinite loop
  useEffect(() => {
    if (!sections) return;
    
    const totalPages = sections.reduce((acc, section) => acc + section.pages.length, 0);
    const pagesCompleted = sections.slice(0, currentSection).reduce((acc, section) => acc + section.pages.length, 0) + currentPage;
    setProgress(Math.round((pagesCompleted / totalPages) * 100));
  }, [currentSection, currentPage, sections]);
  
  // Save progress to localStorage
  const saveProgress = () => {
    if (!lessonId) return;
    
    localStorage.setItem(`lesson_progress_${lessonId}`, JSON.stringify({
      currentSection,
      currentPage,
      completedSections
    }));
  };
  
  useEffect(() => {
    saveProgress();
  }, [currentSection, currentPage, completedSections]);
  
  if (!lesson) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#9945FF] to-[#14F195]">
        <Header />
        <div className="max-w-3xl mx-auto px-4 py-16 text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Lesson not found</h1>
          <p className="mb-6">The lesson you're looking for doesn't exist or has been removed.</p>
          <Button asChild>
            <Link to="/">Back to Courses</Link>
          </Button>
        </div>
      </div>
    );
  }

  const currentSectionData = sections[currentSection];
  const currentPageData = currentSectionData.pages[currentPage];
  
  const navigateNext = () => {
    // If there are more pages in the current section
    if (currentPage < currentSectionData.pages.length - 1) {
      setCurrentPage(currentPage + 1);
    } 
    // If we're at the last page of the current section
    else if (currentPage === currentSectionData.pages.length - 1) {
      toast({
        title: "Section completed!",
        description: "You've completed this section. Time for the quiz!",
      });
    }
  };
  
  const navigatePrev = () => {
    // If there are previous pages in the current section
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    } 
    // If there are previous sections
    else if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
      setCurrentPage(sections[currentSection - 1].pages.length - 1);
    }
  };
  
  const isFirstPage = currentSection === 0 && currentPage === 0;
  const isLastPage = currentSection === sections.length - 1 && currentPage === currentSectionData.pages.length - 1;
  const isLastPageOfSection = currentPage === currentSectionData.pages.length - 1;
  const isSectionCompleted = completedSections.includes(currentSectionData.id);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#9945FF] to-[#14F195]">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Lesson Header */}
        <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <div className="flex items-center mb-2">
              <Button 
                variant="ghost" 
                size="sm" 
                asChild 
                className="text-white/80 hover:text-white p-0 h-auto font-normal"
              >
                <Link to="/">
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Back to Courses
                </Link>
              </Button>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">{lesson.title}</h1>
            <div className="flex items-center mt-2">
              <DifficultyBadge difficulty={lesson.difficulty} />
              <span className="text-white/70 text-sm ml-3">{sections.length} sections • {sections.reduce((acc, section) => acc + section.pages.length, 0)} pages</span>
            </div>
          </div>
          
          <div className="mt-4 md:mt-0">
            <div className="flex items-center mb-1">
              <span className="text-white text-sm mr-2">Progress</span>
              <span className="text-white text-sm font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="w-32 md:w-40 h-2 bg-white/20" />
          </div>
        </div>
        
        {/* Lesson Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="hidden md:block">
            <div className="backdrop-blur-md bg-white/10 border border-white/10 rounded-lg p-4 sticky top-24">
              <h3 className="text-lg font-medium text-white mb-4">Lesson Contents</h3>
              <div className="space-y-4">
                {sections.map((section, sectionIndex) => (
                  <div key={section.id}>
                    <div className="flex items-center mb-2">
                      {completedSections.includes(section.id) ? (
                        <CheckCircle className="h-4 w-4 text-[#14F195] mr-2" />
                      ) : sectionIndex === currentSection ? (
                        <BookOpen className="h-4 w-4 text-white mr-2" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border border-white/40 mr-2"></div>
                      )}
                      <span className="text-white font-medium">{section.title}</span>
                    </div>
                    <div className="ml-6 space-y-1">
                      {section.pages.map((page, pageIndex) => (
                        <button
                          key={page.id}
                          className={`text-sm w-full text-left py-1 px-2 rounded ${
                            sectionIndex === currentSection && pageIndex === currentPage
                              ? "bg-white/20 text-white"
                              : sectionIndex < currentSection || (sectionIndex === currentSection && pageIndex < currentPage)
                              ? "text-white/70 hover:text-white hover:bg-white/10"
                              : "text-white/50"
                          }`}
                          onClick={() => {
                            // Only allow navigating to completed pages or the current one
                            if (
                              sectionIndex < currentSection ||
                              (sectionIndex === currentSection && pageIndex <= currentPage) ||
                              completedSections.includes(section.id)
                            ) {
                              setCurrentSection(sectionIndex);
                              setCurrentPage(pageIndex);
                            }
                          }}
                        >
                          {page.title}
                        </button>
                      ))}
                      
                      {/* Quiz link for the section */}
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className={`text-sm w-full text-left py-1 px-2 rounded flex items-center ${
                          completedSections.includes(section.id)
                            ? "text-[#14F195]"
                            : isLastPageOfSection && sectionIndex === currentSection
                            ? "text-white hover:bg-white/10"
                            : "text-white/50"
                        }`}
                        disabled={!completedSections.includes(section.id) && !(isLastPageOfSection && sectionIndex === currentSection)}
                      >
                        <Link to={`/quiz/${section.quiz.id}?type=section&sectionId=${section.id}`}>
                          <Trophy className="h-3 w-3 mr-1" />
                          Section Quiz
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
                
                {/* Final Test Link */}
                {allSectionsCompleted && (
                  <div className="mt-6 pt-4 border-t border-white/10">
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
                    >
                      <Link to={`/quiz/${lessonId}-test?type=final`}>
                        <Trophy className="h-4 w-4 mr-2 text-[#14F195]" />
                        Take Final Test
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="md:col-span-3">
            <div className="backdrop-blur-md bg-white/10 border border-white/10 rounded-lg p-6 md:p-8">
              {/* If this is a sponsored lesson, show sponsor */}
              {lesson.sponsored && (
                <div className="mb-6 p-3 bg-white/10 rounded-md flex items-center justify-between">
                  <div className="text-white/70 text-sm">This lesson is sponsored by</div>
                  <div className="font-medium text-white">Sponsor Name</div>
                </div>
              )}
              
              <div 
                className="prose prose-invert max-w-none mb-8"
                dangerouslySetInnerHTML={{ __html: currentPageData.content }}
              />
              
              {/* Navigation buttons */}
              <div className="flex justify-between pt-4 border-t border-white/10">
                <Button
                  variant="outline"
                  onClick={navigatePrev}
                  disabled={isFirstPage}
                  className={`border-white/20 text-white hover:bg-white/10 hover:text-white ${
                    isFirstPage ? "invisible" : ""
                  }`}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Previous Page
                </Button>
                
                {isLastPageOfSection ? (
                  <Button 
                    className="bg-[#14F195] text-[#1A1F2C] hover:bg-[#14F195]/90"
                    asChild
                  >
                    <Link to={`/quiz/${currentSectionData.quiz.id}?type=section&sectionId=${currentSectionData.id}`}>
                      Take Section Quiz
                      <Trophy className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                ) : (
                  <Button
                    onClick={navigateNext}
                    className="bg-[#9945FF] hover:bg-[#9945FF]/90 text-white"
                  >
                    Next Page
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonView;
