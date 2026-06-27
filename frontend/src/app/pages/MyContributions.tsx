import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, CalendarDays, Edit3, FileText, Loader2, Plus, Search, Trash2, X } from 'lucide-react';
import { Link } from 'react-router';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { getPostsByAuthor, updateLocalPost, deleteLocalPost } from '../data/localStoragePosts';
import { showGlobalToast } from '../components/Toast';
import { ConfirmModal } from '../components/ConfirmModal';

type ContributionStatus = 'pending' | 'approved' | 'rejected';
type Contribution = { id: string; title: string; content: string; type: string; createdAt: string; status: ContributionStatus; rejectionReason?: string };

const contributionCategories = [
  { id: 'all', label: 'All Contributions' },
  { id: 'job', label: 'My Job Posts' },
  { id: 'internship', label: 'My Internship Posts' },
  { id: 'referral', label: 'My Referral Posts' },
  { id: 'mentorship', label: 'My Mentorship Sessions' },
  { id: 'event', label: 'My Events' },
  { id: 'business', label: 'My Business Posts' },
  { id: 'general', label: 'My General Posts' },
] as const;

const normalizeType = (type?: string) => type === 'opportunity' ? 'job' : type === 'community' ? 'general' : type || 'general';
const typeLabel = (type: string) => contributionCategories.find((category) => category.id === normalizeType(type))?.label.replace(/^My /, '').replace(/ Posts$| Sessions$/, '') || 'General';
const statusStyle: Record<ContributionStatus, string> = { pending: 'bg-amber-100 text-amber-800', approved: 'bg-emerald-100 text-emerald-800', rejected: 'bg-rose-100 text-rose-800' };

export function MyContributions() {
  const { user, role } = useAuth();
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [editing, setEditing] = useState<Contribution | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const canContribute = role === 'alumni' || role === 'faculty';

  // Temporary localStorage approval flow for demo
  const fetchContributions = async () => {
    if (!user?.id || !canContribute) { setLoading(false); return; }
    setLoading(true);

    try {
      // Fetch from Supabase
      const { data, error } = await supabase.from('posts').select('*').eq('alumni_id', user.id).order('created_at', { ascending: false });
      
      const supabaseContributions = (data || []).map((row: any) => ({
        id: String(row.id), title: row.title || 'Untitled post', content: row.content || '', type: normalizeType(row.type),
        createdAt: row.created_at || row.timestamp || new Date().toISOString(), status: row.status || 'approved', rejectionReason: row.rejection_reason || undefined,
      }));

      // Fetch from localStorage
      const localPosts = getPostsByAuthor(user.id).map((p: any) => ({
        id: String(p.id), title: p.title || 'Untitled post', content: p.content || '', type: normalizeType(p.type),
        createdAt: p.timestamp || p.created_at || new Date().toISOString(), status: p.status || 'pending', rejectionReason: p.rejectionReason || undefined,
      }));

      // Combine and deduplicate
      const allContributions = [...supabaseContributions, ...localPosts];
      const uniqueContributions = allContributions.filter((item, index, self) => 
        index === self.findIndex((c) => c.id === item.id)
      );

      setContributions(uniqueContributions);
      setMessage('');
    } catch (error) {
      setMessage('We could not load your contributions right now. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContributions();
    if (!user?.id || !canContribute) return;
    const channel = supabase.channel(`my-contributions-${user.id}`).on('postgres_changes', { event: '*', schema: 'public', table: 'posts', filter: `alumni_id=eq.${user.id}` }, fetchContributions).subscribe();
    return () => { channel.unsubscribe(); };
  }, [user?.id, canContribute]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return contributions.filter((item) => (activeCategory === 'all' || normalizeType(item.type) === activeCategory) && (!query || [item.title, item.content, item.status, typeLabel(item.type)].some((value) => value.toLowerCase().includes(query))));
  }, [activeCategory, contributions, search]);

  const saveEdit = async () => {
    if (!editing || !editing.title.trim() || !editing.content.trim()) return;
    
    try {
      // Check if this is a local post (starts with 'local-')
      const isLocalPost = editing.id.startsWith('local-');
      
      if (isLocalPost) {
        // Update localStorage post and reset status to pending
        const updated = updateLocalPost(editing.id, {
          title: editing.title.trim(),
          content: editing.content.trim(),
          status: 'pending',
          rejectionReason: undefined,
          reviewedBy: undefined,
          reviewedAt: undefined,
        });
        
        // Update local state
        setContributions((current) => 
          current.map((item) => {
            if (item.id === editing.id) {
              const localPost = updated.find(p => p.id === editing.id);
              return localPost ? { ...item, title: localPost.title || item.title, content: localPost.content || item.content, status: 'pending' as ContributionStatus } : item;
            }
            return item;
          })
        );
        
        showGlobalToast('Post updated successfully and sent for admin approval.', 'success');
      } else {
        // Update Supabase post
        const { error } = await supabase.from('posts').update({ title: editing.title.trim(), content: editing.content.trim() }).eq('id', editing.id).eq('alumni_id', user?.id);
        if (error) {
          showGlobalToast('Something went wrong. Please try again.', 'error');
          return;
        }
        setContributions((current) => current.map((item) => item.id === editing.id ? editing : item));
        showGlobalToast('Post updated successfully.', 'success');
      }
      
      setEditing(null);
    } catch (error) {
      showGlobalToast('Something went wrong. Please try again.', 'error');
    }
  };

  const deleteContribution = async (item: Contribution) => {
    setDeleteConfirmId(item.id);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmId || !user) return;
    
    try {
      setIsDeleting(true);
      
      // Check if this is a local post
      const isLocalPost = deleteConfirmId.startsWith('local-');
      const item = contributions.find(c => c.id === deleteConfirmId);
      
      if (isLocalPost) {
        // Delete from localStorage
        deleteLocalPost(deleteConfirmId);
      } else {
        // Delete from Supabase
        const { error } = await supabase.from('posts').delete().eq('id', deleteConfirmId).eq('alumni_id', user.id);
        if (error) {
          showGlobalToast('Something went wrong. Please try again.', 'error');
          return;
        }
      }
      
      // Update local state
      setContributions((current) => current.filter((contribution) => contribution.id !== deleteConfirmId));
      showGlobalToast('Post deleted successfully.', 'success');
      setDeleteConfirmId(null);
    } catch (error) {
      showGlobalToast('Something went wrong. Please try again.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!canContribute) return <div className="mx-auto max-w-3xl px-4 py-16 text-center"><FileText className="mx-auto h-12 w-12 text-slate-300" /><h1 className="mt-4 text-2xl font-bold text-slate-950">My Contributions</h1><p className="mt-2 text-slate-600">Students can browse approved posts and view their participation history. Content creation is available to alumni and faculty.</p><Link to="/dashboard" className="mt-5 inline-flex rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white">Browse posts</Link></div>;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:py-9">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-yellow-700">Content you created</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">My Contributions</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">Track review status and manage your own posts without mixing them into participation history.</p></div><Link to="/dashboard/post" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-yellow-400 hover:text-slate-950"><Plus className="h-4 w-4" />Create Post</Link></div>

      {message && <div className="mt-5 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700"><span>{message}</span><button onClick={() => setMessage('')} aria-label="Dismiss message"><X className="h-4 w-4" /></button></div>}

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <label className="relative block"><span className="sr-only">Search contributions</span><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search your contributions" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20" /></label>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">{contributionCategories.map((category) => { const count = category.id === 'all' ? contributions.length : contributions.filter((item) => normalizeType(item.type) === category.id).length; return <button key={category.id} onClick={() => setActiveCategory(category.id)} className={`shrink-0 rounded-full px-3.5 py-2 text-sm font-semibold transition ${activeCategory === category.id ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-yellow-100 hover:text-slate-950'}`}>{category.label}<span className={`ml-2 rounded-full px-1.5 py-0.5 text-xs ${activeCategory === category.id ? 'bg-white/15' : 'bg-white'}`}>{count}</span></button>; })}</div>
      </section>

      {loading ? <div className="flex items-center justify-center py-20 text-slate-500"><Loader2 className="mr-2 h-5 w-5 animate-spin" />Loading contributions…</div> : (
        <div className="mt-5 space-y-3">
          {filtered.map((item) => {
            const isEditable = item.status === 'pending' || item.status === 'rejected';
            return <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">{typeLabel(item.type)}</span><span className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ${statusStyle[item.status]}`}>{item.status}</span></div><h2 className="mt-3 text-lg font-bold text-slate-950">{item.title}</h2><p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{item.content}</p><p className="mt-3 flex items-center gap-1.5 text-xs text-slate-500"><CalendarDays className="h-3.5 w-3.5" />Created {new Date(item.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</p></div><div className="flex shrink-0 gap-2"><button disabled={!isEditable} onClick={() => setEditing({ ...item })} title={isEditable ? 'Edit contribution' : 'Approved posts cannot be edited'} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"><Edit3 className="h-3.5 w-3.5" />Edit</button><button disabled={!isEditable} onClick={() => deleteContribution(item)} title={isEditable ? 'Delete contribution' : 'Approved posts cannot be deleted'} className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 px-3 py-2 text-xs font-bold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40"><Trash2 className="h-3.5 w-3.5" />Delete</button></div></div>{item.status === 'rejected' && item.rejectionReason && <div className="mt-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><div><p className="font-bold">Rejection reason</p><p className="mt-0.5">{item.rejectionReason}</p></div></div>}</article>;
          })}
        </div>
      )}

      {!loading && filtered.length === 0 && <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center"><FileText className="mx-auto h-10 w-10 text-slate-300" /><h3 className="mt-3 font-bold text-slate-900">No contributions found</h3><p className="mt-1 text-sm text-slate-500">{search ? 'Try a broader search.' : 'Create a post to start building your contribution history.'}</p></div>}

      {editing && <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/60 p-4" role="dialog" aria-modal="true" aria-labelledby="edit-contribution-title"><div className="w-full max-w-xl rounded-2xl bg-white p-5 shadow-2xl sm:p-6"><div className="flex items-center justify-between"><h2 id="edit-contribution-title" className="text-xl font-bold text-slate-950">Edit contribution</h2><button onClick={() => setEditing(null)} aria-label="Close edit dialog" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X className="h-5 w-5" /></button></div><div className="mt-5 space-y-4"><label className="block text-sm font-bold text-slate-700">Title<input value={editing.title} onChange={(event) => setEditing({ ...editing, title: event.target.value })} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20" /></label><label className="block text-sm font-bold text-slate-700">Content<textarea rows={6} value={editing.content} onChange={(event) => setEditing({ ...editing, content: event.target.value })} className="mt-1.5 w-full resize-none rounded-xl border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20" /></label></div><div className="mt-5 flex justify-end gap-2"><button onClick={() => setEditing(null)} className="rounded-xl px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100">Cancel</button><button onClick={saveEdit} className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-yellow-400 hover:text-slate-950">Save changes</button></div></div></div>}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Contribution"
        message={`Are you sure you want to delete "${contributions.find(c => c.id === deleteConfirmId)?.title || 'this post'}"? This action cannot be undone.`}
        confirmText="Delete"
        type="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
