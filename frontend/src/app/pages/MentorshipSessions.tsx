import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { BriefcaseBusiness, Building2, CalendarCheck, CheckCircle2, Clock3, GraduationCap, LayoutDashboard, Menu, Rocket, Search, Send, UserCheck, Users, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { addActivityItem } from '../data/activityStore';
import { useEffect } from "react";
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
    alert("Link not available for this post.");
    return;
  }
  window.open(finalUrl, "_blank", "noopener,noreferrer");
};

type SessionTab = 'available' | 'requested' | 'completed';
type Mentor = { id: number; name: string; initials: string; domain: string; company: string; availability: string; accent: string };

const requestedSeed: any[] = [];
const completedSeed: any[] = [];

export function MentorshipSessions() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<SessionTab>('available');
  const [requestedMentors, setRequestedMentors] = useState<Mentor[]>(requestedSeed);
  const [search, setSearch] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mentors, setMentors] = useState<any[]>([]);
  const availableMentors = mentors.filter(
  (mentor) =>
    !requestedMentors.some(
      (requested) => requested.id === mentor.id
    )
);
  const tabMentors = activeTab === 'available' ? availableMentors : activeTab === 'requested' ? requestedMentors : completedSeed;
  const filteredMentors = useMemo(() => {
  const query = search.trim().toLowerCase();

  return query
    ? tabMentors.filter((mentor: any) =>
        [
          mentor.post_details?.mentorName,
          mentor.post_details?.domain,
          mentor.post_details?.companyName,
        ]
          .filter(Boolean)
          .some((value: string) =>
            value.toLowerCase().includes(query)
          )
      )
    : tabMentors;
}, [search, tabMentors]);
  const tabs: Array<{ id: SessionTab; label: string; count: number }> = [
    { id: 'available', label: 'Available Mentors', count: availableMentors.length },
    { id: 'requested', label: 'Requested Sessions', count: requestedMentors.length },
    { id: 'completed', label: 'Completed Sessions', count: completedSeed.length },
  ];

  const requestMentorship = (mentor: Mentor) => {
    setRequestedMentors((current) => [...current, mentor]);
    addActivityItem(user?.id, 'joinedMentorshipSessions', {
      id: String(mentor.id), title: mentor.name, subtitle: `${mentor.domain} ? ${mentor.company}`,
      date: new Date().toISOString(), status: 'Requested', category: 'Mentorship',
    });
    setActiveTab('requested');
    setSearch('');
    openPostLink(mentor.post_details?.meetingLinkOrVenue);
  };

  const fetchMentors = async () => {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("status", "approved")
    .eq("type", "mentorship")
    .order("created_at", { ascending: false });

  if (error) {
    console.log(error);
    return;
  }

  const formatted = (data || []).map((item: any) => {
    let details = item.post_details;

    try {
      if (typeof details === "string") {
        details = JSON.parse(details);
      }
    } catch {}

    return {
      ...item,
      post_details: details,
    };
  });

  setMentors(formatted);
};

useEffect(() => {
  fetchMentors();
}, []);

  return (
    <div className="-mx-4 -my-8 min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto flex max-w-[1440px]">

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
          <div className="mb-7 flex items-start gap-3">
            <div><p className="mb-2 text-sm font-semibold text-yellow-600 dark:text-yellow-400">LEARN FROM ALUMNI</p><h1 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-slate-100 sm:text-4xl">Mentorship Sessions</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">Find the right mentor, request a one-to-one session, and keep track of your mentorship journey.</p></div>
          </div>
          <div className="mb-6 border-b border-slate-200 dark:border-yellow-400/20">
            <div className="flex gap-2 overflow-x-auto" role="tablist" aria-label="Mentorship sessions">
              {tabs.map((tab) => <button key={tab.id} role="tab" aria-selected={activeTab === tab.id} onClick={() => { setActiveTab(tab.id); setSearch(''); }} className={`flex shrink-0 items-center gap-2 border-b-2 px-3 py-3 text-sm font-semibold transition ${activeTab === tab.id ? 'border-yellow-500 text-slate-950 dark:text-slate-100' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}>{tab.label}<span className={`rounded-full px-2 py-0.5 text-xs ${activeTab === tab.id ? 'bg-yellow-100 dark:bg-yellow-400/20 text-yellow-800 dark:text-yellow-300' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'}`}>{tab.count}</span></button>)}
            </div>
          </div>
          <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-slate-200 dark:border-yellow-400/20 bg-white dark:bg-slate-900/70 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div><h2 className="font-semibold text-slate-900 dark:text-slate-100">{tabs.find((tab) => tab.id === activeTab)?.label}</h2><p className="text-sm text-slate-500 dark:text-slate-400">{activeTab === 'available' ? 'Browse alumni who are currently accepting mentees.' : activeTab === 'requested' ? 'Requests awaiting confirmation from your mentors.' : 'A record of your completed mentorship sessions.'}</p></div>
            <label className="relative block w-full sm:w-72"><span className="sr-only">Search mentors</span><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, domain, company" className="w-full rounded-xl border border-slate-300 dark:border-yellow-400/20 bg-white/70 dark:bg-slate-900/70 py-2.5 pl-9 pr-3 text-sm outline-none transition text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20" /></label>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredMentors.map((mentor) => (
              <article
  key={`${activeTab}-${mentor.id}`}
  className="flex min-h-72 flex-col rounded-2xl border border-slate-200 dark:border-yellow-400/20 bg-white dark:bg-slate-900/70 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-yellow-300 hover:shadow-md"
>
  <div className="flex items-start justify-between gap-3">
    <div className="flex h-14 w-14 items-center justify-center rounded-2xl text-base font-bold bg-yellow-100 dark:bg-yellow-400/20 text-yellow-700 dark:text-yellow-300">
      {mentor.post_details?.mentorName?.substring(0, 2).toUpperCase()}
    </div>

    <span
      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
        activeTab === "available"
          ? "bg-emerald-50 dark:bg-emerald-400/20 text-emerald-700 dark:text-emerald-300"
          : activeTab === "requested"
          ? "bg-amber-50 dark:bg-amber-400/20 text-amber-700 dark:text-amber-300"
          : "bg-blue-50 dark:bg-blue-400/20 text-blue-700 dark:text-blue-300"
      }`}
    >
      {activeTab === "available"
        ? "Available"
        : activeTab === "requested"
        ? "Pending"
        : "Completed"}
    </span>
  </div>

  <div className="mt-4">
    <h3 className="text-lg font-bold text-slate-950 dark:text-slate-100">
      {mentor.post_details?.mentorName}
    </h3>

    <p className="mt-1 font-medium text-yellow-700 dark:text-yellow-400">
      {mentor.post_details?.domain}
    </p>
  </div>

  <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
    <div className="flex items-center gap-2.5">
      <BriefcaseBusiness className="h-4 w-4 shrink-0 text-slate-400" />
      <span>{mentor.post_details?.companyName}</span>
    </div>

    <div className="flex items-start gap-2.5">
      <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
      <span>{mentor.post_details?.availability}</span>
    </div>
  </div>

  <div className="mt-auto pt-5">
     {activeTab === "available" && (
       <button
         onClick={() => openPostLink(mentor.post_details?.meetingLinkOrVenue)}
         className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-yellow-400 hover:text-slate-950"
       >
         <Send className="h-4 w-4" />
         Request Mentorship
       </button>
     )}

    {activeTab === "requested" && (
      <div className="flex items-center justify-center gap-2 rounded-xl bg-amber-50 dark:bg-amber-900/20 px-4 py-2.5 text-sm font-semibold text-amber-800 dark:text-amber-300">
        <Clock3 className="h-4 w-4" />
        Request sent
      </div>
    )}

    {activeTab === "completed" && (
      <div className="flex items-center justify-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2.5 text-sm font-semibold text-emerald-800 dark:text-emerald-300">
        <CheckCircle2 className="h-4 w-4" />
        Session completed
      </div>
    )}
  </div>
</article>
            ))}
          </div>
          {filteredMentors.length === 0 && <div className="rounded-2xl border border-dashed border-slate-300 dark:border-yellow-400/20 bg-white dark:bg-slate-900/70 py-16 text-center"><Users className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-500" /><h3 className="mt-3 font-semibold text-slate-900 dark:text-slate-100">No mentors found</h3><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Try a different name, domain, or company.</p></div>}
        </main>
      </div>
    </div>
  );
}