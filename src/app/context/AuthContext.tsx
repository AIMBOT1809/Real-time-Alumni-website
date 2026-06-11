import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { User } from '@supabase/supabase-js';
import { UserProfile, Role, Post, Job, Event } from '../data/types';

interface AuthContextType {
  user: UserProfile | null;
  login: (payload: UserProfile | User) => Promise<void>;
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
  addPost: (post: Omit<Post, 'id' | 'timestamp'>) => Promise<void>;
  addJob: (job: Omit<Job, 'id' | 'postedDate'>) => void;
  addEvent: (event: Omit<Event, 'id'>) => void;
  deletePost: (id: string) => void;
  deleteJob: (id: string) => void;
  deleteEvent: (id: string) => void;
  getAlumniById: (id: string) => UserProfile | undefined;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [following, setFollowing] = useState<string[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [alumni, setAlumni] = useState<UserProfile[]>([]);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('allumini_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser) as UserProfile;
        setUser(parsed);

        // Attempt to reconcile with latest profile from DB by user_id first, fallback to Email_Address
        (async () => {
          try {
            if (parsed.id || parsed.email) {
              console.log('[AuthContext] Reconciling saved user with DB profile for', { id: parsed.id, email: parsed.email });

              let profileData: any = null;
              let profileError: any = null;

              if (parsed.id) {
                const res = await supabase
                  .from('alumni_profiles')
                  .select('*')
                  .eq('user_id', parsed.id)
                  .maybeSingle();
                profileData = res.data;
                profileError = res.error;
                if (profileError) console.warn('[AuthContext] Profile fetch by user_id error:', profileError.message, profileError);
              }

              if (!profileData && parsed.email) {
                const res2 = await supabase
                  .from('alumni_profiles')
                  .select('*')
                  .ilike('Email_Address', parsed.email)
                  .maybeSingle();
                profileData = res2.data;
                profileError = res2.error;
                if (profileError) console.warn('[AuthContext] Profile fetch by email error:', profileError.message, profileError);
              }

              if (profileError) {
                // already logged above
              } else if (profileData) {
                const firstName = profileData.First_Name || profileData.first_name || '';
                const lastName = profileData.Last_name || profileData.last_name || '';
                const fullName = `${firstName} ${lastName}`.trim() || parsed.name;

                const reconciled: UserProfile = {
                  ...parsed,
                  id: parsed.id,
                  name: fullName,
                  avatar: profileData.Photo_URL || profileData.photo_url || parsed.avatar,
                  collegeName: profileData.College_Name || profileData.college_name || parsed.collegeName,
                  rollNumber: profileData.Roll_Number || profileData.roll_number || parsed.rollNumber,
                  department: profileData.Department || profileData.department || parsed.department,
                  year:
                    profileData.Passed_Out_Year || profileData.passed_out_year ||
                    profileData.Year_of_Joining || parsed.year || '',
                  email: parsed.email,
                  phone: profileData.Phone_Number || profileData.phone || parsed.phone,
                  about: profileData.About || profileData.about || parsed.about,
                  linkedin:
                    profileData.LinkedIn_Profile_URL || profileData.linkedin || parsed.linkedin,
                  resume: profileData.Resume_URL || profileData.resume || parsed.resume,
                  links: parsed.links || [],
                };

                setUser(reconciled);
                localStorage.setItem('allumini_user', JSON.stringify(reconciled));
                console.log('[AuthContext] Reconciled user profile stored to localStorage');
              } else {
                console.log('[AuthContext] No DB profile found for saved user');
              }
            }
          } catch (err) {
            console.error('[AuthContext] Error reconciling saved user profile:', err);
          }
        })();
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

    const savedAlumni = localStorage.getItem('allumini_alumni');
    if (savedAlumni) {
      try {
        setAlumni(JSON.parse(savedAlumni) as UserProfile[]);
      } catch {
        localStorage.removeItem('allumini_alumni');
      }
    }

    const savedEvents = localStorage.getItem('allumini_events');
    if (savedEvents) {
      try {
        setEvents(JSON.parse(savedEvents) as Event[]);
      } catch {
        localStorage.removeItem('allumini_events');
      }
    }

    const savedJobs = localStorage.getItem('allumini_jobs');
    if (savedJobs) {
      try {
        setJobs(JSON.parse(savedJobs) as Job[]);
      } catch {
        localStorage.removeItem('allumini_jobs');
      }
    }

    const savedPosts = localStorage.getItem('allumini_posts');
    if (savedPosts) {
      try {
        setPosts(JSON.parse(savedPosts) as Post[]);
      } catch {
        localStorage.removeItem('allumini_posts');
      }
    }
  }, []);

  // Fetch alumni profiles from Supabase on load and keep in sync
  useEffect(() => {
    let mounted = true;
    let channel: any = null;

    const fetchAlumni = async () => {
      try {
        console.log('[AuthContext] Fetching alumni_profiles from Supabase...');
        const { data, error } = await supabase.from('alumni_profiles').select('*');
        if (error) {
          console.error('[AuthContext] Error fetching alumni_profiles:', {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint,
          });
          if (mounted) {
            setAlumni([]);
            localStorage.removeItem('allumini_alumni');
          }
          // If error looks like permission / RLS issue, warn explicitly
          if (error.message && /permission|policy|unauthorized/i.test(error.message)) {
            console.warn('[AuthContext] Possible RLS/permission issue when reading alumni_profiles. Check table policies and anon/public key permissions.');
          }
          return;
        }

        if (!data) {
          console.log('[AuthContext] No alumni_profiles rows returned');
          if (mounted) {
            setAlumni([]);
            localStorage.setItem('allumini_alumni', JSON.stringify([]));
          }
          return;
        }

        console.log('[AuthContext] alumni_profiles fetched, count =', data.length);
        if (mounted) {
          // Normalize records to UserProfile-ish objects where possible
          const mapped = data.map((r: any) => ({
            id: String(r.user_id ?? r.id ?? r.Email_Address ?? r.email ?? `u-${Date.now()}`),
            name: ((`${r.First_Name ?? r.first_name ?? ''} ${r.Last_name ?? r.last_name ?? ''}`).trim()) || (r.Email_Address ?? r.email) || 'Unknown',
            avatar: (r.Photo_URL ?? r.photo_url ?? r.avatar_url) || `https://ui-avatars.com/api/?name=${encodeURIComponent((r.First_Name ?? r.first_name ?? r.Email_Address ?? 'User'))}&background=FDE68A&color=111827&size=128`,
            collegeName: r.College_Name ?? r.college_name ?? '',
            department: r.Department ?? r.department ?? '',
            year: r.Passed_Out_Year ?? r.passed_out_year ?? r.Year_of_Joining ?? '',
            email: r.Email_Address ?? r.email ?? undefined,
          }));

          setAlumni(mapped as any);
          localStorage.setItem('allumini_alumni', JSON.stringify(mapped));
          console.log('[AuthContext] setAlumni called, alumni.length =', mapped.length);
        }
      } catch (err) {
        console.error('[AuthContext] Unexpected error fetching alumni_profiles:', err);
      }
    };

    fetchAlumni();

    // Realtime subscription for changes to alumni_profiles to keep local cache fresh
    try {
      channel = supabase
        .channel('public:alumni_profiles')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'alumni_profiles' }, (payload) => {
          console.log('[AuthContext] Realtime update for alumni_profiles:', payload);
          fetchAlumni();
        })
        .subscribe((status, err) => {
          if (status === 'SUBSCRIBED') console.log('[AuthContext] Realtime channel subscribed for alumni_profiles');
          if (err) console.error('[AuthContext] Realtime channel error:', err);
        });
    } catch (err) {
      console.error('[AuthContext] Failed to create realtime channel for alumni_profiles:', err);
    }

    return () => {
      mounted = false;
      try {
        if (channel) channel.unsubscribe();
      } catch (e) {
        // ignore
      }
    };
  }, []);

  // Fetch posts from Supabase and subscribe to realtime updates
  useEffect(() => {
    let mounted = true;
    let channel: any = null;

    const fetchPosts = async () => {
      try {
        console.log('[AuthContext] Fetching posts from Supabase...');
        const { data, error } = await supabase.from('posts').select('*').order('timestamp', { ascending: false });
        if (error) {
          console.error('[AuthContext] Error fetching posts:', error.message, error);
          if (mounted) {
            setPosts([]);
            localStorage.removeItem('allumini_posts');
          }
          return;
        }

        if (!data) {
          if (mounted) {
            setPosts([]);
            localStorage.setItem('allumini_posts', JSON.stringify([]));
          }
          return;
        }

        // Normalize rows to Post type where possible
        const mapped = data.map((r: any) => ({
          id: String(r.id ?? r.ID ?? `p-${Date.now()}`),
          alumniId: r.alumni_id ?? r.alumniId ?? r.user_id ?? String(r.alumniId ?? 'unknown'),
          title: r.title ?? r.Title ?? undefined,
          content: r.content ?? r.body ?? r.description ?? '',
          timestamp: r.timestamp ?? r.created_at ?? new Date().toISOString(),
          type: (r.type as any) || 'general',
          likes: Number(r.likes ?? 0),
          comments: Number(r.comments ?? 0),
          image: r.image ?? r.image_url ?? undefined,
          file: r.file ?? undefined,
        }));

        if (mounted) {
          setPosts(mapped as Post[]);
          try { localStorage.setItem('allumini_posts', JSON.stringify(mapped)); } catch {}
          console.log('[AuthContext] posts loaded, count =', mapped.length);
        }
      } catch (err) {
        console.error('[AuthContext] Unexpected error fetching posts:', err);
      }
    };

    fetchPosts();

    try {
      channel = supabase
        .channel('public:posts')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, (payload) => {
          console.log('[AuthContext] Realtime update for posts:', payload);
          fetchPosts();
        })
        .subscribe((status, err) => {
          if (status === 'SUBSCRIBED') console.log('[AuthContext] Realtime channel subscribed for posts');
          if (err) console.error('[AuthContext] Realtime channel error (posts):', err);
        });
    } catch (err) {
      console.error('[AuthContext] Failed to create realtime channel for posts:', err);
    }

    return () => {
      mounted = false;
      try { if (channel) channel.unsubscribe(); } catch (e) {}
    };
  }, []);

  const getSavedUserProfile = (email?: string, id?: string): UserProfile | null => {
    const savedUser = localStorage.getItem('allumini_user');
    if (!savedUser) return null;

    try {
      const parsed = JSON.parse(savedUser) as UserProfile;
      if (
        (id && parsed.id === id) ||
        (email && parsed.email && parsed.email.toLowerCase() === email.toLowerCase())
      ) {
        return parsed;
      }
    } catch {
      localStorage.removeItem('allumini_user');
    }

    return null;
  };

  const login = async (payload: UserProfile | User) => {
    console.log('[AuthContext] login() payload received:', payload);
    // Check if it's a Supabase User
    if ('email' in payload && 'id' in payload && !('role' in payload)) {
      const savedProfile = getSavedUserProfile(payload.email, payload.id);
      if (savedProfile) {
        // Prefer fresh DB profile by user_id if available
        try {
          const res = await supabase.from('alumni_profiles').select('*').eq('user_id', payload.id).maybeSingle();
          const dbProfile = res.data || null;
          if (dbProfile) {
            const firstName = dbProfile.First_Name || dbProfile.first_name || '';
            const lastName = dbProfile.Last_name || dbProfile.last_name || '';
            const fullName = `${firstName} ${lastName}`.trim() || savedProfile.name;
            const merged: UserProfile = {
              ...savedProfile,
              name: fullName,
              avatar: dbProfile.Photo_URL || dbProfile.photo_url || savedProfile.avatar,
              collegeName: dbProfile.College_Name || dbProfile.college_name || savedProfile.collegeName,
              rollNumber: dbProfile.Roll_Number || dbProfile.roll_number || savedProfile.rollNumber,
              department: dbProfile.Department || dbProfile.department || savedProfile.department,
              year: dbProfile.Passed_Out_Year || dbProfile.passed_out_year || dbProfile.Year_of_Joining || savedProfile.year || '',
              email: savedProfile.email || dbProfile.Email_Address || dbProfile.email,
              phone: dbProfile.Phone_Number || dbProfile.phone || savedProfile.phone,
              about: dbProfile.About || dbProfile.about || savedProfile.about,
              linkedin: dbProfile.LinkedIn_Profile_URL || dbProfile.linkedin || savedProfile.linkedin,
              resume: dbProfile.Resume_URL || dbProfile.resume || savedProfile.resume,
              skills: savedProfile.skills?.length ? savedProfile.skills : (dbProfile.Skills || []),
              links: savedProfile.links?.length ? savedProfile.links : (dbProfile.Links || []),
            };
            setUser(merged);
            localStorage.setItem('allumini_user', JSON.stringify(merged));
            localStorage.setItem('allumini_role', merged.role);
            console.log('[AuthContext] Applied savedProfile merged with DB profile for login');
            return;
          }
        } catch (err) {
          console.error('[AuthContext] Error fetching DB profile by user_id for savedProfile merge:', err);
        }

        setUser(savedProfile);
        localStorage.setItem('allumini_user', JSON.stringify(savedProfile));
        localStorage.setItem('allumini_role', savedProfile.role);

        console.log('[AuthContext] Saved profile found for login payload, applying saved profile and refreshing from DB if needed', {
          email: payload.email,
          id: payload.id,
        });

        // Refresh stale saved profile from DB in the background (email fallback)
        (async () => {
          if (!payload.email) return;
          try {
            const { data: profileData, error: profileError } = await supabase
              .from('alumni_profiles')
              .select('*')
              .ilike('Email_Address', payload.email)
              .maybeSingle();

            if (profileError) {
              console.warn('[AuthContext] Background profile refresh failed:', profileError.message, profileError.code, profileError);
              return;
            }

            if (!profileData) return;

            const firstName = profileData.First_Name || profileData.first_name || '';
            const lastName = profileData.Last_name || profileData.last_name || '';
            const fullName = `${firstName} ${lastName}`.trim() || savedProfile.name;

            const refreshed: UserProfile = {
              ...savedProfile,
              name: fullName,
              avatar: profileData.Photo_URL || profileData.photo_url || savedProfile.avatar,
              collegeName: profileData.College_Name || profileData.college_name || savedProfile.collegeName,
              rollNumber: profileData.Roll_Number || profileData.roll_number || savedProfile.rollNumber,
              department: profileData.Department || profileData.department || savedProfile.department,
              year:
                profileData.Passed_Out_Year || profileData.passed_out_year ||
                profileData.Year_of_Joining || savedProfile.year || '',
              phone: profileData.Phone_Number || profileData.phone || savedProfile.phone,
              about: profileData.About || profileData.about || savedProfile.about,
              linkedin: profileData.LinkedIn_Profile_URL || profileData.linkedin || savedProfile.linkedin,
              resume: profileData.Resume_URL || profileData.resume || savedProfile.resume,
            };

            setUser(refreshed);
            localStorage.setItem('allumini_user', JSON.stringify(refreshed));
          } catch (err) {
            console.error('[AuthContext] Background profile refresh exception:', err);
          }
        })();

        return;
      }

      // No saved profile: attempt to fetch DB profile by user_id right away
      try {
        const res = await supabase.from('alumni_profiles').select('*').eq('user_id', payload.id).maybeSingle();
        if (res.error) console.warn('[AuthContext] profile fetch by user_id error:', res.error.message);
        if (res.data) {
          const profileData = res.data;
          const firstName = profileData.First_Name || profileData.first_name || '';
          const lastName = profileData.Last_name || profileData.last_name || '';
          const fullName = `${firstName} ${lastName}`.trim() || payload.user_metadata?.name || payload.email?.split('@')[0] || 'User';

          const userProfile: UserProfile = {
            id: payload.id,
            name: fullName,
            role: payload.user_metadata?.role || 'alumni',
            avatar: profileData.Photo_URL || profileData.photo_url || payload.user_metadata?.avatar_url || 'https://ui-avatars.com/api/?name=User&background=FDE68A&color=111827&size=256',
            graduationYear: Number(profileData.Passed_Out_Year) || new Date().getFullYear(),
            degree: profileData.Department || '',
            skills: profileData.Skills || [],
            email: payload.email,
            phone: profileData.Phone_Number || undefined,
            collegeName: profileData.College_Name || undefined,
            rollNumber: profileData.Roll_Number || undefined,
            department: profileData.Department || undefined,
            year: profileData.Passed_Out_Year || profileData.Year_of_Joining || undefined,
            about: profileData.About || undefined,
            linkedin: profileData.LinkedIn_Profile_URL || undefined,
            resume: profileData.Resume_URL || undefined,
            links: profileData.Links || undefined,
            profileComplete: Boolean(profileData.College_Name || profileData.Roll_Number || profileData.Department || profileData.About),
          };

          setUser(userProfile);
          localStorage.setItem('allumini_user', JSON.stringify(userProfile));
          localStorage.setItem('allumini_role', userProfile.role);
          console.log('[AuthContext] Applied DB profile for login by user_id');
          return;
        }
      } catch (err) {
        console.error('[AuthContext] Error fetching profile by user_id during login:', err);
      }

      // Reset to fresh fallback profile, then refresh from DB if available
      const fallbackUserProfile: UserProfile = {
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
      setUser(fallbackUserProfile);
      localStorage.setItem('allumini_user', JSON.stringify(fallbackUserProfile));
      localStorage.setItem('allumini_role', fallbackUserProfile.role);

      (async () => {
        try {
          let profileData: any = null;
          let profileError: any = null;
          if (payload.id) {
            const res = await supabase.from('alumni_profiles').select('*').eq('user_id', payload.id).maybeSingle();
            profileData = res.data;
            profileError = res.error;
            if (profileError) console.warn('[AuthContext] Background refresh (fallback) by user_id error:', profileError.message, profileError);
          }
          if (!profileData && payload.email) {
            const res2 = await supabase.from('alumni_profiles').select('*').ilike('Email_Address', payload.email).maybeSingle();
            profileData = res2.data;
            profileError = res2.error;
            if (profileError) console.warn('[AuthContext] Background refresh (fallback) by email error:', profileError.message, profileError);
          }

          if (!profileData) return;

          const firstName = profileData.First_Name || profileData.first_name || '';
          const lastName = profileData.Last_name || profileData.last_name || '';
          const fullName = `${firstName} ${lastName}`.trim() || fallbackUserProfile.name;

          const refreshed: UserProfile = {
            ...fallbackUserProfile,
            name: fullName,
            avatar: profileData.Photo_URL || profileData.photo_url || fallbackUserProfile.avatar,
            collegeName: profileData.College_Name || profileData.college_name || fallbackUserProfile.collegeName,
            rollNumber: profileData.Roll_Number || profileData.roll_number || fallbackUserProfile.rollNumber,
            department: profileData.Department || profileData.department || fallbackUserProfile.department,
            year:
              profileData.Passed_Out_Year || profileData.passed_out_year ||
              profileData.Year_of_Joining || fallbackUserProfile.year || '',
            phone: profileData.Phone_Number || profileData.phone || fallbackUserProfile.phone,
            about: profileData.About || profileData.about || fallbackUserProfile.about,
            linkedin: profileData.LinkedIn_Profile_URL || profileData.linkedin || fallbackUserProfile.linkedin,
            resume: profileData.Resume_URL || profileData.resume || fallbackUserProfile.resume,
          };

          setUser(refreshed);
          localStorage.setItem('allumini_user', JSON.stringify(refreshed));
          console.log('[AuthContext] Background refreshed profile saved (fallback path)');
        } catch (err) {
          console.error('[AuthContext] Background profile refresh exception:', err);
        }
      })();

      return;
    }

    // Handle UserProfile
    if ('role' in payload && typeof payload.role === 'string') {
      console.log('[AuthContext] login() detected UserProfile payload; attempting to enrich from DB by user_id/email.', {
        id: payload.id,
        email: payload.email,
        role: payload.role,
      });
      (async () => {
        try {
          let dbProfile: any = null;
          if (payload.id) {
            const res = await supabase.from('alumni_profiles').select('*').eq('user_id', payload.id).maybeSingle();
            if (res.error) console.warn('[AuthContext] DB profile fetch by user_id error:', res.error.message);
            dbProfile = res.data || null;
          }
          if (!dbProfile && payload.email) {
            const res2 = await supabase.from('alumni_profiles').select('*').ilike('Email_Address', payload.email).maybeSingle();
            if (res2.error) console.warn('[AuthContext] DB profile fetch by email error:', res2.error.message);
            dbProfile = res2.data || null;
          }

          const toStore: UserProfile = {
            ...(payload as UserProfile),
          } as UserProfile;

          if (dbProfile) {
            const firstName = dbProfile.First_Name || dbProfile.first_name || '';
            const lastName = dbProfile.Last_name || dbProfile.last_name || '';
            const fullName = `${firstName} ${lastName}`.trim() || toStore.name;

            toStore.name = fullName;
            toStore.avatar = dbProfile.Photo_URL || dbProfile.photo_url || toStore.avatar;
            toStore.collegeName = dbProfile.College_Name || dbProfile.college_name || toStore.collegeName;
            toStore.rollNumber = dbProfile.Roll_Number || dbProfile.roll_number || toStore.rollNumber;
            toStore.department = dbProfile.Department || dbProfile.department || toStore.department;
            toStore.year = dbProfile.Passed_Out_Year || dbProfile.passed_out_year || dbProfile.Year_of_Joining || toStore.year || '';
            toStore.email = toStore.email || dbProfile.Email_Address || dbProfile.email;
            toStore.phone = dbProfile.Phone_Number || dbProfile.phone || toStore.phone;
            toStore.about = dbProfile.About || dbProfile.about || toStore.about;
            toStore.linkedin = dbProfile.LinkedIn_Profile_URL || dbProfile.linkedin || toStore.linkedin;
            toStore.resume = dbProfile.Resume_URL || dbProfile.resume || toStore.resume;
            toStore.skills = toStore.skills?.length ? toStore.skills : (dbProfile.Skills ? dbProfile.Skills : toStore.skills || []);
            toStore.links = toStore.links?.length ? toStore.links : (dbProfile.Links ? dbProfile.Links : toStore.links || []);
            toStore.profileComplete = Boolean(toStore.collegeName || toStore.rollNumber || toStore.department || toStore.about);
          } else {
            // Ensure id exists
            toStore.id = toStore.id || (toStore.email ? toStore.email.split('@')[0] : `u-${Date.now()}`);
            toStore.profileComplete = false;
          }

          setUser(toStore);
          localStorage.setItem('allumini_user', JSON.stringify(toStore));
          localStorage.setItem('allumini_role', toStore.role);
          console.log('[AuthContext] Stored user after enrichment:', toStore);
        } catch (err) {
          console.error('[AuthContext] Error enriching/storing UserProfile payload:', err);
          // fallback to minimal store
          const toStore = payload as UserProfile;
          toStore.id = toStore.id || (toStore.email ? toStore.email.split('@')[0] : `u-${Date.now()}`);
          setUser(toStore);
          localStorage.setItem('allumini_user', JSON.stringify(toStore));
          localStorage.setItem('allumini_role', toStore.role);
        }
      })();
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

  const addPost = async (postData: Omit<Post, 'id' | 'timestamp'>) => {
    if (!user || user.role === 'student') return;

    try {
      let imageUrl: string | undefined = undefined;
      let fileUrl: string | undefined = undefined;

      // If image is a data URL, convert to blob and upload
      if (postData.image && postData.image.startsWith('data:')) {
        const matches = postData.image.match(/^data:(.*);base64,(.*)$/);
        if (matches) {
          const mime = matches[1];
          const b64 = matches[2];
          const byteChars = atob(b64);
          const byteNumbers = new Array(byteChars.length);
          for (let i = 0; i < byteChars.length; i++) {
            byteNumbers[i] = byteChars.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: mime });
          const path = `posts/${user.id}-${Date.now()}`;
          const uploadRes = await supabase.storage.from('posts').upload(path, blob as any, { cacheControl: '3600', upsert: false });
          if (uploadRes.error) {
            console.warn('[AuthContext] Storage upload error:', uploadRes.error.message);
          } else {
            const publicUrl = supabase.storage.from('posts').getPublicUrl(path).data.publicUrl;
            imageUrl = publicUrl;
          }
        }
      }

      // Insert into posts table
      const insertRow: any = {
        alumni_id: user.id,
        title: (postData as any).title ?? null,
        content: postData.content,
        type: postData.type,
        likes: postData.likes ?? 0,
        comments: postData.comments ?? 0,
        image: imageUrl ?? postData.image ?? null,
        file: fileUrl ?? null,
        timestamp: new Date().toISOString(),
      };

      const { data, error } = await supabase.from('posts').insert([insertRow]).select();
      if (error) {
        console.error('[AuthContext] Error inserting post into DB:', error.message, error);
        // fallback to local state
        const fallbackPost: Post = {
          id: `p-${Date.now()}`,
          alumniId: user.id,
          title: (postData as any).title,
          content: postData.content,
          timestamp: new Date().toISOString(),
          type: postData.type,
          likes: postData.likes ?? 0,
          comments: postData.comments ?? 0,
          image: imageUrl ?? (postData.image as any) ?? undefined,
        };
        setPosts(prev => [fallbackPost, ...prev]);
        try { localStorage.setItem('allumini_posts', JSON.stringify([fallbackPost, ...posts])); } catch {}
        return;
      }

      // Successfully inserted; fetchPosts real-time subscription will sync. Still update local state optimistically
      if (data && data[0]) {
        const row = data[0];
        const newPost: Post = {
          id: String(row.id ?? `p-${Date.now()}`),
          alumniId: row.alumni_id ?? user.id,
          title: row.title ?? undefined,
          content: row.content ?? '',
          timestamp: row.timestamp ?? row.created_at ?? new Date().toISOString(),
          type: row.type ?? 'general',
          likes: Number(row.likes ?? 0),
          comments: Number(row.comments ?? 0),
          image: row.image ?? undefined,
          file: row.file ?? undefined,
        };
        setPosts(prev => [newPost, ...prev]);
        try { localStorage.setItem('allumini_posts', JSON.stringify([newPost, ...posts])); } catch {}
      }
    } catch (err) {
      console.error('[AuthContext] addPost unexpected error:', err);
    }
  };

  const addJob = (jobData: Omit<Job, 'id' | 'postedDate'>) => {
    if (user?.role !== 'admin') return;

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
    if (user?.role !== 'admin') return;

    const newEvent: Event = {
      ...eventData,
      id: `e-${Date.now()}`,
    };
    const newEvents = [...events, newEvent];
    setEvents(newEvents);
    localStorage.setItem('allumini_events', JSON.stringify(newEvents));
  };

  const deletePost = (id: string) => {
    if (user?.role !== 'admin') return;
    const newPosts = posts.filter(post => post.id !== id);
    setPosts(newPosts);
    localStorage.setItem('allumini_posts', JSON.stringify(newPosts));
  };

  const deleteJob = (id: string) => {
    if (user?.role !== 'admin') return;
    const newJobs = jobs.filter(job => job.id !== id);
    setJobs(newJobs);
    localStorage.setItem('allumini_jobs', JSON.stringify(newJobs));
  };

  const deleteEvent = (id: string) => {
    if (user?.role !== 'admin') return;
    const newEvents = events.filter(event => event.id !== id);
    setEvents(newEvents);
    localStorage.setItem('allumini_events', JSON.stringify(newEvents));
  };

  const getAlumniById = (id: string) => {
    if (id === user?.id) {
      return user;
    }

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
      deletePost,
      deleteJob,
      deleteEvent,
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