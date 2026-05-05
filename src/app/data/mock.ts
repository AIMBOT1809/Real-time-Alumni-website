import { LucideIcon, Briefcase, Calendar, GraduationCap, Users, User, Award, BookOpen } from 'lucide-react';

export type Role = 'student' | 'graduate' | 'alumni' | 'faculty';

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
  linkedin?: string;
  github?: string;
  portfolio?: string;
  collegeName?: string;
  department?: string;
  year?: string;
  cgpa?: string;
  phoneNumber?: string;
  about?: string;
  resume?: string;
}

export const CURRENT_USER: UserProfile = {
  id: 'u1',
  name: 'Alex Johnson',
  role: 'student',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  graduationYear: 2024,
  degree: 'B.S. Computer Science',
  skills: ['React', 'TypeScript', 'Node.js'],
  bio: 'Final year CS student looking for frontend internships.',
};

export const ALUMNI_DATA: UserProfile[] = [
  {
    id: 'a1',
    name: 'Sarah Chen',
    role: 'alumni',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    graduationYear: 2018,
    degree: 'B.S. Computer Science',
    company: 'TechFlow Inc.',
    position: 'Senior Software Engineer',
    skills: ['System Design', 'Cloud Architecture', 'Mentorship'],
    bio: 'Passionate about helping students break into tech.',
  },
  {
    id: 'a2',
    name: 'Michael Ross',
    role: 'alumni',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    graduationYear: 2015,
    degree: 'MBA',
    company: 'Global Finance',
    position: 'Product Manager',
    skills: ['Product Strategy', 'Agile', 'Leadership'],
    bio: 'MBA grad with 8 years of product experience.',
  },
  {
    id: 'a3',
    name: 'Emily Davis',
    role: 'graduate',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    graduationYear: 2023,
    degree: 'B.A. Marketing',
    company: 'Creative Agency',
    position: 'Marketing Associate',
    skills: ['Social Media', 'Content Creation', 'SEO'],
    bio: 'Recent grad navigating the marketing world.',
  },
  {
    id: 'a4',
    name: 'David Kim',
    role: 'alumni',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    graduationYear: 2012,
    degree: 'B.S. Electrical Engineering',
    company: 'PowerGrid Solutions',
    position: 'Director of Engineering',
    skills: ['Project Management', 'Hardware Design', 'Team Leadership'],
    bio: 'Engineering leader with a passion for sustainable energy.',
  },
  {
    id: 'f1',
    name: 'Dr. Jennifer Martinez',
    role: 'faculty',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    graduationYear: 2008,
    degree: 'Ph.D. Computer Science',
    company: 'University',
    position: 'Associate Professor',
    skills: ['Machine Learning', 'Research', 'Teaching'],
    bio: 'Passionate educator and researcher in AI.',
  }
];

export interface Job {
  id: string;
  title: string;
  company: string;
  type: 'Full-time' | 'Internship' | 'Contract';
  location: string;
  alumniId: string; // Alumni who posted this job
  postedDate: string;
  description: string;
}

export const JOBS_DATA: Job[] = [
  {
    id: 'j1',
    title: 'Frontend Developer Intern',
    company: 'TechFlow Inc.',
    type: 'Internship',
    location: 'Remote',
    alumniId: 'a1',
    postedDate: '2024-03-01',
    description: 'Looking for a motivated intern to help build our new dashboard.',
  },
  {
    id: 'j2',
    title: 'Associate Product Manager',
    company: 'Global Finance',
    type: 'Full-time',
    location: 'New York, NY',
    alumniId: 'a2',
    postedDate: '2024-02-28',
    description: 'Join our product team to lead fintech innovation.',
  },
  {
    id: 'j3',
    title: 'Junior Marketing Specialist',
    company: 'Creative Agency',
    type: 'Full-time',
    location: 'Austin, TX',
    alumniId: 'a3',
    postedDate: '2024-03-05',
    description: 'Great opportunity for recent grads interested in digital marketing.',
  }
];

export interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  type: 'Networking' | 'Workshop' | 'Webinar';
  alumniId: string; // Alumni who created this event
  image: string;
}

export const EVENTS_DATA: Event[] = [
  {
    id: 'e1',
    title: 'Annual Alumni Mixer',
    date: '2024-04-15',
    time: '6:00 PM',
    location: 'Grand Hall, University Center',
    type: 'Networking',
    alumniId: 'a1',
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'e2',
    title: 'Tech Career Workshop',
    date: '2024-03-25',
    time: '2:00 PM',
    location: 'Online (Zoom)',
    type: 'Workshop',
    alumniId: 'a4',
    image: 'https://images.unsplash.com/photo-1544531696-60c35eb65921?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'e3',
    title: 'Resume Review Session',
    date: '2024-03-20',
    time: '4:00 PM',
    location: 'Student Center, Room 204',
    type: 'Workshop',
    alumniId: 'f1',
  }
];

export interface Post {
  id: string;
  alumniId: string; // Alumni who created this post
  content: string;
  timestamp: string;
  type: 'general' | 'opportunity' | 'event';
  likes: number;
  comments: number;
  image?: string;
}

export const POSTS_DATA: Post[] = [
  {
    id: 'p1',
    alumniId: 'a1',
    content: 'Excited to announce that TechFlow Inc. is hiring! We\'re looking for talented Frontend Developers to join our team. If you\'re passionate about React and TypeScript, check out our careers page.',
    timestamp: '2 hours ago',
    type: 'opportunity',
    likes: 24,
    comments: 8,
  },
  {
    id: 'p2',
    alumniId: 'a2',
    content: 'Just wrapped up an amazing product strategy workshop with the team. Remember: user feedback is gold. Always listen to your customers!',
    timestamp: '5 hours ago',
    type: 'general',
    likes: 42,
    comments: 12,
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'p3',
    alumniId: 'a3',
    content: 'Looking for mentorship? I\'m happy to connect with students interested in marketing and content creation. Drop me a message!',
    timestamp: '1 day ago',
    type: 'general',
    likes: 67,
    comments: 15,
  },
  {
    id: 'p4',
    alumniId: 'a4',
    content: 'Attending the Tech Career Workshop next week? I\'ll be speaking about transitioning from engineering to leadership. Hope to see you there!',
    timestamp: '2 days ago',
    type: 'event',
    likes: 38,
    comments: 9,
    image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'p5',
    alumniId: 'a1',
    content: 'Throwback to the Annual Alumni Mixer last year! Can\'t believe it\'s already time for another one. Who else is excited for April?',
    timestamp: '3 days ago',
    type: 'event',
    likes: 55,
    comments: 21,
    image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
  },
];