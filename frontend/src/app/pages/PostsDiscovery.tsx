import { useMemo, useState } from 'react';
import { Bookmark, BookmarkCheck, CalendarDays, Heart, MessageCircle, Plus, Search, Sparkles } from 'lucide-react';
import { Link } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { addActivityItem, getActivity, removeActivityItem } from '../data/activityStore';
import { getApprovedPosts } from '../data/localStoragePosts';

const categories = [
  { id: 'all', label: 'All Posts' },
  { id: 'job', label: 'Jobs' },
  { id: 'internship', label: 'Internships' },
  { id: 'mentorship', label: 'Mentorship' },
  { id: 'referral', label: 'Referrals' },
  { id: 'event', label: 'Events' },
  { id: 'business', label: 'Business' },
  { id: 'higher-education', label: 'Higher Education' },
  { id: 'general', label: 'General Posts' },
] as const;

const normalizeCategory = (type?: string) => {
  if (type === 'opportunity') return 'job';
  if (type === 'community') return 'general';
  if (type === 'higher-education') return 'higher-education';
  return categories.some((category) => category.id === type) ? type || 'general' : 'general';
};

const categoryLabel = (type?: string) =>
  categories.find((category) => category.id === normalizeCategory(type))?.label.replace(' Posts', '') || 'General';

export function PostsDiscovery() {
  const { posts, user, role, getAlumniById } = useAuth();
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [savedIds, setSavedIds] = useState<string[]>(() => getActivity(user?.id).savedPosts.map((item) => item.id));
  const canCreate = role === 'alumni' || role === 'faculty';

  // Temporary localStorage approval flow for demo
  // Combine approved posts from Supabase with approved local posts
  const approvedPosts = useMemo(() => {
    const query = search.trim().toLowerCase();
    
    // Get approved posts from Supabase
    const supabaseApproved = posts.filter((post) => {
      const isApproved = !post.status || post.status === 'approved';
      return isApproved;
    });

    // Get approved posts from localStorage
    const localApproved = getApprovedPosts().map((p) => ({
      id: p.id,
      alumniId: p.alumniId,
      title: p.title,
      content: p.content,
      timestamp: p.timestamp || p.created_at || new Date().toISOString(),
      type: p.type || 'general',
      status: p.status,
      likes: p.likes || 0,
      comments: p.comments || 0,
      image: p.image,
      file: p.file,
      post_details: p.post_details,
    }));

    // Combine and deduplicate by id
    const allPosts = [...supabaseApproved, ...localApproved];
    const uniquePosts = allPosts.filter((post, index, self) => 
      index === self.findIndex((p) => p.id === post.id)
    );

    return uniquePosts.filter((post) => {
      const category = normalizeCategory(String(post.type || 'general'));
      const author = getAlumniById(post.alumniId)?.name || '';
      const matchesCategory = activeCategory === 'all' || category === activeCategory;
      const matchesSearch = !query || [post.title, post.content, author, categoryLabel(String(post.type))]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, getAlumniById, posts, search]);

  const toggleSaved = (post: typeof posts[number]) => {
    if (!user?.id) return;
    const isSaved = savedIds.includes(post.id);
    if (isSaved) {
      removeActivityItem(user.id, 'savedPosts', post.id);
      setSavedIds((current) => current.filter((id) => id !== post.id));
      return;
    }
    addActivityItem(user.id, 'savedPosts', {
      id: post.id,
      title: post.title || 'Untitled post',
      subtitle: post.content.slice(0, 100),
      category: categoryLabel(String(post.type)),
      date: new Date().toISOString(),
      status: 'Saved',
    });
    setSavedIds((current) => [post.id, ...current]);
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:py-9">
      <section className="overflow-hidden rounded-3xl bg-slate-900 px-5 py-7 text-white sm:px-8 sm:py-9">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-yellow-400">
              <Sparkles className="h-4 w-4" /> Community discovery
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Posts &amp; Opportunities</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
              Browse approved opportunities, events, advice, and updates shared across the alumni network.
            </p>
          </div>
          {canCreate && (
            <Link to="/dashboard/post" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-yellow-400 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-yellow-300">
              <Plus className="h-4 w-4" /> Create Post
            </Link>
          )}
        </div>
      </section>

      <section className="sticky top-[158px] z-20 mt-5 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-sm backdrop-blur" aria-label="Post filters">
        <label className="relative block">
          <span className="sr-only">Search posts</span>
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search title, content, author, or category" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20" />
        </label>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {categories.map((category) => (
            <button key={category.id} onClick={() => setActiveCategory(category.id)} className={`shrink-0 rounded-full px-3.5 py-2 text-sm font-semibold transition ${activeCategory === category.id ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-yellow-100 hover:text-slate-950'}`}>
              {category.label}
            </button>
          ))}
        </div>
      </section>

      <div className="mt-5 flex items-center justify-between">
        <h2 className="font-bold text-slate-950">{categories.find((category) => category.id === activeCategory)?.label}</h2>
        <span className="text-sm text-slate-500">{approvedPosts.length} approved {approvedPosts.length === 1 ? 'post' : 'posts'}</span>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {approvedPosts.map((post) => {
          const author = getAlumniById(post.alumniId);
          const saved = savedIds.includes(post.id);
          return (
            <article key={post.id} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-yellow-300 hover:shadow-md">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <span className="inline-flex rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-bold text-yellow-800">{categoryLabel(String(post.type))}</span>
                  <h3 className="mt-3 text-xl font-bold text-slate-950">{post.title || 'Untitled post'}</h3>
                </div>
                <button onClick={() => toggleSaved(post)} aria-label={saved ? 'Remove from saved posts' : 'Save post'} className={`rounded-xl p-2 transition ${saved ? 'bg-yellow-100 text-yellow-800' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                  {saved ? <BookmarkCheck className="h-5 w-5" /> : <Bookmark className="h-5 w-5" />}
                </button>
              </div>
              <p className="mt-3 line-clamp-4 text-sm leading-6 text-slate-600">{post.content}</p>
              {post.image && <img src={post.image} alt="" className="mt-4 h-44 w-full rounded-xl object-cover" />}
              <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 text-xs text-slate-500">
                <div>
                  <p className="font-semibold text-slate-700">{author?.name || 'Alumni member'}</p>
                  <p className="mt-1 flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" />{new Date(post.timestamp).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
                <div className="flex items-center gap-3"><span className="flex items-center gap-1"><Heart className="h-4 w-4" />{post.likes || 0}</span><span className="flex items-center gap-1"><MessageCircle className="h-4 w-4" />{post.comments || 0}</span></div>
              </div>
            </article>
          );
        })}
      </div>

      {approvedPosts.length === 0 && (
        <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
          <Search className="mx-auto h-10 w-10 text-slate-300" />
          <h3 className="mt-3 font-bold text-slate-900">No approved posts found</h3>
          <p className="mt-1 text-sm text-slate-500">Try another category or a broader search.</p>
        </div>
      )}
    </div>
  );
}
