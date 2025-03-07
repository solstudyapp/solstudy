
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AuthPage from "./pages/AuthPage";
import LessonView from "./pages/LessonView";
import QuizPage from "./pages/QuizPage";
import NotFound from "./pages/NotFound";
import About from "./pages/About";

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-black">
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="*" element={
          <>
            <Header />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/admin/*" element={<AdminDashboard />} />
                <Route path="/lesson/:lessonId" element={<LessonView />} />
                <Route path="/quiz/:lessonId/:sectionId" element={<QuizPage />} />
                <Route path="/about" element={<About />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </>
        } />
      </Routes>
    </div>
  );
}

export default App;
