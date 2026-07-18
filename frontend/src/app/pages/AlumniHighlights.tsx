import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import { showGlobalToast } from '../components/Toast';
import { Plus, Eye, EyeOff, MapPin, X } from 'lucide-react';

type HighlightCategory =
  | 'Alumni Meet'
  | 'Discussion'
  | 'Guidance Session'
  | 'Webinar'
  | 'Guest Lecture'
  | 'Event Memories'
  | 'Other';

export type AlumniHighlight = {
  id?: string;
  title: string;
  description: string;
  category: HighlightCategory;
  date: string;
  location?: string;
  images: string[];
  published: boolean;
  created_at?: string;
  created_by?: string | null;
};

export function AlumniHighlights() {
  const [highlights, setHighlights] = useState<AlumniHighlight[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<Omit<AlumniHighlight, 'id' | 'created_at' | 'created_by'>>({
    title: '',
    description: '',
    category: 'Alumni Meet',
    date: new Date().toISOString().split('T')[0],
    location: '',
    images: [],
    published: true,
  });

  useEffect(() => {
    fetchHighlights();
  }, []);

  const fetchHighlights = async () => {
    const { data, error } = await supabase
      .from('alumni_highlights')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching alumni highlights:', error);
      showGlobalToast('Failed to fetch alumni highlights', 'error');
      return;
    }

    setHighlights(data || []);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'Alumni Meet',
      date: new Date().toISOString().split('T')[0],
      location: '',
      images: [],
      published: true,
    });
    setImageUrlInput('');
    setEditingId(null);
    setShowForm(false);
  };

  const getImageUrls = () => {
    return imageUrlInput
      .split(/[\n,]+/)
      .map((url) => url.trim())
      .filter((url) => url.length > 0);
  };

  const removeImageUrl = (index: number) => {
    const urls = getImageUrls();
    const updatedUrls = urls.filter((_, i) => i !== index);
    setImageUrlInput(updatedUrls.join('\n'));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.description.trim()) {
      showGlobalToast('Title and description are required.', 'warning');
      return;
    }

    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const highlightData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        date: formData.date,
        location: formData.location?.trim() || null,
        images: getImageUrls(),
        published: true,
        created_by: user?.id || null,
      };

      if (editingId) {
        const { error } = await supabase
          .from('alumni_highlights')
          .update(highlightData)
          .eq('id', editingId);

        if (error) throw error;

        showGlobalToast('Alumni highlight updated successfully!', 'success');
      } else {
        const { error } = await supabase
          .from('alumni_highlights')
          .insert([highlightData]);

        if (error) throw error;

        showGlobalToast('Alumni highlight published successfully!', 'success');
      }

      await fetchHighlights();
      resetForm();
    } catch (error) {
      console.error('Error saving alumni highlight:', error);
      showGlobalToast('Failed to publish alumni highlight', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (highlight: AlumniHighlight) => {
    setFormData({
      title: highlight.title,
      description: highlight.description,
      category: highlight.category,
      date: highlight.date,
      location: highlight.location || '',
      images: highlight.images || [],
      published: highlight.published,
    });

    setImageUrlInput((highlight.images || []).join('\n'));
    setEditingId(highlight.id || null);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this highlight?')) return;

    const { error } = await supabase
      .from('alumni_highlights')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting highlight:', error);
      showGlobalToast('Failed to delete highlight', 'error');
      return;
    }

    showGlobalToast('Highlight deleted successfully!', 'success');
    await fetchHighlights();
  };

  const handleTogglePublish = async (id: string, published: boolean) => {
    const { error } = await supabase
      .from('alumni_highlights')
      .update({ published })
      .eq('id', id);

    if (error) {
      console.error('Error updating publish status:', error);
      showGlobalToast('Failed to update publish status', 'error');
      return;
    }

    showGlobalToast(published ? 'Highlight published!' : 'Highlight unpublished!', 'success');
    await fetchHighlights();
  };

  const sortedHighlights = [...highlights].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const previewUrls = getImageUrls();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Alumni Highlights</h2>
          <p className="text-sm text-slate-600 mt-1">
            Create and manage highlight posts for the landing page
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }}
          className="inline-flex items-center gap-2 rounded-full bg-yellow-500 px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-yellow-400 transition-colors"
        >
          <Plus className="h-4 w-4" />
          {showForm ? 'Cancel' : 'Create Alumni Highlight'}
        </button>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            {editingId ? 'Edit Highlight' : 'Create New Highlight'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/20"
                  placeholder="Enter highlight title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      category: e.target.value as HighlightCategory,
                    })
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/20"
                >
                  <option value="Alumni Meet">Alumni Meet</option>
                  <option value="Discussion">Discussion</option>
                  <option value="Guidance Session">Guidance Session</option>
                  <option value="Webinar">Webinar</option>
                  <option value="Guest Lecture">Guest Lecture</option>
                  <option value="Event Memories">Event Memories</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/20"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/20"
                  placeholder="Enter location"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Short Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={4}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/20"
                placeholder="Write a short description..."
                required
              />
            </div>

            {/* Image URLs */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Image URLs
              </label>

              <textarea
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                rows={4}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/20"
                placeholder={`Paste image URLs here. You can add one URL per line.\nExample:\nhttps://example.com/image1.jpg\nhttps://example.com/image2.jpg`}
              />

              {previewUrls.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  {previewUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-video bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
                        <img
                          src={url}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-contain"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => removeImageUrl(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-full bg-yellow-500 px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-yellow-400 transition-colors disabled:opacity-60"
              >
                {loading
                  ? 'Publishing...'
                  : editingId
                  ? 'Update Highlight'
                  : 'Publish Highlight'}
              </button>

              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Highlights List */}
      <div className="space-y-4">
        {sortedHighlights.length > 0 ? (
          sortedHighlights.map((highlight) => (
            <div
              key={highlight.id}
              className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
                      {highlight.category}
                    </span>

                    {highlight.published ? (
                      <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
                        Published
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                        Draft
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-semibold text-slate-900 mb-2">
                    {highlight.title}
                  </h3>

                  <p className="text-sm text-slate-600 mb-3">
                    {highlight.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                    <span>
                      {new Date(highlight.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>

                    {highlight.location && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {highlight.location}
                      </span>
                    )}

                    <span>{highlight.images?.length || 0} image URLs</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      handleTogglePublish(highlight.id!, !highlight.published)
                    }
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition"
                  >
                    {highlight.published ? (
                      <>
                        <EyeOff className="h-4 w-4" />
                        Unpublish
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4" />
                        Publish
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleEdit(highlight)}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(highlight.id!)}
                    className="inline-flex items-center gap-2 rounded-full border border-red-200 px-4 py-2 text-sm font-medium text-red-700 hover:border-red-300 hover:bg-red-50 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {highlight.images && highlight.images.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                  {highlight.images.slice(0, 4).map((img, idx) => (
                    <div
                      key={idx}
                      className="aspect-video bg-slate-100 rounded-xl overflow-hidden border border-slate-200"
                    >
                      <img
                        src={img}
                        alt={`${highlight.title} - ${idx + 1}`}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ))}

                  {highlight.images.length > 4 && (
                    <div className="aspect-video bg-slate-100 rounded-xl overflow-hidden border border-slate-200 flex items-center justify-center">
                      <span className="text-sm font-semibold text-slate-600">
                        +{highlight.images.length - 4} more
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-slate-500">
            <p className="text-lg font-medium text-slate-700 mb-1">
              No highlights yet
            </p>
            <p className="text-sm">
              Create your first alumni highlight to showcase on the landing page
            </p>
          </div>
        )}
      </div>
    </div>
  );
}