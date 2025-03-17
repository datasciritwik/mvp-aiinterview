import React, { useState } from 'react';
import { X, Plus, Wand2, Sparkles } from 'lucide-react';
import JobPostPreview from './JobPostPreview';
import JobListing from './JobListing';

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

// Sample job posts
const sampleJobs: JobPost[] = [
  {
    title: 'Senior Frontend Developer',
    department: 'Engineering',
    location: 'Remote',
    employmentType: 'Full-time',
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
  },
  {
    title: 'Product Designer',
    department: 'Design',
    location: 'Hybrid',
    employmentType: 'Full-time',
    experienceLevel: '3+ years',
    salaryRange: '$90,000 - $130,000',
    responsibilities: `• Create user-centered designs by understanding business requirements
• Design user flows, wireframes, and high-fidelity mockups
• Conduct user research and usability testing
• Collaborate with developers on implementation
• Maintain and evolve our design system`,
    requirements: `• 3+ years of product design experience
• Proficiency in Figma and modern design tools
• Strong portfolio demonstrating UX/UI skills
• Experience with design systems
• Excellent collaboration skills`,
    benefits: `• Flexible work schedule
• Health and dental insurance
• Annual learning budget
• Home office stipend
• Regular team events`
  }
];

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

export default function JobPostCreation() {
  const [showModal, setShowModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [jobPost, setJobPost] = useState<JobPost>(initialJobPost);
  const [isGenerating, setIsGenerating] = useState(false);
  const [postedJobs, setPostedJobs] = useState<JobPost[]>(sampleJobs);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPostedJobs([jobPost, ...postedJobs]);
    setShowModal(false);
    setShowPreview(true);
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

      {/* Job Listings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {postedJobs.map((job, index) => (
          <JobListing
            key={index}
            job={job}
            onView={(job) => {
              setJobPost(job);
              setShowPreview(true);
            }}
          />
        ))}
      </div>

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
                    title="Only one templete available"
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
                        <option value="remote">Remote</option>
                        <option value="hybrid">Hybrid</option>
                        <option value="onsite">On-site</option>
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
                        <option value="full-time">Full-time</option>
                        <option value="part-time">Part-time</option>
                        <option value="contract">Contract</option>
                        <option value="internship">Internship</option>
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
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Post Job
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