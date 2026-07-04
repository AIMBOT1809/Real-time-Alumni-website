import { useEffect, useMemo, useState } from 'react';
import { Bookmark, BriefcaseBusiness, CalendarCheck, Clock3, GraduationCap, Search, UserCheck } from 'lucide-react';
import { Link } from 'react-router';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { ActivityItem, getActivity } from '../data/activityStore';

type ActivityTab = 'appliedJobs' | 'registeredEvents' | 'joinedMentorshipSessions' | 'requestedReferrals' | 'savedPosts';

const definitions = [
  { id: 'appliedJobs', label: 'Applied Jobs', icon: BriefcaseBusiness, empty: 'Jobs you apply for will appear here.' },
  { id: 'registeredEvents', label: 'Registered Events', icon: CalendarCheck, empty: 'Events you register for will appear here.' },
  { id: 'joinedMentorshipSessions', label: 'Joined Mentorship Sessions', icon: GraduationCap, empty: 'Mentorship requests and sessions will appear here.' },
  { id: 'requestedReferrals', label: 'Requested Referrals', icon: UserCheck, empty: 'Referral requests will appear here.' },
  { id: 'savedPosts', label: 'Saved Posts', icon: Bookmark, empty: 'Save a post from the discovery feed to find it here.' },
] as const;

export function ActivityHistory() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<ActivityTab>('appliedJobs');
  const [search, setSearch] = useState('');
  const [clientActivity, setClientActivity] = useState(() => getActivity(user?.id));
  const [registeredEvents, setRegisteredEvents] = useState<ActivityItem[]>([]);

  useEffect(() => {
    const refresh = () => setClientActivity(getActivity(user?.id));
    refresh();
    window.addEventListener('alumni-activity-updated', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('alumni-activity-updated', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    let active = true;
    const fetchRegistrations = async () => {
      const { data, error } = await supabase
        .from('event_registrations')
        .select('id, status, created_at, events:event_id(id, title, date, time, location)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (!active || error) return;
      setRegisteredEvents((data || []).map((row: any) => ({
        id: String(row.id),
        title: row.events?.title || 'Registered event',
        subtitle: [row.events?.date, row.events?.time, row.events?.location].filter(Boolean).join(' · '),
        date: row.created_at,
        status: row.status || 'Registered',
      })));
    };
    fetchRegistrations();
    return () => { active = false; };
  }, [user?.id]);

  const activityByTab: Record<ActivityTab, ActivityItem[]> = {
    ...clientActivity,
    registeredEvents,
  };
  const items = useMemo(() => {
    const query = search.trim().toLowerCase();
    return activityByTab[activeTab].filter((item) => !query || [item.title, item.subtitle, item.status, item.category].filter(Boolean).some((value) => String(value).toLowerCase().includes(query)));
  }, [activeTab, clientActivity, registeredEvents, search]);
  const activeDefinition = definitions.find((definition) => definition.id === activeTab)!;
  const ActiveIcon = activeDefinition.icon;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:py-9">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-yellow-700 dark:text-yellow-400">Your participation</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 dark:text-slate-100 sm:text-4xl">Activity</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">A focused history of what you applied to, joined, requested, registered for, and saved.</p>
      </div>

      <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {definitions.map(({ id, label, icon: Icon }) => {
          const count = activityByTab[id].length;
          return (
            <button key={id} onClick={() => { setActiveTab(id); setSearch(''); }} className={`rounded-2xl border p-4 text-left transition ${activeTab === id ? 'border-slate-900 bg-slate-900 text-white shadow-md' : 'border-slate-200 dark:border-yellow-400/20 bg-white dark:bg-slate-900/70 text-slate-900 dark:text-slate-100 hover:border-yellow-300 hover:shadow-sm'}`}>
              <div className="flex items-center justify-between"><span className={`rounded-xl p-2 ${activeTab === id ? 'bg-yellow-400 text-slate-950' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}><Icon className="h-5 w-5" /></span><span className="text-2xl font-bold">{count}</span></div>
              <p className="mt-4 text-sm font-bold leading-5">{label}</p>
            </button>
          );
        })}
      </div>

      <section className="mt-6 rounded-2xl border border-slate-200 dark:border-yellow-400/20 bg-white dark:bg-slate-900/70 p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div><h2 className="text-lg font-bold text-slate-950 dark:text-slate-100">{activeDefinition.label}</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{activityByTab[activeTab].length} {activityByTab[activeTab].length === 1 ? 'item' : 'items'} in your history</p></div>
          <label className="relative block w-full sm:w-72"><span className="sr-only">Search activity</span><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search this activity" className="w-full rounded-xl border border-slate-300 dark:border-yellow-400/20 bg-white/70 dark:bg-slate-900/70 py-2.5 pl-9 pr-3 text-sm outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20" /></label>
        </div>

        <div className="mt-5 space-y-3">
          {items.map((item) => (
            <article key={item.id} className="flex flex-col gap-3 rounded-xl border border-slate-200 dark:border-yellow-400/20 bg-slate-50 dark:bg-slate-800/50 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="font-bold text-slate-950 dark:text-slate-100">{item.title}</h3>{item.category && <span className="rounded-full bg-white dark:bg-slate-800 px-2 py-0.5 text-xs font-semibold text-slate-600 dark:text-slate-300">{item.category}</span>}</div>{item.subtitle && <p className="mt-1 line-clamp-2 text-sm text-slate-600 dark:text-slate-300">{item.subtitle}</p>}</div>
              <div className="shrink-0 sm:text-right">{item.status && <span className="inline-flex rounded-full bg-yellow-100 dark:bg-yellow-400/20 px-2.5 py-1 text-xs font-bold text-yellow-800 dark:text-yellow-300">{item.status}</span>}<p className="mt-1 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 sm:justify-end"><Clock3 className="h-3.5 w-3.5" />{new Date(item.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</p></div>
            </article>
          ))}
        </div>

        {items.length === 0 && (
          <div className="py-14 text-center"><ActiveIcon className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-500" /><h3 className="mt-3 font-bold text-slate-900 dark:text-slate-100">No {activeDefinition.label.toLowerCase()} yet</h3><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{search ? 'Try a broader search.' : activeDefinition.empty}</p>{activeTab === 'savedPosts' && !search && <Link to="/dashboard" className="mt-4 inline-flex rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-yellow-400 hover:text-slate-950">Browse posts</Link>}</div>
        )}
      </section>
    </div>
  );
}