import React, { useState } from 'react';
import { FileText, Users, Building2, Award, Send, Camera, FileCheck, Settings, Download, Mail, Brain, HelpCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const UserInstructions: React.FC = () => {
  const [activeTab, setActiveTab] = useState(1);
  const navigate = useNavigate();

  const tabs = [
    { id: 1, title: 'Job Post Creation', icon: <FileText className="w-5 h-5" /> },
    { id: 2, title: 'Resume & Shortlisting', icon: <FileCheck className="w-5 h-5" /> },
    { id: 3, title: 'AI Interview Process', icon: <Users className="w-5 h-5" /> },
    { id: 4, title: 'Reports & Selection', icon: <Award className="w-5 h-5" /> }
  ];

  const tabContent = [
    {
      id: 1,
      title: 'Job Post Creation',
      description: 'Create and publish job listings for your company with AI assistance',
      steps: [
        { text: 'Log in to your company profile', icon: <Building2 className="w-6 h-6 text-blue-500" /> },
        { text: 'Click on "Create Job Post"', icon: <FileText className="w-6 h-6 text-blue-500" /> },
        { text: 'Enter job details (title, description, skills, salary range, etc.)', icon: <FileText className="w-6 h-6 text-blue-500" /> },
        { text: 'Use AI-assisted JD generator for auto-suggestions', icon: <Brain className="w-6 h-6 text-purple-500" /> },
        { text: 'Review and publish the job post', icon: <Send className="w-6 h-6 text-green-500" /> }
      ]
    },
    {
      id: 2,
      title: 'Resume Submission & Shortlisting',
      description: 'Manage candidate applications with AI-powered screening',
      steps: [
        { text: 'Candidates submit their resumes', icon: <FileText className="w-6 h-6 text-blue-500" /> },
        { text: 'The AI scans and generates a detailed report', icon: <Brain className="w-6 h-6 text-purple-500" /> },
        { text: 'System suggests top candidates based on relevance', icon: <Award className="w-6 h-6 text-yellow-500" /> },
        { text: 'Shortlist candidates with one click', icon: <FileCheck className="w-6 h-6 text-green-500" /> },
        { text: 'Send AI interview invites automatically', icon: <Mail className="w-6 h-6 text-blue-500" /> }
      ]
    },
    {
      id: 3,
      title: 'AI-Powered Interview Process',
      description: 'Conduct efficient, intelligent interviews with our AI assistant',
      steps: [
        { text: 'Candidates receive a link and join the interview', icon: <Users className="w-6 h-6 text-blue-500" /> },
        { text: 'The AI interviewer asks role-specific questions', icon: <Brain className="w-6 h-6 text-purple-500" /> },
        { text: 'Camera is mandatory for facial analysis and authentication', icon: <Camera className="w-6 h-6 text-red-500" /> },
        { text: 'The session is recorded and analyzed in real-time', icon: <FileCheck className="w-6 h-6 text-green-500" /> }
      ]
    },
    {
      id: 4,
      title: 'AI-Generated Reports & Selection',
      description: 'Make data-driven hiring decisions with comprehensive AI insights',
      steps: [
        { text: 'AI evaluates responses, body language, and skills', icon: <Brain className="w-6 h-6 text-purple-500" /> },
        { text: 'Generates detailed performance reports for candidates', icon: <FileText className="w-6 h-6 text-blue-500" /> },
        { text: 'Companies can review reports and make hiring decisions', icon: <Award className="w-6 h-6 text-yellow-500" /> }
      ],
      additionalFeatures: [
        { text: 'Automated Follow-ups: Send emails to shortlisted candidates', icon: <Mail className="w-5 h-5 text-blue-500" /> },
        { text: 'Custom Interview Settings: Adjust difficulty level and question style', icon: <Settings className="w-5 h-5 text-gray-500" /> },
        { text: 'Export Reports: Download reports for HR and management review', icon: <Download className="w-5 h-5 text-green-500" /> }
      ]
    }
  ];

  const activeContent = tabContent.find(content => content.id === activeTab);

  const handleGoBack = () => {
    navigate(-1);
  };

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
              <button 
                onClick={handleGoBack}
                className="ml-6 inline-flex items-center px-1 pt-1 border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 text-sm font-medium"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </button>
            </div>
            <div className="flex items-center">
              <div className="flex items-center">
                <HelpCircle className="h-5 w-5 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-blue-600">Instructions</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              How to Use AceSphere
            </h1>
            <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
              A step-by-step guide to streamline your recruitment process
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="mb-8">
            <div className="sm:hidden">
              <select
                onChange={(e) => setActiveTab(parseInt(e.target.value))}
                value={activeTab}
                className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              >
                {tabs.map((tab) => (
                  <option key={tab.id} value={tab.id}>
                    {tab.title}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="hidden sm:block">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex justify-around" aria-label="Tabs">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`whitespace-nowrap py-4 px-3 border-b-2 font-medium text-sm flex items-center transition-colors ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <span className="mr-2">{tab.icon}</span>
                      <span>{tab.title}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>

          {/* Content */}
          {activeContent && (
            <div className="bg-white shadow rounded-lg p-6 animate-fadeIn">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{activeContent.title}</h2>
                <p className="text-gray-600">{activeContent.description}</p>
              </div>
              
              <div className="space-y-6 mb-8">
                {activeContent.steps.map((step, index) => (
                  <div key={index} className="flex items-start">
                    <div className="flex-shrink-0 bg-blue-50 rounded-full p-3">
                      {step.icon}
                    </div>
                    <div className="ml-4">
                      <p className="text-lg font-medium text-gray-900">Step {index + 1}</p>
                      <p className="text-gray-600">{step.text}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              {activeContent.additionalFeatures && (
                <div className="mt-10 border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Features</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {activeContent.additionalFeatures.map((feature, index) => (
                      <div key={index} className="border border-gray-200 rounded-md p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            {feature.icon}
                          </div>
                          <div className="ml-3">
                            <p className="text-sm text-gray-600">{feature.text}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="mt-8 flex justify-between items-center">
                <button
                  onClick={() => setActiveTab(Math.max(1, activeTab - 1))}
                  disabled={activeTab === 1}
                  className={`px-4 py-2 border rounded-md flex items-center ${
                    activeTab === 1
                      ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                  </svg>
                  Previous
                </button>
                
                <div className="flex items-center">
                  <span className="text-gray-500 text-sm">
                    Step {activeTab} of {tabs.length}
                  </span>
                </div>
                
                <button
                  onClick={() => setActiveTab(Math.min(4, activeTab + 1))}
                  disabled={activeTab === 4}
                  className={`px-4 py-2 border rounded-md flex items-center ${
                    activeTab === 4
                      ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Next
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserInstructions;