import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Post } from '../data/types';
import { getLocalPosts, updateLocalPost, deleteLocalPost } from '../data/localStoragePosts';
import { showGlobalToast } from '../components/Toast';
import { ConfirmModal } from '../components/ConfirmModal';
// @ts-ignore
import { FileText, Search, Loader2, Trash2 } from 'lucide-react';
// @ts-ignore
import CheckCircle from 'lucide-react/dist/esm/icons/check-circle';
// @ts-ignore
import XCircle from 'lucide-react/dist/esm/icons/x-circle';
// @ts-ignore
import Clock from 'lucide-react/dist/esm/icons/clock';
// @ts-ignore
import User from 'lucide-react/dist/esm/icons/user';
// @ts-ignore
import Calendar from 'lucide-react/dist/esm/icons/calendar';
// @ts-ignore
import AlertCircle from 'lucide-react/dist/esm/icons/alert-circle';
// @ts-ignore
import MessageSquare from 'lucide-react/dist/esm/icons/message-square';
// @ts-ignore
import ThumbsUp from 'lucide-react/dist/esm/icons/thumbs-up';
// @ts-ignore
import ChevronLeft from 'lucide-react/dist/esm/icons/chevron-left';
import { Link } from 'react-router';
import { supabase } from '../../supabaseClient';

type PostStatus = 'pending' | 'approved' | 'rejected';

export function PostApproval() {
  const { user, approveLocalPost, rejectLocalPost, alumni } = useAuth();
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
  const [deleteConfirmPost, setDeleteConfirmPost] = useState<Post | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Temporary localStorage approval flow for demo
  // Fetch all posts from localStorage for admin approval
  useEffect(() => {
    if (!user || user.role !== 'admin') return;

    const fetchPosts = async () => {
      try {
        setIsLoading(true);

        const { data, error } = await supabase
  .from("pending_posts")
  .select("*")
  .order("created_at", { ascending: false });

if (error) {
  console.error(error);
  return;
}

const mappedPosts: Post[] = (data || []).map((p: any) => ({
  id: String(p.id),
  alumniId: p.alumni_id,
  title: p.title,
  content: p.content,
  timestamp: p.created_at,
  type: p.type || "general",
  status: p.status || "pending",
  likes: Number(p.likes || 0),
  comments: Number(p.comments || 0),
  image: p.image,
  file: null,
  rejectionReason: p.rejectionReason,
  reviewedBy: p.reviewedBy,
  reviewedAt: p.reviewedAt,
  post_details: p.post_details,
}));

setPosts(mappedPosts);
        //console.log('[PostApproval] Fetching posts from localStorage for admin...');

        /*const localPosts = getLocalPosts();
        const mappedPosts: Post[] = localPosts.map((p: any) => ({
          id: p.id,
          alumniId: p.alumniId,
          title: p.title,
          content: p.content,
          timestamp: p.timestamp || p.created_at,
          type: p.type || 'general',
          status: p.status || 'pending',
          likes: Number(p.likes || 0),
          comments: Number(p.comments || 0),
          image: p.image,
          file: p.file,
          rejectionReason: p.rejectionReason,
          reviewedBy: p.reviewedBy,
          reviewedAt: p.reviewedAt,
          post_details: p.post_details,
        }));

        setPosts(mappedPosts);
        console.log('[PostApproval] Posts loaded from localStorage:', mappedPosts.length); */

        // Build alumni details map from context alumni list
        const alumniMap: Record<string, any> = {};
        alumni.forEach(a => {
          alumniMap[a.id] = {
            name: a.name,
            email: a.email,
            avatar: a.avatar,
            college: a.collegeName,
            department: a.department,
            role: a.role || 'alumni',
          };
        });
        setAlumniDetails(alumniMap);
      } catch (error) {
        console.error('[PostApproval] Error in fetchPosts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();

    // Poll for changes every 2 seconds (temporary demo approach)
    //const interval = setInterval(fetchPosts, 2000);

   /* return () => {
      clearInterval(interval);
    }; */
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

  // Temporary localStorage approval flow for demo
  // Approve post
  const handleApprove = async (postId: string) => {
    if (!user) return;

    try {
      setActionLoading(postId);
      console.log('[PostApproval] Approving post:', postId);
      // Get the pending post
const { data: pendingPost, error: fetchError } = await supabase
  .from("pending_posts")
  .select("*")
  .eq("id", postId)
  .single();

if (fetchError) {
  console.error(fetchError);
  return;
}

// Insert into posts table
const { error: insertError } = await supabase
  .from("posts")
  .insert([
    {
      alumni_id: pendingPost.alumni_id,
      title: pendingPost.title,
      content: pendingPost.content,
      type: pendingPost.type,
      post_details: pendingPost.post_details,
      likes: "0",
      comments: "0",
      image: pendingPost.image || pendingPost.image_url,
      file: null,
      created_at: pendingPost.created_at,
      author_role: "alumni",
    },
  ]);

if (insertError) {
  console.error(insertError);
  alert(insertError.message);
  return;
}

// Delete from pending_posts
await supabase
  .from("pending_posts")
  .delete()
  .eq("id", postId);

// Insert notification
await supabase.from("notifications").insert([
  {
    user_id: pendingPost.alumni_id,
    title: "Post Approved",
    message: `Your post "${pendingPost.title}" has been approved.`,
    read: false,
    created_at: new Date().toISOString()
  }
]);

      // Update localStorage
      approveLocalPost(postId);

      // Update local state
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId
            ? { ...post, status: 'approved' as PostStatus, reviewedBy: user.id, reviewedAt: new Date().toISOString() }
            : post
        )
      );

      console.log('[PostApproval] Post approved successfully');
      showGlobalToast('Post approved successfully.', 'success');
    } catch (error) {
      console.error('[PostApproval] Unexpected error approving post:', error);
      showGlobalToast('Something went wrong. Please try again.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // Temporary localStorage approval flow for demo
  // Reject post
  const handleReject = async (postId: string, reason: string) => {
    if (!user) return;

    try {
      setActionLoading(postId);
      console.log('[PostApproval] Rejecting post:', postId, 'Reason:', reason);

      // Update localStorage
      rejectLocalPost(postId, reason || 'No reason provided');

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

      console.log('[PostApproval] Post rejected successfully');

      // Close modal and reset
      setShowRejectionModal(false);
      setSelectedPost(null);
      setRejectionReason('');
      
      // Show success message
      showGlobalToast('Post rejected successfully.', 'success');
    } catch (error) {
      console.error('[PostApproval] Unexpected error rejecting post:', error);
      showGlobalToast('Something went wrong. Please try again.', 'error');
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

  // Temporary localStorage approval flow for demo
  // Delete post
  const handleDeletePost = async (postId: string) => {
    if (!user) return;
    
    try {
      setIsDeleting(true);
      console.log('[PostApproval] Deleting post:', postId);

      // Update localStorage
      deleteLocalPost(postId);

      // Update local state
      setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));

      console.log('[PostApproval] Post deleted successfully');
      showGlobalToast('Post deleted successfully.', 'success');
      setDeleteConfirmPost(null);
    } catch (error) {
      console.error('[PostApproval] Unexpected error deleting post:', error);
      showGlobalToast('Something went wrong. Please try again.', 'error');
    } finally {
      setIsDeleting(false);
    }
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
                          (post.status || 'pending') === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : (post.status || 'pending') === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {(post.status || 'pending').charAt(0).toUpperCase() + (post.status || 'pending').slice(1)}
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

                    {/* Action Buttons */}
                    {(post.status === 'pending' || user.role === 'admin') && (
                      <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end space-x-3">
                        {post.status === 'pending' && (
                          <>
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
                          </>
                        )}
                        {user.role === 'admin' && (
                          <button
                            onClick={() => setDeleteConfirmPost(post)}
                            className="px-4 py-2 border border-red-300 text-red-700 rounded-lg font-medium hover:bg-red-50 transition-colors flex items-center space-x-2"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span>Delete</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
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

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteConfirmPost}
        onClose={() => setDeleteConfirmPost(null)}
        onConfirm={() => deleteConfirmPost && handleDeletePost(deleteConfirmPost.id)}
        title="Delete Post"
        message={`Are you sure you want to delete "${deleteConfirmPost?.title || 'this post'}"? This action cannot be undone.`}
        confirmText="Delete"
        type="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}