import React, { useState } from 'react';
import { FileText, Users, PlusCircle, Copy, Eye, CheckCircle, XCircle, Search, Filter, ChevronRight, Building2 } from 'lucide-react';
import JobPostCreation from './components/JobPostCreation';
import InterviewScheduling from './components/InterviewScheduling';

function App() {
  const [activeTab, setActiveTab] = useState<'jobs' | 'interviews'>('jobs');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Building2 className="h-8 w-8 text-blue-600" />
                <span className="ml-3 text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">AceSphere</span>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <button
                  onClick={() => setActiveTab('jobs')}
                  className={`${
                    activeTab === 'jobs'
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Job Posts
                </button>
                <button
                  onClick={() => setActiveTab('interviews')}
                  className={`${
                    activeTab === 'interviews'
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Interviews
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'jobs' ? <JobPostCreation /> : <InterviewScheduling />}
      </main>
    </div>
  );
}

export default App;