import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { BriefcaseBusiness, Building2, CalendarCheck, CheckCircle2, GraduationCap, IndianRupee, LayoutDashboard, Menu, Rocket, Search, Send, Sparkles, UserCheck, Users, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { addActivityItem, getActivity } from '../data/activityStore';
<<<<<<< Updated upstream
import { useEffect } from "react";
import { supabase } from "../../supabaseClient";

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

<<<<<<< Updated upstream

export function Jobs() {
  console.log("Jobs component loaded");
const jobs: Job[] = [
  { id: 1, company: 'Microsoft', initials: 'MS', role: 'Software Engineer', package: 'INR 18–24 LPA', eligibility: 'B.Tech / M.Tech · 2025–26 batches', skills: ['React', 'TypeScript', 'DSA'], type: 'Full-time', accent: 'bg-blue-100 text-blue-700' },
  { id: 2, company: 'Deloitte', initials: 'DT', role: 'Business Technology Analyst', package: 'INR 8–12 LPA', eligibility: 'All engineering branches · CGPA 7+', skills: ['SQL', 'Power BI', 'Analytics'], type: 'Full-time', accent: 'bg-emerald-100 text-emerald-700' },
  { id: 3, company: 'Razorpay', initials: 'RZ', role: 'Frontend Developer Intern', package: 'INR 45K / month', eligibility: 'Pre-final and final-year students', skills: ['JavaScript', 'React', 'CSS'], type: 'Internship', accent: 'bg-violet-100 text-violet-700' },
  { id: 4, company: 'Amazon', initials: 'AZ', role: 'Cloud Support Associate', package: 'INR 14–18 LPA', eligibility: 'B.E. / B.Tech / MCA · No active backlogs', skills: ['AWS', 'Linux', 'Networking'], type: 'Full-time', accent: 'bg-amber-100 text-amber-700' },
  { id: 5, company: 'Adobe', initials: 'AD', role: 'Product Design Intern', package: 'INR 60K / month', eligibility: 'Design or engineering students', skills: ['Figma', 'UX Research', 'Prototyping'], type: 'Internship', accent: 'bg-rose-100 text-rose-700' },
  { id: 6, company: 'Google', initials: 'GO', role: 'Data Analyst', package: 'INR 16–22 LPA', eligibility: 'Bachelor’s degree · 0–2 years experience', skills: ['Python', 'SQL', 'Tableau'], type: 'Full-time', accent: 'bg-cyan-100 text-cyan-700' },
];


export function Jobs() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [jobType, setJobType] = useState<'All' | Job['type']>('All');
  const [appliedIds, setAppliedIds] = useState<number[]>(() => getActivity(user?.id).appliedJobs.map((item) => Number(item.id)).filter(Number.isFinite));
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
<<<<<<< Updated upstream
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

  const filteredJobs = useMemo(() => {
    const query = search.trim().toLowerCase();
    return jobs.filter((job) => {
      const matchesType = jobType === 'All' || job.type === jobType;
      const matchesSearch = !query || [job.company, job.role, job.eligibility, ...job.skills].some((value) => value.toLowerCase().includes(query));
      return matchesType && matchesSearch;
    });
  }, [jobType, search]);

  const applyForJob = (jobId: number) => {
    const job = jobs.find((item) => item.id === jobId);
    if (!job || appliedIds.includes(jobId)) return;
    setAppliedIds((current) => [...current, jobId]);
    addActivityItem(user?.id, 'appliedJobs', {
<<<<<<< Updated upstream
      id: String(job.id), title: job.post_details?.jobRole,
subtitle: job.post_details?.companyName,
category: "Job",
      date: new Date().toISOString(), status: 'Application sent',
      id: String(job.id), title: job.role, subtitle: `${job.company} ? ${job.type}`,
      date: new Date().toISOString(), status: 'Application sent', category: job.type,
    });
  };

  return (
    <div className="-mx-4 -my-8 min-h-[calc(100vh-4rem)] bg-slate-50">
      <div className="mx-auto flex max-w-[1440px]">

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
          <div className="mb-7 flex items-start gap-3">
            <div>
              <p className="mb-2 text-sm font-semibold text-yellow-600">ALUMNI CAREER BOARD</p>
              <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Jobs</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">Explore curated roles and internships shared by the alumni community.</p>
            </div>
          </div>

          <section className="mb-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row" aria-label="Job filters">
            <label className="relative min-w-0 flex-1">
              <span className="sr-only">Search jobs</span>
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search company, role, or skill" className="w-full rounded-xl border border-slate-300 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20" />
            </label>
            <select value={jobType} onChange={(event) => setJobType(event.target.value as 'All' | Job['type'])} className="rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20" aria-label="Filter by job type">
              <option>All</option><option>Full-time</option><option>Internship</option>
            </select>
          </section>

          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Open positions</h2>
            <span className="text-sm text-slate-500">{filteredJobs.length} opportunities</span>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredJobs.map((job) => {
              const applied = appliedIds.includes(job.id);
              return (
                <article key={job.id} className="flex min-h-[25rem] flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-yellow-300 hover:shadow-md">
                  <div className="flex items-start justify-between gap-3">
<<<<<<< Updated upstream
                    <div className={`flex h-14 w-14 items-center justify-center rounded-2xl text-base font-bold bg-yellow-100 text-yellow-700`}>{job.post_details?.companyName?.substring(0,2).toUpperCase()}</div>
                    <span className="rounded-full bg-emerald-50 text-emerald-700 px-2.5 py-1 text-xs font-semibold">
Job
</span>
                  </div>
                  <div className="mt-4"><p className="text-sm font-semibold text-yellow-700">{job.post_details?.companyName}</p><h3 className="mt-1 text-xl font-bold text-slate-950">{job.post_details?.jobRole}</h3></div>
                  <dl className="mt-5 space-y-4 text-sm">
                    <div><dt className="flex items-center gap-2 font-medium text-slate-500"><IndianRupee className="h-4 w-4" />Package</dt><dd className="mt-1 pl-6 font-semibold text-slate-900">{job.post_details?.salary}</dd></div>
                    <div><dt className="font-medium text-slate-500">Eligibility</dt><dd className="mt-1 leading-5 text-slate-700">{job.post_details?.experience}</dd></div>
                    <div><dt className="font-medium text-slate-500">Required skills</dt><dd className="mt-2 flex flex-wrap gap-2">{(job.post_details?.requiredSkills?.split(",") || []).map((skill: string) => (
  <span
    key={skill}
    className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700"
  >
    {skill}
  </span>
))}</dd></div>
                    <div className={`flex h-14 w-14 items-center justify-center rounded-2xl text-base font-bold ${job.accent}`}>{job.initials}</div>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${job.type === 'Full-time' ? 'bg-emerald-50 text-emerald-700' : 'bg-violet-50 text-violet-700'}`}>{job.type}</span>
                  </div>
                  <div className="mt-4"><p className="text-sm font-semibold text-yellow-700">{job.company}</p><h3 className="mt-1 text-xl font-bold text-slate-950">{job.role}</h3></div>
                  <dl className="mt-5 space-y-4 text-sm">
                    <div><dt className="flex items-center gap-2 font-medium text-slate-500"><IndianRupee className="h-4 w-4" />Package</dt><dd className="mt-1 pl-6 font-semibold text-slate-900">{job.package}</dd></div>
                    <div><dt className="font-medium text-slate-500">Eligibility</dt><dd className="mt-1 leading-5 text-slate-700">{job.eligibility}</dd></div>
                    <div><dt className="font-medium text-slate-500">Required skills</dt><dd className="mt-2 flex flex-wrap gap-2">{job.skills.map((skill) => <span key={skill} className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">{skill}</span>)}</dd></div>
                  </dl>
                  <button disabled={applied} onClick={() => applyForJob(job.id)} className={`mt-auto flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 ${applied ? 'cursor-default bg-emerald-50 text-emerald-800' : 'bg-slate-900 text-white hover:bg-yellow-400 hover:text-slate-950'}`}>
                    {applied ? <><CheckCircle2 className="h-4 w-4" />Application sent</> : <><Send className="h-4 w-4" />Apply now</>}
                  </button>
                </article>
              );
            })}
          </div>

          {filteredJobs.length === 0 && <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center"><BriefcaseBusiness className="mx-auto h-10 w-10 text-slate-300" /><h3 className="mt-3 font-semibold text-slate-900">No jobs found</h3><p className="mt-1 text-sm text-slate-500">Try a different company, role, skill, or job type.</p></div>}
        </main>
      </div>
    </div>
  );
}
