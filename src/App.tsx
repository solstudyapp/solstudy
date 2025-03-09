import { Routes, Route } from "react-router-dom"
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

function App() {
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
