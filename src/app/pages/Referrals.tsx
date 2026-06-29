import { FormEvent, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { BriefcaseBusiness, Building2, CalendarCheck, CheckCircle2, Clock3, GraduationCap, LayoutDashboard, Menu, Plus, Rocket, Search, Send, ShieldCheck, UserCheck, Users, X, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { addActivityItem } from '../data/activityStore';
<<<<<<< Updated upstream
import { useEffect } from "react";
import { supabase } from "../../supabaseClient";

type ReferralStatus = 'Pending' | 'Accepted' | 'Rejected';
type ReferralOpportunity = { id: number; company: string; role: string; alumnus: string; eligibility: string; skills: string[]; initials: string; accent: string };
type ReferralRequest = { id: number; company: string; role: string; alumnus: string; status: ReferralStatus; updated: string };

<<<<<<< Updated upstream
/*const initialOpportunities: ReferralOpportunity[] = [
  { id: 1, company: 'Microsoft', role: 'Software Engineer', alumnus: 'Ananya Rao', eligibility: '2025ï¿½26 graduates ï¿½ CGPA 7.5+', skills: ['TypeScript', 'React', 'DSA'], initials: 'MS', accent: 'bg-blue-100 text-blue-700' },
  { id: 2, company: 'Deloitte', role: 'Business Technology Analyst', alumnus: 'Vivek Mehta', eligibility: 'All engineering branches ï¿½ No backlogs', skills: ['SQL', 'Analytics', 'Communication'], initials: 'DT', accent: 'bg-emerald-100 text-emerald-700' },
  { id: 3, company: 'Adobe', role: 'Product Designer', alumnus: 'Priya Nair', eligibility: 'Design portfolio required ï¿½ 0ï¿½2 years', skills: ['Figma', 'UX Research', 'Prototyping'], initials: 'AD', accent: 'bg-rose-100 text-rose-700' },
  { id: 4, company: 'Amazon', role: 'Cloud Support Associate', alumnus: 'Arjun Kapoor', eligibility: 'B.Tech / MCA ï¿½ Strong fundamentals', skills: ['AWS', 'Linux', 'Networking'], initials: 'AZ', accent: 'bg-amber-100 text-amber-700' },
];   */

const initialRequests: ReferralRequest[] = [];
const initialOpportunities: ReferralOpportunity[] = [
  { id: 1, company: 'Microsoft', role: 'Software Engineer', alumnus: 'Ananya Rao', eligibility: '2025–26 graduates · CGPA 7.5+', skills: ['TypeScript', 'React', 'DSA'], initials: 'MS', accent: 'bg-blue-100 text-blue-700' },
  { id: 2, company: 'Deloitte', role: 'Business Technology Analyst', alumnus: 'Vivek Mehta', eligibility: 'All engineering branches · No backlogs', skills: ['SQL', 'Analytics', 'Communication'], initials: 'DT', accent: 'bg-emerald-100 text-emerald-700' },
  { id: 3, company: 'Adobe', role: 'Product Designer', alumnus: 'Priya Nair', eligibility: 'Design portfolio required · 0–2 years', skills: ['Figma', 'UX Research', 'Prototyping'], initials: 'AD', accent: 'bg-rose-100 text-rose-700' },
  { id: 4, company: 'Amazon', role: 'Cloud Support Associate', alumnus: 'Arjun Kapoor', eligibility: 'B.Tech / MCA · Strong fundamentals', skills: ['AWS', 'Linux', 'Networking'], initials: 'AZ', accent: 'bg-amber-100 text-amber-700' },
];

const initialRequests: ReferralRequest[] = [
  { id: 101, company: 'Google', role: 'Data Analyst', alumnus: 'Vikram Mehta', status: 'Pending', updated: 'Requested 18 Jun 2026' },
  { id: 102, company: 'Razorpay', role: 'Frontend Developer', alumnus: 'Rahul Sharma', status: 'Accepted', updated: 'Accepted 14 Jun 2026' },
  { id: 103, company: 'Deloitte', role: 'Strategy Analyst', alumnus: 'Sneha Iyer', status: 'Rejected', updated: 'Updated 9 Jun 2026' },
];


const statusStyles: Record<ReferralStatus, { icon: typeof Clock3; card: string; iconBox: string }> = {
  Pending: { icon: Clock3, card: 'border-amber-200 bg-amber-50/70', iconBox: 'bg-amber-100 text-amber-700' },
  Accepted: { icon: CheckCircle2, card: 'border-emerald-200 bg-emerald-50/70', iconBox: 'bg-emerald-100 text-emerald-700' },
  Rejected: { icon: XCircle, card: 'border-rose-200 bg-rose-50/70', iconBox: 'bg-rose-100 text-rose-700' },
};

export function Referrals() {
  const navigate = useNavigate();
  const { role, user } = useAuth();
<<<<<<< Updated upstream
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [opportunities, setOpportunities] = useState(initialOpportunities);
  const [requests, setRequests] = useState(initialRequests);
  const [activeStatus, setActiveStatus] = useState<ReferralStatus>('Pending');
  const [search, setSearch] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showPostForm, setShowPostForm] = useState(false);
  const [form, setForm] = useState({ company: '', role: '', eligibility: '', skills: '' });

  const canPost = role === 'alumni';
  const canRequest = role === 'student';
  const filteredOpportunities = useMemo(() => {
<<<<<<< Updated upstream
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
    const query = search.trim().toLowerCase();
    return opportunities.filter((item) => !query || [item.company, item.role, item.alumnus, item.eligibility, ...item.skills].some((value) => value.toLowerCase().includes(query)));
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

<<<<<<< Updated upstream
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
    <div className="-mx-4 -my-8 min-h-[calc(100vh-4rem)] bg-slate-50">
      <div className="mx-auto flex max-w-[1440px]">

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
          <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3"><div><p className="mb-2 text-sm font-semibold text-yellow-600">CAREERS THROUGH COMMUNITY</p><h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Referrals</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">Discover alumni-shared openings and track every referral request in one place.</p></div></div>
            {canPost && <button onClick={() => setShowPostForm((current) => !current)} className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-yellow-400 hover:text-slate-950"><Plus className="h-4 w-4" />Post opportunity</button>}
          </div>

          {showPostForm && canPost && (
            <form onSubmit={postOpportunity} className="mb-6 rounded-2xl border border-yellow-200 bg-white p-5 shadow-sm">
              <div className="mb-4"><h2 className="font-semibold text-slate-950">Post a referral opportunity</h2><p className="text-sm text-slate-500">Share an opening at your company with students in the network.</p></div>
              <div className="grid gap-3 sm:grid-cols-2"><input required value={form.company} onChange={(event) => setForm({ ...form, company: event.target.value })} placeholder="Company name" className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20" /><input required value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })} placeholder="Role" className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20" /><input required value={form.eligibility} onChange={(event) => setForm({ ...form, eligibility: event.target.value })} placeholder="Eligibility" className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20" /><input value={form.skills} onChange={(event) => setForm({ ...form, skills: event.target.value })} placeholder="Skills, comma separated" className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20" /></div>
              <div className="mt-4 flex justify-end gap-2"><button type="button" onClick={() => setShowPostForm(false)} className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">Cancel</button><button type="submit" className="rounded-xl bg-yellow-400 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-yellow-300">Publish opportunity</button></div>
            </form>
          )}

          <section aria-labelledby="status-heading">
            <div className="mb-4"><h2 id="status-heading" className="text-xl font-bold text-slate-950">Referral status</h2><p className="text-sm text-slate-500">Select a status to review those requests.</p></div>
            <div className="grid gap-3 sm:grid-cols-3">
              {(Object.keys(statusStyles) as ReferralStatus[]).map((status) => {
                const { icon: Icon, card, iconBox } = statusStyles[status];
                const count = requests.filter((request) => request.status === status).length;
                return <button key={status} onClick={() => setActiveStatus(status)} className={`rounded-2xl border p-4 text-left transition ${card} ${activeStatus === status ? 'ring-2 ring-yellow-400 ring-offset-2' : 'hover:shadow-sm'}`}><div className="flex items-center justify-between"><span className={`rounded-xl p-2 ${iconBox}`}><Icon className="h-5 w-5" /></span><span className="text-2xl font-bold text-slate-950">{count}</span></div><p className="mt-3 font-semibold text-slate-900">{status}</p><p className="text-xs text-slate-500">referral {count === 1 ? 'request' : 'requests'}</p></button>;
              })}
            </div>
            <div className="mt-4 space-y-3">
<<<<<<< Updated upstream
              {filteredRequests.map((request) => <article key={request.id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"><div><div className="flex items-center gap-2"><h3 className="font-bold text-slate-950">{request.role}</h3><span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusStyles[request.status].iconBox}`}>{request.status}</span></div><p className="mt-1 text-sm text-slate-600">{request.company} ï¿½ Referred by {request.alumnus}</p></div><p className="text-xs font-medium text-slate-500">{request.updated}</p></article>)}
              {filteredRequests.map((request) => <article key={request.id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"><div><div className="flex items-center gap-2"><h3 className="font-bold text-slate-950">{request.role}</h3><span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusStyles[request.status].iconBox}`}>{request.status}</span></div><p className="mt-1 text-sm text-slate-600">{request.company} · Referred by {request.alumnus}</p></div><p className="text-xs font-medium text-slate-500">{request.updated}</p></article>)}
            </div>
          </section>

          <section className="mt-10" aria-labelledby="opportunities-heading">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><h2 id="opportunities-heading" className="text-xl font-bold text-slate-950">Referral opportunities</h2><p className="text-sm text-slate-500">Open roles shared directly by alumni.</p></div><label className="relative block w-full sm:w-72"><span className="sr-only">Search opportunities</span><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search company, role, or skill" className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20" /></label></div>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredOpportunities.map((opportunity) => {
                const requested = requests.some((request) => request.company === opportunity.company && request.role === opportunity.role);
<<<<<<< Updated upstream
                return <article
  key={opportunity.id}
  className="flex min-h-80 flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-yellow-300 hover:shadow-md"
>
  <div className="flex items-start justify-between">
    <div className="flex h-14 w-14 items-center justify-center rounded-2xl font-bold bg-yellow-100 text-yellow-700">
      {opportunity.post_details?.companyName?.substring(0, 2).toUpperCase()}
    </div>

    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
      Referral Open
    </span>
  </div>

  <div className="mt-4">
    <p className="text-sm font-semibold text-yellow-700">
      {opportunity.post_details?.companyName}
    </p>

    <h3 className="mt-1 text-xl font-bold text-slate-950">
      {opportunity.post_details?.jobRole}
    </h3>

    <p className="mt-2 text-sm text-slate-500">
      Posted by {opportunity.author_name || "Alumni"}
    </p>
  </div>

  <p className="mt-4 text-sm leading-6 text-slate-600">
    {opportunity.post_details?.experience}
  </p>

  <div className="mt-3 flex flex-wrap gap-2">
    {(opportunity.post_details?.requiredSkills?.split(",") || []).map(
      (skill: string) => (
        <span
          key={skill}
          className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700"
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
        ? "bg-amber-50 text-amber-800"
        : canRequest
        ? "bg-slate-900 text-white hover:bg-yellow-400 hover:text-slate-950"
        : "cursor-not-allowed bg-slate-100 text-slate-400"
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
                return <article key={opportunity.id} className="flex min-h-80 flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-yellow-300 hover:shadow-md"><div className="flex items-start justify-between"><div className={`flex h-14 w-14 items-center justify-center rounded-2xl font-bold ${opportunity.accent}`}>{opportunity.initials}</div><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">Referral open</span></div><div className="mt-4"><p className="text-sm font-semibold text-yellow-700">{opportunity.company}</p><h3 className="mt-1 text-xl font-bold text-slate-950">{opportunity.role}</h3><p className="mt-2 text-sm text-slate-500">Posted by {opportunity.alumnus}</p></div><p className="mt-4 text-sm leading-6 text-slate-600">{opportunity.eligibility}</p><div className="mt-3 flex flex-wrap gap-2">{opportunity.skills.map((skill) => <span key={skill} className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">{skill}</span>)}</div><button disabled={!canRequest || requested} onClick={() => requestReferral(opportunity)} className={`mt-auto flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${requested ? 'bg-amber-50 text-amber-800' : canRequest ? 'bg-slate-900 text-white hover:bg-yellow-400 hover:text-slate-950' : 'cursor-not-allowed bg-slate-100 text-slate-400'}`}>{requested ? <><Clock3 className="h-4 w-4" />Request pending</> : <><Send className="h-4 w-4" />{canRequest ? 'Request referral' : 'Student requests only'}</>}</button></article>;
              })}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
