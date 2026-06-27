import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { BriefcaseBusiness, Building2, CalendarCheck, CheckCircle2, Clock3, GraduationCap, IndianRupee, Laptop2, LayoutDashboard, Menu, Rocket, Search, Send, Sparkles, UserCheck, Users, X } from 'lucide-react';

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

const internships: Internship[] = [
  { id: 1, company: 'Microsoft', initials: 'MS', role: 'Software Engineering Intern', duration: '6 months', stipend: 'INR 80K / month', workMode: 'Hybrid', skills: ['TypeScript', 'React', 'DSA'], accent: 'bg-blue-100 text-blue-700' },
  { id: 2, company: 'Razorpay', initials: 'RZ', role: 'Product Management Intern', duration: '4 months', stipend: 'INR 50K / month', workMode: 'On-site', skills: ['Product Strategy', 'Analytics', 'SQL'], accent: 'bg-violet-100 text-violet-700' },
  { id: 3, company: 'Deloitte', initials: 'DT', role: 'Data Analytics Intern', duration: '3 months', stipend: 'INR 30K / month', workMode: 'Hybrid', skills: ['Power BI', 'SQL', 'Excel'], accent: 'bg-emerald-100 text-emerald-700' },
  { id: 4, company: 'Adobe', initials: 'AD', role: 'UX Design Intern', duration: '6 months', stipend: 'INR 60K / month', workMode: 'Remote', skills: ['Figma', 'UX Research', 'Prototyping'], accent: 'bg-rose-100 text-rose-700' },
  { id: 5, company: 'Amazon', initials: 'AZ', role: 'Cloud Support Intern', duration: '5 months', stipend: 'INR 55K / month', workMode: 'On-site', skills: ['AWS', 'Linux', 'Networking'], accent: 'bg-amber-100 text-amber-700' },
  { id: 6, company: 'Groww', initials: 'GW', role: 'Growth Marketing Intern', duration: '3 months', stipend: 'INR 35K / month', workMode: 'Remote', skills: ['SEO', 'Content', 'Analytics'], accent: 'bg-cyan-100 text-cyan-700' },
];


export function Internships() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [workMode, setWorkMode] = useState<'All' | WorkMode>('All');
  const [appliedIds, setAppliedIds] = useState<number[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const filteredInternships = useMemo(() => {
    const query = search.trim().toLowerCase();
    return internships.filter((internship) => {
      const matchesMode = workMode === 'All' || internship.workMode === workMode;
      const matchesSearch = !query || [internship.company, internship.role, internship.duration, ...internship.skills].some((value) => value.toLowerCase().includes(query));
      return matchesMode && matchesSearch;
    });
  }, [search, workMode]);

  const apply = (id: number) => setAppliedIds((current) => current.includes(id) ? current : [...current, id]);

  return (
    <div className="-mx-4 -my-8 min-h-[calc(100vh-4rem)] bg-slate-50">
      <div className="mx-auto flex max-w-[1440px]">

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
          <div className="mb-7 flex items-start gap-3">
            <div><p className="mb-2 text-sm font-semibold text-yellow-600">LAUNCH YOUR CAREER</p><h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Internships</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">Find hands-on opportunities that help you learn, contribute, and grow your professional network.</p></div>
          </div>

          <section className="mb-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row" aria-label="Internship filters">
            <label className="relative min-w-0 flex-1"><span className="sr-only">Search internships</span><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search company, role, or skill" className="w-full rounded-xl border border-slate-300 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20" /></label>
            <select value={workMode} onChange={(event) => setWorkMode(event.target.value as 'All' | WorkMode)} className="rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20" aria-label="Filter by work mode"><option>All</option><option>Remote</option><option>Hybrid</option><option>On-site</option></select>
          </section>

          <div className="mb-5 flex items-center justify-between"><h2 className="font-semibold text-slate-900">Open internships</h2><span className="text-sm text-slate-500">{filteredInternships.length} opportunities</span></div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredInternships.map((internship) => {
              const applied = appliedIds.includes(internship.id);
              const modeStyle = internship.workMode === 'Remote' ? 'bg-blue-50 text-blue-700' : internship.workMode === 'Hybrid' ? 'bg-violet-50 text-violet-700' : 'bg-emerald-50 text-emerald-700';
              return (
                <article key={internship.id} className="flex min-h-[25rem] flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-yellow-300 hover:shadow-md">
                  <div className="flex items-start justify-between gap-3"><div className={`flex h-14 w-14 items-center justify-center rounded-2xl text-base font-bold ${internship.accent}`}>{internship.initials}</div><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${modeStyle}`}>{internship.workMode}</span></div>
                  <div className="mt-4"><p className="text-sm font-semibold text-yellow-700">{internship.company}</p><h3 className="mt-1 text-xl font-bold text-slate-950">{internship.role}</h3></div>
                  <dl className="mt-5 space-y-3 text-sm">
                    <div className="flex items-center justify-between gap-3"><dt className="flex items-center gap-2 text-slate-500"><Clock3 className="h-4 w-4" />Duration</dt><dd className="font-semibold text-slate-900">{internship.duration}</dd></div>
                    <div className="flex items-center justify-between gap-3"><dt className="flex items-center gap-2 text-slate-500"><IndianRupee className="h-4 w-4" />Stipend</dt><dd className="font-semibold text-slate-900">{internship.stipend}</dd></div>
                    <div className="flex items-center justify-between gap-3"><dt className="flex items-center gap-2 text-slate-500"><Laptop2 className="h-4 w-4" />Work mode</dt><dd className="font-semibold text-slate-900">{internship.workMode}</dd></div>
                    <div className="pt-1"><dt className="font-medium text-slate-500">Required skills</dt><dd className="mt-2 flex flex-wrap gap-2">{internship.skills.map((skill) => <span key={skill} className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">{skill}</span>)}</dd></div>
                  </dl>
                  <button disabled={applied} onClick={() => apply(internship.id)} className={`mt-auto flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 ${applied ? 'cursor-default bg-emerald-50 text-emerald-800' : 'bg-slate-900 text-white hover:bg-yellow-400 hover:text-slate-950'}`}>{applied ? <><CheckCircle2 className="h-4 w-4" />Application sent</> : <><Send className="h-4 w-4" />Apply now</>}</button>
                </article>
              );
            })}
          </div>
          {filteredInternships.length === 0 && <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center"><Building2 className="mx-auto h-10 w-10 text-slate-300" /><h3 className="mt-3 font-semibold text-slate-900">No internships found</h3><p className="mt-1 text-sm text-slate-500">Try a different company, role, skill, or work mode.</p></div>}
        </main>
      </div>
    </div>
  );
}
