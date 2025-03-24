import React, { useState } from 'react';
import { X, Upload, ArrowRight, ArrowLeft, Loader2, PartyPopper } from 'lucide-react';
import { auth } from '../firebase/config';
export const userId = auth.currentUser?.uid;
console.log("Job application", userId)
interface JobApplicationFormProps {
  jobId: string;
  jobTitle: string;
  onClose: () => void;
  onSubmit: (formData: JobApplicationData) => Promise<void> | void;
}

export interface JobApplicationData {
  fullName: string;
  email: string;
  phone: string;
  experience: number;
  resumeFile?: File;
  resumeUrl?: string; // Added to store the public URL from the API
}

// This will store the interview questions returned from the API
interface ApiResponse {
  questions: string[];
  error?: string;
}

const COMPANY_NAME = "demo"; // Replace with your actual company name

export default function JobApplicationForm({ jobId, jobTitle, onClose, onSubmit }: JobApplicationFormProps) {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [practiceQuestions, setPracticeQuestions] = useState<string[]>([]);
  
  const [formData, setFormData] = useState<JobApplicationData>({
    fullName: '',
    email: '',
    phone: '',
    experience: 0
  });

  const [errors, setErrors] = useState<Partial<Record<keyof JobApplicationData, string>>>({});

  const validatePersonalDetails = () => {
    const newErrors: Partial<Record<keyof JobApplicationData, string>> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s-()]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (formData.experience < 0) {
      newErrors.experience = 'Experience must be at least 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Function to upload resume to the API
  const uploadResumeToAPI = async (file: File): Promise<string | null> => {
    try {
      
      // Log the API URL and headers for debugging
      
      // First, get the signed URL
      const uploadResponse = await fetch(`${import.meta.env.VITE_BASEURL}/apply/upload`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'endpoint-api-key': import.meta.env.VITE_API_HEADER,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          company_name: COMPANY_NAME,
          file_name: file.name
        })
      });

      
      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error('Upload API Error Response:', errorText);
        throw new Error(`Failed to get resume upload URL: ${uploadResponse.status} ${errorText}`);
      }

      const responseData = await uploadResponse.json();
      
      const { signed_url, public_url } = responseData;
      
      if (!signed_url || !public_url) {
        throw new Error('Missing signed_url or public_url in response');
      }


      // Now upload the actual file to the signed URL
      const uploadFileResponse = await fetch(signed_url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/pdf'
        },
        body: file
      });

      
      if (!uploadFileResponse.ok) {
        const errorText = await uploadFileResponse.text();
        console.error('File Upload Error Response:', errorText);
        throw new Error(`Failed to upload resume to storage: ${uploadFileResponse.status} ${errorText}`);
      }

      return public_url;
    } catch (error) {
      console.error('Resume upload error:', error);
      return null;
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }


    // Validate file type
    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size should be less than 5MB');
      return;
    }

    setIsUploading(true);
    try {
      
      // Upload the resume to the API
      const publicUrl = await uploadResumeToAPI(file);
      
      
      if (!publicUrl) {
        throw new Error('Failed to upload resume. Please try again.');
      }
      
      setFormData(prev => ({ 
        ...prev, 
        resumeFile: file,
        resumeUrl: publicUrl 
      }));
      
      setCurrentStep(2);
    } catch (error) {
      console.error('Resume upload error:', error);
      alert('Failed to upload resume. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // Function to submit candidate data to the API
  const submitCandidateData = async (): Promise<ApiResponse> => {
    try {
      if (!formData.resumeUrl) {
        throw new Error('Resume URL is missing');
      }

      const response = await fetch(`${import.meta.env.VITE_BASEURL}/apply/ats/score`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'endpoint-api-key': import.meta.env.VITE_API_HEADER,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          request: {
            pdf_url: formData.resumeUrl,
            job_id: jobId
          },
          can_data: {
            name: formData.fullName,
            job_title: jobTitle,
            email: formData.email,
            phone: formData.phone,
            experience: `${formData.experience}+ years`,
            status: "Pending"
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit application data');
      }

      // The API returns an array of questions
      const questions = await response.json();
      return { questions };
    } catch (error) {
      console.error('Candidate data submission error:', error);
      return { 
        questions: [],
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePersonalDetails()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // First call the API to submit candidate data
      const apiResponse = await submitCandidateData();
      
      if (apiResponse.error) {
        throw new Error(apiResponse.error);
      }
      
      // Set the practice questions from the API response
      setPracticeQuestions(apiResponse.questions);
      
      // Call the onSubmit prop function to inform parent component
      await onSubmit(formData);
      
      // Move to the thank you page with questions
      setCurrentStep(3);
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    } else {
      onClose();
    }
  };

  const getModalWidth = () => {
    if (currentStep === 3) return 'max-w-4xl';
    return 'max-w-2xl';
  };

  // Use API-returned questions if available, otherwise fall back to defaults
  const displayQuestions = practiceQuestions.length > 0 
    ? practiceQuestions 
    : [
        "Describe a time when you had to extract insights from a complex dataset and how you presented your findings to a non-technical audience.",
        "Walk me through a project where you used SQL or Python to analyze data and what the outcome was.",
        "How do you stay updated with the latest trends in data analysis and visualization?",
        "Give an example of how you've used data to influence strategic decision-making in a previous role.",
        "Tell me about a time you had to work with incomplete or messy data. How did you handle it?"
      ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-25 transition-opacity"></div>

        <div className={`relative w-full ${getModalWidth()} transform overflow-hidden rounded-lg bg-white shadow-xl transition-all`}>
          <div className="absolute right-0 top-0 pr-4 pt-4">
            <button
              onClick={onClose}
              className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="px-6 pt-5 pb-6">
            <h3 className="text-lg font-medium text-gray-900">
              Apply for {jobTitle}
            </h3>
            <div className="mt-1 flex items-center space-x-2">
              <div className={`h-2 w-12 rounded-full ${currentStep === 1 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
              <div className={`h-2 w-12 rounded-full ${currentStep === 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
              <div className={`h-2 w-12 rounded-full ${currentStep === 3 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
            </div>
          </div>

          {currentStep === 1 && (
            <div className="px-6 pb-6">
              <div className="rounded-lg border-2 border-dashed border-gray-300 p-12">
                <div className="text-center">
                  <Upload className="mx-auto h-16 w-16 text-gray-400" />
                  <div className="mt-6">
                    <label htmlFor="resume-upload" className="cursor-pointer">
                      <span className="mt-2 block text-lg font-medium text-gray-900">Upload your resume</span>
                      <span className="mt-2 block text-sm text-gray-500">PDF up to 5MB</span>
                      <input
                        id="resume-upload"
                        name="resume"
                        type="file"
                        accept=".pdf"
                        className="hidden"
                        onChange={handleResumeUpload}
                        disabled={isUploading}
                      />
                      <button
                        type="button"
                        className="mt-6 inline-flex items-center rounded-md border border-transparent bg-blue-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        onClick={() => document.getElementById('resume-upload')?.click()}
                        disabled={isUploading}
                      >
                        {isUploading ? (
                          <>
                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="h-5 w-5 mr-2" />
                            Select PDF
                          </>
                        )}
                      </button>
                    </label>
                  </div>
                </div>
              </div>
              {formData.resumeFile && (
                <div className="mt-6 flex items-center justify-between rounded-md bg-blue-50 px-6 py-4">
                  <span className="text-base text-blue-700">{formData.resumeFile.name}</span>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="inline-flex items-center text-base font-medium text-blue-700 hover:text-blue-600"
                  >
                    Next
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </button>
                </div>
              )}
            </div>
          )}

          {currentStep === 2 && (
            <form onSubmit={handleSubmit} className="px-8 pb-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    className={`mt-1 block w-full rounded-md shadow-sm ${
                      errors.fullName 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                    }`}
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  />
                  {errors.fullName && (
                    <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    className={`mt-1 block w-full rounded-md shadow-sm ${
                      errors.email 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                    }`}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    className={`mt-1 block w-full rounded-md shadow-sm ${
                      errors.phone 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                    }`}
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="experience" className="block text-sm font-medium text-gray-700">
                    Years of Experience *
                  </label>
                  <input
                    type="number"
                    id="experience"
                    min="0"
                    step="0.5"
                    className={`mt-1 block w-full rounded-md shadow-sm ${
                      errors.experience 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                    }`}
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: parseFloat(e.target.value) || 0 })}
                  />
                  {errors.experience && (
                    <p className="mt-1 text-sm text-red-600">{errors.experience}</p>
                  )}
                </div>
              </div>

              <div className="mt-8 flex justify-between">
                <button
                  type="button"
                  onClick={handleBack}
                  className="inline-flex items-center rounded-md border border-gray-300 bg-white px-6 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Application'
                  )}
                </button>
              </div>
            </form>
          )}

          {currentStep === 3 && (
            <div className="px-12 py-8">
              <div className="text-center">
                <PartyPopper className="mx-auto h-16 w-16 text-blue-600" />
                <h2 className="mt-6 text-3xl font-bold text-gray-900">
                  Thank You for Submitting Your Job Application! 🎉
                </h2>
                <p className="mt-4 text-lg text-gray-600">
                  We appreciate your interest and effort in applying. To help you prepare for the next steps, here are a few interview practice questions tailored to your profile:
                </p>
              </div>

              <div className="mt-8 space-y-6">
                {displayQuestions.map((question, index) => (
                  <div key={index} className="rounded-lg bg-blue-50 p-6">
                    <p className="text-lg text-blue-900">{question}</p>
                  </div>
                ))}
              </div>

              <div className="mt-12 text-center">
                <p className="text-lg text-gray-600">
                  Want to practice more? Explore additional tailored interview questions at{' '}
                  <a href="https://world.acesphereai.org" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 font-medium">
                    world.acesphereai.org
                  </a>
                  {' '}and sharpen your skills!
                </p>
                <p className="mt-6 text-xl font-medium text-gray-900">
                  Best of luck with your interview preparation! 🚀
                </p>
                <button
                  onClick={onClose}
                  className="mt-8 inline-flex items-center rounded-md border border-transparent bg-blue-600 px-8 py-4 text-lg font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}