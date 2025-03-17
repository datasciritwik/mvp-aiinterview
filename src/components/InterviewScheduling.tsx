import React, { useState } from 'react';
import { Search, Filter, Eye, CheckCircle, XCircle, Mail, X, Copy } from 'lucide-react';
import {mockCandidates, Candidate} from "../data/data"

const jobTitles = ['Senior Frontend Developer', 'Product Designer'];

export default function InterviewScheduling() {
  const [candidates, setCandidates] = useState<Candidate[]>(mockCandidates);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterScore, setFilterScore] = useState<number | ''>('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'selected' | 'rejected'>('all');
  const [filterJobTitle, setFilterJobTitle] = useState<string>('all');
  const [showEmailModal, setShowEmailModal] = useState(false);

  const handleStatusChange = (candidateId: string, status: 'selected' | 'rejected') => {
    setCandidates(candidates.map(candidate =>
      candidate.id === candidateId ? { ...candidate, status } : candidate
    ));
  };

  const handleViewResume = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setDrawerOpen(true);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const generateEmailContent = (candidate: Candidate) => {
    return `Dear ${candidate.name},

We are pleased to inform you that you have been selected for an interview for the ${candidate.jobTitle} position you applied for. 

Interview Details:
Date: [INSERT DATE]
Time: [INSERT TIME]
Location: [INSERT LOCATION/VIRTUAL MEETING LINK]

Please confirm your availability for this interview by responding to this email.

Best regards,
[YOUR NAME]
[COMPANY NAME]`;
  };

  const handleCopyEmail = (candidate: Candidate) => {
    const emailContent = generateEmailContent(candidate);
    navigator.clipboard.writeText(emailContent);
    alert('Email content copied to clipboard!');
  };

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesScore = filterScore === '' || candidate.atsScore >= filterScore;
    const matchesStatus = filterStatus === 'all' || candidate.status === filterStatus;
    const matchesJobTitle = filterJobTitle === 'all' || candidate.jobTitle === filterJobTitle;
    return matchesSearch && matchesScore && matchesStatus && matchesJobTitle;
  });

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Search and Filter Bar */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search candidates..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="sm:w-48">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="number"
                placeholder="Min ATS Score"
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md"
                value={filterScore}
                onChange={(e) => setFilterScore(e.target.value ? Number(e.target.value) : '')}
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="selected">Selected</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="sm:w-48">
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={filterJobTitle}
              onChange={(e) => setFilterJobTitle(e.target.value)}
            >
              <option value="all">All Positions</option>
              {jobTitles.map(title => (
                <option key={title} value={title}>{title}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Candidates Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Candidate</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Experience</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ATS Score</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredCandidates.map((candidate) => (
              <tr key={candidate.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{candidate.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{candidate.jobTitle}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{candidate.experience} years</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{candidate.email}</div>
                  <div className="text-sm text-gray-500">{candidate.phone}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-sm rounded-full ${getScoreColor(candidate.atsScore)}`}>
                    {candidate.atsScore}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-sm rounded-full ${
                    candidate.status === 'selected' ? 'bg-green-100 text-green-800' :
                    candidate.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {candidate.status.charAt(0).toUpperCase() + candidate.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => handleViewResume(candidate)}
                      className="text-blue-600 hover:text-blue-900"
                      title="View Resume"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    {candidate.status === 'selected' && (
                      <button
                        onClick={() => {
                          setSelectedCandidate(candidate);
                          setShowEmailModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                        title="Send Interview Email"
                      >
                        <Mail className="w-5 h-5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleStatusChange(candidate.id, 'selected')}
                      className="text-green-600 hover:text-green-900"
                      title="Select Candidate"
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleStatusChange(candidate.id, 'rejected')}
                      className="text-red-600 hover:text-red-900"
                      title="Reject Candidate"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Resume Drawer */}
      {drawerOpen && selectedCandidate && (
        <div className="fixed inset-0 overflow-hidden z-50">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
              <div className="relative w-screen max-w-4xl">
                <div className="h-full flex flex-col bg-white shadow-xl">
                  <div className="absolute top-0 right-0 pt-4 pr-4">
                    <button
                      onClick={() => setDrawerOpen(false)}
                      className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                  <div className="flex-1">
                    <iframe
                      src={selectedCandidate.resumeUrl}
                      className="w-full h-full border-0"
                      title="Resume Preview"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Email Modal */}
      {showEmailModal && selectedCandidate && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Interview Email Template
                    </h3>
                    <div className="mt-4">
                      <textarea
                        className="w-full h-64 px-3 py-2 text-gray-700 border rounded-lg focus:outline-none"
                        readOnly
                        value={generateEmailContent(selectedCandidate)}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => handleCopyEmail(selectedCandidate)}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy to Clipboard
                </button>
                <button
                  type="button"
                  onClick={() => setShowEmailModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}