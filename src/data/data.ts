export interface Candidate {
  id: string;
  name: string;
  experience: number;
  email: string;
  phone: string;
  atsScore: number;
  status: 'pending' | 'selected' | 'rejected';
  resumeUrl: string;
  jobTitle: string;
}

export const mockCandidates: Candidate[] = [
  {
    id: '1',
    name: 'John Smith',
    experience: 5,
    email: 'john.smith@example.com',
    phone: '+1 (555) 123-4567',
    atsScore: 85,
    status: 'pending',
    resumeUrl: 'https://storage.googleapis.com/acespere/resume/20be399f-def5-4af9-9dbe-4283a2408642_resume-new300.pdf',
    jobTitle: 'Senior Frontend Developer'
  },
  {
    id: '3',
    name: 'John Ray',
    experience: 5,
    email: 'john.smith@example.com',
    phone: '+1 (555) 123-4567',
    atsScore: 80,
    status: 'pending',
    resumeUrl: 'https://storage.googleapis.com/acespere/resume/20be399f-def5-4af9-9dbe-4283a2408642_resume-new300.pdf',
    jobTitle: 'Senior Frontend Developer'
  },
  {
    id: '4',
    name: 'John Parker',
    experience: 5,
    email: 'john.smith@example.com',
    phone: '+1 (555) 123-4567',
    atsScore: 60,
    status: 'pending',
    resumeUrl: 'https://storage.googleapis.com/acespere/resume/20be399f-def5-4af9-9dbe-4283a2408642_resume-new300.pdf',
    jobTitle: 'Senior Frontend Developer'
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    experience: 3,
    email: 'sarah.j@example.com',
    phone: '+1 (555) 987-6543',
    atsScore: 92,
    status: 'pending',
    resumeUrl: 'https://storage.googleapis.com/acespere/resume/20be399f-def5-4af9-9dbe-4283a2408642_resume-new300.pdf',
    jobTitle: 'Product Designer'
  }
];