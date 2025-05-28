import React, { useState, useEffect } from 'react';
import { FileText, Users, Building2, HelpCircle } from 'lucide-react';
import JobPostCreation from './components/JobPostCreation';
import InterviewScheduling from './components/InterviewScheduling';
import { Link } from 'react-router-dom';

// Define the job post interface
export interface JobPost {
  title: string;
  department: string;
  location: string;
  employmentType: string;
  experienceLevel: string;
  salaryRange: string;
  responsibilities: string;
  requirements: string;
  benefits: string;
  job_id?: string;
  company_id?: string;
  posted_at?: string;
}

// Interface for the API response
interface JobsApiResponse {
  total: number;
  jobs: JobPost[];
}

function App() {
  const [activeTab, setActiveTab] = useState<'jobs' | 'interviews'>('jobs');
  const [jobPosts, setJobPosts] = useState<JobPost[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  // Function to fetch job posts from the API
  const fetchJobPosts = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_BASEURL}/posts/openings`, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'endpoint-api-key': import.meta.env.VITE_API_HEADER,
          'company-id': 'demo'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch job posts');
      }

      const data: JobsApiResponse = await response.json();
      setJobPosts(data.jobs);
      
      // Set the first job's ID as selected if we have jobs and no selection
      if (data.jobs.length > 0 && !selectedJobId) {
        setSelectedJobId(data.jobs[0].job_id || null);
      }
    } catch (err) {
      console.error('Error fetching job posts:', err);
      setError('Failed to load job posts. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle tab change
  const handleTabChange = (tab: 'jobs' | 'interviews') => {
    setActiveTab(tab);
    if (tab === 'jobs') {
      fetchJobPosts();
    }
  };

  // Fetch job posts on initial mount
  useEffect(() => {
    if (activeTab === 'jobs') {
      fetchJobPosts();
    }
  }, []);

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
                  onClick={() => handleTabChange('jobs')}
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
                  onClick={() => handleTabChange('interviews')}
                  className={`${
                    activeTab === 'interviews'
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Candidates
                </button>
                <Link
                  to="/instructions"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Instructions
                </Link>
                <Link
                  to="/interview"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  <HelpCircle className="w-4 h-4 mr-2" />
                  AI Interview
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading && activeTab === 'jobs' ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : error && activeTab === 'jobs' ? (
          <div className="bg-red-50 p-4 rounded-md">
            <div className="flex">
              <div className="h-5 w-5 text-red-400">⚠️</div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="text-sm text-red-700">{error}</div>
                <button 
                  onClick={fetchJobPosts} 
                  className="mt-2 text-sm font-medium text-red-600 hover:text-red-500"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        ) : activeTab === 'jobs' ? (
          <JobPostCreation initialJobs={jobPosts} onJobPosted={fetchJobPosts} />
        ) : (
          selectedJobId ? (
            <InterviewScheduling jobId={selectedJobId} />
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">Please select a job post to view candidates.</p>
            </div>
          )
        )}
      </main>
    </div>
  );
}

export default App;