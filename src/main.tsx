
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ThemeProvider } from './components/theme-provider.tsx'
import { Toaster } from './components/ui/toaster.tsx'
import { Toaster as Sonner } from './components/ui/sonner.tsx'
import ErrorBoundary from './components/ErrorBoundary.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" storageKey="solstudy-theme">
        <App />
        <Toaster />
        <Sonner />
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)
