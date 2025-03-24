import React from 'react';
import { Eye, MapPin, Clock, Briefcase } from 'lucide-react';
import { JobPost } from './JobPostCreation';

interface JobListingProps {
  job: JobPost;
  postedDate?: string;
  onView: (job: JobPost) => void;
}

const JobListing: React.FC<JobListingProps> = ({ job, postedDate, onView }) => {
  // Function to map location to icon and text
  const getLocationInfo = (location: string) => {
    const normalizedLocation = location.toLowerCase();
    if (normalizedLocation.includes('remote')) {
      return { icon: <MapPin className="h-4 w-4" />, text: 'Remote' };
    } else if (normalizedLocation.includes('hybrid')) {
      return { icon: <MapPin className="h-4 w-4" />, text: 'Hybrid' };
    } else {
      return { icon: <MapPin className="h-4 w-4" />, text: location };
    }
  };

  // Function to map employment type to icon and text
  const getEmploymentTypeInfo = (type: string) => {
    const normalizedType = type.toLowerCase();
    if (normalizedType.includes('full-time')) {
      return { icon: <Clock className="h-4 w-4" />, text: 'Full-time' };
    } else if (normalizedType.includes('part-time')) {
      return { icon: <Clock className="h-4 w-4" />, text: 'Part-time' };
    } else if (normalizedType.includes('contract')) {
      return { icon: <Briefcase className="h-4 w-4" />, text: 'Contract' };
    } else if (normalizedType.includes('internship')) {
      return { icon: <Briefcase className="h-4 w-4" />, text: 'Internship' };
    } else {
      return { icon: <Clock className="h-4 w-4" />, text: type };
    }
  };

  const locationInfo = getLocationInfo(job.location);
  const employmentTypeInfo = getEmploymentTypeInfo(job.employmentType);

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow duration-200">
      <div className="p-5">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-medium text-gray-900 truncate">{job.title}</h3>
            <p className="text-sm text-gray-500">{job.department}</p>
          </div>
          <div className="flex items-center space-x-2">
            <a
              href={`/job/${job.job_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
              title="Open in new tab"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
            <button
              onClick={() => onView(job)}
              className="p-2 text-blue-600 hover:text-blue-800 transition-colors duration-200"
              title="View job details"
            >
              <Eye className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <div className="mt-4 flex items-center text-sm text-gray-500 space-x-4">
          <div className="flex items-center">
            {locationInfo.icon}
            <span className="ml-1">{locationInfo.text}</span>
          </div>
          <div className="flex items-center">
            {employmentTypeInfo.icon}
            <span className="ml-1">{employmentTypeInfo.text}</span>
          </div>
        </div>
        
        {job.experienceLevel && (
          <div className="mt-2 text-sm text-gray-500">
            Experience: {job.experienceLevel}
          </div>
        )}
        
        {job.salaryRange && (
          <div className="mt-1 text-sm font-medium text-gray-700">
            {job.salaryRange}
          </div>
        )}
        
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700">Responsibilities:</h4>
          <div className="mt-1 text-sm text-gray-600 line-clamp-3 whitespace-pre-line">
            {job.responsibilities}
          </div>
        </div>
        
        {postedDate && (
          <div className="mt-4 text-xs text-gray-400">
            Posted: {postedDate}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobListing;