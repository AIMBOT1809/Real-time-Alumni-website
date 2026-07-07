import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../../supabaseClient';
import { User } from '@supabase/supabase-js';
import { UserProfile, Role, Post, Job, Event, PostComment, AdminPost, AdminPostLike, AdminPostComment, Notification } from '../data/types';
import { getLocalPosts, addLocalPost, updateLocalPost, deleteLocalPost, getApprovedPosts, getPostsByAuthor } from '../data/localStoragePosts';
import { showGlobalToast } from '../components/Toast';

interface AuthContextType {
  user: UserProfile | null;
  login: (payload: UserProfile | User) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  role: Role | null;
  following: string[];
  follow: (alumniId: string) => void;
  unfollow: (alumniId: string) => void;
  isFollowing: (alumniId: string) => boolean;
  alumni: UserProfile[];
  posts: Post[];
  jobs: Job[];
  events: Event[];
  adminPosts: AdminPost[];
  addPost: (post: Omit<Post, 'id' | 'timestamp' | 'status'>) => Promise<void>;
  addJob: (jobData: Omit<Job, 'id' | 'postedDate'>) => void;
  addEvent: (eventData: Omit<Event, 'id'>) => void;
  likePost: (postId: string) => Promise<boolean>;
  likeAdminPost: (adminPostId: string) => Promise<boolean>;
  commentPost: (postId: string, commentText: string, parentCommentId?: string) => Promise<void>;
  commentAdminPost: (adminPostId: string, commentText: string, parentCommentId?: string) => Promise<void>;
  deleteComment: (commentId: string, postId: string) => Promise<void>;
  deleteAdminPostComment: (commentId: string, adminPostId: string) => Promise<void>;
  getPostComments: (postId: string) => Promise<PostComment[]>;
  getAdminPostComments: (adminPostId: string) => Promise<AdminPostComment[]>;
  hasUserLikedPost: (postId: string) => Promise<boolean>;
  hasUserLikedAdminPost: (adminPostId: string) => Promise<boolean>;
  sharePost: (postId: string) => Promise<void>;
  shareAdminPost: (adminPostId: string) => Promise<void>;
  notifications: Notification[];
  unreadNotificationCount: number;
  fetchNotifications: () => Promise<void>;
  markNotificationRead: (notificationId: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  editPost: (postId: string, updates: Partial<Post>) => Promise<void>;
  deletePost: (id: string) => void;
  deleteJob: (id: string) => void;
  deleteEvent: (id: string) => void;
  getAlumniById: (id: string) => UserProfile | undefined;
  localPosts: Post[];
  approveLocalPost: (postId: string) => void;
  rejectLocalPost: (postId: string, reason: string) => void;
  getLocalPostsByAuthor: (authorId: string) => Post[];
  fetchAdminPosts: () => Promise<void>;
}
//hello
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [following, setFollowing] = useState<string[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [alumni, setAlumni] = useState<UserProfile[]>([]);
  const [localPosts, setLocalPosts] = useState<Post[]>([]);
  const [adminPosts, setAdminPosts] = useState<AdminPost[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const savedUser = localStorage.getItem('allumini_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser) as UserProfile;
        setUser(parsed);

        (async () => {
          try {
            if (parsed.id || parsed.email) {
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

    // Temporary localStorage approval flow for demo - load local posts
    const savedLocalPosts = getLocalPosts();
    if (savedLocalPosts.length > 0) {
      setLocalPosts(savedLocalPosts as Post[]);
      console.log('[AuthContext] Loaded local posts from localStorage:', savedLocalPosts.length);
    }
  }, []);

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

  // Fetch events from Supabase
  useEffect(() => {
    let mounted = true;
    let eventsChannel: any = null;

    const fetchEvents = async () => {
      try {
        console.log('[AuthContext] Fetching events from Supabase...');
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('[AuthContext] Error fetching events:', error);
          if (mounted) {
            setEvents([]);
          }
          return;
        }

        if (!data) {
          console.log('[AuthContext] No events found');
          if (mounted) {
            setEvents([]);
          }
          return;
        }

        console.log('[AuthContext] Events fetched, count =', data.length);
        if (mounted) {
        const mappedEvents = data.map((r: any) => ({
            id: String(r.id),
            title: r.title ?? 'Untitled Event',
            date: r.event_date ?? r.date ?? '',
            time: r.event_time ?? r.time ?? '',
            location: r.location ?? '',
            type: r.type ?? 'Event',
            description: r.description ?? '',
            image: r.image_url ?? r.image ?? '',
            organizer: r.organizer ?? 'Admin',
            alumniId: r.created_by ?? r.alumniId ?? 'admin',
            source: 'admin' as const,
            event_link: r.event_link ?? '',
            registration_link: r.registration_link ?? '',
            link: r.link ?? '',
          }));

          setEvents(mappedEvents as Event[]);
          localStorage.setItem('allumini_events', JSON.stringify(mappedEvents));
          console.log('[AuthContext] Events set, count =', mappedEvents.length);
        }
      } catch (err) {
        console.error('[AuthContext] Unexpected error fetching events:', err);
      }
    };

    fetchEvents();

    // Setup realtime subscription for events
    try {
      eventsChannel = supabase
        .channel('public:events')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, (payload) => {
          console.log('[AuthContext] Realtime update for events:', payload.eventType);
          fetchEvents();
        })
        .subscribe((status, err) => {
          if (status === 'SUBSCRIBED') console.log('[AuthContext] Events channel subscribed');
          if (err) console.error('[AuthContext] Events channel error:', err);
        });
    } catch (err) {
      console.error('[AuthContext] Failed to create realtime channel for events:', err);
    }

    return () => {
      mounted = false;
      try {
        if (eventsChannel) eventsChannel.unsubscribe();
      } catch (e) {
        // ignore
      }
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    let channel: any = null;

    const fetchPosts = async () => {
      try {
        console.log('[AuthContext] Fetching posts from Supabase...');
        let query = supabase.from('posts').select('*');

        if (user?.role !== 'admin') {
          query = query.eq('status', 'approved');
          console.log('[AuthContext] Filtering posts by status: approved');
        } else {
          console.log('[AuthContext] Admin viewing all posts (no status filter)');
        }

        query = query.order('created_at', { ascending: false });

        let { data, error } = await query;

        if (error && /status.*does not exist/i.test(error.message)) {
          console.warn('[AuthContext] Approval columns are not installed; loading legacy posts.');
          const legacyResult = await supabase.from('posts').select('*').order('created_at', { ascending: false });
          data = legacyResult.data;
          error = legacyResult.error;
        }

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
            localStorage.setItem('alumni_posts', JSON.stringify([]));
          }
          return;
        }

        const mapped = data.map((r: any) => ({
          id: String(r.id ?? r.ID ?? `p-${Date.now()}`),
          alumniId: r.alumni_id ?? r.alumniId ?? r.user_id ?? String(r.alumniId ?? 'unknown'),
          title: r.title ?? r.Title ?? undefined,
          content: r.content ?? r.body ?? r.description ?? '',
          timestamp: r.timestamp ?? r.created_at ?? new Date().toISOString(),
          type: (r.type as any) || 'general',
          status: r.status ?? 'approved',
          likes: Number(r.likes ?? 0),
          comments: Number(r.comments ?? 0),
          image: r.image ?? r.image_url ?? undefined,
          file: r.file ?? undefined,
          rejectionReason: r.rejection_reason,
          reviewedBy: r.reviewed_by,
          reviewedAt: r.reviewed_at,
          post_details: r.post_details ?? undefined,
          event_link: r.event_link ?? '',
          registration_link: r.registration_link ?? '',
          link: r.link ?? '',
        }));

        if (mounted) {
          setPosts(mapped as Post[]);
          try { localStorage.setItem('allumini_posts', JSON.stringify(mapped)); } catch {}
          console.log('[AuthContext] posts loaded, count =', mapped.length, 'status filter:', user?.role !== 'admin' ? 'approved only' : 'all');
        }
      } catch (err) {
        console.error('[AuthContext] Unexpected error fetching posts:', err);
      }
    };

    fetchPosts();

    try {
      // Create separate channels for better reliability
      const postsChannel = supabase
        .channel('public:posts')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, (payload) => {
          console.log('[AuthContext] Realtime update for posts:', payload.eventType);
          fetchPosts();
        })
        .subscribe((status, err) => {
          if (status === 'SUBSCRIBED') console.log('[AuthContext] Posts channel subscribed');
          if (err) console.error('[AuthContext] Posts channel error:', err);
        });

      const likesChannel = supabase
        .channel('public:post_likes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'post_likes' }, (payload: any) => {
          console.log('[AuthContext] Realtime update for post_likes:', payload.eventType, 'post_id:', payload.new?.post_id || payload.old?.post_id);
          // Refetch posts to update like counts
          fetchPosts();
        })
        .subscribe((status, err) => {
          if (status === 'SUBSCRIBED') console.log('[AuthContext] Post likes channel subscribed');
          if (err) console.error('[AuthContext] Post likes channel error:', err);
        });

      const commentsChannel = supabase
        .channel('public:post_comments')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'post_comments' }, (payload: any) => {
          console.log('[AuthContext] Realtime update for post_comments:', payload.eventType, 'post_id:', payload.new?.post_id || payload.old?.post_id);
          // Refetch posts to update comment counts
          fetchPosts();
        })
        .subscribe((status, err) => {
          if (status === 'SUBSCRIBED') console.log('[AuthContext] Post comments channel subscribed');
          if (err) console.error('[AuthContext] Post comments channel error:', err);
        });

      // Store all channels for cleanup
      channel = { unsubscribe: async () => {
        await postsChannel.unsubscribe();
        await likesChannel.unsubscribe();
        await commentsChannel.unsubscribe();
      }};
    } catch (err) {
      console.error('[AuthContext] Failed to create realtime channel:', err);
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
    if ('email' in payload && 'id' in payload && !('role' in payload)) {
      const savedProfile = getSavedUserProfile(payload.email, payload.id);
      if (savedProfile) {
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
            toStore.id = toStore.id || (toStore.email ? toStore.email.split('@')[0] : `u-${Date.now()}`);
            toStore.profileComplete = false;
          }

          setUser(toStore);
          localStorage.setItem('allumini_user', JSON.stringify(toStore));
          localStorage.setItem('allumini_role', toStore.role);
          console.log('[AuthContext] Stored user after enrichment:', toStore);
        } catch (err) {
          console.error('[AuthContext] Error enriching/storing UserProfile payload:', err);
          const toStore = payload as UserProfile;
          toStore.id = toStore.id || (toStore.email ? toStore.email.split('@')[0] : `u-${Date.now()}`);
          setUser(toStore);
          localStorage.setItem('allumini_user', JSON.stringify(toStore));
          localStorage.setItem('allumini_role', toStore.role);
        }
      })();
      return;
    }

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

  const addPost = async (postData: Omit<Post, 'id' | 'timestamp' | 'status'>) => {
    if (!user || user.role === 'student') return;

    try {
      let imageUrl: string | undefined = undefined;
      let fileUrl: string | undefined = undefined;

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

      const postStatus = user.role === 'admin' ? 'approved' : 'pending';
      console.log('[AuthContext] Creating post with status:', postStatus, 'for user role:', user.role);

      // Temporary localStorage approval flow for demo
      // Save post to localStorage with pending status for non-admin users
      const localPostId = `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newLocalPost: any = {
        id: localPostId,
        alumniId: user.id,
        title: (postData as any).title ?? undefined,
        content: postData.content,
        timestamp: new Date().toISOString(),
        type: postData.type,
        status: postStatus,
        likes: postData.likes ?? 0,
        comments: postData.comments ?? 0,
        image: imageUrl ?? (postData.image as any) ?? undefined,
        file: fileUrl ?? undefined,
        post_details: (postData as any).post_details ?? undefined,
        authorName: user.name,
        authorRole: user.role,
        authorAvatar: user.avatar,
        created_at: new Date().toISOString(),
      };

      // Add to localStorage
      const updatedLocalPosts = addLocalPost(newLocalPost);
      setLocalPosts(updatedLocalPosts as Post[]);

      if (postStatus === 'pending') {
        showGlobalToast('Post created successfully. Please wait for admin approval.', 'success');
      }

      // Also try to save to Supabase (for when DB is connected)
      const insertRow: any = {
        alumni_id: user.id,
        title: (postData as any).title ?? null,
        content: postData.content,
        type: postData.type,
        status: postStatus,
        likes: postData.likes ?? 0,
        comments: postData.comments ?? 0,
        image: imageUrl ?? postData.image ?? null,
        file: fileUrl ?? null,
        post_details: (postData as any).post_details ?? null,
        created_at: new Date().toISOString(),
      };

      let supportsApprovalStatus = true;
      let { data, error } = await supabase.from('pending_posts').insert([insertRow]).select();
      console.log("INSERT DATA:", data);
      console.log("INSERT ERROR:", error);

      /*if (error && /status.*does not exist/i.test(error.message)) {
        const { status: _status, ...legacyRow } = insertRow;
        const legacyResult = await supabase.from('posts').insert([legacyRow]).select();
        data = legacyResult.data;
        error = legacyResult.error;
        supportsApprovalStatus = false;
      } */

      if (error) {
        console.warn('[AuthContext] Supabase insert failed, using localStorage only:', error.message);
        // Post is already saved in localStorage, so we're good for demo
        return;
      }

      if (data && data[0]) {
        const row = data[0];
        const newPost: Post = {
          id: String(row.id ?? localPostId),
          alumniId: row.alumni_id ?? user.id,
          title: row.title ?? undefined,
          content: row.content ?? '',
          timestamp: row.timestamp ?? row.created_at ?? new Date().toISOString(),
          type: row.type ?? 'general',
          status: row.status ?? (supportsApprovalStatus ? 'pending' : 'approved'),
          likes: Number(row.likes ?? 0),
          comments: Number(row.comments ?? 0),
          image: row.image ?? undefined,
          file: row.file ?? undefined,
          post_details: row.post_details ?? undefined,
        };

        if (newPost.status === 'approved' || user.role === 'admin') {
          setPosts(prev => [newPost, ...prev]);
        }

        if (supportsApprovalStatus && postStatus === 'pending') {
          // Already alerted above
        }
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

  const fetchNotifications = useCallback(async (): Promise<void> => {
    if (!user) {
      setNotifications([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('recipient_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[AuthContext] Error fetching notifications:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        });
        return;
      }

      setNotifications((data ?? []) as Notification[]);
    } catch (err) {
      console.error('[AuthContext] fetchNotifications error:', err);
    }
  }, [user]);

  const markNotificationRead = useCallback(async (notificationId: string): Promise<void> => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('recipient_id', user.id);

      if (error) {
        console.error('[AuthContext] Error marking notification read:', error);
        return;
      }

      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId ? { ...notification, is_read: true } : notification
        )
      );
    } catch (err) {
      console.error('[AuthContext] markNotificationRead error:', err);
    }
  }, [user]);

  const markAllNotificationsRead = useCallback(async (): Promise<void> => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('recipient_id', user.id)
        .eq('is_read', false);

      if (error) {
        console.error('[AuthContext] Error marking all notifications read:', error);
        return;
      }

      setNotifications(prev => prev.map(notification => ({ ...notification, is_read: true })));
    } catch (err) {
      console.error('[AuthContext] markAllNotificationsRead error:', err);
    }
  }, [user]);

  const unreadNotificationCount = notifications.reduce(
    (count, notification) => count + (notification.is_read ? 0 : 1),
    0
  );

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }

    fetchNotifications();

    let notificationsChannel: any = null;
    try {
      notificationsChannel = supabase
        .channel(`notifications:${user.id}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'notifications', filter: `recipient_id=eq.${user.id}` },
          (payload: any) => {
            console.log('[AuthContext] Realtime update for notifications:', payload.eventType);
            fetchNotifications();
          }
        )
        .subscribe((status, err) => {
          if (status === 'SUBSCRIBED') console.log('[AuthContext] Notifications channel subscribed');
          if (err) console.error('[AuthContext] Notifications channel error:', err);
        });
    } catch (err) {
      console.error('[AuthContext] Failed to create realtime channel for notifications:', err);
    }

    return () => {
      try {
        if (notificationsChannel) notificationsChannel.unsubscribe();
      } catch (e) {
        console.error('[AuthContext] Error unsubscribing notifications channel:', e);
      }
    };
  }, [user, fetchNotifications]);

  const createCommentNotifications = async (
    commentId: string,
    postId: string,
    commentText: string,
    parentCommentId?: string
  ): Promise<void> => {
    if (!user) return;

    try {
      const trimmedMessage = commentText.trim().replace(/\s+/g, ' ');
      const preview = trimmedMessage.length > 80 ? `${trimmedMessage.slice(0, 77)}...` : trimmedMessage;
      const actorName = user.name?.split(' ')[0] || user.email?.split('@')[0] || 'Someone';
      const notificationsToInsert: any[] = [];

      const { data: postData, error: postError } = await supabase
        .from('posts')
        .select('alumni_id')
        .eq('id', postId)
        .maybeSingle();

      if (postError) {
        console.error('[AuthContext] Error fetching post owner for notification:', postError);
      }

      const postOwnerId = postData?.alumni_id;
      let parentCommentOwnerId: string | undefined;

      if (parentCommentId) {
        const { data: parentCommentData, error: parentCommentError } = await supabase
          .from('post_comments')
          .select('user_id')
          .eq('id', parentCommentId)
          .maybeSingle();

        if (parentCommentError) {
          console.error('[AuthContext] Error fetching parent comment for notification:', parentCommentError);
        } else if (parentCommentData?.user_id) {
          parentCommentOwnerId = parentCommentData.user_id;
          if (parentCommentOwnerId !== user.id) {
            notificationsToInsert.push({
              recipient_id: parentCommentOwnerId,
              sender_id: user.id,
              type: 'comment',
              post_id: postId,
              comment_id: commentId,
              message: `${actorName} replied to your comment: "${preview}"`,
              is_read: false,
            });
          }
        }
      }

      if (postOwnerId && postOwnerId !== user.id && postOwnerId !== parentCommentOwnerId) {
        notificationsToInsert.push({
          recipient_id: postOwnerId,
          sender_id: user.id,
          type: 'comment',
          post_id: postId,
          comment_id: commentId,
          message: parentCommentId
            ? `${actorName} also commented on your post: "${preview}"`
            : `${actorName} commented on your post: "${preview}"`,
          is_read: false,
        });
      }

      if (notificationsToInsert.length === 0) {
        return;
      }

      const { error } = await supabase.from('notifications').insert(notificationsToInsert);
      if (error) {
        console.error('[AuthContext] Error inserting comment notifications:', error);
      }
    } catch (err) {
      console.error('[AuthContext] createCommentNotifications error:', err);
    }
  };

  const likePost = async (postId: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      console.log('[AuthContext] likePost called for postId:', postId, 'userId:', user.id);
      
      const { data: existingLike, error: selectError } = await supabase
        .from('post_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (selectError) {
        console.error('[AuthContext] Error checking existing like:', selectError);
        return false;
      }

      if (existingLike) {
        console.log('[AuthContext] Removing like for postId:', postId);
        const { error: deleteError } = await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
        
        if (deleteError) {
          console.error('[AuthContext] Error removing like:', deleteError);
          return false;
        }
        return true;
      } else {
        console.log('[AuthContext] Adding like for postId:', postId);
        const { error: insertError } = await supabase
          .from('post_likes')
          .insert({ post_id: postId, user_id: user.id });
        
        if (insertError) {
          console.error('[AuthContext] Error adding like:', insertError);
          return false;
        }
        return true;
      }
    } catch (e) {
      console.error('[AuthContext] likePost unexpected error:', e);
      return false;
    }
  };

  const commentPost = async (postId: string, commentText: string, parentCommentId?: string): Promise<void> => {
    if (!user || !commentText.trim()) {
      console.error('[AuthContext] commentPost blocked: no user or empty text', { user: !!user, text: commentText });
      return;
    }

    try {
      console.log('[AuthContext] commentPost called:', {
        postId,
        userId: user.id,
        userRole: user.role,
        textLength: commentText.trim().length,
        textPreview: commentText.trim().substring(0, 50)
      });

    // Fetch First_Name from alumni_profiles for alumni users
      let userName: string | undefined;
      let profileQueryResult: { data: any; error: any } | null = null;

      if (user.role === 'alumni') {
        console.log('[AuthContext] Fetching alumni profile for comment author, userId:', user.id);
        
        const { data: authUser } = await supabase.auth.getUser();
        console.log('[AuthContext] Debug - auth user ID:', authUser?.user?.id, '| context user ID:', user.id);
        
        // Query alumni_profiles using .eq('user_id', authUser.id)
        profileQueryResult = await supabase
          .from('alumni_profiles')
          .select('First_Name, user_id')
          .eq('user_id', user.id)
          .maybeSingle();

        // Log the query result
        console.log('[AuthContext] Alumni profile query result:', {
          userId: user.id,
          data: profileQueryResult.data,
          error: profileQueryResult.error,
          hasData: !!profileQueryResult.data,
          hasError: !!profileQueryResult.error
        });

        // Log any Supabase errors
        if (profileQueryResult.error) {
          console.error('[AuthContext] Supabase error fetching alumni profile for comment:', {
            userId: user.id,
            errorMessage: profileQueryResult.error.message,
            errorCode: profileQueryResult.error.code,
            errorDetails: profileQueryResult.error.details,
            errorHint: profileQueryResult.error.hint,
            fullError: profileQueryResult.error
          });
          showGlobalToast(`Failed to add comment: Database error while verifying profile. Please try again later.`, 'error');
          return;
        }

        // Verify auth.users.id matches alumni_profiles.user_id and check for rows
        if (profileQueryResult.data) {
          // Verify the user_id matches
          if (profileQueryResult.data.user_id !== user.id) {
            console.error('[AuthContext] User ID mismatch - auth.users.id does not match alumni_profiles.user_id:', {
              authUserId: user.id,
              profileUserId: profileQueryResult.data.user_id
            });
            showGlobalToast(`Failed to add comment: Profile verification failed. Please contact support.`, 'error');
            return;
          }

          // Store the retrieved First_Name in post_comments.user_name
          userName = profileQueryResult.data.First_Name?.trim();
          console.log('[AuthContext] Successfully fetched First_Name from alumni_profiles:', userName, 'for userId:', user.id);
        } else {
          // Profile lookup returned no rows - stop insert and log exact reason
          const noProfileReason = `No alumni_profiles row found for user_id: ${user.id}. User must complete alumni registration before commenting.`;
          console.error('[AuthContext] Comment insertion blocked - no alumni profile found:', {
            userId: user.id,
            reason: noProfileReason,
            queryResult: profileQueryResult
          });
          showGlobalToast(`Failed to add comment: Alumni profile not found. Please complete your profile first.`, 'error');
          return;
        }
      } else if (user.role === 'student') {
        console.log('[AuthContext] Fetching student profile for comment author, userId:', user.id);
        profileQueryResult = await supabase
          .from('student_profiles')
          .select('First_Name')
          .eq('user_id', user.id)
          .maybeSingle();
      } else if (user.role === 'faculty') {
        console.log('[AuthContext] Fetching faculty profile for comment author, userId:', user.id);
        profileQueryResult = await supabase
          .from('faculty_profiles')
          .select('First_Name')
          .eq('user_id', user.id)
          .maybeSingle();
      }

      // Handle student and faculty profile results (unchanged)
      if (user.role !== 'alumni' && profileQueryResult) {
        const { data: profileData, error: profileError } = profileQueryResult;

        if (profileError) {
          console.error('[AuthContext] Error fetching profile for comment:', {
            role: user.role,
            userId: user.id,
            error: profileError.message,
            code: profileError.code,
            details: profileError.details,
            hint: profileError.hint,
            fullError: profileError
          });
          showGlobalToast(`Failed to add comment: Could not verify user profile. Please try again later.`, 'error');
          return;
        }

        if (profileData) {
          userName = profileData.First_Name?.trim();
          console.log('[AuthContext] Fetched First_Name for comment from', user.role + '_profiles:', userName);
        } else {
          console.error('[AuthContext] No profile found for comment author:', {
            role: user.role,
            userId: user.id,
            queryResult: profileQueryResult
          });
          showGlobalToast(`Failed to add comment: User profile not found. Please complete your profile first.`, 'error');
          return;
        }
      }

      // Fallback for roles without profile tables (e.g., admin)
      if (!userName) {
        userName = user.name?.split(' ')[0] || user.email?.split('@')[0] || 'User';
        console.log('[AuthContext] No profile table for role', user.role, '- using fallback name:', userName);
      }

      const insertData: any = {
        post_id: postId,
        user_id: user.id,
        content: commentText.trim(),
        user_name: userName,
        user_role: user.role,
        user_avatar: user.avatar || '',
      };

      if (parentCommentId) {
        insertData.parent_comment_id = parentCommentId;
      }

      console.log('[AuthContext] Inserting comment:', insertData);

      const { data, error } = await supabase
        .from('post_comments')
        .insert(insertData)
        .select();

      if (error) {
        console.error('[AuthContext] Error adding comment:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
          fullError: error
        });
        showGlobalToast(`Failed to add comment: ${error.message || 'Unknown error'}`, 'error');
        return;
      }

      console.log('[AuthContext] Comment added successfully:', data);
      showGlobalToast('Comment added', 'success');

      const insertedCommentId = Array.isArray(data) ? data[0]?.id : (data as any)?.id;
      if (insertedCommentId) {
        await createCommentNotifications(insertedCommentId, postId, commentText, parentCommentId);
      }
    } catch (e) {
      console.error('[AuthContext] commentPost unexpected error:', e);
      showGlobalToast('Something went wrong', 'error');
    }
  };

  const deleteComment = async (commentId: string, postId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('post_comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user.id);

      if (error) {
        console.error('[AuthContext] Error deleting comment:', error);
        showGlobalToast('Failed to delete comment', 'error');
        return;
      }

      showGlobalToast('Comment deleted', 'success');
    } catch (e) {
      console.error('[AuthContext] deleteComment error:', e);
      showGlobalToast('Something went wrong', 'error');
    }
  };

  const getPostComments = async (postId: string): Promise<PostComment[]> => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('post_comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('[AuthContext] Error fetching comments:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        });
        return [];
      }

      if (!data || data.length === 0) {
        return [];
      }

      // Fetch user details from all profile tables
      const userIds = [...new Set(data.map(c => c.user_id))];
      const [alumniRes, studentRes, facultyRes] = await Promise.all([
        supabase.from('alumni_profiles').select('user_id, First_Name, Last_Name, Photo_URL').in('user_id', userIds),
        supabase.from('student_profiles').select('user_id, First_Name, Last_Name, photo_url').in('user_id', userIds),
        supabase.from('faculty_profiles').select('user_id, First_Name, Last_Name, photo_url').in('user_id', userIds),
      ]);

      if (alumniRes.error) {
        console.warn('[AuthContext] Error fetching alumni profiles for comments:', alumniRes.error.message);
      }
      if (studentRes.error) {
        console.warn('[AuthContext] Error fetching student profiles for comments:', studentRes.error.message);
      }
      if (facultyRes.error) {
        console.warn('[AuthContext] Error fetching faculty profiles for comments:', facultyRes.error.message);
      }

      const profileMap = new Map<string, { name: string; avatar: string; role: Role }>();

      (alumniRes.data || []).forEach((p: any) => {
        const name = (p.First_Name || '').trim() || 'User';
        profileMap.set(p.user_id, {
          name,
          avatar: p.Photo_URL || '',
          role: 'alumni',
        });
      });

      (studentRes.data || []).forEach((p: any) => {
        const name = (p.First_Name || '').trim() || 'User';
        profileMap.set(p.user_id, {
          name,
          avatar: p.photo_url || '',
          role: 'student',
        });
      });

      (facultyRes.data || []).forEach((p: any) => {
        const name = (p.First_Name || '').trim() || 'User';
        profileMap.set(p.user_id, {
          name,
          avatar: p.photo_url || '',
          role: 'faculty',
        });
      });

      return data.map((comment: any) => {
        const profile = profileMap.get(comment.user_id);
        return {
          id: comment.id,
          post_id: comment.post_id,
          user_id: comment.user_id,
          content: comment.content,
          created_at: comment.created_at,
          updated_at: comment.updated_at,
          parent_comment_id: comment.parent_comment_id,
          user_name: comment.user_name,
          user_role: comment.user_role,
          user_avatar: comment.user_avatar,
          user: profile ? {
            id: comment.user_id,
            name: comment.user_name || profile.name,
            avatar: profile.avatar,
            role: profile.role,
            graduationYear: new Date().getFullYear(),
            degree: '',
            skills: [],
          } : undefined,
        };
      });
    } catch (e) {
      console.error('[AuthContext] getPostComments error:', e);
      return [];
    }
  };

  const hasUserLikedPost = async (postId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .from('post_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .maybeSingle();

      return !!data && !error;
    } catch (e) {
      console.error('[AuthContext] hasUserLikedPost error:', e);
      return false;
    }
  };

  const sharePost = async (postId: string) => {
    if (!user) return;
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('shares')
        .eq('id', postId)
        .single();
      if (error || !data) {
        console.error('[AuthContext] Error fetching post for share:', error);
        return;
      }
      const newShares = (data.shares || 0) + 1;
      const { error: updateError } = await supabase
        .from('posts')
        .update({ shares: newShares })
        .eq('id', postId);
      if (!updateError) {
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, shares: newShares } : p));
      }
    } catch (e) {
      console.error('[AuthContext] sharePost error:', e);
    }
  };

  const editPost = async (postId: string, updates: Partial<Post>) => {
    if (!user) return;
    const post = posts.find(p => p.id === postId);
    const localPost = localPosts.find(p => p.id === postId);
    const targetPost = post || localPost;
    if (!targetPost) return;
    if (user.role !== 'admin' && targetPost.alumniId !== user.id) return;

    try {
      // If editing an approved/rejected post (and not admin), reset status to pending
      const isStatusReset = (targetPost.status === 'approved' || targetPost.status === 'rejected') && user.role !== 'admin';
      
      // Prepare updates for Supabase (use snake_case for DB columns)
      const supabaseUpdates = isStatusReset
        ? { ...updates, status: 'pending' as const, rejection_reason: null }
        : updates;
      
      // Prepare updates for localStorage (use camelCase)
      const finalUpdates = isStatusReset
        ? { ...updates, status: 'pending' as const, rejectionReason: undefined, reviewedBy: undefined, reviewedAt: undefined }
        : updates;

      // Try Supabase update first
      const { error } = await supabase.from('posts').update(supabaseUpdates).eq('id', postId);
      if (!error) {
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, ...finalUpdates } : p));
      } else if (error.message && /status.*does not exist/i.test(error.message)) {
        // Legacy table without status column - try without status fields
        const { status: _status, rejection_reason: _rr, ...legacyUpdates } = supabaseUpdates as any;
        const { error: legacyError } = await supabase.from('posts').update(legacyUpdates).eq('id', postId);
        if (!legacyError) {
          setPosts(prev => prev.map(p => p.id === postId ? { ...p, ...legacyUpdates } : p));
        }
      }

      // Always update localStorage
      const updatedLocal = updateLocalPost(postId, finalUpdates);
      setLocalPosts(updatedLocal as Post[]);

      if (isStatusReset) {
        showGlobalToast('Post updated successfully and sent for admin approval.', 'success');
      } else {
        showGlobalToast('Post updated successfully.', 'success');
      }
    } catch (e) {
      console.error('[AuthContext] editPost error:', e);
      showGlobalToast('Something went wrong. Please try again.', 'error');
    }
  };

  const deletePost = async (id: string) => {
    if (!user) return;
    const target = posts.find(p => p.id === id);
    const localTarget = localPosts.find(p => p.id === id);
    if (!target && !localTarget) return;
    if (user.role !== 'admin' && (target?.alumniId !== user.id || localTarget?.alumniId !== user.id)) return;

    try {
      const { error } = await supabase.from('posts').delete().eq('id', id);
      if (error) {
        console.warn('[AuthContext] Supabase delete failed, removing from localStorage only:', error.message);
      }
    } catch (err) {
      console.error('[AuthContext] Unexpected error deleting post:', err);
    }

    // Remove from both states
    const newPosts = posts.filter(post => post.id !== id);
    setPosts(newPosts);
    const newLocalPosts = localPosts.filter(post => post.id !== id);
    setLocalPosts(newLocalPosts);
    try { localStorage.setItem('allumini_posts', JSON.stringify(newPosts)); } catch {}
    deleteLocalPost(id);

    showGlobalToast('Post deleted successfully.', 'success');
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

  // Temporary localStorage approval flow for demo
  const approveLocalPost = (postId: string) => {
    const updated = updateLocalPost(postId, { status: 'approved' });
    setLocalPosts(updated as Post[]);
    return updated;
  };

  const rejectLocalPost = (postId: string, reason: string) => {
    const updated = updateLocalPost(postId, { status: 'rejected', rejectionReason: reason });
    setLocalPosts(updated as Post[]);
    return updated;
  };

  const getLocalPostsByAuthor = (authorId: string) => {
    return getPostsByAuthor(authorId) as Post[];
  };

  const fetchAdminPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[AuthContext] Error fetching admin posts:', error);
        return;
      }

      const mapped = (data || []).map((r: any) => ({
        id: String(r.id),
        title: r.title ?? undefined,
        content: r.content ?? '',
        created_at: r.created_at ?? new Date().toISOString(),
        updated_at: r.updated_at,
        likes: Number(r.likes ?? 0),
        comments: Number(r.comments ?? 0),
        shares: Number(r.shares ?? 0),
        image: r.image ?? r.image_url ?? r.file_url ?? undefined,
        attachment_url: r.file_url ?? r.attachment_url ?? undefined,
        attachment_name: r.file_name ?? r.attachment_name ?? undefined,
        attachment_type: r.attachment_type ?? undefined,
        post_details: r.post_details ?? undefined,
      }));

      // Log the fetched admin posts with image URLs for debugging
      console.log('[AuthContext] Admin posts fetched:', mapped.map((p: any) => ({ id: p.id, title: p.title, image: p.image })));

      setAdminPosts(mapped as AdminPost[]);
      console.log('[AuthContext] admin posts loaded, count =', mapped.length);
    } catch (err) {
      console.error('[AuthContext] Unexpected error fetching admin posts:', err);
    }
  };

  // Expose fetchAdminPosts via a ref-like pattern by attaching to window for MainDashboard access
  if (typeof window !== 'undefined') {
    (window as any).__fetchAdminPosts = fetchAdminPosts;
  }

  const likeAdminPost = async (adminPostId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data: existingLike, error: selectError } = await supabase
        .from('admin_post_likes')
        .select('id')
        .eq('admin_post_id', adminPostId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (selectError) {
        console.error('[AuthContext] Error checking existing admin post like:', selectError);
        return false;
      }

      if (existingLike) {
        const { error: deleteError } = await supabase
          .from('admin_post_likes')
          .delete()
          .eq('admin_post_id', adminPostId)
          .eq('user_id', user.id);

        if (deleteError) {
          console.error('[AuthContext] Error removing admin post like:', deleteError);
          return false;
        }
      } else {
        const { error: insertError } = await supabase
          .from('admin_post_likes')
          .insert({ admin_post_id: adminPostId, user_id: user.id });

        if (insertError) {
          console.error('[AuthContext] Error adding admin post like:', insertError);
          return false;
        }
      }

      const { count: likeCount, error: countError } = await supabase
        .from('admin_post_likes')
        .select('*', { count: 'exact', head: true })
        .eq('admin_post_id', adminPostId);

      if (countError) {
        console.error('[AuthContext] Error counting admin post likes:', countError);
      } else {
        const newLikes = likeCount ?? 0;
        const { error: updateError } = await supabase
          .from('admin_posts')
          .update({ likes: newLikes })
          .eq('id', adminPostId);

        if (updateError) {
          console.error('[AuthContext] Error updating admin post likes count:', updateError);
        } else {
          setAdminPosts(prev => prev.map(p => p.id === adminPostId ? { ...p, likes: newLikes } : p));
        }
      }

      return true;
    } catch (e) {
      console.error('[AuthContext] likeAdminPost unexpected error:', e);
      return false;
    }
  };

  const commentAdminPost = async (adminPostId: string, commentText: string, parentCommentId?: string): Promise<void> => {
    if (!user || !commentText.trim()) return;

    try {
      let userName = user.name?.split(' ')[0] || user.email?.split('@')[0] || 'User';

      const insertData: any = {
        admin_post_id: adminPostId,
        user_id: user.id,
        content: commentText.trim(),
        user_name: userName,
        user_role: user.role,
        user_avatar: user.avatar || '',
      };

      if (parentCommentId) {
        insertData.parent_comment_id = parentCommentId;
      }

      const { error } = await supabase
        .from('admin_post_comments')
        .insert(insertData);

      if (error) {
        console.error('[AuthContext] Error adding admin post comment:', error);
        showGlobalToast(`Failed to add comment: ${error.message || 'Unknown error'}`, 'error');
        return;
      }

      // Sync comments count from admin_post_comments into admin_posts.comments
      const { count: commentCount, error: countError } = await supabase
        .from('admin_post_comments')
        .select('*', { count: 'exact', head: true })
        .eq('admin_post_id', adminPostId);

      if (countError) {
        console.error('[AuthContext] Error counting admin post comments:', countError);
      } else {
        const newComments = commentCount ?? 0;
        const { error: updateError } = await supabase
          .from('admin_posts')
          .update({ comments: newComments })
          .eq('id', adminPostId);

        if (updateError) {
          console.error('[AuthContext] Error updating admin post comments count:', updateError);
        } else {
          setAdminPosts(prev => prev.map(p => p.id === adminPostId ? { ...p, comments: newComments } : p));
        }
      }

      showGlobalToast('Comment added', 'success');
    } catch (e) {
      console.error('[AuthContext] commentAdminPost unexpected error:', e);
      showGlobalToast('Something went wrong', 'error');
    }
  };

  const deleteAdminPostComment = async (commentId: string, adminPostId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('admin_post_comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user.id);

      if (error) {
        console.error('[AuthContext] Error deleting admin post comment:', error);
        showGlobalToast('Failed to delete comment', 'error');
        return;
      }

      // Sync comments count from admin_post_comments into admin_posts.comments
      const { count: commentCount, error: countError } = await supabase
        .from('admin_post_comments')
        .select('*', { count: 'exact', head: true })
        .eq('admin_post_id', adminPostId);

      if (countError) {
        console.error('[AuthContext] Error counting admin post comments after delete:', countError);
      } else {
        const newComments = commentCount ?? 0;
        const { error: updateError } = await supabase
          .from('admin_posts')
          .update({ comments: newComments })
          .eq('id', adminPostId);

        if (updateError) {
          console.error('[AuthContext] Error updating admin post comments count after delete:', updateError);
        } else {
          setAdminPosts(prev => prev.map(p => p.id === adminPostId ? { ...p, comments: newComments } : p));
        }
      }

      showGlobalToast('Comment deleted', 'success');
    } catch (e) {
      console.error('[AuthContext] deleteAdminPostComment error:', e);
      showGlobalToast('Something went wrong', 'error');
    }
  };

  const getAdminPostComments = async (adminPostId: string): Promise<AdminPostComment[]> => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('admin_post_comments')
        .select('*')
        .eq('admin_post_id', adminPostId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('[AuthContext] Error fetching admin post comments:', error);
        return [];
      }

      if (!data || data.length === 0) {
        return [];
      }

      const userIds = [...new Set(data.map(c => c.user_id))];
      const [alumniRes, studentRes, facultyRes] = await Promise.all([
        supabase.from('alumni_profiles').select('user_id, First_Name, Last_Name, Photo_URL').in('user_id', userIds),
        supabase.from('student_profiles').select('user_id, First_Name, Last_Name, photo_url').in('user_id', userIds),
        supabase.from('faculty_profiles').select('user_id, First_Name, Last_Name, photo_url').in('user_id', userIds),
      ]);

      const profileMap = new Map<string, { name: string; avatar: string; role: Role }>();

      (alumniRes.data || []).forEach((p: any) => {
        const name = (p.First_Name || '').trim() || 'User';
        profileMap.set(p.user_id, { name, avatar: p.Photo_URL || '', role: 'alumni' });
      });

      (studentRes.data || []).forEach((p: any) => {
        const name = (p.First_Name || '').trim() || 'User';
        profileMap.set(p.user_id, { name, avatar: p.photo_url || '', role: 'student' });
      });

      (facultyRes.data || []).forEach((p: any) => {
        const name = (p.First_Name || '').trim() || 'User';
        profileMap.set(p.user_id, { name, avatar: p.photo_url || '', role: 'faculty' });
      });

      return data.map((comment: any) => {
        const profile = profileMap.get(comment.user_id);
        return {
          id: comment.id,
          admin_post_id: comment.admin_post_id,
          user_id: comment.user_id,
          content: comment.content,
          created_at: comment.created_at,
          updated_at: comment.updated_at,
          parent_comment_id: comment.parent_comment_id,
          user_name: comment.user_name,
          user_role: comment.user_role,
          user_avatar: comment.user_avatar,
          user: profile ? {
            id: comment.user_id,
            name: comment.user_name || profile.name,
            avatar: profile.avatar,
            role: profile.role,
            graduationYear: new Date().getFullYear(),
            degree: '',
            skills: [],
          } : undefined,
        };
      });
    } catch (e) {
      console.error('[AuthContext] getAdminPostComments error:', e);
      return [];
    }
  };

  const hasUserLikedAdminPost = async (adminPostId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .from('admin_post_likes')
        .select('id')
        .eq('admin_post_id', adminPostId)
        .eq('user_id', user.id)
        .maybeSingle();

      return !!data && !error;
    } catch (e) {
      console.error('[AuthContext] hasUserLikedAdminPost error:', e);
      return false;
    }
  };

  const shareAdminPost = async (adminPostId: string) => {
    if (!user) return;
    const post = adminPosts.find(p => p.id === adminPostId);
    if (!post) return;

    try {
      const { data, error } = await supabase
        .from('admin_posts')
        .select('shares')
        .eq('id', adminPostId)
        .single();

      if (error || !data) {
        console.error('[AuthContext] Error fetching admin post for share:', error);
        return;
      }

      const newShares = (data.shares || 0) + 1;
      const { error: updateError } = await supabase
        .from('admin_posts')
        .update({ shares: newShares })
        .eq('id', adminPostId);

      if (!updateError) {
        setAdminPosts(prev => prev.map(p => p.id === adminPostId ? { ...p, shares: newShares } : p));
      }
    } catch (e) {
      console.error('[AuthContext] shareAdminPost error:', e);
    }
  };

  const logout = () => {
    setUser(null);
    setFollowing([]);
    setPosts([]);
    setJobs([]);
    setEvents([]);
    setAlumni([]);
    setLocalPosts([]);
    localStorage.removeItem('allumini_role');
    localStorage.removeItem('allumini_user');
    localStorage.removeItem('allumini_following');
    localStorage.removeItem('allumini_posts');
    localStorage.removeItem('allumini_jobs');
    localStorage.removeItem('allumini_events');
    localStorage.removeItem('allumini_alumni');
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
      adminPosts,
      addPost,
      addJob,
      addEvent,
      likePost,
      likeAdminPost,
      commentPost,
      commentAdminPost,
      deleteComment,
      deleteAdminPostComment,
      getPostComments,
      getAdminPostComments,
      hasUserLikedPost,
      hasUserLikedAdminPost,
      sharePost,
      shareAdminPost,
      editPost,
      deletePost,
      deleteJob,
      deleteEvent,
      getAlumniById,
      localPosts,
      approveLocalPost,
      rejectLocalPost,
      getLocalPostsByAuthor,
      fetchAdminPosts,
      notifications,
      unreadNotificationCount,
      fetchNotifications,
      markNotificationRead,
      markAllNotificationsRead,
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