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

  yearOfJoining?: number;

  passedOutYear?: number;

  department?: string;

  linkedin?: string;

  github?: string;

  portfolio?: string;

  resume?: string;

  memo?: string;

  idproof?: string;

  links?: { title: string; url: string }[];

  cgpa?: string;

  phoneNumber?: string;

  profileComplete?: boolean;

  // Student career interest fields

  careerInterest?: 'Job' | 'Business' | 'HigherEducation';

  jobInterest?: string;

  businessInterest?: string;

  higherCourse?: string;

  higherCountry?: string;

  // Faculty-specific fields

  facultyId?: string;

  designation?: string;

  facultyType?: 'Professor' | 'Associate Professor' | 'Assistant Professor' | 'HOD' | 'Lecturer' | 'Other';

  officeEmail?: string;

  yearsOfExperience?: number;

  specialization?: string;

  researchInterests?: string[];

  // Entrepreneur / Startup Founder fields

  startupName?: string;

  founderRole?: string;

  industry?: string;

  yearFounded?: string;

  website?: string;

  location?: string;

  employeeCount?: string;

  startupStage?: string;

  lookingFor?: string;

  startupDescription?: string;

  businessVerification?: string;

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

  attachmentUrl?: string;

  attachmentName?: string;

  attachmentType?: string;

}



export interface Post {

  id: string;

  alumniId: string;

  title?: string;

  content: string;

  timestamp: string;

  type: 'general' | 'opportunity' | 'event' | 'community' | 'job' | 'internship' | 'mentorship' | 'referral' | 'business' | 'higher-education';

  status?: 'pending' | 'approved' | 'rejected';

  rejectionReason?: string;

  rejection_reason?: string;

  reviewedBy?: string;

  reviewedAt?: string;

  created_at?: string;

  authorRole?: Role | null;

  likes: number;

  comments: number;

  shares?: number;

  image?: string;

  attachmentUrl?: string;

  attachmentName?: string;

  attachmentType?: string;

  file?: string;

  post_details?: Record<string, any>;

}



export interface PostLike {

  id: string;

  post_id: string;

  user_id: string;

  created_at: string;

}



export interface PostComment {

  id: string;

  post_id: string;

  user_id: string;

  content: string;

  created_at: string;

  updated_at: string;

  parent_comment_id?: string | null;

  user_name?: string;

  user_role?: string;

  user_avatar?: string;

  user?: UserProfile;

}



export interface AdminPost {

  id: string;

  title?: string;

  content: string;

  created_at: string;

  updated_at?: string;

  likes: number;

  comments: number;

  shares?: number;

  image?: string;

  attachment_url?: string;

  attachment_name?: string;

  attachment_type?: string;

  post_details?: Record<string, any>;

}



export interface AdminPostLike {

  id: string;

  admin_post_id: string;

  user_id: string;

  created_at: string;

}



export interface AdminPostComment {

  id: string;

  admin_post_id: string;

  user_id: string;

  content: string;

  created_at: string;

  updated_at: string;

  parent_comment_id?: string | null;

  user_name?: string;

  user_role?: string;

  user_avatar?: string;

  user?: UserProfile;

}