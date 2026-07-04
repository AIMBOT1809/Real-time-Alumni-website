import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { BriefcaseBusiness, Building2, CalendarCheck, CheckCircle2, Clock3, GraduationCap, IndianRupee, Laptop2, LayoutDashboard, Menu, Rocket, Search, Send, Sparkles, UserCheck, Users, X } from 'lucide-react';
import { useEffect } from "react";
import { supabase } from '../../supabaseClient';

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

type WorkMode = 'Remote' | 'Hybrid' | 'On-site';
type Internship = {
  id: number;
  company: string;
  initials: string;
  role: string;
  duration: string;
  stipend: string;
  workMode: WorkMode;
  skills: string[];
  accent: string;
};

export function Internships() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [workMode, setWorkMode] = useState<'All' | WorkMode>('All');
  const [appliedIds, setAppliedIds] = useState<number[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [internships, setInternships] = useState<any[]>([]);
  const fetchInternships = async () => {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("status", "approved")
    .eq("type", "internship")
    .order("created_at", { ascending: false });
    console.log("DATA FROM POSTS:",data);
    console.log("FIRST POST:",data?.[0]);

  if (error) {
    console.log("FULL ERROR:", error);
    alert(error.message);
    return;
}

  const formatted = (data || []).map((item: any) => {
  let details = item.post_details;

  try {
    if (typeof details === "string") {
      details = JSON.parse(details);
    }
  } catch (e) {
    console.log("Parse failed:", details);
  }

  return {
    ...item,
    post_details: details,
  };
});
console.log("AFTER PARSE:", formatted[0]);

setInternships(formatted);
};
useEffect(() => {
    fetchInternships();
}, []);

  const filteredInternships = useMemo(() => {
  const query = search.trim().toLowerCase();

  return internships.filter((internship) => {
    const details = internship.post_details || {};

    const mode = details.locationType || "";
    const skills =
      typeof details.requiredSkills === "string"
        ? details.requiredSkills.split(",")
        : [];

    const matchesMode =
      workMode === "All" || mode === workMode;

    const matchesSearch =
      !query ||
      [
        details.companyName || "",
        details.internshipRole || "",
        details.duration || "",
        ...skills,
      ].some((value: string) =>
        value.toLowerCase().includes(query)
      );

    return matchesMode && matchesSearch;
  });
}, [internships, search, workMode]);

  const apply = (id: number) => {
    setAppliedIds((current) => current.includes(id) ? current : [...current, id]);
    const internship = internships.find((item) => item.id === id);
    if (internship) {
      openPostLink(internship.post_details?.applyLink);
    }
  };

  return (
    <div className="-mx-4 -my-8 min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto flex max-w-[1440px]">

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
          <div className="mb-7 flex items-start gap-3">
            <div><p className="mb-2 text-sm font-semibold text-yellow-600 dark:text-yellow-400">LAUNCH YOUR CAREER</p><h1 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-slate-100 sm:text-4xl">Internships</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">Find hands-on opportunities that help you learn, contribute, and grow your professional network.</p></div>
          </div>

          <section className="mb-6 flex flex-col gap-3 rounded-2xl border border-slate-200 dark:border-yellow-400/20 bg-white dark:bg-slate-900/70 p-4 shadow-sm sm:flex-row" aria-label="Internship filters">
            <label className="relative min-w-0 flex-1"><span className="sr-only">Search internships</span><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search company, role, or skill" className="w-full rounded-xl border border-slate-300 dark:border-yellow-400/20 bg-white/70 dark:bg-slate-900/70 py-2.5 pl-9 pr-3 text-sm outline-none transition text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20" /></label>
            <select value={workMode} onChange={(event) => setWorkMode(event.target.value as 'All' | WorkMode)} className="rounded-xl border border-slate-300 dark:border-yellow-400/20 bg-white/70 dark:bg-slate-900/70 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20" aria-label="Filter by work mode"><option>All</option><option>Remote</option><option>Hybrid</option><option>On-site</option></select>
          </section>

          <div className="mb-5 flex items-center justify-between"><h2 className="font-semibold text-slate-900 dark:text-slate-100">Open internships</h2><span className="text-sm text-slate-500 dark:text-slate-400">{filteredInternships.length} opportunities</span></div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredInternships.map((internship) => {
              const applied = appliedIds.includes(internship.id);
              const modeStyle = internship.workMode === 'Remote' ? 'bg-blue-50 dark:bg-blue-400/20 text-blue-700 dark:text-blue-300' : internship.workMode === 'Hybrid' ? 'bg-violet-50 dark:bg-violet-400/20 text-violet-700 dark:text-violet-300' : 'bg-emerald-50 dark:bg-emerald-400/20 text-emerald-700 dark:text-emerald-300';
              return (
                <article key={internship.id} className="flex min-h-[25rem] flex-col rounded-2xl border border-slate-200 dark:border-yellow-400/20 bg-white dark:bg-slate-900/70 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-yellow-300 hover:shadow-md">
                  <div className="flex items-start justify-between gap-3"><div className={`flex h-14 w-14 items-center justify-center rounded-2xl text-base font-bold ${internship.accent}`}>{internship.initials}</div><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${modeStyle}`}>{internship.workMode}</span></div>
                  <div className="mt-4"><p className="text-sm font-semibold text-yellow-700 dark:text-yellow-400">{internship.post_details?.companyName}</p><h3 className="mt-1 text-xl font-bold text-slate-950 dark:text-slate-100">{internship.post_details?.internshipRole}</h3></div>
                  <dl className="mt-5 space-y-3 text-sm">
                    <div className="flex items-center justify-between gap-3"><dt className="flex items-center gap-2 text-slate-500 dark:text-slate-400"><Clock3 className="h-4 w-4" />Duration</dt><dd className="font-semibold text-slate-900 dark:text-slate-100">{internship.post_details?.duration}</dd></div>
                    <div className="flex items-center justify-between gap-3"><dt className="flex items-center gap-2 text-slate-500 dark:text-slate-400"><IndianRupee className="h-4 w-4" />Stipend</dt><dd className="font-semibold text-slate-900 dark:text-slate-100">{internship.post_details?.stipend}</dd></div>
                    <div className="flex items-center justify-between gap-3"><dt className="flex items-center gap-2 text-slate-500 dark:text-slate-400"><Laptop2 className="h-4 w-4" />Work mode</dt><dd className="font-semibold text-slate-900 dark:text-slate-100">{internship.post_details?.locationType}</dd></div>
                    <div className="pt-1"><dt className="font-medium text-slate-500 dark:text-slate-400">Required skills</dt><dd className="mt-2 flex flex-wrap gap-2">{(internship.post_details?.requiredSkills?.split(",") || []).map((skill: string) =>  <span key={skill} className="rounded-lg bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300">{skill}</span>)}</dd></div>
                  </dl>
                  <button disabled={applied} onClick={() => openPostLink(internship.post_details?.applyLink)} className={`mt-auto flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 ${applied ? 'cursor-default bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-300' : 'bg-slate-900 text-white hover:bg-yellow-400 hover:text-slate-950'}`}>{applied ? <><CheckCircle2 className="h-4 w-4" />Application sent</> : <><Send className="h-4 w-4" />Apply now</>}</button>
                </article>
              );
            })}
          </div>
          {filteredInternships.length === 0 && <div className="rounded-2xl border border-dashed border-slate-300 dark:border-yellow-400/20 bg-white dark:bg-slate-900/70 py-16 text-center"><Building2 className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-500" /><h3 className="mt-3 font-semibold text-slate-900 dark:text-slate-100">No internships found</h3><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Try a different company, role, skill, or work mode.</p></div>}
        </main>
      </div>
    </div>
  );
}