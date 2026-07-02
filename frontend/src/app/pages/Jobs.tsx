import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { BriefcaseBusiness, Building2, CalendarCheck, CheckCircle2, GraduationCap, IndianRupee, LayoutDashboard, Menu, Rocket, Search, Send, Sparkles, UserCheck, Users, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { addActivityItem, getActivity } from '../data/activityStore';
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

type Job = {
  id: number;
  company: string;
  initials: string;
  role: string;
  package: string;
  eligibility: string;
  skills: string[];
  type: 'Full-time' | 'Internship';
  accent: string;
};


export function Jobs() {
  console.log("Jobs component loaded");
  const navigate = useNavigate();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [jobType, setJobType] = useState<'All' | Job['type']>('All');
  const [appliedIds, setAppliedIds] = useState<number[]>(() => getActivity(user?.id).appliedJobs.map((item) => Number(item.id)).filter(Number.isFinite));
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [jobs, setJobs] = useState<any[]>([]);
  const fetchJobs = async () => {
    console.log("Fetching jobs...");
  const { data, error } = await supabase
  
    .from("posts")
    .select("*")
    .eq("status", "approved")
    .eq("type", "job")
    .order("created_at", { ascending: false });

  if (error) {
    console.log(error);
    return;
  }
  console.log("RAW JOB DATA:", data);

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
  console.log("JOBS DATA:", formatted);
console.log("FIRST JOB:", formatted[0]);

  setJobs(formatted);
};
useEffect(() => {
  console.log("Jobs page loaded");
  fetchJobs();
}, []);

  const filteredJobs = useMemo(() => {
  const query = search.trim().toLowerCase();

  return jobs.filter((job) => {
    const matchesSearch =
      !query ||
      [
        job.post_details?.companyName,
        job.post_details?.jobRole,
        job.post_details?.requiredSkills,
      ]
        .filter(Boolean)
        .some((value: string) =>
          value.toLowerCase().includes(query)
        );

    return matchesSearch;
  });
}, [jobs, search]);

  const applyForJob = (jobId: number) => {
    const job = jobs.find((item) => item.id === jobId);
    if (!job || appliedIds.includes(jobId)) return;
    setAppliedIds((current) => [...current, jobId]);
    addActivityItem(user?.id, 'appliedJobs', {
      id: String(job.id), title: job.post_details?.jobRole,
      subtitle: job.post_details?.companyName,
      category: "Job",
      date: new Date().toISOString(), status: 'Application sent',
    });
    openPostLink(job.post_details?.applyLink);
  };

  return (
    <div className="-mx-4 -my-8 min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto flex max-w-[1440px]">

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
          <div className="mb-7 flex items-start gap-3">
            <div>
              <p className="mb-2 text-sm font-semibold text-yellow-600 dark:text-yellow-400">ALUMNI CAREER BOARD</p>
              <h1 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-slate-100 sm:text-4xl">Jobs</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">Explore curated roles and internships shared by the alumni community.</p>
            </div>
          </div>

          <section className="mb-6 flex flex-col gap-3 rounded-2xl border border-slate-200 dark:border-yellow-400/20 bg-white dark:bg-slate-900/70 p-4 shadow-sm sm:flex-row" aria-label="Job filters">
            <label className="relative min-w-0 flex-1">
              <span className="sr-only">Search jobs</span>
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search company, role, or skill" className="w-full rounded-xl border border-slate-300 dark:border-yellow-400/20 bg-white/70 dark:bg-slate-900/70 py-2.5 pl-9 pr-3 text-sm outline-none transition text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20" />
            </label>
            <select value={jobType} onChange={(event) => setJobType(event.target.value as 'All' | Job['type'])} className="rounded-xl border border-slate-300 dark:border-yellow-400/20 bg-white/70 dark:bg-slate-900/70 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20" aria-label="Filter by job type">
              <option>All</option><option>Full-time</option><option>Internship</option>
            </select>
          </section>

          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900 dark:text-slate-100">Open positions</h2>
            <span className="text-sm text-slate-500 dark:text-slate-400">{filteredJobs.length} opportunities</span>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredJobs.map((job) => {
              const applied = appliedIds.includes(job.id);
              return (
                <article key={job.id} className="flex min-h-[25rem] flex-col rounded-2xl border border-slate-200 dark:border-yellow-400/20 bg-white dark:bg-slate-900/70 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-yellow-300 hover:shadow-md">
                  <div className="flex items-start justify-between gap-3">
                    <div className={`flex h-14 w-14 items-center justify-center rounded-2xl text-base font-bold bg-yellow-100 dark:bg-yellow-400/20 text-yellow-700 dark:text-yellow-300`}>{job.post_details?.companyName?.substring(0,2).toUpperCase()}</div>
                    <span className="rounded-full bg-emerald-50 dark:bg-emerald-400/20 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 text-xs font-semibold">
Job
</span>
                  </div>
                  <div className="mt-4"><p className="text-sm font-semibold text-yellow-700 dark:text-yellow-400">{job.post_details?.companyName}</p><h3 className="mt-1 text-xl font-bold text-slate-950 dark:text-slate-100">{job.post_details?.jobRole}</h3></div>
                  <dl className="mt-5 space-y-4 text-sm">
                    <div><dt className="flex items-center gap-2 font-medium text-slate-500 dark:text-slate-400"><IndianRupee className="h-4 w-4" />Package</dt><dd className="mt-1 pl-6 font-semibold text-slate-900 dark:text-slate-100">{job.post_details?.salary}</dd></div>
                    <div><dt className="font-medium text-slate-500 dark:text-slate-400">Eligibility</dt><dd className="mt-1 leading-5 text-slate-700 dark:text-slate-300">{job.post_details?.experience}</dd></div>
                    <div><dt className="font-medium text-slate-500 dark:text-slate-400">Required skills</dt><dd className="mt-2 flex flex-wrap gap-2">{(job.post_details?.requiredSkills?.split(",") || []).map((skill: string) => (
  <span
    key={skill}
    className="rounded-lg bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300"
  >
    {skill}
  </span>
))}</dd></div>
                  </dl>
                  <button disabled={applied} onClick={() => openPostLink(job.post_details?.applyLink)} className={`mt-auto flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 ${applied ? 'cursor-default bg-emerald-50 text-emerald-800' : 'bg-slate-900 text-white hover:bg-yellow-400 hover:text-slate-950'}`}>
                    {applied ? <><CheckCircle2 className="h-4 w-4" />Application sent</> : <><Send className="h-4 w-4" />Apply now</>}
                  </button>
                </article>
              );
            })}
          </div>

          {filteredJobs.length === 0 && <div className="rounded-2xl border border-dashed border-slate-300 dark:border-yellow-400/20 bg-white dark:bg-slate-900/70 py-16 text-center"><BriefcaseBusiness className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-500" /><h3 className="mt-3 font-semibold text-slate-900 dark:text-slate-100">No jobs found</h3><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Try a different company, role, skill, or job type.</p></div>}
        </main>
      </div>
    </div>
  );
}
