import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
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
  created_by?: string;
};

type AlumniHighlightsProps = {
  highlights: AlumniHighlight[];
  onCreateHighlight: (highlight: Omit<AlumniHighlight, 'id' | 'created_at' | 'created_by'>) => Promise<void>;
  onUpdateHighlight: (id: string, highlight: Partial<AlumniHighlight>) => Promise<void>;
  onDeleteHighlight: (id: string) => Promise<void>;
  onTogglePublish: (id: string, published: boolean) => Promise<void>;
};

export function AlumniHighlights({
  highlights,
  onCreateHighlight,
  onUpdateHighlight,
  onDeleteHighlight,
  onTogglePublish,
}: AlumniHighlightsProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<AlumniHighlight, 'id' | 'created_at' | 'created_by'>>({
    title: '',
    description: '',
    category: 'Alumni Meet',
    date: new Date().toISOString().split('T')[0],
    location: '',
    images: [],
    published: false,
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'Alumni Meet',
      date: new Date().toISOString().split('T')[0],
      location: '',
      images: [],
      published: false,
    });
    setImageFiles([]);
    setImagePreviews([]);
    setEditingId(null);
    setShowForm(false);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newPreviews = files.map(file => URL.createObjectURL(file));
    
    setImageFiles(prev => [...prev, ...files]);
    setImagePreviews(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim()) {
      alert('Title and description are required.');
      return;
    }

    // Convert images to URLs (in real implementation, these would be uploaded to Supabase Storage)
    const imageUrls = imagePreviews;

    const highlightData = {
      ...formData,
      images: imageUrls,
    };

    if (editingId) {
      await onUpdateHighlight(editingId, highlightData);
    } else {
      await onCreateHighlight(highlightData);
    }

    resetForm();
  };

  const handleEdit = (highlight: AlumniHighlight) => {
    setFormData({
      title: highlight.title,
      description: highlight.description,
      category: highlight.category,
      date: highlight.date,
      location: highlight.location || '',
      images: highlight.images,
      published: highlight.published,
    });
    setImagePreviews(highlight.images);
    setImageFiles([]); // Files are already uploaded
    setEditingId(highlight.id || null);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this highlight?')) {
      await onDeleteHighlight(id);
    }
  };

  const sortedHighlights = [...highlights].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Alumni Highlights</h2>
          <p className="text-sm text-slate-600 mt-1">Create and manage highlight posts for the landing page</p>
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
          {showForm ? 'Cancel' : 'Create Highlight'}
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
                <label className="block text-sm font-medium text-slate-700 mb-2">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/20"
                  placeholder="Enter highlight title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as HighlightCategory })}
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
                <label className="block text-sm font-medium text-slate-700 mb-2">Date *</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/20"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Location (Optional)</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/20"
                  placeholder="Enter location"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Short Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/20"
                placeholder="Write a short description..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Images (Multiple allowed)
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-700 focus:outline-none"
              />
              
              {/* Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-video bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
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
                className="inline-flex items-center gap-2 rounded-full bg-yellow-500 px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-yellow-400 transition-colors"
              >
                {editingId ? 'Update Highlight' : 'Publish Highlight'}
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
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">{highlight.title}</h3>
                  <p className="text-sm text-slate-600 mb-3">{highlight.description}</p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
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
                    <span className="inline-flex items-center gap-1">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {highlight.images.length} image{highlight.images.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => onTogglePublish(highlight.id!, !highlight.published)}
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
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(highlight.id!)}
                    className="inline-flex items-center gap-2 rounded-full border border-red-200 px-4 py-2 text-sm font-medium text-red-700 hover:border-red-300 hover:bg-red-50 transition"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                </div>
              </div>

              {/* Image Preview */}
              {highlight.images.length > 0 && (
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
            <svg className="h-12 w-12 mx-auto mb-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-lg font-medium text-slate-700 mb-1">No highlights yet</p>
            <p className="text-sm">Create your first alumni highlight to showcase on the landing page</p>
          </div>
        )}
      </div>
    </div>
  );
}