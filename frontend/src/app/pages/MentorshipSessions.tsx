import { useMemo, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { 
  BriefcaseBusiness, Building2, CalendarCheck, CheckCircle2, Clock3, 
  GraduationCap, Laptop2, MapPin, Users, BookOpen, Award, 
  Send, UserCheck, Search, Menu, X, FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { showGlobalToast } from '../components/Toast';
import { addActivityItem } from '../data/activityStore';
import { supabase } from "../../supabaseClient";

const normalizeUrl = (url?: string) => {
  if (!url || !url.trim()) return "";
  const trimmed = url.trim();
  return trimmed.startsWith("http://") || trimmed.startsWith("https://")
    ? trimmed
    : `https://${trimmed}`;
};

const openPostLink = (url?: string) => {
  const finalUrl = normalizeUrl(url);
  if (!finalUrl) {
    showGlobalToast("Link not available for this post.", 'warning');
    return;
  }
  window.open(finalUrl, "_blank", "noopener,noreferrer");
};

const fallback = (value: any, fallbackText = "Not Provided"): string => {
  if (value === null || value === undefined || value === "" || value === "undefined" || value === "null") {
    return fallbackText;
  }
  return String(value);
};

type SessionTab = 'available' | 'requested' | 'completed';

const ALUMNI_STORAGE_KEY = 'allumini_posts_demo';

// Parse post_details which could be a JSON string or already an object
const parsePostDetails = (details: any): Record<string, any> => {
  if (!details) return {};
  try {
    if (typeof details === "string") {
      return JSON.parse(details);
    }
    return details;
  } catch {
    return {};
  }
};

// Get initials from name
const getInitials = (name?: string): string => {
  if (!name || name === "Not Provided") return "?";
  return name.substring(0, 2).toUpperCase();
};

export function MentorshipSessions() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<SessionTab>('available');
  const [search, setSearch] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mentors, setMentors] = useState<any[]>([]);
  const [alumniProfiles, setAlumniProfiles] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  // Fetch alumni profiles for profile pics, names, companies
  const fetchAlumniProfiles = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('alumni_profiles')
        .select('user_id, First_Name, Last_name, Photo_URL');
      
      if (error) {
        console.warn('[MentorshipSessions] Error fetching alumni profiles:', error);
        return;
      }

      if (data) {
        const profileMap: Record<string, any> = {};
        data.forEach((p: any) => {
          const userId = p.user_id || '';
          const firstName = p.First_Name || p.first_name || '';
          const lastName = p.Last_name || p.last_name || '';
          const fullName = `${firstName} ${lastName}`.trim();
          profileMap[userId] = {
            name: fullName || 'Unknown',
            avatar: p.Photo_URL || p.photo_url || '',
          };
        });
        setAlumniProfiles(profileMap);
      }
    } catch (err) {
      console.warn('[MentorshipSessions] Error in fetchAlumniProfiles:', err);
    }
  }, []);

  // Fetch mentorship posts from multiple data sources
  const fetchMentors = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch from Supabase posts table
      const { data: supabaseData, error: supabaseError } = await supabase
        .from("posts")
        .select("*")
        .eq("status", "approved")
        .eq("type", "mentorship")
        .order("created_at", { ascending: false });

      if (supabaseError) {
        console.warn('[MentorshipSessions] Supabase fetch error:', supabaseError);
      }

      // 2. Fetch from pending_posts table (where new posts are inserted)
      let pendingData: any[] = [];
      try {
        const { data } = await supabase
          .from("pending_posts")
          .select("*")
          .eq("type", "mentorship")
          .order("created_at", { ascending: false });
        if (data) pendingData = data;
      } catch (e) {
        // pending_posts table might not exist
      }

      // 3. Fetch from localStorage (demo/fallback)
      let localData: any[] = [];
      try {
        const stored = localStorage.getItem(ALUMNI_STORAGE_KEY);
        if (stored) {
          localData = JSON.parse(stored).filter((p: any) => p.type === 'mentorship');
        }
      } catch (e) {
        // ignore localStorage errors
      }

      // Merge all data sources (deduplicate by id)
      const allItems = [...(supabaseData || []), ...pendingData, ...localData];
      const seen = new Set<string>();
      const merged: any[] = [];
      
      allItems.forEach((item: any) => {
        const id = String(item.id || item.ID || '');
        if (id && seen.has(id)) return;
        if (id) seen.add(id);

        const details = parsePostDetails(item.post_details);
        
        // Get alumni profile info
        const alumniId = item.alumni_id || item.alumniId || item.user_id || '';
        const profile = alumniProfiles[alumniId] || {};

        merged.push({
          id,
          alumni_id: alumniId,
          post_details: details,
          profile_avatar: profile.avatar || '',
          profile_name: details.mentorName || profile.name || 'Unknown',
          created_at: item.created_at || item.timestamp || new Date().toISOString(),
        });
      });

      // Sort by created_at descending
      merged.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setMentors(merged);
    } catch (err) {
      console.error('[MentorshipSessions] Error in fetchMentors:', err);
    } finally {
      setLoading(false);
    }
  }, [alumniProfiles]);

  // Load alumni profiles first
  useEffect(() => {
    fetchAlumniProfiles();
  }, [fetchAlumniProfiles]);

  // Then fetch mentors
  useEffect(() => {
    fetchMentors();
  }, [fetchMentors]);

  const filteredMentors = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return mentors;

    return mentors.filter((mentor: any) => {
      const pd = mentor.post_details || {};
      const searchFields = [
        pd.mentorName,
        pd.mentorshipTopic,
        pd.mentorRole,
        mentor.profile_name,
      ];
      return searchFields
        .filter(Boolean)
        .some((value: string) => value.toLowerCase().includes(query));
    });
  }, [search, mentors]);

  const tabs: Array<{ id: SessionTab; label: string; count: number }> = [
    { id: 'available', label: 'Available Mentors', count: filteredMentors.length },
    { id: 'requested', label: 'Requested Sessions', count: 0 },
    { id: 'completed', label: 'Completed Sessions', count: 0 },
  ];

  const requestMentorship = (mentor: any) => {
    const pd = mentor.post_details || {};
    addActivityItem(user?.id, 'joinedMentorshipSessions', {
      id: String(mentor.id),
      title: pd.mentorName || mentor.profile_name || 'Mentor',
      subtitle: `${pd.mentorshipTopic || 'Mentorship'} at ${pd.mentorRole || 'TKR College'}`,
      date: new Date().toISOString(),
      status: 'Requested',
      category: 'Mentorship',
    });
    setSearch('');
    openPostLink(pd.meetingLinkOrVenue);
    showGlobalToast('Mentorship request sent!', 'success');
  };

  // Check if a value is valid (not null, undefined, empty)
  const hasValue = (value: any): boolean => {
    if (value === null || value === undefined || value === "" || value === "undefined" || value === "null") {
      return false;
    }
    return true;
  };

  // Detail row component - only renders if value is valid
  const DetailRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: any }) => {
    if (!hasValue(value)) return null;
    return (
      <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
        <span className="shrink-0 text-slate-400">{icon}</span>
        <span className="font-medium text-slate-500 dark:text-slate-400 min-w-[80px]">{label}</span>
        <span className="break-words">{fallback(value)}</span>
      </div>
    );
  };

  return (
    <div className="-mx-4 -my-8 min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto flex max-w-[1440px]">
        {isSidebarOpen && (
          <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
        )}

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
          {/* Header */}
          <div className="mb-7 flex items-start gap-3">
            <button className="mt-1 lg:hidden" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
              <Menu className="h-6 w-6 text-slate-700 dark:text-slate-300" />
            </button>
            <div>
              <p className="mb-2 text-sm font-semibold text-yellow-600 dark:text-yellow-400">LEARN FROM ALUMNI</p>
              <h1 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-slate-100 sm:text-4xl">Mentorship Sessions</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">Find the right mentor and request a one-to-one session.</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-6 border-b border-slate-200 dark:border-yellow-400/20">
            <div className="flex gap-2 overflow-x-auto" role="tablist" aria-label="Mentorship sessions">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  onClick={() => { setActiveTab(tab.id); setSearch(''); }}
                  className={`flex shrink-0 items-center gap-2 border-b-2 px-3 py-3 text-sm font-semibold transition ${
                    activeTab === tab.id
                      ? 'border-yellow-500 text-slate-950 dark:text-slate-100'
                      : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {tab.label}
                  <span className={`rounded-full px-2 py-0.5 text-xs ${
                    activeTab === tab.id
                      ? 'bg-yellow-100 dark:bg-yellow-400/20 text-yellow-800 dark:text-yellow-300'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                  }`}>{tab.count}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-slate-200 dark:border-yellow-400/20 bg-white dark:bg-slate-900/70 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-slate-900 dark:text-slate-100">{tabs.find((tab) => tab.id === activeTab)?.label}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Browse mentorship sessions available from alumni.</p>
            </div>
            <label className="relative block w-full sm:w-72">
              <span className="sr-only">Search mentors</span>
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name, topic, role..."
                className="w-full rounded-xl border border-slate-300 dark:border-yellow-400/20 bg-white/70 dark:bg-slate-900/70 py-2.5 pl-9 pr-3 text-sm outline-none transition text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20"
              />
            </label>
          </div>

          {/* Mentors Grid - CSS Columns Masonry Layout */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-yellow-400 border-t-transparent" />
            </div>
          ) : (
            <div
              className="[column-count:1] md:[column-count:2] xl:[column-count:3] [column-gap:1.25rem]"
              style={{ breakInside: 'avoid' }}
            >
              {filteredMentors.map((mentor) => {
                const pd = mentor.post_details || {};
                const initials = (pd.mentorName || mentor.profile_name || '').substring(0, 2).toUpperCase() || '?';
                const avatarUrl = mentor.profile_avatar || '';

                return (
                  <article
                    key={mentor.id}
                    className="inline-flex flex-col w-full rounded-2xl border border-slate-200 dark:border-yellow-400/20 bg-white dark:bg-slate-900/70 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-yellow-300 hover:shadow-md mb-5"
                    style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}
                  >
                    {/* Header with Avatar + Mentor Name + Topic */}
                    <div className="flex items-start gap-3">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={pd.mentorName || mentor.profile_name || 'Mentor'}
                          className="h-14 w-14 rounded-2xl object-cover bg-yellow-100 dark:bg-yellow-400/20"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                            ((e.target as HTMLImageElement).nextElementSibling as HTMLElement)?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <div
                        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-base font-bold bg-yellow-100 dark:bg-yellow-400/20 text-yellow-700 dark:text-yellow-300 ${avatarUrl ? 'hidden' : ''}`}
                      >
                        {initials}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-bold text-slate-950 dark:text-slate-100 break-words">
                          {fallback(pd.mentorName || mentor.profile_name)}
                        </h3>
                        <p className="text-sm font-medium text-yellow-700 dark:text-yellow-400 break-words">
                          {fallback(pd.mentorshipTopic)}
                        </p>
                      </div>

                      <span className="shrink-0 rounded-full bg-emerald-50 dark:bg-emerald-400/20 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                        Available
                      </span>
                    </div>

                    {/* Divider - only show if at least one detail field has a value */}
                    {(hasValue(pd.mentorRole) || hasValue(pd.sessionDate) || hasValue(pd.sessionTime) || hasValue(pd.duration) || hasValue(pd.mode)) && (
                      <div className="my-4 border-t border-slate-100 dark:border-yellow-400/10" />
                    )}

                    {/* Mandatory Details - only renders rows with valid values */}
                    <div className="space-y-3">
                      <DetailRow icon={<Award className="h-4 w-4" />} label="Role" value={pd.mentorRole} />
                      <DetailRow icon={<CalendarCheck className="h-4 w-4" />} label="Date" value={pd.sessionDate} />
                      <DetailRow icon={<Clock3 className="h-4 w-4" />} label="Time" value={pd.sessionTime} />
                      <DetailRow icon={<Clock3 className="h-4 w-4" />} label="Duration" value={pd.duration} />
                      <DetailRow icon={<Laptop2 className="h-4 w-4" />} label="Mode" value={pd.mode} />
                    </div>

                    {/* Action Button */}
                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-yellow-400/10">
                      <button
                        onClick={() => requestMentorship(mentor)}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-yellow-400 hover:text-slate-950 dark:bg-slate-800 dark:hover:bg-yellow-400"
                      >
                        <Send className="h-4 w-4" />
                        Request Mentorship
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredMentors.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 dark:border-yellow-400/20 bg-white dark:bg-slate-900/70 py-16 text-center">
              <GraduationCap className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-500" />
              <h3 className="mt-3 font-semibold text-slate-900 dark:text-slate-100">
                {search ? 'No mentors found' : 'No mentorship sessions available'}
              </h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {search ? 'Try a different name, topic, or role.' : 'Check back later for new mentorship opportunities.'}
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}