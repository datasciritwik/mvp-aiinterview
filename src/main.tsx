import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import App from './App.tsx'
import JobDetailPage from './components/JobDetailPage.tsx'
import AuthPage from './components/auth/AuthPage.tsx'
import UserInstructions from './components/UserInstructions.tsx' // Import the new component
import { AuthProvider } from './context/AuthContext.tsx'
import ProtectedRoute from './components/auth/ProtectedRoute.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/" element={
            <ProtectedRoute>
              <App />
            </ProtectedRoute>
          } />
          <Route path="/job/:jobId" element={<JobDetailPage />} />
          {/* Add the new instructions route */}
          <Route path="/instructions" element={
            <ProtectedRoute>
              <UserInstructions />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  </React.StrictMode>,
)