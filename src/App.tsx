import { Routes, Route, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import Header from "./components/Header"
import Footer from "./components/Footer"
import Index from "./pages/Index"
import Dashboard from "./pages/Dashboard"
import AdminDashboard from "./pages/AdminDashboard"
import AuthPage from "./pages/AuthPage"
import EmailConfirmationPageWrapper from "./pages/EmailConfirmationPageWrapper"
import LessonView from "./pages/LessonView"
import QuizPage from "./pages/QuizPage"
import NotFound from "./pages/NotFound"
import About from "./pages/About"
import ProtectedRoute from "./components/ProtectedRoute"
import AdminRoute from "./components/AdminRoute"
import { loadLessons } from "./data/lessons"
import { useToast } from "./hooks/use-toast"
import { Loader2 } from "lucide-react"

function App() {
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const navigate = useNavigate()

  // Load lessons data when the app starts
  useEffect(() => {
    const initializeApp = async () => {
      try {
        await loadLessons()
      } catch (error) {
        console.error("Error initializing app:", error)
        toast({
          title: "Error loading data",
          description:
            "There was a problem loading the application data. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    initializeApp()
  }, [toast])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-black">
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-16 w-16 animate-spin text-[#14F195] mx-auto mb-6" />
            <p className="text-white text-xl">Loading SolStudy...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route
          path="/email-confirmation"
          element={<EmailConfirmationPageWrapper />}
        />
        <Route
          path="*"
          element={
            <>
              <Header />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/*"
                    element={
                      <AdminRoute>
                        <AdminDashboard />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/lesson/:lessonId"
                    element={
                      <ProtectedRoute>
                        <LessonView />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/quiz/:lessonId/:sectionId"
                    element={
                      <ProtectedRoute>
                        <QuizPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/about" element={<About />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <Footer />
            </>
          }
        />
      </Routes>
    </div>
  )
}

export default App
