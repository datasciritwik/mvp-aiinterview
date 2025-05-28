import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import App from './App.tsx'
import JobDetailPage from './components/JobDetailPage.tsx'
import UserInstructions from './components/UserInstructions.tsx'
import './index.css'
import VideoChatWithExecution from './components/ImprovedVideoChat.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/job/:jobId" element={<JobDetailPage />} />
        <Route path="/instructions" element={<UserInstructions />} />
        <Route path="/interview" element={<VideoChatWithExecution />} />
      </Routes>
    </Router>
  </React.StrictMode>,
)