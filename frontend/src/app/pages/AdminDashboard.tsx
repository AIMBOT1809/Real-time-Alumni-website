import React, { useEffect, useMemo, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Link } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../../supabaseClient';
import { PostImageViewer } from '../components/PostImageViewer';
import {
  ShieldCheck,
  Users,
  Briefcase,
  BarChart3,
  Plus,
  Search,
  LogOut,
  Home,
  FileText,
  Settings,
  MessageCircle,
  Eye,
  EyeOff,
} from 'lucide-react';

type CommunityAlumniRecord = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'alumni' | 'career-aspirant' | 'higher-education' |'entrepreneur';
  department?: string;
  company?: string;
  position?: string;
  experience?: string;
  status?: string;
  phone?: string;
  year?: string;
  graduationYear?: string;
  currentStatus?: string;
  createdAt?: string;
};
type AdminHighlight = {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  location?: string;
  images: string[];
  published: boolean;
  created_at?: string;
};
export function AdminDashboard() {
  const {
    user,
    role,
    logout,
    posts,
    jobs,
    events,
    alumni,
    addPost,
    addJob,
    addEvent,
  } = useAuth();

  const adminPosts = useMemo(
    () => posts.filter((post) => post.alumniId === user?.id),
    [posts, user?.id],
  );

  const [adminEvents, setAdminEvents] = useState<any[]>([]);

  const fetchAdminEvents = async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching admin events:', error);
      return;
    }

    const mapped = (data || []).map((r: any) => ({
      id: String(r.id),
      title: r.title ?? 'Untitled Event',
      date: r.event_date ?? r.date ?? '',
      time: r.event_time ?? r.time ?? '',
      location: r.location ?? '',
      type: r.type ?? 'Event',
      description: r.description ?? '',
      image: r.image_url ?? r.image ?? '',
      alumniId: r.created_by ?? r.alumniId ?? 'admin',
      attachmentUrl: r.file_url ?? undefined,
      attachmentName: r.file_name ?? undefined,
    }));

    setAdminEvents(mapped);
  };

  useEffect(() => {
    fetchAdminEvents();

    const channel = supabase
      .channel('admin_events_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'events' },
        () => {
          fetchAdminEvents();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const [activeTab, setActiveTab] = useState<'home' | 'reports' | 'analytics' | 'admins'>('home');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showJoiningYearFilter, setShowJoiningYearFilter] = useState(false);
  const [showPassedOutYearFilter, setShowPassedOutYearFilter] = useState(false);
  const [joiningYear, setJoiningYear] = useState('');
  const [passedOutYear, setPassedOutYear] = useState('');
  const [homeView, setHomeView] = useState<'overview' | 'posts' | 'events' | 'highlights'>('overview');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [showNewAdminPassword, setShowNewAdminPassword] = useState(false);
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [adminAccounts, setAdminAccounts] = useState<{ id: string; email: string; password: string; isCurrent?: boolean }[]>([]);
  const [editingAdminId, setEditingAdminId] = useState<string | null>(null);
  const [editedAdminEmail, setEditedAdminEmail] = useState('');
  const [editedAdminPassword, setEditedAdminPassword] = useState('');
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostDescription, setNewPostDescription] = useState('');
  const [newPostFile, setNewPostFile] = useState<File | null>(null);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDescription, setNewEventDescription] = useState('');
  const [newEventDate, setNewEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [newEventTime, setNewEventTime] = useState('17:00');
  const [newEventLocation, setNewEventLocation] = useState('Online');
  const [newEventType, setNewEventType] = useState<'Networking' | 'Workshop' | 'Webinar'>('Webinar');
  const [newEventFile, setNewEventFile] = useState<File | null>(null);
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);
  const [reportAlumni, setReportAlumni] = useState<CommunityAlumniRecord[]>([]);
  const [showHighlightForm, setShowHighlightForm] = useState(false);
  const [adminHighlights, setAdminHighlights] = useState<AdminHighlight[]>([]);
const [highlightTitle, setHighlightTitle] = useState('');
const [highlightDescription, setHighlightDescription] = useState('');
const [highlightCategory, setHighlightCategory] = useState('Alumni Meet');
const [highlightDate, setHighlightDate] = useState(new Date().toISOString().split('T')[0]);
const [highlightLocation, setHighlightLocation] = useState('');
const [highlightFiles, setHighlightFiles] = useState<File[]>([]);
const [dashboardCounts, setDashboardCounts] = useState({
  pendingPosts: 0,
  posts: 0,
  events: 0,
});
  useEffect(() => {
    fetchAllProfiles();

    const channel = supabase
      .channel('profiles_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'alumni_profiles' },
        () => {
          fetchAllProfiles();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  useEffect(() => {
  fetchAdminHighlights();

  const channel = supabase
    .channel('alumni_highlights_realtime')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'alumni_highlights' },
      () => {
        fetchAdminHighlights();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, []);

  const normalizeCurrentStatus = (value: any): CommunityAlumniRecord['role'] => {
  const status = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/_/g, '-')
  .replace(/\s+/g, '-');

  if (
    status === 'working-professional' ||
    status === 'workingprofessional' ||
    status === 'job' ||
    status === 'alumni'
  ) {
    return 'alumni';
  }

  if (
    status === 'career-aspirant' ||
    status === 'careeraspirant'
  ) {
    return 'career-aspirant';
  }

  if (
    status === 'higher-education' ||
    status === 'highereducation'
  ) {
    return 'higher-education';
  }

  if (
    status === 'entrepreneur' ||
    status === 'enterpreneur' ||
    status === 'business' ||
    status === 'startup'
  ) {
    return 'entrepreneur';
  }

  return 'alumni';
};

const fetchAllProfiles = async () => {
  const { data: alumniData, error: alumniError } = await supabase
    .from('alumni_profiles')
    .select('*');

  if (alumniError) {
    console.error('Error fetching profiles:', alumniError);
    return;
  }

  const alumniRecords: CommunityAlumniRecord[] = (alumniData || []).map(
    (item, index) => {
      const currentStatusValue =
        item.currentStatus ||
        item.current_status ||
        item.Current_Status ||
        item.CurrentStatus ||
        item.status ||
        item.role;

      return {
        id: item.id || `a-${index}`,
        name: item.First_Name || item.name || '',
        email: item.Email_Address || item.email || '',
        phone: item.Phone_Number || item.phone || '',
        graduationYear: String(item.Passed_Out_Year || item.graduationYear || ''),
        year: String(item.Year_of_Joining || item.year || ''),
        role: normalizeCurrentStatus(currentStatusValue),
        department: String(item.Department || item.department || '').toUpperCase(),
        currentStatus: currentStatusValue,
        createdAt: item.created_at,
      };
    }
  );

  setReportAlumni(alumniRecords);
};
  const fetchAdminHighlights = async () => {
  const { data, error } = await supabase
    .from('alumni_highlights')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching alumni highlights:', error);
    return;
  }

  setAdminHighlights(data || []);
};
const fetchDashboardCounts = async () => {
  const { count: pendingPostsCount, error: pendingPostsError } = await supabase
    .from('pending_posts')
    .select('*', { count: 'exact', head: true });

  const { count: adminPostsCount, error: adminPostsError } = await supabase
    .from('admin_posts')
    .select('*', { count: 'exact', head: true });

  const { count: eventsCount, error: eventsError } = await supabase
    .from('events')
    .select('*', { count: 'exact', head: true });

  if (pendingPostsError) {
    console.error('Pending posts count error:', pendingPostsError);
  }

  if (adminPostsError) {
    console.error('Admin posts count error:', adminPostsError);
  }

  if (eventsError) {
    console.error('Events count error:', eventsError);
  }

  setDashboardCounts({
    pendingPosts: pendingPostsCount || 0,
    posts: adminPostsCount || 0,
    events: eventsCount || 0,
  });
};
useEffect(() => {
  fetchDashboardCounts();

  const channel = supabase
    .channel('admin_dashboard_counts')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'pending_posts' },
      () => fetchDashboardCounts()
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'admin_posts' },
      () => fetchDashboardCounts()
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'events' },
      () => fetchDashboardCounts()
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, []);

  useEffect(() => {
    const currentUserEmail = user?.email;
    if (user?.role === 'admin' && currentUserEmail) {
      setAdminAccounts((prev) => {
        if (prev.some((admin) => admin.id === user.id)) {
          return prev;
        }
        return [
          {
            id: user.id,
            email: currentUserEmail,
            password: '********',
            isCurrent: true,
          },
          ...prev,
        ];
      });
    }
  }, [user]);

  const getPostTitle = (post: any) => {
    if (post.title) return post.title;
    const firstLine = post.content?.split('\n')[0]?.trim();
    return firstLine?.slice(0, 80) || 'Post update';
  };

  const getPostDescription = (post: any) => {
    const parts = post.content?.split('\n').slice(1).join('\n').trim();
    return parts || post.content || '';
  };

  const formatTimestamp = (timestamp: string) => {
    const parsed = Date.parse(timestamp);
    if (Number.isNaN(parsed)) return timestamp;
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(parsed));
  };

  const handleSubmitCreatePost = async() => {
    if (!user || role !== 'admin') return;
    const title = newPostTitle.trim();
    const description = newPostDescription.trim();

    if (!title || !description) {
      alert('Title and description are required.');
      return;
    }

    const attachmentUrl = newPostFile ? URL.createObjectURL(newPostFile) : undefined;

    const { error } = await supabase
      .from('admin_posts')
      .insert([
        {
          title,
          description,
          created_by: user.id,
          created_at: new Date().toISOString(),
          file_url: attachmentUrl
        }
      ]);

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    alert('Post published successfully');
    setNewPostTitle('');
    setNewPostDescription('');
    setNewPostFile(null);
  };

  const handleSubmitCreateEvent = async () => {
    if (!user || role !== 'admin') return;
    const title = newEventTitle.trim();
    const description = newEventDescription.trim();

    if (!title || !description || !newEventDate || !newEventTime || !newEventLocation.trim()) {
      alert('Please complete the event title, description, date, time, and location.');
      return;
    }

    let imageUrl = 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80';
    let fileUrl: string | undefined = undefined;

    // Upload file to Supabase Storage if provided
    if (newEventFile) {
      try {
        const fileExt = newEventFile.name.split('.').pop();
        const fileName = `events/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

        // Try to upload - if bucket doesn't exist, try to create it
        let { error: uploadError } = await supabase.storage
          .from('event_images')
          .upload(fileName, newEventFile);

        // If bucket not found, try to create it
        if (uploadError && uploadError.message?.includes('bucket')) {
          console.log('event_images bucket not found, attempting to create it...');
          const { error: createError } = await supabase.storage.createBucket('event_images', {
            public: true,
          });
          if (createError) {
            console.error('Failed to create bucket:', createError);
          } else {
            // Retry upload after creating bucket
            const retryResult = await supabase.storage
              .from('event_images')
              .upload(fileName, newEventFile);
            uploadError = retryResult.error;
          }
        }

        if (uploadError) {
          console.error('Image upload error (using default image):', uploadError);
          // Don't block event creation - just use default image
        } else {
          const { data } = supabase.storage.from('event_images').getPublicUrl(fileName);

          if (newEventFile.type.startsWith('image/')) {
            imageUrl = data.publicUrl;
          } else {
            fileUrl = data.publicUrl;
          }
        }
      } catch (uploadErr) {
        console.error('Upload exception (using default image):', uploadErr);
        // Don't block event creation
      }
    }

    const { error } = await supabase
      .from('events')
      .insert([
        {
          title: title,
          event_date: newEventDate,
          event_time: newEventTime,
          location: newEventLocation.trim(),
          type: newEventType,
          description: description,
          image_url: imageUrl,
          file_url: fileUrl,
          created_by: user.id
        }
      ]);

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    alert('Event published successfully');
    setNewEventTitle('');
    setNewEventDescription('');
    setNewEventFile(null);
  };
  const handleSubmitCreateHighlight = async () => {
  if (!user || role !== 'admin') return;

  const title = highlightTitle.trim();
  const description = highlightDescription.trim();

  if (!title || !description) {
    alert('Highlight title and description are required.');
    return;
  }

  const uploadedImageUrls: string[] = [];

  for (const file of highlightFiles) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${fileExt}`;

    const filePath = `highlights/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('alumni_highlights')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Image upload error:', uploadError);
      alert(uploadError.message);
      return;
    }

    const { data } = supabase.storage
      .from('alumni_highlights')
      .getPublicUrl(filePath);

    uploadedImageUrls.push(data.publicUrl);
  }

  const { error } = await supabase
    .from('alumni_highlights')
    .insert([
      {
        title,
        description,
        category: highlightCategory,
        date: highlightDate,
        location: highlightLocation.trim() || null,
        images: uploadedImageUrls,
        published: true,
        created_by: user.id,
      },
    ]);

  if (error) {
    console.error(error);
    alert(error.message);
    return;
  }

  alert('Alumni highlight published successfully');

  setHighlightTitle('');
  setHighlightDescription('');
  setHighlightCategory('Alumni Meet');
  setHighlightDate(new Date().toISOString().split('T')[0]);
  setHighlightLocation('');
  setHighlightFiles([]);
  setShowHighlightForm(false);

  fetchAdminHighlights();
};
  

  const handleCreateAdmin = async () => {
    if (!user || role !== 'admin') return;
    if (!newAdminEmail || !newAdminPassword) {
      alert('Please fill in all fields');
      return;
    }

    const currentSession = await supabase.auth.getSession();
    const currentRefreshToken = currentSession.data.session?.refresh_token;

    const { data, error } = await supabase.auth.signUp({
      email: newAdminEmail.trim(),
      password: newAdminPassword,
      options: {
        data: {
          role: 'admin',
        },
      },
    });

    if (error) {
      alert(`Unable to create admin account: ${error.message}`);
      return;
    }

    const currentAccessToken = currentSession.data.session?.access_token;
    if (currentRefreshToken && currentAccessToken) {
      await supabase.auth.setSession({
        access_token: currentAccessToken,
        refresh_token: currentRefreshToken,
      });
    }

    setNewAdminEmail('');
    setNewAdminPassword('');
    setShowAdminForm(false);

    alert(
      'Admin account request submitted successfully. The new admin will receive email instructions to verify and sign in.'
    );
  };

  const uniqueDepartments = useMemo(() => {
    const depts = new Set(reportAlumni.map(item => item.department).filter(Boolean));
    return Array.from(depts).sort();
  }, [reportAlumni]);

  const filteredAlumni = useMemo(() => {
    return reportAlumni.filter((item) => {
      const searchText = [item.name, item.email, item.phone, item.department, item.graduationYear]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      const matchesSearch = searchText.includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || item.department === filterStatus;
      const joinYearValue = String(item.year || '').trim();
      const passedOutYearValue = String(item.graduationYear || '').trim();
      const matchesJoiningYear = !showJoiningYearFilter || !joiningYear || joinYearValue === joiningYear;
      const matchesPassedOutYear = !showPassedOutYearFilter || !passedOutYear || passedOutYearValue === passedOutYear;

      return matchesSearch && matchesStatus && matchesJoiningYear && matchesPassedOutYear;
    });
  }, [reportAlumni, filterStatus, searchTerm, showJoiningYearFilter, showPassedOutYearFilter, joiningYear, passedOutYear]);

  const analyticsCounts = useMemo(() => {
    const totalRegistrations = reportAlumni.length;
    const alumniCount = reportAlumni.filter((item) => item.role === 'alumni').length;
    const higherEducationCount = reportAlumni.filter((item) => item.role === 'higher-education').length;
    const careerAspirantCount = reportAlumni.filter((item) => item.role === 'career-aspirant').length;
    const entrepreneurCount = reportAlumni.filter((item) => item.role === 'entrepreneur').length;
    const effectiveTotal = totalRegistrations || 1;

    return {
      totalRegistrations,
      alumniCount,
      higherEducationCount,
      careerAspirantCount,
      alumniRatio: Math.round((alumniCount / effectiveTotal) * 100),
      higherEducationRatio: Math.round((higherEducationCount / effectiveTotal) * 100),
      careerAspirantRatio: Math.round((careerAspirantCount / effectiveTotal) * 100),
      entrepreneurCount,
entrepreneurRatio: Math.round((entrepreneurCount / effectiveTotal) * 100),
    };
  }, [reportAlumni]);

  const registrationSegments = useMemo(() => {
    const segments = [
      { label: 'Working Professional', count: analyticsCounts.alumniCount, color: 'from-blue-500 to-sky-400', dashColor: '#0ea5e9' },
      { label: 'Higher Education', count: analyticsCounts.higherEducationCount, color: 'from-violet-500 to-fuchsia-400', dashColor: '#8b5cf6' },
      { label: 'Career Aspirant', count: analyticsCounts.careerAspirantCount, color: 'from-amber-400 to-orange-300', dashColor: '#f59e0b' },
      { label: 'Entrepreneur', count: analyticsCounts.entrepreneurCount, color: 'from-emerald-400 to-green-300', dashColor: '#10b981' },
    ];
    const total = analyticsCounts.totalRegistrations || 1;
    let offset = 0;

    return segments.map((segment) => {
      const percent = Math.round((segment.count / total) * 100);
      const segmentWithOffset = {
        ...segment,
        percent,
        offset,
      };
      offset += percent;
      return segmentWithOffset;
    });
  }, [analyticsCounts]);

  const timelineData = useMemo(() => {
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    
    const monthlyData = months.map(month => ({
      name: month,
      timelineAlumni: 0,
      timelineStudents: 0,
      timelineHigherEd: 0,
      timelineEntrepreneur: 0
    }));

    reportAlumni.forEach(profile => {
      if (!profile.createdAt) return;
      const date = new Date(profile.createdAt);
      if (isNaN(date.getTime())) return;
      
      const monthIndex = date.getMonth();
      const role = profile.role;
      
      if (role === 'alumni') {
        monthlyData[monthIndex].timelineAlumni++;
      } else if (role === 'higher-education') {
        monthlyData[monthIndex].timelineHigherEd++;
      } else if (role === 'career-aspirant') {
        monthlyData[monthIndex].timelineStudents++;
        } else if (role === 'entrepreneur') {
  monthlyData[monthIndex].timelineEntrepreneur++;
      }
    });

    return monthlyData;
  }, [reportAlumni]);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Admin Dashboard</h1>
          </div>
          <button
            onClick={() => logout?.()}
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>

      <div className="bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-2 justify-start">
            <button
              onClick={() => setActiveTab('home')}
              className={`flex items-center gap-3 px-6 py-3 border-b-4 text-base md:text-lg font-semibold transition-all rounded-t-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
                activeTab === 'home'
                  ? 'border-yellow-500 text-yellow-700 bg-white shadow-sm'
                  : 'border-transparent text-slate-700 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Home className="h-5 w-5" />
              <span className="leading-none">Home</span>
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className={`flex items-center gap-3 px-6 py-3 border-b-4 text-base md:text-lg font-semibold transition-all rounded-t-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
                activeTab === 'reports'
                  ? 'border-yellow-500 text-yellow-700 bg-white shadow-sm'
                  : 'border-transparent text-slate-700 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <FileText className="h-5 w-5" />
              <span className="leading-none">Community Report</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-3 px-6 py-3 border-b-4 text-base md:text-lg font-semibold transition-all rounded-t-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
                activeTab === 'analytics'
                  ? 'border-yellow-500 text-yellow-700 bg-white shadow-sm'
                  : 'border-transparent text-slate-700 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <BarChart3 className="h-5 w-5" />
              <span className="leading-none">Analytics Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('admins')}
              className={`flex items-center gap-3 px-6 py-3 border-b-4 text-base md:text-lg font-semibold transition-all rounded-t-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
                activeTab === 'admins'
                  ? 'border-yellow-500 text-yellow-700 bg-white shadow-sm'
                  : 'border-transparent text-slate-700 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Settings className="h-5 w-5" />
              <span className="leading-none">Admin Management</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'home' && (
          <div className="space-y-8">
            {homeView === 'overview' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link
                  to="/admin/post-approval"
                  className="text-left bg-white rounded-3xl border border-slate-200 p-8 shadow-sm transition hover:shadow-lg hover:border-yellow-300 hover:ring-2 hover:ring-yellow-200"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-100 text-yellow-700">
                      <ShieldCheck className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Post Approval</p>
                      <p className="text-xs text-slate-500">Review pending posts</p>
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-slate-900">
                    {dashboardCounts.pendingPosts}
                  </p>
                  <p className="mt-3 text-sm text-slate-500">
                    {dashboardCounts.pendingPosts === 0
  ? 'All posts reviewed!'
  : 'Posts awaiting your approval'}
                  </p>
                </Link>

                <button
                  type="button"
                  onClick={() => setHomeView('posts')}
                  className="text-left bg-white rounded-3xl border border-slate-200 p-8 shadow-sm transition hover:shadow-lg hover:border-slate-300"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 text-green-700">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Posts</p>
                      <p className="text-xs text-slate-500">View or create announcements</p>
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-slate-900">{dashboardCounts.posts}</p>
                  <p className="mt-3 text-sm text-slate-500">Review posts created by this admin.</p>
                </button>

                <button
                  type="button"
                  onClick={() => setHomeView('events')}
                  className="text-left bg-white rounded-3xl border border-slate-200 p-8 shadow-sm transition hover:shadow-lg hover:border-slate-300"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-700">
                      <BarChart3 className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Events</p>
                      <p className="text-xs text-slate-500">Publish and manage events</p>
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-slate-900">{dashboardCounts.events}</p>
                  <p className="mt-3 text-sm text-slate-500">Track events created by this admin.</p>
                </button>

                <button
                  type="button"
                  onClick={() => setHomeView('highlights')}
                  className="text-left bg-white rounded-3xl border border-slate-200 p-8 shadow-sm transition hover:shadow-lg hover:border-slate-300"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-100 text-purple-700">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Alumni Highlights</p>
                      <p className="text-xs text-slate-500">Share alumni meet photos and updates</p>
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-slate-900">{adminHighlights.length}</p>
                  <p className="mt-3 text-sm text-slate-500">Manage alumni highlights and memories.</p>
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="rounded-3xl border border-slate-200 bg-white p-3 shadow-sm">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center justify-start">
                      <button
                        type="button"
                        onClick={() => setHomeView('overview')}
                        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Home
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 justify-end">
                      <button
                        type="button"
                        onClick={() => setHomeView('posts')}
                        className={`flex items-center justify-center gap-2 px-6 py-3 border-b-4 text-sm md:text-base font-semibold transition-all rounded-t-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
                          homeView === 'posts'
                            ? 'border-yellow-500 text-yellow-700 bg-white shadow-sm'
                            : 'border-transparent text-slate-700 bg-white hover:text-slate-900 hover:bg-slate-50'
                        }`}
                      >
                        Post
                      </button>
                      <button
                        type="button"
                        onClick={() => setHomeView('events')}
                        className={`flex items-center justify-center gap-2 px-6 py-3 border-b-4 text-sm md:text-base font-semibold transition-all rounded-t-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
                          homeView === 'events'
                            ? 'border-yellow-500 text-yellow-700 bg-white shadow-sm'
                            : 'border-transparent text-slate-700 bg-white hover:text-slate-900 hover:bg-slate-50'
                        }`}
                      >
                        Event
                      </button>
                      <button
                        type="button"
                        onClick={() => setHomeView('highlights')}
                        className={`flex items-center justify-center gap-2 px-6 py-3 border-b-4 text-sm md:text-base font-semibold transition-all rounded-t-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
                          homeView === 'highlights'
                            ? 'border-yellow-500 text-yellow-700 bg-white shadow-sm'
                            : 'border-transparent text-slate-700 bg-white hover:text-slate-900 hover:bg-slate-50'
                        }`}
                      >
                        Highlights
                      </button>
                    </div>
                  </div>
                </div>

                {homeView === 'posts' && (
                  <div className="space-y-6">
                    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="text-lg font-semibold text-slate-900">All posts</p>
                          <p className="text-sm text-slate-500">Read, preview files, and create posts for the alumni community.</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setHomeView('posts')}
                          className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                          Create Post
                        </button>
                      </div>

                      <div className="mt-6 grid gap-4">
                        <div className="grid gap-3 md:grid-cols-[1fr_1.5fr] items-end">
                          <div>
                            <label className="block text-sm font-medium text-slate-700">Title</label>
                            <input
                              value={newPostTitle}
                              onChange={(e) => setNewPostTitle(e.target.value)}
                              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/20"
                              placeholder="Post title"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700">Upload file</label>
                            <input
                              type="file"
                              onChange={(e) => setNewPostFile(e.target.files?.[0] || null)}
                              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-700 focus:outline-none"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700">Description</label>
                          <textarea
                            value={newPostDescription}
                            onChange={(e) => setNewPostDescription(e.target.value)}
                            rows={4}
                            className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/20"
                            placeholder="Write the post content here..."
                          />
                        </div>

                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={handleSubmitCreatePost}
                            className="inline-flex items-center gap-2 rounded-full bg-yellow-500 px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-yellow-400 transition-colors"
                          >
                            <Plus className="h-4 w-4" />
                            Publish post
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {adminPosts.length > 0 ? (
                        adminPosts.map((post) => (
                          <div key={post.id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                              <div>
                                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">{post.type}</p>
                                <h3 className="mt-2 text-xl font-semibold text-slate-900">{getPostTitle(post)}</h3>
                                <p className="mt-2 text-sm text-slate-500">{formatTimestamp(post.timestamp)}</p>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-sm text-slate-600">
                                  {post.likes} likes
                                </span>
                                <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-sm text-slate-600">
                                  {post.comments} comments
                                </span>
                              </div>
                            </div>

                            <p className="mt-4 text-slate-600 whitespace-pre-line">{getPostDescription(post)}</p>

                            {post.image && (
                              <PostImageViewer
                                src={post.image}
                                alt="Post attachment"
                                className="max-h-96"
                              />
                            )}

                            {post.attachmentUrl && !post.image && (
                              <div className="mt-4 flex items-center gap-2 text-slate-600">
                                <a
                                  href={post.attachmentUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="font-medium text-slate-900 hover:text-yellow-600"
                                >
                                  {post.attachmentName ?? 'View attachment'}
                                </a>
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-slate-500">
                          No posts available.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {homeView === 'events' && (
                  <div className="space-y-6">
                    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="text-lg font-semibold text-slate-900">Past events</p>
                          <p className="text-sm text-slate-500">Publish a new event or review the most recent event activity.</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setHomeView('events')}
                          className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                          Create Event
                        </button>
                      </div>

                      <div className="mt-6 grid gap-3 lg:grid-cols-2">
                        <div>
                          <label className="block text-sm font-medium text-slate-700">Event title</label>
                          <input
                            value={newEventTitle}
                            onChange={(e) => setNewEventTitle(e.target.value)}
                            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/20"
                            placeholder="Enter event title"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700">Date</label>
                          <input
                            type="date"
                            value={newEventDate}
                            onChange={(e) => setNewEventDate(e.target.value)}
                            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/20"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700">Time</label>
                          <input
                            type="time"
                            value={newEventTime}
                            onChange={(e) => setNewEventTime(e.target.value)}
                            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/20"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700">Location</label>
                          <input
                            value={newEventLocation}
                            onChange={(e) => setNewEventLocation(e.target.value)}
                            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/20"
                            placeholder="Online or on-site location"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700">Type</label>
                          <select
                            value={newEventType}
                            onChange={(e) => setNewEventType(e.target.value as 'Networking' | 'Workshop' | 'Webinar')}
                            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/20"
                          >
                            <option value="Networking">Networking</option>
                            <option value="Workshop">Workshop</option>
                            <option value="Webinar">Webinar</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700">Upload image or file</label>
                          <input
                            type="file"
                            onChange={(e) => setNewEventFile(e.target.files?.[0] || null)}
                            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-700 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="mt-4">
                        <label className="block text-sm font-medium text-slate-700">Description</label>
                        <textarea
                          value={newEventDescription}
                          onChange={(e) => setNewEventDescription(e.target.value)}
                          rows={4}
                          className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/20"
                          placeholder="Add event details, speaker notes, or agenda items"
                        />
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={handleSubmitCreateEvent}
                          className="inline-flex items-center gap-2 rounded-full bg-yellow-500 px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-yellow-400 transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                          Publish event
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {adminEvents.length > 0 ? (
                        [...adminEvents]
                          .sort((a, b) => Number(new Date(b.date)) - Number(new Date(a.date)))
                          .map((event) => (
                            <div key={event.id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                <div>
                                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">{event.type}</p>
                                  <h3 className="mt-2 text-xl font-semibold text-slate-900">{event.title}</h3>
                                  <p className="mt-2 text-sm text-slate-500">{formatTimestamp(event.date)} · {event.time} · {event.location}</p>
                                </div>
                                <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-2 text-sm text-slate-600">Organized by {event.alumniId}</span>
                              </div>

                              <p className="mt-4 text-slate-600">{(event as any).description ?? 'Review the event details and attachments below.'}</p>

                              {event.image && (
                                <img
                                  src={event.image}
                                  alt={event.title}
                                  className="mt-4 h-56 w-full rounded-3xl object-cover"
                                />
                              )}

                              {(event as any).attachmentUrl && !event.image && (
                                <div className="mt-4 flex items-center gap-2 text-slate-600">
                                  <a
                                    href={(event as any).attachmentUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="font-medium text-slate-900 hover:text-yellow-600"
                                  >
                                    {(event as any).attachmentName ?? 'View file'}
                                  </a>
                                </div>
                              )}
                            </div>
                          ))
                      ) : (
                        <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-slate-500">
                          No events available.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {homeView === 'highlights' && (
                  <div className="space-y-6">
                    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="text-lg font-semibold text-slate-900">Alumni Highlights</p>
                          <p className="text-sm text-slate-500">Create and manage highlight posts with multiple images for the landing page carousel.</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowHighlightForm(!showHighlightForm)}
                          className="inline-flex items-center gap-2 rounded-full bg-yellow-500 px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-yellow-400 transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                          Create Alumni Highlight
                        </button>
                      </div>
                      {showHighlightForm && (
  <div className="mt-6 space-y-4 border-t border-slate-200 pt-6">
    <div className="grid gap-4 md:grid-cols-2">
      <div>
        <label className="block text-sm font-medium text-slate-700">
          Highlight Title
        </label>
        <input
          type="text"
          value={highlightTitle}
          onChange={(e) => setHighlightTitle(e.target.value)}
          placeholder="Enter highlight title"
          className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/20"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">
          Category
        </label>
        <select
          value={highlightCategory}
          onChange={(e) => setHighlightCategory(e.target.value)}
          className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/20"
        >
          <option value="Alumni Meet">Alumni Meet</option>
          <option value="Discussion">Discussion</option>
          <option value="Guidance Session">Guidance Session</option>
          <option value="Webinar">Webinar</option>
          <option value="Guest Lecture">Guest Lecture</option>
          <option value="Event Memories">Event Memories</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">
          Date
        </label>
        <input
          type="date"
          value={highlightDate}
          onChange={(e) => setHighlightDate(e.target.value)}
          className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/20"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">
          Location
        </label>
        <input
          type="text"
          value={highlightLocation}
          onChange={(e) => setHighlightLocation(e.target.value)}
          placeholder="Enter location"
          className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/20"
        />
      </div>
    </div>

    <div>
      <label className="block text-sm font-medium text-slate-700">
        Description
      </label>
      <textarea
        rows={3}
        value={highlightDescription}
        onChange={(e) => setHighlightDescription(e.target.value)}
        placeholder="Enter highlight description"
        className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/20"
      />
    </div>

    <div>
  <label className="block text-sm font-medium text-slate-700">
    Upload Images
  </label>

  <input
    type="file"
    multiple
    accept="image/*"
    onChange={(e) => setHighlightFiles(Array.from(e.target.files || []))}
    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-700 focus:outline-none"
  />

  <p className="mt-1 text-xs text-slate-500">
    You can upload multiple images for this alumni highlight.
  </p>

  {highlightFiles.length > 0 && (
    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
      {highlightFiles.map((file, index) => (
        <div
          key={index}
          className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600"
        >
          {file.name}
        </div>
      ))}
    </div>
  )}
</div>
    <div className="flex justify-end">
      <button
        type="button"
        onClick={handleSubmitCreateHighlight}
        className="inline-flex items-center gap-2 rounded-full bg-yellow-500 px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-yellow-400 transition-colors"
      >
        <Plus className="h-4 w-4" />
        Publish Highlight
      </button>
    </div>
  </div>
)}

                      
                    <div className="space-y-4">
                      <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-slate-500">
                        No highlights created yet. Click "Create Alumni Highlight" to get started.
                      </div>
                      </div>
                </div>
              </div>
            )}
          </div>
        )}
        </div>
        )}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="bg-white/85 backdrop-blur-xl rounded-[28px] border border-slate-200/40 px-4 py-4 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
              <div className="grid gap-3 lg:grid-cols-[1.7fr_1fr_1fr] items-start">
                <div className="h-full">
                  <label className="sr-only">Search by name, email, company, or role</label>
                  <div className="relative h-12">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 h-4 w-4 transition-colors duration-200" />
                    <input
                      type="text"
                      placeholder="Search by name, email, company, or role..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="h-full w-full rounded-2xl border border-slate-200 bg-white/90 px-12 text-sm text-slate-900 shadow-sm transition duration-200 ease-in-out focus:border-transparent focus:bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400/50 hover:shadow-md"
                    />
                  </div>
                </div>
                <div className="h-full">
                  <label className="sr-only">Role filter</label>
                  <div className="h-12 rounded-2xl border border-slate-200 bg-white px-3 shadow-sm transition duration-200 ease-in-out hover:shadow-md">
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="h-full w-full rounded-2xl border-none bg-transparent px-3 text-sm text-slate-900 outline-none focus:ring-0"
                    >
                      <option value="all">All Departments</option>
                      {['CSE', 'CSD', 'CSM', 'ECE', 'EEE', 'MECH', 'IT', 'CIVIL'].map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="h-full rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition duration-200 ease-in-out hover:shadow-md">
                  <div className="flex flex-col h-full justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Year filters</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setShowJoiningYearFilter((prev) => !prev)}
                          className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                            showJoiningYearFilter
                              ? 'bg-slate-900 text-white shadow-sm shadow-slate-900/10'
                              : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200'
                          }`}
                        >
                          Joining Year
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowPassedOutYearFilter((prev) => !prev)}
                          className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                            showPassedOutYearFilter
                              ? 'bg-slate-900 text-white shadow-sm shadow-slate-900/10'
                              : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200'
                          }`}
                        >
                          Passed Out Year
                        </button>
                      </div>
                    </div>
                    <div className={`grid gap-2 sm:grid-cols-2 ${showJoiningYearFilter || showPassedOutYearFilter ? '' : 'hidden'}`}>
                      {showJoiningYearFilter && (
                        <div className="h-11">
                          <label className="sr-only">Enter Joining Year</label>
                          <input
                            type="text"
                            value={joiningYear}
                            onChange={(e) => setJoiningYear(e.target.value)}
                            placeholder="Enter Joining Year"
                            className="h-full w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 shadow-sm transition duration-200 ease-in-out focus:border-transparent focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
                          />
                        </div>
                      )}
                      {showPassedOutYearFilter && (
                        <div className="h-11">
                          <label className="sr-only">Enter Passed Out Year</label>
                          <input
                            type="text"
                            value={passedOutYear}
                            onChange={(e) => setPassedOutYear(e.target.value)}
                            placeholder="Enter Passed Out Year"
                            className="h-full w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 shadow-sm transition duration-200 ease-in-out focus:border-transparent focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Name</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Department</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Email Address</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Phone Number</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Year of Joining</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Passed Out Year</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {reportAlumni.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                          No registered users found
                        </td>
                      </tr>
                    ) : filteredAlumni.length > 0 ? (
                      filteredAlumni.map((alumnus) => {
                        return (
                          <tr key={alumnus.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={alumnus.avatar ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(alumnus.name)}&background=e2e8f0&color=475569&size=64`}
                                  alt={alumnus.name}
                                  className="h-8 w-8 rounded-full object-cover"
                                />
                                <Link to={`/admin/user/${encodeURIComponent(alumnus.email)}`} className="font-medium text-blue-600 hover:underline">
                                  {alumnus.name}
                                </Link>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-slate-100 text-slate-700`}>
                                {alumnus.department || '—'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600">{alumnus.email || '—'}</td>
                            <td className="px-6 py-4 text-sm text-slate-600">{alumnus.phone || '—'}</td>
                            <td className="px-6 py-4 text-sm text-slate-600">{alumnus.year || '—'}</td>
                            <td className="px-6 py-4 text-sm text-slate-600">{alumnus.graduationYear || '—'}</td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                          No users found matching your search criteria
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex items-center justify-between">
                <span className="text-sm text-slate-600">
                  Showing <span className="font-semibold">{filteredAlumni.length}</span> of <span className="font-semibold">{reportAlumni.length}</span> users
                </span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="bg-gradient-to-br from-[#1c4e40] to-[#0f2a22] rounded-[32px] p-6 lg:p-8 text-white shadow-2xl">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              {[
                { title: 'Total Registrations', value: analyticsCounts.totalRegistrations, subtitle: 'All registered users', accent: 'from-sky-400 via-cyan-300 to-slate-100', detail: 'Overall network size' },
                { title: 'Working Professional', value: analyticsCounts.alumniCount, subtitle: `${analyticsCounts.alumniRatio}% of total`, accent: 'from-blue-500 via-sky-400 to-cyan-400', detail: 'Working professional growth' },
                { title: 'Higher Education', value: analyticsCounts.higherEducationCount, subtitle: `${analyticsCounts.higherEducationRatio}% of total`, accent: 'from-violet-500 via-fuchsia-400 to-pink-300', detail: 'Institutional partners' },
                { title: 'Career Aspirant', value: analyticsCounts.careerAspirantCount, subtitle: `${analyticsCounts.careerAspirantRatio}% of total`, accent: 'from-amber-400 via-orange-300 to-rose-200', detail: 'Postgraduate network' },
                { title: 'Entrepreneur', value: analyticsCounts.entrepreneurCount, subtitle: `${analyticsCounts.entrepreneurRatio}% of total`, accent: 'from-emerald-400 via-green-300 to-lime-200', detail: 'Entrepreneur network' },
              ].map((card) => (
                <div
                  key={card.title}
                  className="group flex flex-col justify-between min-h-[220px] rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-md transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl"
                >
                  <div className={`h-1.5 w-24 rounded-full bg-gradient-to-r ${card.accent} shadow-lg`} />
                  <div className="flex flex-col justify-between h-full gap-4 pt-4">
                    <div className="min-w-0">
                      <p className="text-sm uppercase tracking-[0.22em] text-white/70 font-semibold truncate">{card.title}</p>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-sm text-white/50 truncate">{card.subtitle}</p>
                      </div>
                      <div className="flex-shrink-0">
                        <p className="text-4xl font-bold text-white leading-tight sm:text-3xl md:text-4xl truncate">{card.value}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white/60 truncate">{card.detail}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr] mt-6">
              <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-md">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-base font-semibold text-white">Registration breakdown</p>
                    <p className="mt-1 text-sm text-white/60">Live distribution across all user types.</p>
                  </div>
                  <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/80 shadow-md">
                    Updated now
                  </span>
                </div>
                <div className="mt-6 grid gap-6 lg:grid-cols-[0.95fr_0.8fr] xl:grid-cols-[0.8fr_0.9fr]">
                  <div className="relative flex items-center justify-center rounded-[28px] bg-black/20 p-4">
                    <div className="relative h-72 w-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={registrationSegments}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="count"
                            nameKey="label"
                            onMouseEnter={(_, index) => setHoveredSegment(registrationSegments[index].label)}
                            onMouseLeave={() => setHoveredSegment(null)}
                            stroke="none"
                          >
                            {registrationSegments.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={entry.dashColor} 
                                style={{
                                  transition: 'all 0.3s ease',
                                  filter: hoveredSegment === entry.label ? 'brightness(1.2) drop-shadow(0px 0px 10px rgba(255,255,255,0.3))' : hoveredSegment ? 'opacity(0.3)' : 'none',
                                  transformOrigin: 'center',
                                  transform: hoveredSegment === entry.label ? 'scale(1.05)' : 'scale(1)',
                                  cursor: 'pointer'
                                }}
                              />
                            ))}
                          </Pie>
                          <RechartsTooltip 
                            formatter={(value: number, name: string) => [`${value} users`, name]}
                            contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: 'rgba(15, 23, 42, 0.9)', color: '#fff' }}
                            itemStyle={{ fontWeight: 600 }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="absolute inset-x-0 top-1/2 flex translate-y-[-50%] flex-col items-center text-center">
                      <p className="text-xs uppercase tracking-[0.24em] text-white/50">{hoveredSegment || 'Total'}</p>
                      <p className="mt-2 text-3xl font-semibold text-white">
                        {hoveredSegment
                          ? registrationSegments.find((segment) => segment.label === hoveredSegment)?.count
                          : analyticsCounts.totalRegistrations}
                      </p>
                      <p className="text-sm text-white/50">
                        {hoveredSegment
                          ? `${registrationSegments.find((segment) => segment.label === hoveredSegment)?.percent}%`
                          : '100%'}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {registrationSegments.map((segment) => (
                      <button
                        key={segment.label}
                        type="button"
                        onMouseEnter={() => setHoveredSegment(segment.label)}
                        onMouseLeave={() => setHoveredSegment(null)}
                        className="group w-full rounded-3xl border border-white/5 bg-white/5 p-4 text-left transition hover:border-white/20 hover:bg-white/10"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <span className={`inline-flex h-3.5 w-3.5 rounded-full bg-gradient-to-r ${segment.color}`} />
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-white">{segment.label}</p>
                              <p className="text-xs text-white/60">{segment.count} users</p>
                            </div>
                          </div>
                          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white">
                            {segment.percent}%
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-md">
                <p className="text-base font-semibold text-white">Engagement overview</p>
                <div className="mt-5 grid gap-4">
                  <div className="rounded-[24px] bg-black/20 p-4 ring-1 ring-white/10">
                    <p className="text-xs uppercase tracking-[0.22em] text-white/60">Registration velocity</p>
                    <div className="mt-4 h-32 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={registrationSegments} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                          <XAxis 
                            dataKey="label" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.6)' }} 
                            interval={0}
                          />
                          <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.6)' }} 
                            width={30}
                          />
                          <RechartsTooltip
                            formatter={(value: number, name: string) => [`${value} users`, name]}
                            contentStyle={{ borderRadius: '8px', border: 'none', backgroundColor: 'rgba(15, 23, 42, 0.9)', color: '#fff', fontSize: '12px' }}
                            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                          />
                          <Bar 
                            dataKey="count" 
                            radius={[4, 4, 0, 0]}
                            animationDuration={1000}
                          >
                            {registrationSegments.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.dashColor} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="rounded-[24px] bg-black/20 p-4 ring-1 ring-white/10">
                    <p className="text-xs uppercase tracking-[0.22em] text-white/60">Summary</p>
                    <p className="mt-3 text-sm text-white/70">Monitor total registrations and user type mix for a strategic view of network growth.</p>
                    <div className="mt-4 grid gap-3">
                      <div className="flex items-center justify-between rounded-3xl bg-white/5 p-3 text-sm text-white ring-1 ring-white/10">
                        <span>High-growth segment</span>
                        <span className="font-semibold text-cyan-400">{analyticsCounts.alumniRatio}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-md">
              <p className="text-base font-semibold text-white">Monthly Registrations</p>
              <div className="mt-4 h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={timelineData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.6)' }} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.6)' }} 
                      width={30}
                    />
                    <RechartsTooltip
                      contentStyle={{ borderRadius: '8px', border: 'none', backgroundColor: 'rgba(15, 23, 42, 0.9)', color: '#fff', fontSize: '12px' }}
                      cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    />
                    <Bar dataKey="timelineAlumni" name="Working Professional" stackId="a" fill="#0ea5e9" radius={[0, 0, 0, 0]} animationDuration={1000} />
                    <Bar dataKey="timelineHigherEd" name="Higher Education" stackId="a" fill="#8b5cf6" radius={[0, 0, 0, 0]} animationDuration={1000} />
                    <Bar dataKey="timelineStudents" name="Career Aspirant" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} animationDuration={1000} />
                    <Bar dataKey="timelineEntrepreneur" name="Entrepreneur" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} animationDuration={1000} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'admins' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Admin Management</h2>
                <p className="text-slate-600 mt-1">Create, edit, and remove admin accounts from the dashboard.</p>
              </div>
              <button
                onClick={() => setShowAdminForm(!showAdminForm)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-yellow-500 text-slate-900 rounded-lg hover:bg-yellow-400 transition-colors font-medium"
              >
                <Plus className="h-5 w-5" />
                New Admin
              </button>
            </div>

            {showAdminForm && (
              <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Create New Admin Account</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                    <input
                      type="email"
                      value={newAdminEmail}
                      onChange={(e) => setNewAdminEmail(e.target.value)}
                      placeholder="admin@example.com"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
                    <div className="relative">
                      <input
                        type={showNewAdminPassword ? 'text' : 'password'}
                        value={newAdminPassword}
                        onChange={(e) => setNewAdminPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pr-10 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewAdminPassword((s) => !s)}
                        className="absolute inset-y-0 right-2 flex items-center p-1 text-slate-500 hover:text-slate-700"
                        aria-label={showNewAdminPassword ? 'Hide password' : 'Show password'}
                      >
                        {showNewAdminPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleCreateAdmin}
                      className="flex-1 px-4 py-2 bg-yellow-500 text-slate-900 rounded-lg hover:bg-yellow-400 transition-colors font-medium"
                    >
                      Create Admin
                    </button>
                    <button
                      onClick={() => setShowAdminForm(false)}
                      className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm overflow-x-auto">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Admin Accounts</h3>
              <table className="min-w-full text-left">
                <thead className="border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-sm font-semibold text-slate-900">Email ID</th>
                    <th className="px-4 py-3 text-sm font-semibold text-slate-900">Password</th>
                    <th className="px-4 py-3 text-sm font-semibold text-slate-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {adminAccounts.length > 0 ? (
                    adminAccounts.map((admin) => {
                      const isEditing = editingAdminId === admin.id;

                      return (
                        <tr key={admin.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-4 align-top">
                            {isEditing ? (
                              <input
                                value={editedAdminEmail}
                                onChange={(e) => setEditedAdminEmail(e.target.value)}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/20"
                              />
                            ) : (
                              <span className="text-sm text-slate-900">{admin.email}</span>
                            )}
                          </td>
                          <td className="px-4 py-4 align-top">
                            {isEditing ? (
                              <input
                                value={editedAdminPassword}
                                onChange={(e) => setEditedAdminPassword(e.target.value)}
                                placeholder="Enter new password"
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/20"
                              />
                            ) : (
                              <span className="text-sm text-slate-600">{admin.password}</span>
                            )}
                          </td>
                          <td className="px-4 py-4 align-top">
                            {isEditing ? (
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setAdminAccounts((prev) =>
                                      prev.map((item) =>
                                        item.id === admin.id
                                          ? {
                                              ...item,
                                              email: editedAdminEmail || item.email,
                                              password: editedAdminPassword || item.password,
                                            }
                                          : item
                                      )
                                    );
                                    setEditingAdminId(null);
                                    setEditedAdminEmail('');
                                    setEditedAdminPassword('');
                                  }}
                                  className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-3 py-2 text-white text-sm hover:bg-slate-800 transition"
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingAdminId(null);
                                    setEditedAdminEmail('');
                                    setEditedAdminPassword('');
                                  }}
                                  className="inline-flex items-center justify-center rounded-lg bg-slate-100 px-3 py-2 text-slate-700 text-sm hover:bg-slate-200 transition"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-3">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingAdminId(admin.id);
                                    setEditedAdminEmail(admin.email);
                                    setEditedAdminPassword(admin.password === '********' ? '' : admin.password);
                                  }}
                                  aria-label="Edit credentials"
                                  className="group inline-flex items-center justify-center rounded-full bg-white shadow-sm px-3 py-2 hover:shadow-md transform transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-yellow-500/30"
                                >
                                  <span className="sr-only">Edit credentials</span>
                                  <svg className="h-5 w-5 text-slate-700 group-hover:text-yellow-600 transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>

                                {!admin.isCurrent && (
                                  <button
                                    type="button"
                                    onClick={() => setAdminAccounts((prev) => prev.filter((item) => item.id !== admin.id))}
                                    aria-label="Delete credentials"
                                    className="group inline-flex items-center justify-center rounded-full bg-white shadow-sm px-3 py-2 hover:shadow-md transform transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500/30"
                                  >
                                    <span className="sr-only">Delete credentials</span>
                                    <svg className="h-5 w-5 text-red-600 group-hover:text-red-700 transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-slate-500">
                        No admin accounts have been added yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}