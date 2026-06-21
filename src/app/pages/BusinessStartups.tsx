import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { BriefcaseBusiness, Building2, CalendarCheck, CheckCircle2, GraduationCap, Handshake, LayoutDashboard, Lightbulb, Menu, MessageCircle, Rocket, Search, UserCheck, Users, X } from 'lucide-react';

type CommunityTab = 'ideas' | 'mentors' | 'cofounders';
type CommunityItem = {
  id: string;
  tab: CommunityTab;
  title: string;
  subtitle: string;
  description: string;
  meta: string;
  tags: string[];
  initials: string;
  accent: string;
};

const communityItems: CommunityItem[] = [
  { id: 'idea-1', tab: 'ideas', title: 'CampusLoop', subtitle: 'Circular marketplace for students', description: 'A verified peer-to-peer platform for students to exchange books, devices, and hostel essentials within their campus.', meta: 'Idea by Aditi Verma · Validation stage', tags: ['Marketplace', 'Sustainability', 'EdTech'], initials: 'CL', accent: 'bg-emerald-100 text-emerald-700' },
  { id: 'idea-2', tab: 'ideas', title: 'MediRoute AI', subtitle: 'Smarter access to local healthcare', description: 'An AI-assisted navigation service that matches patients with nearby specialists based on urgency, cost, and availability.', meta: 'Idea by Rohan Das · Prototype stage', tags: ['HealthTech', 'AI', 'B2C'], initials: 'MR', accent: 'bg-blue-100 text-blue-700' },
  { id: 'idea-3', tab: 'ideas', title: 'FarmStack', subtitle: 'Digital operations for small farms', description: 'Simple mobile tools for crop planning, inventory tracking, and direct connections to regional buyers.', meta: 'Idea by Neha Reddy · Seeking pilot partners', tags: ['AgriTech', 'SaaS', 'Impact'], initials: 'FS', accent: 'bg-amber-100 text-amber-700' },
  { id: 'mentor-1', tab: 'mentors', title: 'Kavya Menon', subtitle: 'Founder & Growth Advisor', description: 'Helps early-stage teams sharpen product-market fit, define their go-to-market motion, and prepare for seed fundraising.', meta: 'Ex-Founder, ScaleUp Labs · 12 years experience', tags: ['Growth', 'Fundraising', 'B2B SaaS'], initials: 'KM', accent: 'bg-violet-100 text-violet-700' },
  { id: 'mentor-2', tab: 'mentors', title: 'Arvind Rao', subtitle: 'FinTech Operator & Angel Investor', description: 'Mentors founders working through financial models, regulatory strategy, pricing, and investor readiness.', meta: 'Angel Investor · 20+ startups advised', tags: ['FinTech', 'Finance', 'Strategy'], initials: 'AR', accent: 'bg-cyan-100 text-cyan-700' },
  { id: 'mentor-3', tab: 'mentors', title: 'Meera Shah', subtitle: 'Brand & Consumer Business Mentor', description: 'Works with consumer founders on brand positioning, customer research, retention, and community-led growth.', meta: 'VP Marketing, Bloom & Co. · Alumni 2011', tags: ['D2C', 'Brand', 'Marketing'], initials: 'MS', accent: 'bg-rose-100 text-rose-700' },
  { id: 'cofounder-1', tab: 'cofounders', title: 'Technical Co-founder for FinPilot', subtitle: 'Posted by Sameer Khan', description: 'Looking for a full-stack engineer to build an AI-first cash-flow assistant for small and medium-sized businesses.', meta: 'Hyderabad · Equity-based · 10 hrs/week', tags: ['React', 'Node.js', 'AI'], initials: 'FP', accent: 'bg-blue-100 text-blue-700' },
  { id: 'cofounder-2', tab: 'cofounders', title: 'Growth Co-founder for WellNest', subtitle: 'Posted by Isha Patel', description: 'Seeking a customer-obsessed growth partner for a workplace wellness platform currently running three paid pilots.', meta: 'Remote · Equity + stipend · MVP live', tags: ['Growth', 'B2B Sales', 'Wellness'], initials: 'WN', accent: 'bg-emerald-100 text-emerald-700' },
  { id: 'cofounder-3', tab: 'cofounders', title: 'Design Co-founder for Craftly', subtitle: 'Posted by Vivek Iyer', description: 'Need a product designer passionate about helping independent artisans sell and tell their stories online.', meta: 'Bengaluru · Equity-based · Discovery stage', tags: ['Product Design', 'UX', 'Commerce'], initials: 'CR', accent: 'bg-orange-100 text-orange-700' },
];


const tabDetails: Array<{ id: CommunityTab; label: string; icon: typeof Lightbulb }> = [
  { id: 'ideas', label: 'Startup Ideas', icon: Lightbulb },
  { id: 'mentors', label: 'Business Mentors', icon: Building2 },
  { id: 'cofounders', label: 'Co-founder Requests', icon: Handshake },
];

export function BusinessStartups() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<CommunityTab>('ideas');
  const [search, setSearch] = useState('');
  const [joinedIds, setJoinedIds] = useState<string[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    return communityItems.filter((item) => item.tab === activeTab && (!query || [item.title, item.subtitle, item.description, item.meta, ...item.tags].some((value) => value.toLowerCase().includes(query))));
  }, [activeTab, search]);

  const joinDiscussion = (id: string) => setJoinedIds((current) => current.includes(id) ? current : [...current, id]);

  return (
    <div className="-mx-4 -my-8 min-h-[calc(100vh-4rem)] bg-slate-50">
      <div className="mx-auto flex max-w-[1440px]">

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
          <div className="mb-7 flex items-start gap-3">
            <div><p className="mb-2 text-sm font-semibold text-yellow-600">BUILD WITH THE COMMUNITY</p><h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Business &amp; Startups</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">Discover promising ideas, learn from experienced operators, and find the right co-founder to build with.</p></div>
          </div>

          <div className="mb-6 border-b border-slate-200">
            <div className="flex gap-2 overflow-x-auto" role="tablist" aria-label="Business and startup resources">
              {tabDetails.map(({ id, label, icon: Icon }) => {
                const count = communityItems.filter((item) => item.tab === id).length;
                return <button key={id} role="tab" aria-selected={activeTab === id} onClick={() => { setActiveTab(id); setSearch(''); }} className={`flex shrink-0 items-center gap-2 border-b-2 px-3 py-3 text-sm font-semibold transition ${activeTab === id ? 'border-yellow-500 text-slate-950' : 'border-transparent text-slate-500 hover:text-slate-800'}`}><Icon className="h-4 w-4" />{label}<span className={`rounded-full px-2 py-0.5 text-xs ${activeTab === id ? 'bg-yellow-100 text-yellow-800' : 'bg-slate-200 text-slate-600'}`}>{count}</span></button>;
              })}
            </div>
          </div>

          <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div><h2 className="font-semibold text-slate-900">{tabDetails.find((tab) => tab.id === activeTab)?.label}</h2><p className="text-sm text-slate-500">{activeTab === 'ideas' ? 'Explore ideas taking shape across the alumni network.' : activeTab === 'mentors' ? 'Connect with founders, operators, and business leaders.' : 'Meet alumni actively searching for a complementary partner.'}</p></div>
            <label className="relative block w-full sm:w-72"><span className="sr-only">Search discussions</span><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search topics, people, or skills" className="w-full rounded-xl border border-slate-300 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20" /></label>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredItems.map((item) => {
              const joined = joinedIds.includes(item.id);
              return (
                <article key={item.id} className="flex min-h-[24rem] flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-yellow-300 hover:shadow-md">
                  <div className="flex items-start justify-between gap-3"><div className={`flex h-14 w-14 items-center justify-center rounded-2xl text-base font-bold ${item.accent}`}>{item.initials}</div><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{tabDetails.find((tab) => tab.id === item.tab)?.label.replace(' Requests', '')}</span></div>
                  <div className="mt-4"><h3 className="text-xl font-bold leading-7 text-slate-950">{item.title}</h3><p className="mt-1 font-medium text-yellow-700">{item.subtitle}</p></div>
                  <p className="mt-4 text-sm leading-6 text-slate-600">{item.description}</p>
                  <p className="mt-4 border-l-2 border-yellow-400 pl-3 text-xs font-medium leading-5 text-slate-500">{item.meta}</p>
                  <div className="mt-4 flex flex-wrap gap-2">{item.tags.map((tag) => <span key={tag} className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">{tag}</span>)}</div>
                  <button disabled={joined} onClick={() => joinDiscussion(item.id)} className={`mt-auto flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 ${joined ? 'cursor-default bg-emerald-50 text-emerald-800' : 'bg-slate-900 text-white hover:bg-yellow-400 hover:text-slate-950'}`}>{joined ? <><CheckCircle2 className="h-4 w-4" />Discussion joined</> : <><MessageCircle className="h-4 w-4" />Join Discussion</>}</button>
                </article>
              );
            })}
          </div>

          {filteredItems.length === 0 && <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center"><MessageCircle className="mx-auto h-10 w-10 text-slate-300" /><h3 className="mt-3 font-semibold text-slate-900">No discussions found</h3><p className="mt-1 text-sm text-slate-500">Try another person, topic, or skill.</p></div>}
        </main>
      </div>
    </div>
  );
}
