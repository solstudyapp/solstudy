import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import App from "./App"
import "./index.css"
import { AuthProvider } from "./hooks/use-auth"
import { ThemeProvider } from "./components/theme-provider"

const rootElement = document.getElementById("root")
if (!rootElement) throw new Error("Failed to find the root element")

// Add a small delay to ensure the DOM is ready
setTimeout(() => {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <BrowserRouter>
        <ThemeProvider defaultTheme="dark" storageKey="solstudy-theme">
          <AuthProvider>
            <App />
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </React.StrictMode>
  )
}, 0)
