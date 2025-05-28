import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import VideoChatWithExecution from './components/ImprovedVideoChat.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<VideoChatWithExecution />} />
      </Routes>
    </Router>
  </React.StrictMode>,
)