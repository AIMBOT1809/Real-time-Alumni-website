import React, { useState , useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../../supabaseClient';
import { createChat } from '@n8n/chat';
import '@n8n/chat/style.css';
import { 
  Bell, 
  User, 
  Plus,
  Home,
  Users,
  Briefcase,
  Search,
  Settings,
  LogOut,
  Eye,
  MessageSquare,
  MessageCircle,
  ArrowLeft,
  Sun,
  Moon,
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { Chat } from './Chat';

export function MainDashboard() {
  const { user, role, logout, login, posts, jobs, events, following, getAlumniById, alumni, addPost } = useAuth();
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('home');
  const [eventView, setEventView] = useState('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [chatTheme, setChatTheme] = useState<'dark' | 'light'>('dark');
  const [adminPosts, setAdminPosts] = useState<any[]>([]);
  
  // Profile editing state
  const [isEditing, setIsEditing] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [postType, setPostType] = useState<'general'|'opportunity'|'event'>('general');
  const [postImage, setPostImage] = useState<string | null>(null);
  const [postFileName, setPostFileName] = useState<string | null>(null);
  const [postTitle, setPostTitle] = useState<string>('');
  const [formData, setFormData] = useState({
    collegeName: user?.collegeName || '',
    rollNumber: user?.rollNumber || '',
    department: user?.department || '',
    year: user?.year || '',
    yearOfJoining: user?.yearOfJoining || undefined,
    passedOutYear: user?.passedOutYear || undefined,
    about: user?.about || '',
    linkedin: user?.linkedin || '',
    resume: user?.resume || '',
    avatar: user?.avatar || '',
  });
  const [skills, setSkills] = useState(user?.skills || []);
  const [newSkill, setNewSkill] = useState('');
  const [links, setLinks] = useState(user?.links || []);
  const [newLink, setNewLink] = useState({ title: '', url: '' });
  const [alumniStrip, setAlumniStrip] = useState<Array<{ id: string; name: string; avatar: string }>>([]);
  
  const resetFormFromUser = () => {
    setFormData({
      collegeName: user?.collegeName || '',
      rollNumber: user?.rollNumber || '',
      department: user?.department || '',
      year: user?.year || '',
      yearOfJoining: user?.yearOfJoining || undefined,
      passedOutYear: user?.passedOutYear || undefined,
      about: user?.about || '',
      linkedin: user?.linkedin || '',
      resume: user?.resume || '',
      avatar: user?.avatar || '',
    });
    setSkills(user?.skills || []);
    setLinks(user?.links || []);
  };

  // Keep edit form state synchronized with latest user profile
  useEffect(() => {
    if (!user) return;
    try {
      console.log('[MainDashboard] Syncing formData with latest user profile', { userId: user?.id, userName: user?.name });
      resetFormFromUser();
    } catch (err) {
      console.error('[MainDashboard] Failed to sync formData from user', err);
    }
  }, [user]);

  useEffect(() => {
    console.log('[MainDashboard] AuthContext user change:', user);
    console.log('[MainDashboard] localStorage allumini_user:', (() => { try { return JSON.parse(localStorage.getItem('allumini_user')||'null'); } catch { return null; } })());
  }, [user]);

  useEffect(() => {
  createChat({
    webhookUrl: 'https://shaaz-03.app.n8n.cloud/webhook/2c823375-ff32-43b7-b598-63fb73838f86/chat'
  });
}, []);

  const startEditing = () => {
    if (!user) return;
    resetFormFromUser();
    setIsEditing(true);
  };
  
  useEffect(() => {
    if (!user && !isLoggingOut) {
      navigate('/login');
    }
  }, [user, isLoggingOut, navigate]);

  // Fetch alumni data for the scrollbar
  useEffect(() => {
    let mounted = true;
    let subscription: any = null;

    const normalizeRole = (row: any) => {
      const roleValue = (row.role ?? row.Role ?? '').toString().toLowerCase();
      const statusValue = (row.Current_Status ?? row.current_status ?? row.currentStatus ?? '').toString().toLowerCase();

      if (roleValue.includes('faculty')) return 'faculty';
      if (statusValue === 'job') return 'career-aspirant';
      if (statusValue === 'higher-education' || statusValue === 'higher education') return 'higher-education';
      return 'alumni';
    };

    const fetchAlumniRecords = async () => {
      try {
        console.log('[MainDashboard] Fetching alumni records from alumni_profiles...');
        const { data, error } = await supabase
          .from('alumni_profiles')
          .select('*')
          .order('First_Name', { ascending: true });

        if (error) {
          console.error('[MainDashboard] Supabase fetch error:', {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint,
          });
          setAlumniStrip([]);
          return;
        }

        if (!mounted) {
          console.log('[MainDashboard] Component unmounted, skipping state update');
          return;
        }

        if (!data || data.length === 0) {
          console.log('[MainDashboard] No alumni records found in database');
          setAlumniStrip([]);
          return;
        }

        console.log(`[MainDashboard] Found ${data.length} total records in alumni_profiles`);

        const mappedRecords = data.map((r: any) => {
          const first = r.First_Name ?? r.first_name ?? r.FirstName ?? '';
          const last = r.Last_name ?? r.last_name ?? r.LastName ?? '';
          const fullName = `${first} ${last}`.trim();
          const name = fullName || r.Email_Address || r.email || 'Unknown';
          const role = normalizeRole(r);

          return {
            id: String(r.user_id ?? r.id ?? name),
            name,
            avatar: r.Photo_URL ?? r.photo_url ?? r.avatar_url ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=FDE68A&color=111827&size=128`,
            role,
          };
        });

        // Filter to only include alumni role users
        const alumniUsers = mappedRecords.filter((record) => record.role === 'alumni');
        console.log(`[MainDashboard] Filtered to ${alumniUsers.length} alumni users (role='alumni')`);

        // Create strip list with only alumni users
        const stripList = alumniUsers.map((record) => ({
          id: record.id,
          name: record.name,
          avatar: record.avatar,
        }));

        console.log(`[MainDashboard] Alumni strip list prepared with ${stripList.length} members`);
        setAlumniStrip(stripList);
      } catch (err) {
        console.error('[MainDashboard] Unexpected error fetching alumni records:', {
          error: err instanceof Error ? err.message : String(err),
          stack: err instanceof Error ? err.stack : undefined,
        });
        setAlumniStrip([]);
      }
    };

    fetchAlumniRecords();

    // Setup Realtime subscription with error handling
    const setupRealtimeSubscription = async () => {
      try {
        subscription = supabase
          .channel('public:alumni_profiles')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'alumni_profiles' }, (payload: any) => {
            console.log('[MainDashboard] Realtime update received:', {
              eventType: payload.eventType,
              newRecord: (payload.new as any)?.id,
              oldRecord: (payload.old as any)?.id,
            });
            fetchAlumniRecords();
          })
          .subscribe((status, err) => {
            if (status === 'SUBSCRIBED') {
              console.log('[MainDashboard] Realtime subscription established');
            } else if (status === 'CHANNEL_ERROR' || err) {
              console.error('[MainDashboard] Realtime subscription error:', {
                status,
                error: err,
              });
            }
          });
      } catch (err) {
        console.error('[MainDashboard] Failed to setup Realtime subscription:', err);
      }
    };

    setupRealtimeSubscription();

    return () => {
      mounted = false;
      if (subscription) {
        try {
          subscription.unsubscribe();
          console.log('[MainDashboard] Realtime subscription unsubscribed');
        } catch (e) {
          console.error('[MainDashboard] Error unsubscribing from Realtime:', e);
        }
      }
    };
  }, []);

  useEffect(() => {
  fetchAdminPosts();
}, []);

const fetchAdminPosts = async () => {
  const { data, error } = await supabase
    .from('admin_posts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error(error);
    return;
  }
console.log("ADMIN POSTS:", data);
  setAdminPosts(data || []);
};

  if (!user) return null;

  // Profile handlers
  const handleSave = async () => {
    const updatedUser = {
      ...user,
      ...formData,
      skills,
      links,
    };
    await login(updatedUser);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      collegeName: user?.collegeName || '',
      rollNumber: user?.rollNumber || '',
      department: user?.department || '',
      year: user?.year || '',
      yearOfJoining: user?.yearOfJoining || undefined,
      passedOutYear: user?.passedOutYear || undefined,
      about: user?.about || '',
      linkedin: user?.linkedin || '',
      resume: user?.resume || '',
      avatar: user?.avatar || '',
    });
    setSkills(user?.skills || []);
    setLinks(user?.links || []);
    setNewSkill('');
    setNewLink({ title: '', url: '' });
    setIsEditing(false);
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const avatarData = (event.target?.result as string) || '';
        setFormData(prev => ({ ...prev, avatar: avatarData }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({ ...prev, resume: (event.target?.result as string) || '' }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileLogout = () => {
    setIsLoggingOut(true);
    logout();
    navigate('/');
  };

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (index: number) => {
    setSkills(skills.filter((_: string, i: number) => i !== index));
  };

  const addLink = () => {
    if (newLink.title.trim() && newLink.url.trim()) {
      setLinks([...links, { title: newLink.title.trim(), url: newLink.url.trim() }]);
      setNewLink({ title: '', url: '' });
    }
  };

  const removeLink = (index: number) => {
    setLinks(links.filter((_: any, i: number) => i !== index));
  };
 
 
/*
  if (!user) {
    navigate('/login');
    return null;
  }
*/    

 // const canPost = !!role && role !== 'student';
 // const followedPosts = posts ||[];
 //const followedPosts = adminPosts;
  const canPost = role === 'faculty' || role === 'alumni';

// Show admin posts + faculty/alumni posts to everyone
const followedPosts = [
  ...(adminPosts || []).map((post) => ({
    ...post,
    source: 'admin',
  })),
  ...(posts || []).map((post) => ({
    ...post,
    source: 'user',
    description: post.content,
    created_at: post.timestamp,
    file_url: post.image,
  })),
];
  // Filter events
  const now = new Date();
  const upcomingEvents = events?.filter(event => new Date(event.date) > now) || [];
  const currentEvents = events?.filter(event => {
    const eventDate = new Date(event.date);
    const eventEnd = new Date(eventDate);
    eventEnd.setHours(23, 59, 59, 999); // End of event day
    return eventDate <= now && eventEnd >= now;
  }) || [];
  
  // Get followed alumni
  const followedAlumni = alumni?.filter(alumnus => following?.includes(alumnus.id)) || [];

  // Filter jobs to only show from followed alumni
  const followedJobs = jobs?.filter(job => job.alumniId && following?.includes(job.alumniId)) || [];

  if (activeMenu === 'chat') {
    const isDark = chatTheme === 'dark';
    return (
      <div className={`fixed inset-0 z-50 flex flex-col ${isDark ? 'bg-black' : 'bg-white'}`}>
        <div className={`h-16 px-6 border-b flex items-center justify-between ${isDark ? 'bg-black border-[#262626]' : 'bg-white border-gray-200'}`}>
          <button onClick={() => setActiveMenu('home')} className={`flex items-center gap-2 transition-colors ${isDark ? 'text-white hover:text-[#FFD700]' : 'text-black hover:text-yellow-600'}`}>
            <ArrowLeft size={20} />
            <span className="font-semibold text-sm">Back to Dashboard</span>
          </button>
          
          <button 
            onClick={() => setChatTheme(isDark ? 'light' : 'dark')} 
            className={`p-2 rounded-full transition-colors ${isDark ? 'bg-[#1a1a1a] text-white hover:bg-[#262626]' : 'bg-gray-100 text-black hover:bg-gray-200'}`}
            title="Toggle theme"
          >
             {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
        <div className="flex-1 overflow-hidden w-full">
          <Chat theme={chatTheme} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Top Navbar */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-[#FFD700]">Alumni Connect</h1>
            </div>

            {/* Right Icons */}
            <div className="flex items-center space-x-4">
              {canPost && (
                <button className="p-2 hover:bg-slate-800 rounded-lg transition-colors group">
                  <Plus className="h-6 w-6 text-[#FFD700] group-hover:text-yellow-400" />
                </button>
              )}
              <button 
                onClick={() => setActiveMenu('chat')}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors relative"
              >
                <MessageCircle className="h-6 w-6 text-slate-300" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-[#FFD700] rounded-full"></span>
              </button>
              <button 
                onClick={() => setActiveMenu('notifications')}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors relative"
              >
                <Bell className="h-6 w-6 text-slate-300" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-[#FFD700] rounded-full"></span>
              </button>
              <button className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
                <img 
                  src={user?.avatar || 'https://ui-avatars.com/api/?name=User&background=FDE68A&color=111827&size=256'} 
                  alt={user?.name || 'User'}
                  className="h-8 w-8 rounded-full object-cover border-2 border-[#FFD700]"
                />
              </button>
            </div>
          </div>

          <div className="mt-4 mb-3">
            <div className="relative max-w-3xl mx-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search the dashboard..."
                className="w-full rounded-2xl border border-slate-700 bg-slate-800 py-3 pl-10 pr-4 text-slate-100 placeholder:text-slate-500 focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/20"
              />
            </div>
          </div>
        </div>
      </header>

      <nav className="mt-4 bg-white border border-slate-200 rounded-3xl shadow-sm max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className={`grid ${role === 'student' ? 'grid-cols-5' : 'grid-cols-6'} gap-1`}>
          <button
            onClick={() => setActiveMenu('home')}
            className={`flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[0.72rem] transition ${
              activeMenu === 'home' ? 'bg-[#FFD700] text-black' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Home className="h-5 w-5" />
            <span>Home</span>
          </button>
          {role !== 'student' && (
          <button
            onClick={() => setActiveMenu('post')}
            className={`flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[0.72rem] transition ${
              activeMenu === 'post' ? 'bg-[#FFD700] text-black' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Plus className="h-5 w-5" />
            <span>Post</span>
          </button>
          )}
          <button
            onClick={() => setActiveMenu('events')}
            className={`flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[0.72rem] transition ${
              activeMenu === 'events' ? 'bg-[#FFD700] text-black' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Briefcase className="h-5 w-5" />
            <span>Event</span>
          </button>
          <button
            onClick={() => setActiveMenu('community')}
            className={`flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[0.72rem] transition ${
              activeMenu === 'community' ? 'bg-[#FFD700] text-black' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Users className="h-5 w-5" />
            <span>Community Discussion</span>
          </button>
          <button
            onClick={() => setActiveMenu('profile')}
            className={`flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[0.72rem] transition ${
              activeMenu === 'profile' ? 'bg-[#FFD700] text-black' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <User className="h-5 w-5" />
            <span>Profile</span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-slate-900 rounded-lg border border-slate-800 overflow-hidden sticky top-20">
              {/* Simple User Profile Card */}
              <div className="p-4 border-b border-slate-800">
                <div className="flex items-center space-x-3 mb-4">
                  <img 
                    src={user?.avatar || 'https://ui-avatars.com/api/?name=User&background=FDE68A&color=111827&size=256'} 
                    alt={user?.name || 'User'}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-semibold text-white">{user?.name || 'User'}</h3>
                    <p className="text-sm text-slate-400 capitalize">{role}</p>
                  </div>
                </div>
                              </div>

            </div>
          </aside>

          {/* Main Content Area */}
          <main className="lg:col-span-3 space-y-6">
            {activeMenu === 'home' && (
              <>
                {/* Create Post (for Faculty and Alumni) */}
                {canPost && (
                  <div className="bg-slate-900 rounded-lg border border-slate-800 p-4">
                    <div className="flex items-start space-x-3">
                      <img 
                        src={user?.avatar || 'https://ui-avatars.com/api/?name=User&background=FDE68A&color=111827&size=256'} 
                        alt={user?.name || 'User'}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="Share something with the community..."
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Posts Feed */}
                <div className="space-y-4">
                  {followedPosts.map((post) => {
                    
                    /*const author = getAlumniById(post.alumniId);
                    if (!author) return null;
                    */
                  // const author = {
 // name: "Admin",
 // avatar: "https://ui-avatars.com/api/?name=Admin"
//};
const author =
  post.source === 'admin'
    ? {
        name: 'Admin',
        avatar: 'https://ui-avatars.com/api/?name=Admin',
        position: 'Admin',
        company: 'Alumni Connect',
      }
    : getAlumniById(post.alumniId) || {
        name: 'Unknown User',
        avatar: 'https://ui-avatars.com/api/?name=User',
        position: 'Faculty/Alumni',
        company: 'TKR College',
      };
                    return (
                      <article key={post.id} className="bg-slate-900 rounded-lg border border-slate-800 overflow-hidden">
                        {/* Post Header */}
                        <div className="p-4 flex items-start space-x-3">
                          <img 
                            src={author.avatar || 'https://ui-avatars.com/api/?name=User&background=FDE68A&color=111827&size=256'} 
                            alt={author.name || 'User'}
                            className="h-12 w-12 rounded-full object-cover"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-semibold text-white">{author.name || 'Unknown User'}</h4>
                                <p className="text-sm text-slate-400">
                                  {author.position || 'Alumni'} at {author.company || 'Company'}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {(() => {
                                    try {
                                      const d = new Date(post.created_at);
                                      return isNaN(d.getTime()) ? post.timestamp : d.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
                                    } catch { return post.timestamp; }
                                  })()}
                                </p>
                              </div>
                              {post.type === 'opportunity' && (
                                <span className="px-3 py-1 bg-[#FFD700] text-black text-xs font-bold rounded-full">
                                  Opportunity
                                </span>
                              )}
                              {post.type === 'event' && (
                                <span className="px-3 py-1 bg-blue-500 text-white text-xs font-bold rounded-full">
                                  Event
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Post Content */}
                        <div className="px-4 pb-3">
                          {post.title && <h3 className="text-lg font-semibold text-slate-100">{post.title}</h3>}
                          <p className="text-slate-200">{post.description}</p>
                        </div>

                        {/* Post Image */}
                        {post.file_url && (
                          <img 
                            src={post.file_url} 
                            alt="Post content"
                            className="w-full h-64 object-cover"
                          />
                        )}

                        {/* Post Actions */}
                        <div className="px-4 py-3 border-t border-slate-800">
                          <div className="flex items-center justify-between text-sm text-slate-400 mb-3">
                            <span>{post.likes || 0} likes</span>
                            <span>{post.comments || 0} comments</span>
                          </div>
                          <div className="flex items-center justify-around border-t border-slate-800 pt-2">
                            <button className="flex items-center space-x-2 px-4 py-2 text-slate-300 hover:text-red-500 hover:bg-slate-800 rounded-lg transition-colors">
                              <span className="text-lg">♥</span>
                              <span>Like</span>
                            </button>
                            <button className="flex items-center space-x-2 px-4 py-2 text-slate-300 hover:text-blue-500 hover:bg-slate-800 rounded-lg transition-colors">
                              <span className="text-lg">💬</span>
                              <span>Comment</span>
                            </button>
                            <button className="flex items-center space-x-2 px-4 py-2 text-slate-300 hover:text-green-500 hover:bg-slate-800 rounded-lg transition-colors">
                              <span className="text-lg">↗</span>
                              <span>Share</span>
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                  
                  {followedPosts.length === 0 && (
                    <div className="text-center py-12 bg-slate-800 rounded-lg border border-slate-700">
                      <Bell className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-white">No posts yet</h3>
                      <p className="text-slate-400">Follow some alumni to see their posts here.</p>
                    </div>
                  )}
                </div>
              </>
            )}

            {activeMenu === 'post' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white">Create Post</h2>

                {!canPost ? (
                  <div className="text-center py-12 bg-slate-800 rounded-lg border border-slate-700">
                    <p className="text-slate-400">You do not have permission to create posts.</p>
                  </div>
                ) : (
                  <div className="bg-slate-900 rounded-lg border border-slate-800 p-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Type</label>
                        <select
                          value={postType}
                          onChange={(e) => setPostType(e.target.value as any)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                        >
                          <option value="general">General</option>
                          <option value="opportunity">Opportunity</option>
                          <option value="event">Event</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Title</label>
                        <input
                          type="text"
                          value={postTitle}
                          onChange={(e) => setPostTitle(e.target.value)}
                          placeholder="Post title (optional)"
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-400"
                        />
                        <label className="block text-sm font-medium text-slate-300 mb-1 mt-3">Content</label>
                        <textarea
                          value={postContent}
                          onChange={(e) => setPostContent(e.target.value)}
                          rows={6}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-400"
                          placeholder="Write your post here..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Attach file / image (optional)</label>
                        <label className="mt-2 flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-4 cursor-pointer transition-colors bg-slate-800 border-slate-700 hover:border-yellow-500">
                          <input
                            type="file"
                            accept="image/*,.pdf,.doc,.docx"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              setPostFileName(file.name);
                              const reader = new FileReader();
                              reader.onload = (ev) => setPostImage((ev.target?.result as string) || null);
                              reader.readAsDataURL(file);
                            }}
                            className="hidden"
                          />
                          <div className="text-slate-400 text-sm">Click to choose a file, or drop it here</div>
                          {postFileName && <div className="text-slate-200 text-sm mt-2">{postFileName}</div>}
                        </label>
                        {postImage && (
                          <div className="mt-3">
                            <img src={postImage} alt="preview" className="max-h-48 rounded-md object-contain" />
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => {
                            if (!postContent.trim()) return;
                            addPost({
  title: postTitle || undefined,
  alumniId: user?.id || 'unknown',
  authorRole: role,
  content: postContent.trim(),
  type: postType,
  likes: 0,
  comments: 0,
  image: postImage || undefined,
});
                            setPostTitle('');
                            setPostContent('');
                            setPostType('general');
                            setPostImage(null);
                            setActiveMenu('home');
                          }}
                          className="px-4 py-2 bg-[#FFD700] text-black rounded-lg font-semibold hover:bg-yellow-600"
                        >
                          Publish
                        </button>
                        <button
                          onClick={() => { setPostContent(''); setPostType('general'); setPostImage(null); }}
                          className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeMenu === 'events' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">Events</h2>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => setEventView('upcoming')}
                      className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                        eventView === 'upcoming' 
                          ? 'bg-[#FFD700] text-black hover:bg-yellow-600' 
                          : 'bg-slate-700 text-white hover:bg-slate-600'
                      }`}
                    >
                      Upcoming Events
                    </button>
                    <button 
                      onClick={() => setEventView('current')}
                      className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                        eventView === 'current' 
                          ? 'bg-[#FFD700] text-black hover:bg-yellow-600' 
                          : 'bg-slate-700 text-white hover:bg-slate-600'
                      }`}
                    >
                      Current Events
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {(eventView === 'upcoming' ? upcomingEvents : currentEvents).map((event) => (
                    <div key={event.id} className="bg-slate-900 rounded-lg border border-slate-800 overflow-hidden hover:border-[#FFD700] transition-colors">
                      <img 
                        src={event.image} 
                        alt={event.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-white mb-2">{event.title}</h3>
                        <p className="text-slate-300 mb-4">{event.date} at {event.time}</p>
                        <p className="text-slate-400 text-sm mb-4">{event.location}</p>
                        <button className="w-full py-2 bg-[#FFD700] text-black rounded-lg font-semibold hover:bg-yellow-600 transition-colors">
                          Register
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {(eventView === 'upcoming' ? upcomingEvents : currentEvents).length === 0 && (
                    <div className="col-span-full text-center py-12 bg-slate-800 rounded-lg border border-slate-700">
                      <Briefcase className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-white">No events available</h3>
                      <p className="text-slate-400">
                        {eventView === 'upcoming' 
                          ? 'Check back later for upcoming events.' 
                          : 'No events are available'
                        }
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeMenu === 'community' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white">Community Discussion</h2>
                
                <div className="bg-slate-900 rounded-lg border border-slate-800 p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Joined Communities</h3>
                  <p className="text-slate-400 mb-4">You haven't joined any communities yet.</p>
                  <button className="px-4 py-2 bg-[#FFD700] text-black rounded-lg font-semibold hover:bg-yellow-600 transition-colors">
                    Browse Communities
                  </button>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-white">Recent Discussions</h3>
                  <div className="text-center py-12 bg-slate-800 rounded-lg border border-slate-700">
                    <MessageSquare className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white">No discussions yet</h3>
                    <p className="text-slate-400">Join a community to see discussions here.</p>
                  </div>
                </div>
              </div>
            )}

            {activeMenu === 'opportunities' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white">Opportunities</h2>
                
                <div className="space-y-4">
                  {followedJobs.map((job) => (
                    <div key={job.id} className="bg-slate-900 rounded-lg border border-slate-800 p-6 hover:border-[#FFD700] transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white mb-2">{job.title}</h3>
                          <p className="text-slate-300 mb-3">{job.company}</p>
                          <div className="flex items-center space-x-4 text-sm text-slate-400 mb-4">
                            <span className="px-2 py-1 bg-slate-700 rounded">{job.type}</span>
                            <span>{job.location}</span>
                            <span>Posted {(() => {
                              try {
                                const d = new Date(job.postedDate);
                                return isNaN(d.getTime()) ? job.postedDate : d.toLocaleDateString();
                              } catch { return job.postedDate; }
                            })()}</span>
                          </div>
                          <p className="text-slate-200">{job.description}</p>
                        </div>
                        <button className="px-6 py-2 bg-[#FFD700] text-black rounded-lg font-semibold hover:bg-yellow-600 transition-colors ml-6">
                          Apply
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {followedJobs.length === 0 && (
                    <div className="text-center py-12 bg-slate-800 rounded-lg border border-slate-700">
                      <Briefcase className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-white">No opportunities available</h3>
                      <p className="text-slate-400">Check back later for new opportunities.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeMenu === 'status' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white">Activity</h2>
                
                <div className="bg-slate-900 rounded-lg border border-slate-800 p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Your Activity</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg">
                      <div>
                        <h4 className="font-semibold text-white">Following</h4>
                        <p className="text-sm text-slate-400">Alumni you follow</p>
                      </div>
                      <span className="text-2xl font-bold text-[#FFD700]">
                        {following?.length || 0}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg">
                      <div>
                        <h4 className="font-semibold text-white">Events Attended</h4>
                        <p className="text-sm text-slate-400">Events you've participated in</p>
                      </div>
                      <span className="text-2xl font-bold text-[#FFD700]">0</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeMenu === 'profile' && (
              <div className="space-y-6 pb-24">
                {/* Profile Header */}
                <div className="flex items-end justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white">{user?.name}</h2>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={startEditing} 
                      className="bg-[#FFD700] text-black px-4 py-2 rounded-lg font-medium hover:bg-yellow-400"
                    >
                      Edit Profile
                    </button>
                                      </div>
                </div>

                {/* Edit Form */}
                {isEditing ? (
                  <div className="bg-slate-900 rounded-lg border border-slate-800 p-6 space-y-4">
                    {/* Avatar Section */}
                    <div className="flex items-center gap-4">
                      <label htmlFor="profile-avatar" className="cursor-pointer">
                        <img 
                          src={formData.avatar || user?.avatar || 'https://ui-avatars.com/api/?name=User&background=FDE68A&color=111827&size=256'} 
                          alt="Profile"
                          className="h-24 w-24 rounded-full object-cover border-2 border-[#FFD700] hover:opacity-80 transition-opacity"
                        />
                      </label>
                      <input id="profile-avatar" type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                      <div>
                        <p className="text-white font-medium">Click avatar to change profile image</p>
                        <p className="text-xs text-slate-400">Supports: JPG, PNG, GIF</p>
                      </div>
                    </div>

                    <hr className="border-slate-700" />

                    {/* Form Fields */}
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">College Name *</label>
                        <input
                          type="text"
                          placeholder="Your college name"
                          value={formData.collegeName}
                          onChange={(e) => setFormData(prev => ({ ...prev, collegeName: e.target.value }))}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Roll Number *</label>
                        <input
                          type="text"
                          placeholder="Your roll number"
                          value={formData.rollNumber}
                          onChange={(e) => setFormData(prev => ({ ...prev, rollNumber: e.target.value }))}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Department *</label>
                        <input
                          type="text"
                          placeholder="Your department"
                          value={formData.department}
                          onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-1">Year of Joining</label>
                          <input
                            type="number"
                            min="1950"
                            max={new Date().getFullYear()}
                            placeholder="e.g., 2020"
                            value={user?.yearOfJoining || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, yearOfJoining: parseInt(e.target.value) }))}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-1">Year of Passing Out</label>
                          <input
                            type="number"
                            min="1950"
                            max={new Date().getFullYear() + 10}
                            placeholder="e.g., 2024"
                            value={user?.passedOutYear || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, passedOutYear: parseInt(e.target.value) }))}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Study Year *</label>
                        <input
                          type="text"
                          placeholder="Your year (e.g., 2nd Year)"
                          value={formData.year}
                          onChange={(e) => setFormData(prev => ({ ...prev, year: e.target.value }))}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">About</label>
                        <textarea
                          placeholder="Tell us about yourself (optional)"
                          value={formData.about}
                          onChange={(e) => setFormData(prev => ({ ...prev, about: e.target.value }))}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
                          rows={4}
                        />
                      </div>

                      {/* Skills */}
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Skills *</label>
                        <div className="flex gap-2 mb-2">
                          <input
                            type="text"
                            placeholder="Add a skill"
                            value={newSkill}
                            onChange={(e) => setNewSkill(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                            className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
                          />
                          <button onClick={addSkill} className="bg-[#FFD700] text-black px-4 py-2 rounded-lg font-medium hover:bg-yellow-400">
                            Add Skill
                          </button>
                        </div>
                        {skills.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {skills.map((skill, idx) => (
                              <div key={idx} className="bg-slate-700 text-white px-3 py-1 rounded-lg text-sm flex items-center gap-2">
                                {skill}
                                <button onClick={() => removeSkill(idx)} className="text-red-400 hover:text-red-300 font-bold">×</button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">LinkedIn URL *</label>
                        <input
                          type="text"
                          placeholder="https://linkedin.com/in/your-profile"
                          value={formData.linkedin}
                          onChange={(e) => setFormData(prev => ({ ...prev, linkedin: e.target.value }))}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
                        />
                      </div>

                      {/* Other Links */}
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Other Links</label>
                        <div className="space-y-2 mb-3">
                          <input
                            type="text"
                            placeholder="Link title (e.g., Portfolio)"
                            value={newLink.title}
                            onChange={(e) => setNewLink(prev => ({ ...prev, title: e.target.value }))}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
                          />
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Link URL"
                              value={newLink.url}
                              onChange={(e) => setNewLink(prev => ({ ...prev, url: e.target.value }))}
                              className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
                            />
                            <button onClick={addLink} className="bg-[#FFD700] text-black px-4 py-2 rounded-lg font-medium hover:bg-yellow-400">
                              Add Link
                            </button>
                          </div>
                        </div>
                        {links.length > 0 && (
                          <div className="space-y-2">
                            {links.map((link: any, idx: number) => (
                              <div key={idx} className="bg-slate-700 px-4 py-2 rounded-lg flex items-center justify-between">
                                <div>
                                  <p className="text-white text-sm font-medium">{link.title}</p>
                                  <p className="text-slate-400 text-xs truncate">{link.url}</p>
                                </div>
                                <button onClick={() => removeLink(idx)} className="text-red-400 hover:text-red-300 font-bold">×</button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Resume Upload */}
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Resume Upload *</label>
                        <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2">
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={handleResumeUpload}
                            className="text-white text-sm flex-1"
                          />
                        </div>
                        {formData.resume && <p className="text-xs text-green-400 mt-2">✓ Resume selected</p>}
                      </div>
                    </div>

                    <hr className="border-slate-700" />

                    {/* Save/Cancel Buttons */}
                    <div className="flex gap-3">
                      <button 
                        onClick={handleSave} 
                        className="flex-1 bg-[#FFD700] text-black py-3 px-4 rounded-lg font-semibold hover:bg-yellow-400"
                      >
                        Save Profile
                      </button>
                      <button 
                        onClick={handleCancel} 
                        className="flex-1 bg-slate-700 text-white py-3 px-4 rounded-lg font-semibold hover:bg-slate-600"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Profile View */
                  <div className="bg-slate-900 rounded-lg border border-slate-800 p-6 space-y-6">
                    {/* Profile Avatar and Basic Info */}
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                      <img 
                        src={user?.avatar || 'https://ui-avatars.com/api/?name=User&background=FDE68A&color=111827&size=256'} 
                        alt={user?.name}
                        className="h-32 w-32 rounded-full object-cover border-4 border-[#FFD700]"
                      />
                      <div className="flex-1 w-full text-center md:text-left">
                        <h3 className="text-2xl font-bold text-white mb-4">{user?.name}</h3>
                        
                        <div className="flex justify-center md:justify-start gap-8 mb-4 text-white text-lg">
                          <div><span className="font-bold">{posts?.filter(p => p.alumniId === user?.id).length || 0}</span> posts</div>
                          <div><span className="font-bold">{user?.id === 'admin' ? 124 : Math.floor(Math.random() * 50) + 10}</span> followers</div>
                          <div><span className="font-bold">{following?.length || 0}</span> following</div>
                        </div>

                        <div className="text-sm">
                          {user?.department && <p className="text-white font-medium text-base">{user.department} {user?.year ? `- ${user.year}` : ''}</p>}
                          {user?.collegeName && <p className="text-slate-300">{user.collegeName}</p>}
                          {user?.about && <p className="text-slate-200 mt-2 whitespace-pre-wrap">{user.about}</p>}
                          {user?.email && <p className="text-slate-400 mt-1">{user.email}</p>}
                          {user?.linkedin && (
                            <a href={user.linkedin.startsWith('http') ? user.linkedin : `https://${user.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 hover:underline mt-1 block">
                              {user.linkedin.replace(/^https?:\/\/(www\.)?/, '')}
                            </a>
                          )}
                        </div>
                      </div>
                    </div>

                    <hr className="border-slate-700" />

                    {/* Profile Grid */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {user?.rollNumber && (
                        <div className="rounded-lg bg-slate-800 p-4">
                          <p className="text-sm text-slate-400">Roll Number</p>
                          <p className="text-white">{user.rollNumber}</p>
                        </div>
                      )}
                      {user?.year && (
                        <div className="rounded-lg bg-slate-800 p-4">
                          <p className="text-sm text-slate-400">Study Year</p>
                          <p className="text-white">{user.year}</p>
                        </div>
                      )}
                      {user?.yearOfJoining && (
                        <div className="rounded-lg bg-slate-800 p-4">
                          <p className="text-sm text-slate-400">Year of Joining</p>
                          <p className="text-white">{user.yearOfJoining}</p>
                        </div>
                      )}
                      {user?.passedOutYear && (
                        <div className="rounded-lg bg-slate-800 p-4">
                          <p className="text-sm text-slate-400">Year of Passing Out</p>
                          <p className="text-white">{user.passedOutYear}</p>
                        </div>
                      )}
                      {user?.linkedin && (
                        <div className="rounded-lg bg-slate-800 p-4">
                          <p className="text-sm text-slate-400">LinkedIn</p>
                          <a href={user.linkedin.startsWith('http') ? user.linkedin : `https://${user.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-[#FFD700] hover:underline block truncate">
                            View Profile
                          </a>
                        </div>
                      )}
                      {user?.resume && (
                        <div className="rounded-lg bg-slate-800 p-4">
                          <p className="text-sm text-slate-400">Resume</p>
                          <a href={user.resume} target="_blank" rel="noopener noreferrer" className="text-[#FFD700] hover:underline block truncate">
                            View Resume
                          </a>
                        </div>
                      )}
                    </div>

                    {/* About Section */}
                    {user?.about && (
                      <>
                        <hr className="border-slate-700" />
                        <div>
                          <p className="text-sm text-slate-400 mb-2">About</p>
                          <p className="text-white">{user.about}</p>
                        </div>
                      </>
                    )}

                    {/* Skills Section */}
                    {user?.skills?.length > 0 && (
                      <>
                        <hr className="border-slate-700" />
                        <div>
                          <p className="text-sm text-slate-400 mb-3">Skills</p>
                          <div className="flex flex-wrap gap-2">
                            {user.skills.map((skill, idx) => (
                              <span key={idx} className="bg-slate-700 text-white px-3 py-1 rounded-lg text-sm">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    {/* Other Links */}
                    {(user?.links?.length! > 0) && (
                      <>
                        <hr className="border-slate-700" />
                        <div>
                          <p className="text-sm text-slate-400 mb-3">Links</p>
                          <div className="space-y-2">
                            {user.links?.map((link: any, idx: number) => (
                              <a 
                                key={idx}
                                href={link.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="block bg-slate-800 px-4 py-2 rounded-lg text-[#FFD700] hover:bg-slate-700 hover:underline"
                              >
                                {link.title}
                              </a>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    {/* Logout */}
                    {role && (
                      <>
                        <hr className="border-slate-700" />
                        <div className="flex justify-center">
                          <span 
                            onClick={logout} 
                            className="text-red-600 hover:text-red-700 py-3 px-4 text-center cursor-pointer font-semibold"
                          >
                            Logout
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeMenu === 'chat' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white">Chat</h2>
                
                <div className="text-center py-12 bg-slate-800 rounded-lg border border-slate-700">
                  <MessageCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white">Chat functionality</h3>
                  <p className="text-slate-400">Coming soon...</p>
                </div>
              </div>
            )}

            {activeMenu === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white">Notifications</h2>
                
                <div className="text-center py-12 bg-slate-800 rounded-lg border border-slate-700">
                  <Bell className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white">Notifications</h3>
                  <p className="text-slate-400">Coming soon...</p>
                </div>
              </div>
            )}
          </main>

        </div>
      </div>
    </div>
  );
}
