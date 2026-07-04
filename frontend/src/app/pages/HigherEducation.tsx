import React, { useState, useMemo } from 'react';
import { Search, GraduationCap, MapPin, BookOpen, Calendar, ExternalLink, FileText, Award, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getApprovedHigherEducationPosts } from '../data/localStoragePosts';

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

export function HigherEducation() {
  const { getAlumniById } = useAuth();
  const [search, setSearch] = useState('');

  const posts = useMemo(() => {
    const query = search.trim().toLowerCase();
    const localPosts = getApprovedHigherEducationPosts();

    return localPosts.filter((post) => {
      const author = getAlumniById(post.alumniId)?.name || '';
      const details = post.post_details || {};
      const searchableText = [
        post.title,
        post.content,
        author,
        details.country,
        details.university,
        details.course,
        details.branch,
        details.eligibility,
        details.exams,
        details.scholarship,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return !query || searchableText.includes(query);
    });
  }, [search, getAlumniById]);

  const formatDate = (timestamp?: string) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-lg bg-yellow-100 dark:bg-yellow-400/20 flex items-center justify-center">
            <GraduationCap className="h-6 w-6 text-yellow-700 dark:text-yellow-300" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Higher Education</h1>
        </div>
        <p className="text-slate-600 dark:text-slate-300 mt-2">
          Explore higher education opportunities shared by faculty members.
        </p>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-slate-900/70 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-yellow-400/20 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search by course, university, country, or keyword..."
            className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-yellow-400/20 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white/70 dark:bg-slate-900/70 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Posts Count */}
      <div className="mb-4">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {posts.length} {posts.length === 1 ? 'program' : 'programs'} available
        </p>
      </div>

      {/* Posts List */}
      {posts.length > 0 ? (
        <div className="space-y-6">
          {posts.map((post) => {
            const author = getAlumniById(post.alumniId);
            const details = post.post_details || {};
            const hasDetails =
              details.country ||
              details.university ||
              details.course ||
              details.branch ||
              details.eligibility ||
              details.exams ||
              details.scholarship ||
              details.deadline ||
              details.link;

            return (
              <div
                key={post.id}
                className="bg-white dark:bg-slate-900/70 rounded-xl border border-slate-200 dark:border-yellow-400/20 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                {/* Post Image */}
                {post.image && (
                  <div className="w-full h-56 sm:h-64">
                    <img
                      src={post.image}
                      alt={post.title || 'Higher Education Post'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="p-6">
                  {/* Title and Category Badge */}
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                    <div className="flex-1 min-w-0">
                      <span className="inline-flex rounded-full bg-yellow-100 dark:bg-yellow-400/20 px-3 py-1 text-xs font-bold text-yellow-800 dark:text-yellow-300 mb-2">
                        Higher Education
                      </span>
                      <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 break-words">
                        {post.title || 'Untitled Post'}
                      </h2>
                    </div>
                  </div>

                  {/* Description */}
                  {post.content && (
                    <p className="text-slate-600 dark:text-slate-300 mb-5 leading-relaxed whitespace-pre-line">
                      {post.content}
                    </p>
                  )}

                  {/* Details Grid */}
                  {hasDetails && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-yellow-400/10">
                      {details.country && (
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-slate-400 dark:text-slate-500 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Country</p>
                            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{details.country}</p>
                          </div>
                        </div>
                      )}

                      {details.university && (
                        <div className="flex items-start gap-2">
                          <GraduationCap className="h-4 w-4 text-slate-400 dark:text-slate-500 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">University / College</p>
                            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{details.university}</p>
                          </div>
                        </div>
                      )}

                      {details.course && (
                        <div className="flex items-start gap-2">
                          <BookOpen className="h-4 w-4 text-slate-400 dark:text-slate-500 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Course / Program</p>
                            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{details.course}</p>
                          </div>
                        </div>
                      )}

                      {details.branch && (
                        <div className="flex items-start gap-2">
                          <Award className="h-4 w-4 text-slate-400 dark:text-slate-500 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Branch / Specialization</p>
                            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{details.branch}</p>
                          </div>
                        </div>
                      )}

                      {details.eligibility && (
                        <div className="flex items-start gap-2 sm:col-span-2">
                          <Users className="h-4 w-4 text-slate-400 dark:text-slate-500 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Eligibility</p>
                            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{details.eligibility}</p>
                          </div>
                        </div>
                      )}

                      {details.exams && (
                        <div className="flex items-start gap-2 sm:col-span-2">
                          <FileText className="h-4 w-4 text-slate-400 dark:text-slate-500 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Exams Required</p>
                            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{details.exams}</p>
                          </div>
                        </div>
                      )}

                      {details.scholarship && (
                        <div className="flex items-start gap-2 sm:col-span-2">
                          <Award className="h-4 w-4 text-slate-400 dark:text-slate-500 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Scholarship Information</p>
                            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{details.scholarship}</p>
                          </div>
                        </div>
                      )}

                      {details.deadline && (
                        <div className="flex items-start gap-2 sm:col-span-2">
                          <Calendar className="h-4 w-4 text-slate-400 dark:text-slate-500 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Application Deadline</p>
                            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{details.deadline}</p>
                          </div>
                        </div>
                      )}

                      {details.link && (
                        <div className="flex items-start gap-2 sm:col-span-2">
                          <ExternalLink className="h-4 w-4 text-slate-400 dark:text-slate-500 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Application / Info Link</p>
                            <a
                              href={details.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm font-medium text-yellow-700 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-300 underline break-all"
                            >
                              {details.link}
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Attachment */}
                  {post.attachmentUrl && (
                    <div className="mb-4">
                      <a
                        href={post.attachmentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-yellow-700 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-300 underline"
                      >
                        <FileText className="h-4 w-4" />
                        {post.attachmentName || 'View Attachment'}
                      </a>
                    </div>
                  )}

                  {/* Apply Button */}
                  {details.link && (
                    <div className="mb-4">
                      <button
                        onClick={() => openPostLink(details.link)}
                        className="w-full py-2 bg-slate-900 text-white font-medium rounded-md hover:bg-slate-800 dark:hover:bg-yellow-400 dark:hover:text-slate-950 transition-colors flex items-center justify-center gap-2"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Apply / View Details
                      </button>
                    </div>
                  )}

                  {/* Footer: Author and Date */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 dark:border-yellow-400/10 pt-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-yellow-100 dark:bg-yellow-400/20 flex items-center justify-center">
                        <Users className="h-4 w-4 text-yellow-700 dark:text-yellow-300" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {author?.name || 'Faculty Member'}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {author?.designation || author?.facultyType || 'Faculty'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(post.timestamp || post.created_at)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-16 bg-slate-50 dark:bg-slate-900/70 rounded-lg border border-dashed border-slate-300 dark:border-yellow-400/20">
          <GraduationCap className="h-12 w-12 text-slate-300 dark:text-slate-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">No higher education posts available yet.</h3>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Check back later for new opportunities shared by faculty.
          </p>
        </div>
      )}
    </div>
  );
}