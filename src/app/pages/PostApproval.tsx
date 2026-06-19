import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../../supabaseClient';
import { Post } from '../data/types';
import {
  CheckCircle,
  XCircle,
  Clock,
  User,
  Calendar,
  FileText,
  Image as ImageIcon,
  AlertCircle,
  Filter,
  Search,
  ChevronLeft,
  Eye,
  MessageSquare,
  ThumbsUp,
  Loader2,
} from 'lucide-react';
import { Link } from 'react-router';

type PostStatus = 'pending' | 'approved' | 'rejected';

export function PostApproval() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<PostStatus>('pending');
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [alumniDetails, setAlumniDetails] = useState<Record<string, any>>({});

  // Fetch all posts (admin can see all statuses)
  useEffect(() => {
    if (!user || user.role !== 'admin') return;

    const fetchPosts = async () => {
      try {
        setIsLoading(true);
        console.log('[PostApproval] Fetching posts for admin...');

        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('[PostApproval] Error fetching posts:', error);
          throw error;
        }

        const mappedPosts: Post[] = data.map((r: any) => ({
          id: String(r.id),
          alumniId: r.alumni_id,
          title: r.title,
          content: r.content,
          timestamp: r.created_at,
          type: r.type || 'general',
          status: r.status || 'pending',
          likes: Number(r.likes || 0),
          comments: Number(r.comments || 0),
          image: r.image,
          file: r.file,
          rejectionReason: r.rejection_reason,
          reviewedBy: r.reviewed_by,
          reviewedAt: r.reviewed_at,
        }));

        setPosts(mappedPosts);
        console.log('[PostApproval] Posts loaded:', mappedPosts.length);

        // Fetch alumni details for all unique alumni IDs
        const alumniIds = [...new Set(mappedPosts.map(p => p.alumniId))];
        if (alumniIds.length > 0) {
          const { data: alumniData } = await supabase
            .from('alumni_profiles')
            .select('*')
            .in('user_id', alumniIds);

          if (alumniData) {
            const alumniMap: Record<string, any> = {};
            alumniData.forEach(profile => {
              alumniMap[profile.user_id] = {
                name: `${profile.First_Name || ''} ${profile.Last_name || ''}`.trim() || profile.Email_Address,
                email: profile.Email_Address,
                avatar: profile.Photo_URL || profile.photo_url,
                college: profile.College_Name,
                department: profile.Department,
                role: profile.role || 'alumni',
              };
            });
            setAlumniDetails(alumniMap);
          }
        }
      } catch (error) {
        console.error('[PostApproval] Error in fetchPosts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();

    // Set up real-time subscription
    const channel = supabase
      .channel('post_approval_updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, (payload) => {
        console.log('[PostApproval] Realtime update:', payload);
        fetchPosts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Filter posts based on active tab and search query
  useEffect(() => {
    let filtered = posts.filter(post => post.status === activeTab);

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(post => {
        const alumniInfo = alumniDetails[post.alumniId];
        return (
          post.content?.toLowerCase().includes(query) ||
          post.title?.toLowerCase().includes(query) ||
          alumniInfo?.name?.toLowerCase().includes(query) ||
          alumniInfo?.email?.toLowerCase().includes(query)
        );
      });
    }

    setFilteredPosts(filtered);
  }, [posts, activeTab, searchQuery, alumniDetails]);

  // Approve post
  const handleApprove = async (postId: string) => {
    if (!user) return;

    try {
      setActionLoading(postId);
      console.log('[PostApproval] Approving post:', postId);

      const { error } = await supabase
        .from('posts')
        .update({
          status: 'approved',
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', postId);

      if (error) {
        console.error('[PostApproval] Error approving post:', error);
        alert('Failed to approve post: ' + error.message);
        return;
      }

      console.log('[PostApproval] Post approved successfully');
      
      // Update local state
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId
            ? { ...post, status: 'approved' as PostStatus, reviewedBy: user.id, reviewedAt: new Date().toISOString() }
            : post
        )
      );

      // Show success message
      alert('Post approved successfully!');
    } catch (error) {
      console.error('[PostApproval] Unexpected error approving post:', error);
      alert('An unexpected error occurred while approving the post.');
    } finally {
      setActionLoading(null);
    }
  };

  // Reject post
  const handleReject = async (postId: string, reason: string) => {
    if (!user) return;

    try {
      setActionLoading(postId);
      console.log('[PostApproval] Rejecting post:', postId, 'Reason:', reason);

      const { error } = await supabase
        .from('posts')
        .update({
          status: 'rejected',
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          rejection_reason: reason || 'No reason provided',
        })
        .eq('id', postId);

      if (error) {
        console.error('[PostApproval] Error rejecting post:', error);
        alert('Failed to reject post: ' + error.message);
        return;
      }

      console.log('[PostApproval] Post rejected successfully');

      // Update local state
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId
            ? {
                ...post,
                status: 'rejected' as PostStatus,
                reviewedBy: user.id,
                reviewedAt: new Date().toISOString(),
                rejectionReason: reason || 'No reason provided',
              }
            : post
        )
      );

      // Close modal and reset
      setShowRejectionModal(false);
      setSelectedPost(null);
      setRejectionReason('');
      
      // Show success message
      alert('Post rejected successfully!');
    } catch (error) {
      console.error('[PostApproval] Unexpected error rejecting post:', error);
      alert('An unexpected error occurred while rejecting the post.');
    } finally {
      setActionLoading(null);
    }
  };

  // Open rejection modal
  const openRejectionModal = (post: Post) => {
    setSelectedPost(post);
    setShowRejectionModal(true);
    setRejectionReason('');
  };

  // Get counts for each tab
  const pendingCount = posts.filter(p => p.status === 'pending').length;
  const approvedCount = posts.filter(p => p.status === 'approved').length;
  const rejectedCount = posts.filter(p => p.status === 'rejected').length;

  if (!user || user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h2>
          <p className="text-slate-600">You must be an admin to access this page.</p>
          <Link to="/dashboard" className="mt-4 inline-block px-6 py-2 bg-yellow-500 text-slate-900 rounded-lg font-semibold hover:bg-yellow-400">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                to="/admin"
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="h-6 w-6 text-slate-600" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Post Approval</h1>
                <p className="text-slate-600 mt-1">Review and manage alumni posts</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search posts..."
                  className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('pending')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'pending'
                  ? 'border-yellow-500 text-yellow-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Pending</span>
                {pendingCount > 0 && (
                  <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
                    {pendingCount}
                  </span>
                )}
              </div>
            </button>
            <button
              onClick={() => setActiveTab('approved')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'approved'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5" />
                <span>Approved</span>
                {approvedCount > 0 && (
                  <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                    {approvedCount}
                  </span>
                )}
              </div>
            </button>
            <button
              onClick={() => setActiveTab('rejected')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'rejected'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <XCircle className="h-5 w-5" />
                <span>Rejected</span>
                {rejectedCount > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {rejectedCount}
                  </span>
                )}
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
              {activeTab === 'pending' && <Clock className="h-8 w-8 text-slate-400" />}
              {activeTab === 'approved' && <CheckCircle className="h-8 w-8 text-slate-400" />}
              {activeTab === 'rejected' && <XCircle className="h-8 w-8 text-slate-400" />}
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              No {activeTab} posts
            </h3>
            <p className="text-slate-600">
              {activeTab === 'pending' && 'All posts have been reviewed.'}
              {activeTab === 'approved' && 'No posts have been approved yet.'}
              {activeTab === 'rejected' && 'No posts have been rejected yet.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredPosts.map((post) => {
              const alumniInfo = alumniDetails[post.alumniId] || {};
              const isProcessing = actionLoading === post.id;

              return (
                <div
                  key={post.id}
                  className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Post Header */}
                  <div className="p-6 border-b border-slate-200">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <img
                          src={
                            alumniInfo.avatar ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              alumniInfo.name || 'User'
                            )}&background=FDE68A&color=111827&size=128`
                          }
                          alt={alumniInfo.name}
                          className="h-12 w-12 rounded-full"
                        />
                        <div>
                          <h3 className="font-semibold text-slate-900">{alumniInfo.name || 'Unknown User'}</h3>
                          <div className="flex items-center space-x-4 mt-1 text-sm text-slate-500">
                            <span className="flex items-center">
                              <User className="h-4 w-4 mr-1" />
                              {alumniInfo.role || 'Alumni'}
                            </span>
                            {alumniInfo.college && (
                              <span className="flex items-center">
                                <FileText className="h-4 w-4 mr-1" />
                                {alumniInfo.college}
                              </span>
                            )}
                            <span className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {new Date(post.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          post.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : post.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="p-6">
                    {post.title && (
                      <h4 className="text-xl font-bold text-slate-900 mb-3">{post.title}</h4>
                    )}
                    <p className="text-slate-700 whitespace-pre-wrap mb-4">{post.content}</p>

                    {/* Post Image */}
                    {post.image && (
                      <div className="mb-4">
                        <img
                          src={post.image}
                          alt="Post content"
                          className="rounded-lg max-h-96 w-full object-cover"
                        />
                      </div>
                    )}

                    {/* Post File */}
                    {post.file && (
                      <div className="flex items-center space-x-2 p-3 bg-slate-50 rounded-lg mb-4">
                        <FileText className="h-5 w-5 text-slate-500" />
                        <span className="text-sm text-slate-700">Attachment included</span>
                      </div>
                    )}

                    {/* Post Stats */}
                    <div className="flex items-center space-x-6 text-sm text-slate-500">
                      <span className="flex items-center">
                        <ThumbsUp className="h-4 w-4 mr-1" />
                        {post.likes} likes
                      </span>
                      <span className="flex items-center">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        {post.comments} comments
                      </span>
                      <span className="px-2 py-1 bg-slate-100 rounded text-xs font-medium">
                        {post.type}
                      </span>
                    </div>

                    {/* Rejection Reason (for rejected posts) */}
                    {post.status === 'rejected' && post.rejectionReason && (
                      <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-start space-x-2">
                          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                          <div>
                            <h5 className="font-semibold text-red-900 mb-1">Rejection Reason</h5>
                            <p className="text-sm text-red-700">{post.rejectionReason}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Review Info (for approved/rejected posts) */}
                    {(post.status === 'approved' || post.status === 'rejected') && post.reviewedAt && (
                      <div className="mt-4 text-xs text-slate-500">
                        Reviewed on {new Date(post.reviewedAt).toLocaleString()}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons (only for pending posts) */}
                  {post.status === 'pending' && (
                    <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end space-x-3">
                      <button
                        onClick={() => openRejectionModal(post)}
                        disabled={isProcessing}
                        className="px-4 py-2 border border-red-300 text-red-700 rounded-lg font-medium hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4" />
                            <span>Reject</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleApprove(post.id)}
                        disabled={isProcessing}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4" />
                            <span>Approve</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Rejection Modal */}
      {showRejectionModal && selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Reject Post</h3>
            <p className="text-slate-600 mb-4">
              Please provide a reason for rejecting this post. This will be visible to the author.
            </p>
            <textarea
              className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
              rows={4}
              placeholder="Enter rejection reason..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowRejectionModal(false);
                  setSelectedPost(null);
                  setRejectionReason('');
                }}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReject(selectedPost.id, rejectionReason)}
                disabled={!rejectionReason.trim() || actionLoading === selectedPost.id}
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {actionLoading === selectedPost.id ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Rejecting...</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4" />
                    <span>Confirm Rejection</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}