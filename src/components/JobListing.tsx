import React from 'react';
import { MapPin, Clock, Building2, Briefcase } from 'lucide-react';
import type { JobPost } from './JobPostCreation';

interface JobListingProps {
  job: JobPost;
  onView: (job: JobPost) => void;
}

export default function JobListing({ job, onView }: JobListingProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">{job.title}</h3>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <div className="flex items-center text-gray-600">
              <Building2 className="w-4 h-4 mr-2" />
              <span className="text-sm">{job.department}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <MapPin className="w-4 h-4 mr-2" />
              <span className="text-sm">{job.location}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Clock className="w-4 h-4 mr-2" />
              <span className="text-sm">{job.employmentType}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Briefcase className="w-4 h-4 mr-2" />
              <span className="text-sm">{job.experienceLevel}</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {/* <p className="text-sm text-gray-600 line-clamp-2">
            {job.responsibilities.split('\n')[0]}
          </p> */}
          {job.salaryRange && (
            <p className="text-sm font-medium text-blue-600">
              {job.salaryRange}
            </p>
          )}
        </div>

        <div className="pt-4 flex justify-end">
          <button
            onClick={() => onView(job)}
            className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}