import React from 'react';
import { Share2, X } from 'lucide-react';
import type { JobPost } from './JobPostCreation';

interface JobPostPreviewProps {
  jobPost: JobPost;
  onClose: () => void;
}

export default function JobPostPreview({ jobPost, onClose }: JobPostPreviewProps) {
  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        
        <div className="relative bg-white rounded-lg max-w-4xl w-full mx-auto shadow-xl">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-900">Job Post Preview</h2>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleShare}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-8">
            <div className="space-y-4">
              <h1 className="text-3xl font-bold text-gray-900">{jobPost.title}</h1>
              <div className="flex flex-wrap gap-4 text-sm">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full">{jobPost.department}</span>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full">{jobPost.location}</span>
                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full">{jobPost.employmentType}</span>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full">{jobPost.experienceLevel}</span>
                {jobPost.salaryRange && (
                  <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full">{jobPost.salaryRange}</span>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <section className="space-y-3">
                <h2 className="text-xl font-semibold text-gray-900">Key Responsibilities</h2>
                <div className="prose max-w-none">
                  {jobPost.responsibilities.split('\n').map((item, index) => (
                    <p key={index} className="text-gray-600">{item}</p>
                  ))}
                </div>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-semibold text-gray-900">Requirements</h2>
                <div className="prose max-w-none">
                  {jobPost.requirements.split('\n').map((item, index) => (
                    <p key={index} className="text-gray-600">{item}</p>
                  ))}
                </div>
              </section>

              {jobPost.benefits && (
                <section className="space-y-3">
                  <h2 className="text-xl font-semibold text-gray-900">Benefits</h2>
                  <div className="prose max-w-none">
                    {jobPost.benefits.split('\n').map((item, index) => (
                      <p key={index} className="text-gray-600">{item}</p>
                    ))}
                  </div>
                </section>
              )}
            </div>

            <div className="mt-8 flex justify-center">
              <button className="px-8 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium">
                Apply Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}