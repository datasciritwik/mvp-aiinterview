import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Building2, MapPin, Clock, Briefcase, Calendar, ArrowLeft, Loader } from 'lucide-react';
import JobApplicationForm, { JobApplicationData } from './JobApplicationForm';

// Define the JobPost interface if it's not imported from JobPostCreation
interface JobPost {
  id?: string;
  title: string;
  department: string;
  location: string;
  employmentType: string;
  experienceLevel: string;
  salaryRange?: string;
  responsibilities: string;
  requirements: string;
  benefits?: string;
  posted_at?: string;
}

const JobDetailPage: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<JobPost | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);

  useEffect(() => {
    const fetchJobDetail = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Make sure we have a valid jobId
        if (!jobId) {
          throw new Error('Job ID is missing');
        }
        
        const response = await fetch(`${import.meta.env.VITE_BASEURL}/posts/openings/${jobId}`, {
          method: 'GET',
          headers: {
            'accept': 'application/json',
            'endpoint-api-key': import.meta.env.VITE_API_HEADER,
            'company-id': import.meta.env.VITE_COMPANY_ID
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch job details');
        }

        const data = await response.json();
        setJob(data);
      } catch (err) {
        console.error('Error fetching job details:', err);
        setError('Failed to load job details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (jobId) {
      fetchJobDetail();
    }
  }, [jobId]);

  const handleApplicationSubmit = async (formData: JobApplicationData) => {
    try {
      console.log('Application submitted:', formData);
      
      // Here you would typically send the application data to your backend
      // This is now handled inside the JobApplicationForm component with API integration
      
      // Show success message if needed (though this is redundant now)
      // alert('Application submitted successfully!');
      
      // The form itself will handle the success flow and display the practice questions
    } catch (error) {
      console.error('Error handling application submission:', error);
    }
  };

  // Format the posted date
  const formatPostedDate = (dateString?: string) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const goBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader className="h-8 w-8 text-blue-600 animate-spin" />
          <p className="mt-4 text-gray-600">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-red-600">Error</h2>
            <p className="mt-2 text-gray-600">{error || 'Job not found'}</p>
            <button
              onClick={goBack}
              className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* <button
          onClick={goBack}
          className="mb-6 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Jobs
        </button> */}

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-8 text-white">
            <div className="flex items-center">
              <Building2 className="h-10 w-10 mr-4" />
              <div>
                <h1 className="text-2xl font-bold">{job.title}</h1>
                <p className="text-blue-100">{job.department}</p>
              </div>
            </div>
          </div>

          {/* Job Details */}
          <div className="p-6">
            <div className="flex flex-wrap gap-6 mb-8">
              <div className="flex items-center text-gray-600">
                <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                <span>{job.location}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Briefcase className="h-5 w-5 mr-2 text-blue-600" />
                <span>{job.employmentType}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Clock className="h-5 w-5 mr-2 text-blue-600" />
                <span>{job.experienceLevel}</span>
              </div>
              {job.posted_at && (
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                  <span>Posted on {formatPostedDate(job.posted_at)}</span>
                </div>
              )}
            </div>

            {job.salaryRange && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Salary Range</h2>
                <div className="bg-blue-50 text-blue-800 px-4 py-3 rounded-md font-medium">
                  {job.salaryRange}
                </div>
              </div>
            )}

            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Key Responsibilities</h2>
              <div className="whitespace-pre-line text-gray-700">{job.responsibilities}</div>
            </div>

            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Requirements</h2>
              <div className="whitespace-pre-line text-gray-700">{job.requirements}</div>
            </div>

            {job.benefits && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Benefits</h2>
                <div className="whitespace-pre-line text-gray-700">{job.benefits}</div>
              </div>
            )}

            <div className="mt-10 pt-6 border-t border-gray-200">
              <button
                onClick={() => setShowApplicationForm(true)}
                className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-md transition-colors duration-200"
              >
                Apply for this position
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Job Application Form Modal */}
      {showApplicationForm && jobId && (
        <JobApplicationForm
          jobId={jobId}
          jobTitle={job.title}
          onClose={() => setShowApplicationForm(false)}
          onSubmit={handleApplicationSubmit}
        />
      )}
    </div>
  );
};

export default JobDetailPage;