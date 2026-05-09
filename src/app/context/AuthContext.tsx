import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { UserProfile, Role, Post, Job, Event, ALUMNI_DATA, POSTS_DATA, JOBS_DATA, EVENTS_DATA } from '../data/mock';

interface AuthContextType {
  user: UserProfile | null;
  login: (payload: Role | UserProfile | User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  role: Role | null;
  following: string[]; // Array of alumni IDs the user follows
  follow: (alumniId: string) => void;
  unfollow: (alumniId: string) => void;
  isFollowing: (alumniId: string) => boolean;
  // Data management
  alumni: UserProfile[]; // All alumni data
  posts: Post[];
  jobs: Job[];
  events: Event[];
  addPost: (post: Omit<Post, 'id' | 'timestamp'>) => void;
  addJob: (job: Omit<Job, 'id' | 'postedDate'>) => void;
  addEvent: (event: Omit<Event, 'id'>) => void;
  getAlumniById: (id: string) => UserProfile | undefined;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [following, setFollowing] = useState<string[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [alumni] = useState<UserProfile[]>(ALUMNI_DATA); // Static alumni data

  // Load data from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('allumini_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser) as UserProfile);
      } catch {
        localStorage.removeItem('allumini_user');
      }
    }

    const savedFollowing = localStorage.getItem('allumini_following');
    if (savedFollowing) {
      try {
        setFollowing(JSON.parse(savedFollowing) as string[]);
      } catch {
        localStorage.removeItem('allumini_following');
      }
    }

    const savedEvents = localStorage.getItem('allumini_events');
    if (savedEvents) {
      try {
        setEvents(JSON.parse(savedEvents) as Event[]);
      } catch {
        localStorage.removeItem('allumini_events');
      }
    } else {
      // Initialize with sample data if no saved data exists
      setEvents(EVENTS_DATA);
      localStorage.setItem('allumini_events', JSON.stringify(EVENTS_DATA));
    }

    const savedJobs = localStorage.getItem('allumini_jobs');
    if (savedJobs) {
      try {
        setJobs(JSON.parse(savedJobs) as Job[]);
      } catch {
        localStorage.removeItem('allumini_jobs');
      }
    } else {
      // Initialize with sample data if no saved data exists
      setJobs(JOBS_DATA);
      localStorage.setItem('allumini_jobs', JSON.stringify(JOBS_DATA));
    }

    const savedPosts = localStorage.getItem('allumini_posts');
    if (savedPosts) {
      try {
        setPosts(JSON.parse(savedPosts) as Post[]);
      } catch {
        localStorage.removeItem('allumini_posts');
      }
    } else {
      // Initialize with sample data if no saved data exists
      setPosts(POSTS_DATA);
      localStorage.setItem('allumini_posts', JSON.stringify(POSTS_DATA));
    }
  }, []);

  const getSavedUserProfile = (email?: string, id?: string): UserProfile | null => {
    const savedUser = localStorage.getItem('allumini_user');
    if (!savedUser) return null;

    try {
      const parsed = JSON.parse(savedUser) as UserProfile;
      if (
        (email && parsed.email?.toLowerCase() === email.toLowerCase()) ||
        (id && parsed.id === id)
      ) {
        return parsed;
      }
    } catch {
      localStorage.removeItem('allumini_user');
    }

    return null;
  };

  const login = (payload: Role | UserProfile | User) => {
    if (typeof payload === 'string') {
      // Handle Role
      const savedUser = localStorage.getItem('allumini_user');
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser) as UserProfile;
          if (parsed.role === payload) {
            setUser(parsed);
            localStorage.setItem('allumini_user', JSON.stringify(parsed));
            localStorage.setItem('allumini_role', parsed.role);
            return;
          }
        } catch {
          localStorage.removeItem('allumini_user');
        }
      }

      const fallbackUser: UserProfile = {
        id: `u-${payload}-${Date.now()}`,
        name: '',
        role: payload,
        avatar: 'https://ui-avatars.com/api/?name=User&background=FDE68A&color=111827&size=256',
        graduationYear: new Date().getFullYear(),
        degree: '',
        skills: [],
        email: '',
        phone: '',
      };

      setUser(fallbackUser);
      localStorage.setItem('allumini_user', JSON.stringify(fallbackUser));
      localStorage.setItem('allumini_role', fallbackUser.role);
      return;
    }

    // Check if it's a Supabase User
    if ('email' in payload && 'id' in payload && !('role' in payload)) {
      const savedProfile = getSavedUserProfile(payload.email, payload.id);
      if (savedProfile) {
        setUser(savedProfile);
        localStorage.setItem('allumini_user', JSON.stringify(savedProfile));
        localStorage.setItem('allumini_role', savedProfile.role);
        return;
      }

      // Convert Supabase User to UserProfile
      const userProfile: UserProfile = {
        id: payload.id,
        name: payload.user_metadata?.name || payload.email?.split('@')[0] || 'User',
        role: payload.user_metadata?.role || 'alumni',
        avatar:
          payload.user_metadata?.avatar_url ||
          'https://ui-avatars.com/api/?name=User&background=FDE68A&color=111827&size=256',
        graduationYear: new Date().getFullYear(),
        degree: '',
        skills: [],
        email: payload.email,
      };
      setUser(userProfile);
      localStorage.setItem('allumini_user', JSON.stringify(userProfile));
      localStorage.setItem('allumini_role', userProfile.role);
      return;
    }

    // Handle UserProfile
    if ('role' in payload && typeof payload.role === 'string') {
      setUser(payload as UserProfile);
      localStorage.setItem('allumini_user', JSON.stringify(payload));
      localStorage.setItem('allumini_role', payload.role);
      return;
    }

    // If it's a Supabase User that wasn't caught above, convert it
    if ('email' in payload && 'id' in payload) {
      const userProfile: UserProfile = {
        id: payload.id,
        name: payload.user_metadata?.name || payload.email?.split('@')[0] || 'User',
        role: 'alumni',
        avatar: payload.user_metadata?.avatar_url || 'https://ui-avatars.com/api/?name=User&background=FDE68A&color=111827&size=256',
        graduationYear: new Date().getFullYear(),
        degree: '',
        skills: [],
        email: payload.email,
      };
      setUser(userProfile);
      localStorage.setItem('allumini_user', JSON.stringify(userProfile));
      localStorage.setItem('allumini_role', userProfile.role);
    }
  };

  const follow = (alumniId: string) => {
    if (!following.includes(alumniId)) {
      const newFollowing = [...following, alumniId];
      setFollowing(newFollowing);
      localStorage.setItem('allumini_following', JSON.stringify(newFollowing));
    }
  };

  const unfollow = (alumniId: string) => {
    const newFollowing = following.filter(id => id !== alumniId);
    setFollowing(newFollowing);
    localStorage.setItem('allumini_following', JSON.stringify(newFollowing));
  };

  const isFollowing = (alumniId: string) => {
    return following.includes(alumniId);
  };

  const addPost = (postData: Omit<Post, 'id' | 'timestamp'>) => {
    const newPost: Post = {
      ...postData,
      id: `p-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    const newPosts = [...posts, newPost];
    setPosts(newPosts);
    localStorage.setItem('allumini_posts', JSON.stringify(newPosts));
  };

  const addJob = (jobData: Omit<Job, 'id' | 'postedDate'>) => {
    const newJob: Job = {
      ...jobData,
      id: `j-${Date.now()}`,
      postedDate: new Date().toISOString().split('T')[0],
    };
    const newJobs = [...jobs, newJob];
    setJobs(newJobs);
    localStorage.setItem('allumini_jobs', JSON.stringify(newJobs));
  };

  const addEvent = (eventData: Omit<Event, 'id'>) => {
    const newEvent: Event = {
      ...eventData,
      id: `e-${Date.now()}`,
    };
    const newEvents = [...events, newEvent];
    setEvents(newEvents);
    localStorage.setItem('allumini_events', JSON.stringify(newEvents));
  };

  const getAlumniById = (id: string) => {
    return alumni.find(a => a.id === id);
  };

  const logout = () => {
    setUser(null);
    setFollowing([]);
    localStorage.removeItem('allumini_role');
    localStorage.removeItem('allumini_user');
    localStorage.removeItem('allumini_following');
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isAuthenticated: !!user,
      role: user?.role || null,
      following,
      follow,
      unfollow,
      isFollowing,
      alumni,
      posts,
      jobs,
      events,
      addPost,
      addJob,
      addEvent,
      getAlumniById
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}