export type Role = 'student' | 'alumni' | 'faculty' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  role: Role;
  avatar: string;
  graduationYear: number;
  degree: string;
  company?: string;
  position?: string;
  email?: string;
  phone?: string;
  bio?: string;
  skills: string[];
  about?: string;
  collegeName?: string;
  rollNumber?: string;
  year?: string;
  department?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  resume?: string;
  idProof?: string;
  links?: { title: string; url: string }[];
  cgpa?: string;
  phoneNumber?: string;
  profileComplete?: boolean;
  // Faculty-specific fields
  facultyId?: string;
  designation?: string;
  facultyType?: 'Professor' | 'Associate Professor' | 'Assistant Professor' | 'HOD' | 'Lecturer' | 'Other';
  officeEmail?: string;
  yearsOfExperience?: number;
  specialization?: string;
  researchInterests?: string[];
}

export interface Job {
  id: string;
  title: string;
  company: string;
  type: 'Full-time' | 'Internship' | 'Contract';
  location: string;
  alumniId: string;
  postedDate: string;
  description: string;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  type: 'Networking' | 'Workshop' | 'Webinar';
  alumniId: string;
  image: string;
}

export interface Post {
  id: string;
  alumniId: string;
  content: string;
  timestamp: string;
  type: 'general' | 'opportunity' | 'event';
  likes: number;
  comments: number;
  image?: string;
}
