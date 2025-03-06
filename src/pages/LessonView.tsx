
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { lessonData } from "@/data/lessons";
import { toast } from "@/hooks/use-toast";
import { lessonService } from "@/services/lessonService";
import LessonSidebar from "@/components/lesson/LessonSidebar";
import LessonHeader from "@/components/lesson/LessonHeader";
import LessonContent from "@/components/lesson/LessonContent";
import { Button } from "@/components/ui/button";

const LessonView = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const [currentSection, setCurrentSection] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [progress, setProgress] = useState(0);
  
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
      ]
    },
    {
      id: "section2",
      title: "Core Components",
      pages: [
        { id: "page5", title: "Cryptography Basics", content: "<h1>Cryptography in Blockchain</h1><p>Public/private keys, hash functions, and digital signatures are the building blocks of blockchain security.</p>" },
        { id: "page6", title: "Consensus Mechanisms", content: "<h1>How Blockchains Agree</h1><p>Proof of Work, Proof of Stake, and other mechanisms ensure that all participants can trust the blockchain's state.</p>" },
        { id: "page7", title: "Transactions & Blocks", content: "<h1>The Anatomy of Blockchain</h1><p>Understanding how transactions are created, validated, and permanently recorded in blocks.</p>" },
        { id: "page8", title: "Smart Contracts", content: "<h1>Self-Executing Agreements</h1><p>Smart contracts are programs stored on the blockchain that run when predetermined conditions are met.</p>" },
      ]
    },
    {
      id: "section3",
      title: "Applications & Future",
      pages: [
        { id: "page9", title: "DeFi Overview", content: "<h1>Decentralized Finance</h1><p>DeFi aims to recreate and improve traditional financial systems using blockchain technology.</p>" },
        { id: "page10", title: "NFTs Explained", content: "<h1>Non-Fungible Tokens</h1><p>NFTs represent unique digital assets, enabling new forms of digital ownership and creator economies.</p>" },
        { id: "page11", title: "DAOs & Governance", content: "<h1>Decentralized Autonomous Organizations</h1><p>DAOs enable community governance of blockchain protocols and projects through token voting.</p>" },
        { id: "page12", title: "Future Trends", content: "<h1>Where Blockchain Is Heading</h1><p>Scalability solutions, institutional adoption, and emerging use cases are shaping the future of blockchain.</p>" },
      ]
    }
  ];
  
  useEffect(() => {
    if (!lesson) return;
    
    // Calculate progress based on current position
    const totalPages = sections.reduce((acc, section) => acc + section.pages.length, 0);
    const pagesCompleted = sections.slice(0, currentSection).reduce((acc, section) => acc + section.pages.length, 0) + currentPage;
    setProgress(Math.round((pagesCompleted / totalPages) * 100));
  }, [currentSection, currentPage, lesson]);
  
  if (!lesson) {
    return (
      <div className="min-h-screen bg-black">
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
    // If there are more sections
    else if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1);
      setCurrentPage(0);
      
      // Mark section as completed in the service
      lessonService.completeSection(lesson.id, currentSectionData.id);
      
      toast({
        title: "Section completed!",
        description: "Moving on to the next section.",
      });
    } 
    // If we're at the last page of the last section
    else if (currentSection === sections.length - 1 && currentPage === currentSectionData.pages.length - 1) {
      // Mark section as completed
      lessonService.completeSection(lesson.id, currentSectionData.id);
      
      toast({
        title: "Section completed!",
        description: "You've completed this section. Time for the quiz!",
      });
      
      // Navigate to the quiz
      navigate(`/quiz/${lesson.id}/section${currentSection + 1}`);
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
  
  // Calculate total pages for the header
  const totalPages = sections.reduce((acc, section) => acc + section.pages.length, 0);
  
  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Lesson Header */}
        <LessonHeader 
          lesson={lesson} 
          progress={progress} 
          totalSections={sections.length}
          totalPages={totalPages}
        />
        
        {/* Lesson Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <LessonSidebar 
            sections={sections}
            currentSection={currentSection}
            currentPage={currentPage}
            setCurrentSection={setCurrentSection}
            setCurrentPage={setCurrentPage}
          />
          
          {/* Main Content */}
          <LessonContent 
            lesson={lesson}
            currentSection={currentSection}
            currentPage={currentPage}
            currentPageData={currentPageData}
            navigatePrev={navigatePrev}
            navigateNext={navigateNext}
            isFirstPage={isFirstPage}
            isLastPage={isLastPage}
          />
        </div>
      </div>
    </div>
  );
};

export default LessonView;
