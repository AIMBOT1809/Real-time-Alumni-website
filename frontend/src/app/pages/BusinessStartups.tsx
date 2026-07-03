import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Building2,
  CheckCircle2,
  Handshake,
  Lightbulb,
  MessageCircle,
  Search,
} from "lucide-react";
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




const tabDetails: Array<{ id: CommunityTab; label: string; icon: typeof Lightbulb }> = [
  { id: 'ideas', label: 'Startup Ideas', icon: Lightbulb },
  { id: 'mentors', label: 'Business Mentors', icon: Building2 },
  { id: 'cofounders', label: 'Co-founder Requests', icon: Handshake },
];

export function BusinessStartups() {
  const navigate = useNavigate();

const [activeTab, setActiveTab] = useState<CommunityTab>("ideas");
const [search, setSearch] = useState("");
const [joinedIds, setJoinedIds] = useState<string[]>([]);
const [isSidebarOpen, setIsSidebarOpen] = useState(false);

const [communityItems, setCommunityItems] = useState<any[]>([]);

const fetchBusinessPosts = async () => {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("status", "approved")
    .eq("type", "business")
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
      id: item.id,
      tab: "ideas",
      title: details?.opportunityTitle || "",
      subtitle: details?.businessName || "",
      description: details?.collaborationDetails || "",
      meta: details?.businessCategory || "",
      tags: details?.supportNeeded
        ? details.supportNeeded.split(",").map((s: string) => s.trim())
        : [],
      initials: (details?.businessName || "B")
        .substring(0, 2)
        .toUpperCase(),
      accent: "bg-yellow-100 dark:bg-yellow-400/20 text-yellow-700 dark:text-yellow-300",
      contactLink: details?.contactLink || "",
    };
  });

  console.log("Business Posts:", formatted);

  setCommunityItems(formatted);
};

useEffect(() => {
  fetchBusinessPosts();
}, []);
  

  const filteredItems = useMemo(() => {
  const query = search.trim().toLowerCase();

  return communityItems.filter((item: any) => {
    const matchesTab = item.tab === activeTab;

    const matchesSearch =
      !query ||
      [
        item.title,
        item.subtitle,
        item.description,
        item.meta,
        ...(item.tags || []),
      ]
        .filter(Boolean)
        .some((value: string) =>
          value.toLowerCase().includes(query)
        );

    return matchesTab && matchesSearch;
  });
}, [communityItems, activeTab, search]);

  const joinDiscussion = (id: string) => setJoinedIds((current) => current.includes(id) ? current : [...current, id]);

  return (
    <div className="-mx-4 -my-8 min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto flex max-w-[1440px]">

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
          <div className="mb-7 flex items-start gap-3">
            <div><p className="mb-2 text-sm font-semibold text-yellow-600 dark:text-yellow-400">BUILD WITH THE COMMUNITY</p><h1 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-slate-100 sm:text-4xl">Business & Startups</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">Discover promising ideas, learn from experienced operators, and find the right co-founder to build with.</p></div>
          </div>

          <div className="mb-6 border-b border-slate-200 dark:border-yellow-400/20">
            <div className="flex gap-2 overflow-x-auto" role="tablist" aria-label="Business and startup resources">
              {tabDetails
.filter(tab => tab.id === "ideas")
.map(({ id, label, icon: Icon }) => {
                const count =
id === "ideas"
? communityItems.length
: 0;
                return <button key={id} role="tab" aria-selected={activeTab === id} onClick={() => { setActiveTab(id); setSearch(''); }} className={`flex shrink-0 items-center gap-2 border-b-2 px-3 py-3 text-sm font-semibold transition ${activeTab === id ? 'border-yellow-500 text-slate-950 dark:text-slate-100' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}><Icon className="h-4 w-4" />{label}<span className={`rounded-full px-2 py-0.5 text-xs ${activeTab === id ? 'bg-yellow-100 dark:bg-yellow-400/20 text-yellow-800 dark:text-yellow-300' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'}`}>{count}</span></button>;
              })}
            </div>
          </div>

          <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-slate-200 dark:border-yellow-400/20 bg-white dark:bg-slate-900/70 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500 dark:text-slate-400">
  Explore approved business opportunities shared by alumni.
</p>
            <label className="relative block w-full sm:w-72"><span className="sr-only">Search discussions</span><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search topics, people, or skills" className="w-full rounded-xl border border-slate-300 dark:border-yellow-400/20 bg-white/70 dark:bg-slate-900/70 py-2.5 pl-9 pr-3 text-sm outline-none transition text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20" /></label>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredItems.map((item) => {
              const joined = joinedIds.includes(item.id);
              return (
                <article
  key={item.id}
  className="flex min-h-[24rem] flex-col rounded-2xl border border-slate-200 dark:border-yellow-400/20 bg-white dark:bg-slate-900/70 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-yellow-300 hover:shadow-md"
>
  <div className="flex items-start justify-between gap-3">
    <div
      className={`flex h-14 w-14 items-center justify-center rounded-2xl text-base font-bold ${item.accent}`}
    >
      {item.initials}
    </div>

    <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
      Business
    </span>
  </div>

  <div className="mt-4">
    <h3 className="text-xl font-bold leading-7 text-slate-950 dark:text-slate-100">
      {item.title}
    </h3>

    <p className="mt-1 font-medium text-yellow-700 dark:text-yellow-400">
      {item.subtitle}
    </p>
  </div>

  <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
    {item.description}
  </p>

  <p className="mt-4 border-l-2 border-yellow-400 pl-3 text-xs font-medium leading-5 text-slate-500 dark:text-slate-400">
    Business Category: {item.meta}
  </p>

  <div className="mt-4 flex flex-wrap gap-2">
    {(item.tags || []).map((tag: string) => (
      <span
        key={tag}
        className="rounded-lg bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300"
      >
        {tag}
      </span>
    ))}
  </div>

  <button
onClick={() => openPostLink(item.contactLink)}
className="mt-auto flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-yellow-400 hover:text-slate-950"
>
  <MessageCircle className="h-4 w-4" />
  Contact
</button>
</article>
                
              );
            })}
          </div>

          {filteredItems.length === 0 && <div className="rounded-2xl border border-dashed border-slate-300 dark:border-yellow-400/20 bg-white dark:bg-slate-900/70 py-16 text-center"><MessageCircle className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-500" /><h3 className="mt-3 font-semibold text-slate-900 dark:text-slate-100">No discussions found</h3><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Try another person, topic, or skill.</p></div>}
        </main>
      </div>
    </div>
  );
}