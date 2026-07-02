import { FormEvent, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { BriefcaseBusiness, Building2, CalendarCheck, CheckCircle2, Clock3, GraduationCap, LayoutDashboard, Menu, Plus, Rocket, Search, Send, ShieldCheck, UserCheck, Users, X, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { addActivityItem } from '../data/activityStore';
import { useEffect } from "react";
import { supabase } from "../../supabaseClient";

type ReferralStatus = 'Pending' | 'Accepted' | 'Rejected';
type ReferralOpportunity = { id: number; company: string; role: string; alumnus: string; eligibility: string; skills: string[]; initials: string; accent: string };
type ReferralRequest = { id: number; company: string; role: string; alumnus: string; status: ReferralStatus; updated: string };

const initialRequests: ReferralRequest[] = [];

const statusStyles: Record<ReferralStatus, { icon: typeof Clock3; card: string; iconBox: string }> = {
  Pending: { icon: Clock3, card: 'border-amber-200 dark:border-amber-400/20 bg-amber-50/70 dark:bg-amber-900/20', iconBox: 'bg-amber-100 dark:bg-amber-400/20 text-amber-700 dark:text-amber-300' },
  Accepted: { icon: CheckCircle2, card: 'border-emerald-200 dark:border-emerald-400/20 bg-emerald-50/70 dark:bg-emerald-900/20', iconBox: 'bg-emerald-100 dark:bg-emerald-400/20 text-emerald-700 dark:text-emerald-300' },
  Rejected: { icon: XCircle, card: 'border-rose-200 dark:border-rose-400/20 bg-rose-50/70 dark:bg-rose-900/20', iconBox: 'bg-rose-100 dark:bg-rose-400/20 text-rose-700 dark:text-rose-300' },
};

export function Referrals() {
  const navigate = useNavigate();
  const { role, user } = useAuth();
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [requests, setRequests] = useState(initialRequests);
  const [activeStatus, setActiveStatus] = useState<ReferralStatus>('Pending');
  const [search, setSearch] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showPostForm, setShowPostForm] = useState(false);
  const [form, setForm] = useState({ company: '', role: '', eligibility: '', skills: '' });

  const canPost = role === 'alumni';
  const canRequest = role === 'student';
  const filteredOpportunities = useMemo(() => {
  const query = search.trim().toLowerCase();

  return opportunities.filter((item) => {
    return (
      !query ||
      [
        item.post_details?.companyName,
        item.post_details?.jobRole,
        item.post_details?.requiredSkills,
      ]
        .filter(Boolean)
        .some((value: string) =>
          value.toLowerCase().includes(query)
        )
    );
  });
}, [opportunities, search]);
  const filteredRequests = requests.filter((request) => request.status === activeStatus);

  const requestReferral = (opportunity: ReferralOpportunity) => {
    if (!canRequest || requests.some((request) => request.company === opportunity.company && request.role === opportunity.role)) return;
    setRequests((current) => [{ id: Date.now(), company: opportunity.company, role: opportunity.role, alumnus: opportunity.alumnus, status: 'Pending', updated: 'Requested just now' }, ...current]);
    addActivityItem(user?.id, 'requestedReferrals', {
      id: String(opportunity.id), title: opportunity.role, subtitle: `${opportunity.company} ? Referred by ${opportunity.alumnus}`,
      date: new Date().toISOString(), status: 'Pending', category: 'Referral',
    });
    setActiveStatus('Pending');
  };

  const postOpportunity = (event: FormEvent) => {
    event.preventDefault();
    if (!canPost || !form.company.trim() || !form.role.trim() || !form.eligibility.trim()) return;
    const company = form.company.trim();
    setOpportunities((current) => [{ id: Date.now(), company, role: form.role.trim(), alumnus: user?.name || 'Alumni member', eligibility: form.eligibility.trim(), skills: form.skills.split(',').map((skill) => skill.trim()).filter(Boolean), initials: company.slice(0, 2).toUpperCase(), accent: 'bg-violet-100 text-violet-700' }, ...current]);
    setForm({ company: '', role: '', eligibility: '', skills: '' });
    setShowPostForm(false);
  };

  const fetchReferrals = async () => {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("status", "approved")
    .eq("type", "referral")
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

  setOpportunities(formatted);
};

useEffect(() => {
  fetchReferrals();
}, []);

  return (
    <div className="-mx-4 -my-8 min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto flex max-w-[1440px]">

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
          <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3"><div><p className="mb-2 text-sm font-semibold text-yellow-600 dark:text-yellow-400">CAREERS THROUGH COMMUNITY</p><h1 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-slate-100 sm:text-4xl">Referrals</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">Discover alumni-shared openings and track every referral request in one place.</p></div></div>
            {canPost && <button onClick={() => setShowPostForm((current) => !current)} className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-yellow-400 hover:text-slate-950"><Plus className="h-4 w-4" />Post opportunity</button>}
          </div>

          {showPostForm && canPost && (
            <form onSubmit={postOpportunity} className="mb-6 rounded-2xl border border-yellow-200 dark:border-yellow-400/20 bg-white dark:bg-slate-900/70 p-5 shadow-sm">
              <div className="mb-4"><h2 className="font-semibold text-slate-950 dark:text-slate-100">Post a referral opportunity</h2><p className="text-sm text-slate-500 dark:text-slate-400">Share an opening at your company with students in the network.</p></div>
              <div className="grid gap-3 sm:grid-cols-2"><input required value={form.company} onChange={(event) => setForm({ ...form, company: event.target.value })} placeholder="Company name" className="rounded-xl border border-slate-300 dark:border-yellow-400/20 bg-white/70 dark:bg-slate-900/70 px-3 py-2.5 text-sm outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20" /><input required value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })} placeholder="Role" className="rounded-xl border border-slate-300 dark:border-yellow-400/20 bg-white/70 dark:bg-slate-900/70 px-3 py-2.5 text-sm outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20" /><input required value={form.eligibility} onChange={(event) => setForm({ ...form, eligibility: event.target.value })} placeholder="Eligibility" className="rounded-xl border border-slate-300 dark:border-yellow-400/20 bg-white/70 dark:bg-slate-900/70 px-3 py-2.5 text-sm outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20" /><input value={form.skills} onChange={(event) => setForm({ ...form, skills: event.target.value })} placeholder="Skills, comma separated" className="rounded-xl border border-slate-300 dark:border-yellow-400/20 bg-white/70 dark:bg-slate-900/70 px-3 py-2.5 text-sm outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20" /></div>
              <div className="mt-4 flex justify-end gap-2"><button type="button" onClick={() => setShowPostForm(false)} className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">Cancel</button><button type="submit" className="rounded-xl bg-yellow-400 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-yellow-300">Publish opportunity</button></div>
            </form>
          )}

          <section aria-labelledby="status-heading">
            <div className="mb-4"><h2 id="status-heading" className="text-xl font-bold text-slate-950 dark:text-slate-100">Referral status</h2><p className="text-sm text-slate-500 dark:text-slate-400">Select a status to review those requests.</p></div>
            <div className="grid gap-3 sm:grid-cols-3">
              {(Object.keys(statusStyles) as ReferralStatus[]).map((status) => {
                const { icon: Icon, card, iconBox } = statusStyles[status];
                const count = requests.filter((request) => request.status === status).length;
                return <button key={status} onClick={() => setActiveStatus(status)} className={`rounded-2xl border p-4 text-left transition ${card} ${activeStatus === status ? 'ring-2 ring-yellow-400 ring-offset-2' : 'hover:shadow-sm'}`}><div className="flex items-center justify-between"><span className={`rounded-xl p-2 ${iconBox}`}><Icon className="h-5 w-5" /></span><span className="text-2xl font-bold text-slate-950 dark:text-slate-100">{count}</span></div><p className="mt-3 font-semibold text-slate-900 dark:text-slate-100">{status}</p><p className="text-xs text-slate-500 dark:text-slate-400">referral {count === 1 ? 'request' : 'requests'}</p></button>;
              })}
            </div>
            <div className="mt-4 space-y-3">
              {filteredRequests.map((request) => <article key={request.id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 dark:border-yellow-400/20 bg-white dark:bg-slate-900/70 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"><div><div className="flex items-center gap-2"><h3 className="font-bold text-slate-950 dark:text-slate-100">{request.role}</h3><span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusStyles[request.status].iconBox}`}>{request.status}</span></div><p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{request.company} ? Referred by {request.alumnus}</p></div><p className="text-xs font-medium text-slate-500 dark:text-slate-400">{request.updated}</p></article>)}
            </div>
          </section>

          <section className="mt-10" aria-labelledby="opportunities-heading">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><h2 id="opportunities-heading" className="text-xl font-bold text-slate-950 dark:text-slate-100">Referral opportunities</h2><p className="text-sm text-slate-500 dark:text-slate-400">Open roles shared directly by alumni.</p></div><label className="relative block w-full sm:w-72"><span className="sr-only">Search opportunities</span><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search company, role, or skill" className="w-full rounded-xl border border-slate-300 dark:border-yellow-400/20 bg-white/70 dark:bg-slate-900/70 py-2.5 pl-9 pr-3 text-sm outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20" /></label></div>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredOpportunities.map((opportunity) => {
                const requested = requests.some((request) => request.company === opportunity.company && request.role === opportunity.role);
                return <article
  key={opportunity.id}
  className="flex min-h-80 flex-col rounded-2xl border border-slate-200 dark:border-yellow-400/20 bg-white dark:bg-slate-900/70 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-yellow-300 hover:shadow-md"
>
  <div className="flex items-start justify-between">
    <div className="flex h-14 w-14 items-center justify-center rounded-2xl font-bold bg-yellow-100 dark:bg-yellow-400/20 text-yellow-700 dark:text-yellow-300">
      {opportunity.post_details?.companyName?.substring(0, 2).toUpperCase()}
    </div>

    <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
      Referral Open
    </span>
  </div>

  <div className="mt-4">
    <p className="text-sm font-semibold text-yellow-700 dark:text-yellow-400">
      {opportunity.post_details?.companyName}
    </p>

    <h3 className="mt-1 text-xl font-bold text-slate-950 dark:text-slate-100">
      {opportunity.post_details?.jobRole}
    </h3>

    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
      Posted by {opportunity.author_name || "Alumni"}
    </p>
  </div>

  <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
    {opportunity.post_details?.experience}
  </p>

  <div className="mt-3 flex flex-wrap gap-2">
    {(opportunity.post_details?.requiredSkills?.split(",") || []).map(
      (skill: string) => (
        <span
          key={skill}
          className="rounded-lg bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300"
        >
          {skill}
        </span>
      )
    )}
  </div>

  <button
    disabled={!canRequest || requested}
    onClick={() => requestReferral(opportunity)}
    className={`mt-auto flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
      requested
        ? "bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300"
        : canRequest
        ? "bg-slate-900 text-white hover:bg-yellow-400 hover:text-slate-950"
        : "cursor-not-allowed bg-slate-100 dark:bg-slate-800 text-slate-400"
    }`}
  >
    {requested ? (
      <>
        <Clock3 className="h-4 w-4" />
        Request pending
      </>
    ) : (
      <>
        <Send className="h-4 w-4" />
        {canRequest ? "Request referral" : "Student requests only"}
      </>
    )}
  </button>
</article>;
              })}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}