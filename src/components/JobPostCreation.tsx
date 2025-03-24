import React, { useState } from 'react';
import { X, Plus, Wand2, Sparkles } from 'lucide-react';
import JobPostPreview from './JobPostPreview';
import JobListing from './JobListing';

import { auth } from '../firebase/config';
import { useAuth } from '../context/AuthContext';

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

const initialJobPost: JobPost = {
  title: '',
  department: '',
  location: '',
  employmentType: '',
  experienceLevel: '',
  salaryRange: '',
  responsibilities: '',
  requirements: '',
  benefits: ''
};

const mockAIGenerate = async () => {
  // Simulated AI response - in real app, this would call an AI service
  return {
    title: 'Senior Frontend Developer',
    department: 'Engineering',
    location: 'Remote',
    employmentType: 'full-time',
    experienceLevel: '5+ years',
    salaryRange: '$120,000 - $160,000',
    responsibilities: `• Lead the development of complex web applications
• Architect scalable frontend solutions
• Mentor junior developers
• Collaborate with product and design teams
• Implement best practices and coding standards`,
    requirements: `• 5+ years of experience with React.js
• Strong TypeScript knowledge
• Experience with modern frontend tools
• Excellent problem-solving skills
• Strong communication abilities`,
    benefits: `• Competitive salary
• Remote work flexibility
• Health insurance
• 401(k) matching
• Professional development budget`
  };
};

// Function to post a job to the backend API
const postJobToBackend = async (jobPost: JobPost, userId: string) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_BASEURL}/posts/`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'company-id': userId, // Use Firebase userId here
        'endpoint-api-key': import.meta.env.VITE_API_HEADER,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: jobPost.title,
        department: jobPost.department,
        location: jobPost.location,
        employmentType: jobPost.employmentType,
        experienceLevel: jobPost.experienceLevel,
        salaryRange: jobPost.salaryRange,
        responsibilities: jobPost.responsibilities,
        requirements: jobPost.requirements,
        benefits: jobPost.benefits
      })
    });

    if (!response.ok) {
      throw new Error('Failed to post job');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error posting job:', error);
    throw error;
  }
};

interface JobPostCreationProps {
  initialJobs?: JobPost[];
  onJobPosted?: () => void;
}

export default function JobPostCreation({ initialJobs = [], onJobPosted }: JobPostCreationProps) {
  const [showModal, setShowModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [jobPost, setJobPost] = useState<JobPost>(initialJobPost);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [postedJobs, setPostedJobs] = useState<JobPost[]>(initialJobs);
  const { currentUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Get the userId from current user
      const userId = currentUser?.uid;
      
      if (!userId) {
        throw new Error('User not authenticated');
      }
      
      // Send job post to backend API with userId
      const result = await postJobToBackend(jobPost, userId);
      
      // Save job ID in session storage
      if (result.job_id) {
        sessionStorage.setItem('lastPostedJobId', result.job_id);
      }
      
      // Add job with ID to local state
      const newJob = { 
        ...jobPost, 
        job_id: result.job_id,
        posted_at: new Date().toISOString() 
      };
      
      setPostedJobs([newJob, ...postedJobs]);
      
      // Close modal and show preview
      setShowModal(false);
      setShowPreview(true);
      
      // Notify parent component that a job was posted
      if (onJobPosted) {
        onJobPosted();
      }
      
      // Reset form
      setJobPost(initialJobPost);
    } catch (error) {
      console.error('Error submitting job post:', error);
      alert('Failed to post job. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAIGenerate = async () => {
    setIsGenerating(true);
    try {
      const generatedPost = await mockAIGenerate();
      setJobPost(generatedPost);
    } catch (error) {
      console.error('Error generating job post:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Format the posted date
  const formatPostedDate = (dateString?: string) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Jobs</h1>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <Plus className="w-5 h-5 mr-2" />
          Post New Job
        </button>
      </div>

      {/* Empty state */}
      {postedJobs.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No job posts</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a new job post.
          </p>
          <div className="mt-6">
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              New Job Post
            </button>
          </div>
        </div>
      )}

      {/* Job Listings */}
      {postedJobs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {postedJobs.map((job) => (
            <JobListing
              key={job.job_id || Math.random().toString()}
              job={job}
              postedDate={formatPostedDate(job.posted_at)}
              onView={(job) => {
                setJobPost(job);
                setShowPreview(true);
              }}
            />
          ))}
        </div>
      )}

      {/* Job Posting Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-10 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Post New Job</h2>
                <div className="flex items-center space-x-4">
                  <button
                    title="Only one template available"
                    onClick={handleAIGenerate}
                    disabled={isGenerating}
                    className={`inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                      isGenerating ? 'opacity-75 cursor-not-allowed' : ''
                    }`}
                  >
                    {isGenerating ? (
                      <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                    ) : (
                      <Wand2 className="w-5 h-5 mr-2" />
                    )}
                    {isGenerating ? 'Generating...' : 'AI Generate'}
                  </button>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="px-6 py-6 max-h-[calc(120vh-300px)] overflow-y-auto">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Job Title*
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g., Senior Frontend Developer"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        value={jobPost.title}
                        onChange={(e) => setJobPost({ ...jobPost, title: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Department*
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g., Engineering"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        value={jobPost.department}
                        onChange={(e) => setJobPost({ ...jobPost, department: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Location*
                      </label>
                      <select
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        value={jobPost.location}
                        onChange={(e) => setJobPost({ ...jobPost, location: e.target.value })}
                      >
                        <option value="">Select location</option>
                        <option value="Remote">Remote</option>
                        <option value="Hybrid">Hybrid</option>
                        <option value="On-site">On-site</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Employment Type*
                      </label>
                      <select
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        value={jobPost.employmentType}
                        onChange={(e) => setJobPost({ ...jobPost, employmentType: e.target.value })}
                      >
                        <option value="">Select type</option>
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Contract">Contract</option>
                        <option value="Internship">Internship</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Experience Level*
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g., 3+ years"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        value={jobPost.experienceLevel}
                        onChange={(e) => setJobPost({ ...jobPost, experienceLevel: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Salary Range <span className="text-gray-500">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., $80,000 - $100,000"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        value={jobPost.salaryRange}
                        onChange={(e) => setJobPost({ ...jobPost, salaryRange: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Key Responsibilities*
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder="List the key responsibilities and expectations for this role..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      value={jobPost.responsibilities}
                      onChange={(e) => setJobPost({ ...jobPost, responsibilities: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Requirements*
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder="List the qualifications, skills, and experience required..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      value={jobPost.requirements}
                      onChange={(e) => setJobPost({ ...jobPost, requirements: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Benefits <span className="text-gray-500">(Optional)</span>
                    </label>
                    <textarea
                      rows={4}
                      placeholder="List the benefits, perks, and advantages of working with your company..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      value={jobPost.benefits}
                      onChange={(e) => setJobPost({ ...jobPost, benefits: e.target.value })}
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                      isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
                    }`}
                  >
                    {isSubmitting ? 'Posting...' : 'Post Job'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Job Post Preview */}
      {showPreview && (
        <JobPostPreview
          jobPost={jobPost}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
}