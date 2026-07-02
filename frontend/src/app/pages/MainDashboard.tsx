import React, { useState , useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../../supabaseClient';
import { createChat } from '@n8n/chat';
import '@n8n/chat/style.css';
import { AlumniStatisticsWidget } from '../components/AlumniStatisticsWidget';
import { RecentAlumniHighlights } from '../components/RecentAlumniHighlights';
import { PostImageViewer } from '../components/PostImageViewer';
import { 
  Bell, 
  User, 
  Plus,
  Home,
  Users,
  Briefcase,
  Search,
  Settings,
  LogOut,
  Eye,
  MessageCircle,
  GraduationCap,
} from 'lucide-react';
// @ts-ignore
import MessageSquare from 'lucide-react/dist/esm/icons/message-square';
// @ts-ignore
import ArrowLeft from 'lucide-react/dist/esm/icons/arrow-left';
// @ts-ignore
import Sun from 'lucide-react/dist/esm/icons/sun';
// @ts-ignore
import Moon from 'lucide-react/dist/esm/icons/moon';
// @ts-ignore
import Edit3 from 'lucide-react/dist/esm/icons/edit-3';
// @ts-ignore
import Trash2 from 'lucide-react/dist/esm/icons/trash-2';
import { useLocation, useNavigate } from 'react-router';
import { Chat } from './Chat';
import { getApprovedPosts, getPostsByAuthor } from '../data/localStoragePosts';
import { showGlobalToast } from '../components/Toast';
import { ConfirmModal } from '../components/ConfirmModal';
import { PostComment, AdminPost, AdminPostComment } from '../data/types';

// Recursive component for rendering threaded comments
interface CommentItemProps {
  comment: any;
  postId: string;
  user: any;
  replyingTo: Record<string, string | null>;
  replyText: Record<string, string>;
  onReplyClick: (commentId: string) => void;
  onReplyTextChange: (text: string) => void;
  onReplySubmit: (parentId: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
  highlightedCommentId?: string | null;
}

function CommentItem({
  comment,
  postId,
  user,
  replyingTo,
  replyText,
  onReplyClick,
  onReplyTextChange,
  onReplySubmit,
  onDelete,
  highlightedCommentId,
  depth = 0,
}: CommentItemProps & { depth?: number }) {
  const isReplying = replyingTo[postId] === comment.id;
  const isReply = depth > 0;

  return (
    <div id={`comment-${comment.id}`} className={`${isReply ? 'ml-6 relative' : ''}`}>
      {/* Connecting line for replies */}
      {isReply && (
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-slate-600 -ml-3" />
      )}
      
      <div className={`${isReply ? 'bg-slate-700/50' : 'bg-slate-800'} rounded-lg p-3 ${isReply ? 'border-l-2 border-slate-600' : ''} ${comment.id === highlightedCommentId ? 'ring-2 ring-yellow-400 bg-yellow-100' : ''}`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className={`${isReply ? 'text-xs' : 'text-sm'} font-medium text-white`}>
                {comment.user_name || comment.user?.name || 'User'}
              </span>
              <span className="text-xs text-slate-500">
                {new Date(comment.created_at).toLocaleDateString()}
              </span>
            </div>
            <p className={`${isReply ? 'text-xs' : 'text-sm'} text-slate-300`}>
              {comment.content}
            </p>

            {/* Reply Button */}
            {user && (
              <button
                onClick={() => onReplyClick(comment.id)}
                className={`${isReply ? 'text-xs' : 'text-xs'} text-blue-400 hover:text-blue-300 mt-1`}
              >
                Reply
              </button>
            )}

            {/* Reply Input */}
            {isReplying && (
              <div className={`mt-2 flex gap-2`}>
                <input
                  type="text"
                  placeholder="Write a reply..."
                  value={replyText[postId] || ''}
                  onChange={(e) => onReplyTextChange(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && replyText[postId]?.trim()) {
                      onReplySubmit(comment.id);
                    }
                  }}
                  className={`flex-1 bg-slate-600 border border-slate-500 rounded-lg px-3 py-1 text-white text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FFD700]`}
                  autoFocus
                />
                <button
                  onClick={async () => {
                    if (replyText[postId]?.trim()) {
                      await onReplySubmit(comment.id);
                    }
                  }}
                  className={`px-3 py-1 bg-[#FFD700] text-black rounded-lg text-xs font-semibold hover:bg-yellow-600 transition-colors`}
                >
                  Reply
                </button>
              </div>
            )}

            {/* Recursively render nested replies with increased depth */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="mt-2 space-y-2">
                {comment.replies.map((reply: any) => (
                  <CommentItem
                    key={reply.id}
                    comment={reply}
                    postId={postId}
                    user={user}
                    replyingTo={replyingTo}
                    replyText={replyText}
                    onReplyClick={onReplyClick}
                    onReplyTextChange={onReplyTextChange}
                    onReplySubmit={onReplySubmit}
                    onDelete={onDelete}
                    depth={depth + 1}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Delete button - only for comment author */}
          {user && comment.user_id === user.id && (
            <button
              onClick={async () => {
                await onDelete(comment.id);
              }}
              className="text-red-400 hover:text-red-300 ml-2"
              title="Delete comment"
            >
              <Trash2 size={isReply ? 12 : 14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function MainDashboard() {
  const { user, role, logout, login, posts, jobs, events, following, getAlumniById, alumni, addPost, deletePost, likePost, commentPost, getPostComments, hasUserLikedPost, sharePost, deleteComment, adminPosts, likeAdminPost, commentAdminPost, getAdminPostComments, hasUserLikedAdminPost, shareAdminPost, fetchAdminPosts } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const getMenuFromPath = () => {
    const section = location.pathname.split('/')[2];
    return ['community', 'activity', 'notifications', 'profile', 'chat', 'post'].includes(section) ? section : 'home';
  };
  const [activeMenu, setActiveMenu] = useState(getMenuFromPath);
  const [eventView, setEventView] = useState('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [chatTheme, setChatTheme] = useState<'dark' | 'light'>('dark');
  const [registeredEvents, setRegisteredEvents] = useState<any[]>([]);
  const [attendedEvents, setAttendedEvents] = useState<any[]>([]);
  const [selectedActivityCard, setSelectedActivityCard] = useState<string | null>(null);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [postComments, setPostComments] = useState<Record<string, (PostComment | AdminPostComment)[]>>({});
  const [openCommentPost, setOpenCommentPost] = useState<string | null>(null);
  const [focusedPostId, setFocusedPostId] = useState<string | null>(null);
  const [highlightedCommentId, setHighlightedCommentId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState<Record<string, string>>({});
  const [replyingTo, setReplyingTo] = useState<Record<string, string | null>>({});
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [deleteConfirmPost, setDeleteConfirmPost] = useState<string | null>(null);
  const [isDeletingPost, setIsDeletingPost] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Helper to route post interactions based on post source
  const getPostActions = (post: any) => {
    const isAdminPost = post.source === 'admin';
    return {
      like: isAdminPost ? likeAdminPost : likePost,
      comment: isAdminPost ? commentAdminPost : commentPost,
      getComments: isAdminPost ? getAdminPostComments : getPostComments,
      share: isAdminPost ? shareAdminPost : sharePost,
    };
  };

  // Helper function to build threaded comment tree
  const buildCommentTree = (comments: any[]): any[] => {
    const commentMap = new Map<string, any>();
    const rootComments: any[] = [];

    // First pass: create map of all comments with empty replies array
    comments.forEach(comment => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });

    // Second pass: build tree structure
    comments.forEach(comment => {
      const commentWithReplies = commentMap.get(comment.id)!;
      
      if (comment.parent_comment_id) {
        // This is a reply - add it to parent's replies
        const parent = commentMap.get(comment.parent_comment_id);
        if (parent) {
          parent.replies.push(commentWithReplies);
        } else {
          // Parent not found in current set, treat as root (orphaned reply)
          rootComments.push(commentWithReplies);
        }
      } else {
        // This is a top-level comment
        rootComments.push(commentWithReplies);
      }
    });

    // Sort root comments by creation time
    return rootComments.sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
  };

  // Fetch user's liked posts from database on mount
  useEffect(() => {
    const fetchUserLikes = async () => {
      if (!user?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('post_likes')
          .select('post_id')
          .eq('user_id', user.id);

        if (error) {
          console.error('Error fetching user likes:', error);
          return;
        }

        if (data) {
          const likedPostIds = new Set(data.map(like => like.post_id));
          setLikedPosts(likedPostIds);
          console.log(`Loaded ${likedPostIds.size} liked posts from database`);
        }
      } catch (err) {
        console.error('Error fetching user likes:', err);
      }
    };

    fetchUserLikes();
  }, [user?.id]);

  useEffect(() => {
    setActiveMenu(getMenuFromPath());
  }, [location.pathname]);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const openCommentPostId = searchParams.get('openComment');
    const commentId = searchParams.get('comment');

    if (openCommentPostId) {
      setOpenCommentPost(openCommentPostId);
      setFocusedPostId(openCommentPostId);
      if (commentId) {
        setHighlightedCommentId(commentId);
      }

      const actions = getPostActions(posts.find((post) => post.id === openCommentPostId) || { comment: commentPost, getComments: getPostComments, share: sharePost });
      actions.getComments(openCommentPostId).then((comments) => {
        setPostComments((prev) => ({ ...prev, [openCommentPostId]: comments }));
      });
    } else {
      setFocusedPostId(null);
    }
  }, [location.search, posts, getPostActions, commentPost, getPostComments, sharePost]);

  useEffect(() => {
    if (!openCommentPost || !highlightedCommentId) return;

    const elementId = `comment-${highlightedCommentId}`;
    const scrollAndHighlight = () => {
      const element = document.getElementById(elementId);
      if (!element) return;

      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.classList.add('ring-2', 'ring-yellow-400', 'bg-yellow-100');

      window.setTimeout(() => {
        element.classList.remove('ring-2', 'ring-yellow-400', 'bg-yellow-100');
        setHighlightedCommentId(null);
      }, 2200);
    };

    const timeout = window.setTimeout(scrollAndHighlight, 250);
    return () => window.clearTimeout(timeout);
  }, [openCommentPost, highlightedCommentId, postComments]);
  
  // Profile editing state
  const [isEditing, setIsEditing] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [postType, setPostType] = useState<'general'|'job'|'internship'|'mentorship'|'referral'|'event'|'business'|'higher-education'>('general');
  const [postImage, setPostImage] = useState<string | null>(null);
  const [postFileName, setPostFileName] = useState<string | null>(null);
  const [postTitle, setPostTitle] = useState<string>('');
  const [postDetails, setPostDetails] = useState<Record<string, any>>({});

  // Reset dynamic fields when post type changes
  useEffect(() => {
    setPostDetails({});
  }, [postType]);

  const [formData, setFormData] = useState({
    collegeName: user?.collegeName || '',
    rollNumber: user?.rollNumber || '',
    department: user?.department || '',
    year: user?.year || '',
    yearOfJoining: user?.yearOfJoining || undefined,
    passedOutYear: user?.passedOutYear || undefined,
    about: user?.about || '',
    linkedin: user?.linkedin || '',
    resume: user?.resume || '',
    avatar: user?.avatar || '',
  });
  const [skills, setSkills] = useState(
  Array.isArray(user?.skills)
    ? user.skills
    : user?.skills
      ? user.skills.split(",")
      : []
);
  const [newSkill, setNewSkill] = useState('');
  const [links, setLinks] = useState(user?.links || []);
  const [newLink, setNewLink] = useState({ title: '', url: '' });
  const [alumniStrip, setAlumniStrip] = useState<Array<{ id: string; name: string; avatar: string }>>([]);
  
  const resetFormFromUser = () => {
    setFormData({
      collegeName: user?.collegeName || '',
      rollNumber: user?.rollNumber || '',
      department: user?.department || '',
      year: user?.year || '',
      yearOfJoining: user?.yearOfJoining || undefined,
      passedOutYear: user?.passedOutYear || undefined,
      about: user?.about || '',
      linkedin: user?.linkedin || '',
      resume: user?.resume || '',
      avatar: user?.avatar || '',
    });
    setSkills(Array.isArray(user?.skills) ? user.skills : []);
    setLinks(user?.links || []);
  };

  // Keep edit form state synchronized with latest user profile
  useEffect(() => {
    if (!user) return;
    try {
      console.log('[MainDashboard] Syncing formData with latest user profile', { userId: user?.id, userName: user?.name });
      resetFormFromUser();
    } catch (err) {
      console.error('[MainDashboard] Failed to sync formData from user', err);
    }
  }, [user]);

  useEffect(() => {
    console.log('[MainDashboard] AuthContext user change:', user);
    console.log('[MainDashboard] localStorage allumini_user:', (() => { try { return JSON.parse(localStorage.getItem('allumini_user')||'null'); } catch { return null; } })());
  }, [user]);

  useEffect(() => {
  createChat({
    webhookUrl: 'https://shaaz-03.app.n8n.cloud/webhook/2c823375-ff32-43b7-b598-63fb73838f86/chat'
  });

  // Replace the n8n chat toggle icon with the chatbot video
  const tryInjectVideo = () => {
    const toggleBtn = document.querySelector('.chat-window-toggle') as HTMLElement | null;
    if (!toggleBtn) return;
    if (toggleBtn.querySelector('.chatbot-video')) return;

    toggleBtn.classList.add('has-video');

    const video = document.createElement('video');
    video.src = '/chatbot.mp4';
    video.autoplay = true;
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.className = 'chatbot-video';
    Object.assign(video.style, {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      borderRadius: '50%',
      pointerEvents: 'none',
      position: 'absolute',
      top: '0',
      left: '0',
    } as Partial<CSSStyleDeclaration>);

    const fallbackIcon = document.createElement('span');
    fallbackIcon.className = 'chatbot-fallback-icon';
    fallbackIcon.innerHTML = '💬';
    Object.assign(fallbackIcon.style, {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      fontSize: '24px',
      lineHeight: '1',
      pointerEvents: 'none',
      zIndex: '1',
    } as Partial<CSSStyleDeclaration>);

    const showFallback = () => {
      toggleBtn.classList.remove('has-video');
      (video as HTMLElement).style.display = 'none';
      (fallbackIcon as HTMLElement).style.display = 'flex';
      toggleBtn.style.backgroundColor = '#ec4899';
      toggleBtn.style.border = 'none';
      toggleBtn.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    };

    video.onerror = () => {
      showFallback();
    };

    video.onloadeddata = () => {
      (fallbackIcon as HTMLElement).style.display = 'none';
    };

    toggleBtn.style.position = 'relative';
    toggleBtn.style.overflow = 'hidden';
    toggleBtn.appendChild(video);
    toggleBtn.appendChild(fallbackIcon);
  };

  // Wait for n8n chat to render its toggle button
  const observer = new MutationObserver(() => {
    tryInjectVideo();
  });
  observer.observe(document.body, { childList: true, subtree: true });

  // Also try immediately in case it's already there
  setTimeout(tryInjectVideo, 500);
  setTimeout(tryInjectVideo, 1500);

  return () => observer.disconnect();
}, []);

  const startEditing = () => {
    if (!user) return;
    resetFormFromUser();
    setIsEditing(true);
  };
  
  useEffect(() => {
    if (!user && !isLoggingOut) {
      navigate('/login');
    }
  }, [user, isLoggingOut, navigate]);

  // Fetch alumni data for the scrollbar
  useEffect(() => {
    let mounted = true;
    let subscription: any = null;

    const normalizeRole = (row: any) => {
      const roleValue = (row.role ?? row.Role ?? '').toString().toLowerCase();
      const statusValue = (row.Current_Status ?? row.current_status ?? row.currentStatus ?? '').toString().toLowerCase();

      if (roleValue.includes('faculty')) return 'faculty';
      if (statusValue === 'job') return 'career-aspirant';
      if (statusValue === 'higher-education' || statusValue === 'higher education') return 'higher-education';
      return 'alumni';
    };

    const fetchAlumniRecords = async () => {
      try {
        console.log('[MainDashboard] Fetching alumni records from alumni_profiles...');
        const { data, error } = await supabase
          .from('alumni_profiles')
          .select('*')
          .order('First_Name', { ascending: true });

        if (error) {
          console.error('[MainDashboard] Supabase fetch error:', {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint,
          });
          setAlumniStrip([]);
          return;
        }

        if (!mounted) {
          console.log('[MainDashboard] Component unmounted, skipping state update');
          return;
        }

        if (!data || data.length === 0) {
          console.log('[MainDashboard] No alumni records found in database');
          setAlumniStrip([]);
          return;
        }

        console.log(`[MainDashboard] Found ${data.length} total records in alumni_profiles`);

        const mappedRecords = data.map((r: any) => {
          const first = r.First_Name ?? r.first_name ?? r.FirstName ?? '';
          const last = r.Last_name ?? r.last_name ?? r.LastName ?? '';
          const fullName = `${first} ${last}`.trim();
          const name = fullName || r.Email_Address || r.email || 'Unknown';
          const role = normalizeRole(r);

          return {
            id: String(r.user_id ?? r.id ?? name),
            name,
            avatar: r.Photo_URL ?? r.photo_url ?? r.avatar_url ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=FDE68A&color=111827&size=128`,
            role,
          };
        });

        // Filter to only include alumni role users
        const alumniUsers = mappedRecords.filter((record) => record.role === 'alumni');
        console.log(`[MainDashboard] Filtered to ${alumniUsers.length} alumni users (role='alumni')`);

        // Create strip list with only alumni users
        const stripList = alumniUsers.map((record) => ({
          id: record.id,
          name: record.name,
          avatar: record.avatar,
        }));

        console.log(`[MainDashboard] Alumni strip list prepared with ${stripList.length} members`);
        setAlumniStrip(stripList);
      } catch (err) {
        console.error('[MainDashboard] Unexpected error fetching alumni records:', {
          error: err instanceof Error ? err.message : String(err),
          stack: err instanceof Error ? err.stack : undefined,
        });
        setAlumniStrip([]);
      }
    };

    fetchAlumniRecords();

    // Setup Realtime subscription with error handling
    const setupRealtimeSubscription = async () => {
      try {
        subscription = supabase
          .channel('public:alumni_profiles')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'alumni_profiles' }, (payload: any) => {
            console.log('[MainDashboard] Realtime update received:', {
              eventType: payload.eventType,
              newRecord: (payload.new as any)?.id,
              oldRecord: (payload.old as any)?.id,
            });
            fetchAlumniRecords();
          })
          .subscribe((status, err) => {
            if (status === 'SUBSCRIBED') {
              console.log('[MainDashboard] Realtime subscription established');
            } else if (status === 'CHANNEL_ERROR' || err) {
              console.error('[MainDashboard] Realtime subscription error:', {
                status,
                error: err,
              });
            }
          });
      } catch (err) {
        console.error('[MainDashboard] Failed to setup Realtime subscription:', err);
      }
    };

    setupRealtimeSubscription();

    return () => {
      mounted = false;
      if (subscription) {
        try {
          subscription.unsubscribe();
          console.log('[MainDashboard] Realtime subscription unsubscribed');
        } catch (e) {
          console.error('[MainDashboard] Error unsubscribing from Realtime:', e);
        }
      }
    };
  }, []);


  const fetchEventRegistrations = async () => {
    try {
      if (!user?.id) return;

      // Fetch event registrations for the current user
      const { data: registrations, error: regError } = await supabase
        .from('event_registrations')
        .select(`
          id,
          event_id,
          status,
          attended,
          created_at,
          events:event_id(
            id,
            title,
            date,
            time,
            location,
            description,
            image
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (regError) {
        console.error('[MainDashboard] Error fetching event registrations:', regError);
        setRegisteredEvents([]);
        setAttendedEvents([]);
        return;
      }

      if (!registrations) {
        console.log('[MainDashboard] No event registrations found');
        setRegisteredEvents([]);
        setAttendedEvents([]);
        return;
      }

      console.log('[MainDashboard] Event registrations:', registrations);

      // Filter registered and attended events
      const registered: any[] = [];
      const attended: any[] = [];

      registrations.forEach((reg: any) => {
        if (reg.events) {
          const eventData = {
            ...reg.events,
            registrationId: reg.id,
            status: reg.status,
            attended: reg.attended,
            registeredAt: reg.created_at,
          };

          registered.push(eventData);

          // If attended, also add to attended list
          if (reg.attended) {
            attended.push(eventData);
          }
        }
      });

      setRegisteredEvents(registered);
      setAttendedEvents(attended);
    } catch (err) {
      console.error('[MainDashboard] Unexpected error fetching event registrations:', err);
      setRegisteredEvents([]);
      setAttendedEvents([]);
    }
  };

  useEffect(() => {
    if (!user?.id) return;
    fetchEventRegistrations();
  }, [user?.id]);

  // Fetch admin posts on mount
  useEffect(() => {
    fetchAdminPosts();
  }, [fetchAdminPosts]);

  if (!user) return null;

  // Profile handlers
  const handleSave = async () => {
  if (!user) return;

  const { error } = await supabase
    .from("alumni_profiles")
    .update({
      College_Name: formData.collegeName,
      Roll_Number: formData.rollNumber,
      Department: formData.department,
      Year_of_Joining: formData.yearOfJoining,
      Passed_Out_Year: formData.passedOutYear,
      study_year: formData.studyYear,
      about: formData.about,
      Skills:skills.join(","),
      links,
    })
    .eq("user_id", user.id);

  if (error) {
  console.error("Supabase Error:", error);
  alert(error.message);
  return;
}

  const updatedUser = {
    ...user,
    ...formData,
    skills,
    links,
  };

  await login(updatedUser);
  setIsEditing(false);

  alert("Profile updated successfully!");
};

  const handleCancel = () => {
    setFormData({
      collegeName: user?.collegeName || '',
      rollNumber: user?.rollNumber || '',
      department: user?.department || '',
      year: user?.year || '',
      yearOfJoining: user?.yearOfJoining || undefined,
      passedOutYear: user?.passedOutYear || undefined,
      about: user?.about || '',
      linkedin: user?.linkedin || '',
      resume: user?.resume || '',
      avatar: user?.avatar || '',
    });
    setSkills(Array.isArray(user?.skills) ? user.skills : []);
    setLinks(user?.links || []);
    setNewSkill('');
    setNewLink({ title: '', url: '' });
    setIsEditing(false);
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const avatarData = (event.target?.result as string) || '';
        setFormData(prev => ({ ...prev, avatar: avatarData }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({ ...prev, resume: (event.target?.result as string) || '' }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileLogout = () => {
    setIsLoggingOut(true);
    logout();
    navigate('/');
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showGlobalToast('Link copied to clipboard', 'success');
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      showGlobalToast('Failed to copy link', 'error');
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (index: number) => {
    setSkills(skills.filter((_: string, i: number) => i !== index));
  };

  const addLink = () => {
    if (newLink.title.trim() && newLink.url.trim()) {
      setLinks([...links, { title: newLink.title.trim(), url: newLink.url.trim() }]);
      setNewLink({ title: '', url: '' });
    }
  };

  const removeLink = (index: number) => {
    setLinks(links.filter((_: any, i: number) => i !== index));
  };

  const handleDeletePost = async (postId: string) => {
    if (!user) return;
    const canDelete = user.role === 'admin' || posts.some(p => p.id === postId && p.alumniId === user.id);
    if (!canDelete) return;
    setDeleteConfirmPost(postId);
  };

  const confirmDeletePost = async () => {
    if (!deleteConfirmPost || !user) return;
    
    try {
      setIsDeletingPost(true);
      const { error } = await supabase.from('posts').delete().eq('id', deleteConfirmPost);
      if (error) {
        console.error('[MainDashboard] Error deleting post:', error);
        showGlobalToast('Something went wrong. Please try again.', 'error');
        return;
      }
      showGlobalToast('Post deleted successfully.', 'success');
      setDeleteConfirmPost(null);
    } catch (err) {
      console.error('[MainDashboard] Unexpected error deleting post:', err);
      showGlobalToast('Something went wrong. Please try again.', 'error');
    } finally {
      setIsDeletingPost(false);
    }
  };
 
/*
  if (!user) {
    navigate('/login');
    return null;
  }
*/    

// const canPost = !!role && role !== 'student';
// const followedPosts = posts ||[];
//const followedPosts = adminPosts;
  const canPost = role === 'faculty' || role === 'alumni';

  // Temporary localStorage approval flow for demo
  // Show admin posts + faculty/alumni posts to everyone (only approved posts)
  const followedPosts = [
    ...(adminPosts || []).map((post) => ({
      ...post,
      source: 'admin',
      status: 'approved',
      alumniId: 'admin',
      timestamp: post.created_at,
      type: 'general',
    })),
    ...(posts || []).map((post) => ({
      ...post,
      source: 'user',
      description: post.content,
      created_at: post.timestamp || post.created_at,
      file_url: post.image,
    })),
    // Add approved local posts from localStorage
    ...getApprovedPosts().map((post) => ({
      ...post,
      source: 'local',
      description: post.content,
      created_at: post.timestamp || post.created_at || new Date().toISOString(),
      file_url: post.image,
      status: 'approved',
      alumniId: post.alumniId || 'unknown',
      timestamp: post.timestamp || post.created_at,
      type: post.type || 'general',
    })),
  ].filter((post, index, self) => 
    // Filter out pending/rejected posts and deduplicate
    (!post.status || post.status === 'approved') && 
    index === self.findIndex((p) => p.id === post.id)
  );
  // Filter events
  const now = new Date();
  const upcomingEvents = events?.filter(event => new Date(event.date) > now) || [];
  const currentEvents = events?.filter(event => {
    const eventDate = new Date(event.date);
    const eventEnd = new Date(eventDate);
    eventEnd.setHours(23, 59, 59, 999); // End of event day
    return eventDate <= now && eventEnd >= now;
  }) || [];
  
  // Get followed alumni
  const followedAlumni = alumni?.filter(alumnus => following?.includes(alumnus.id)) || [];

  // Filter jobs to only show from followed alumni
  const followedJobs = jobs?.filter(job => job.alumniId && following?.includes(job.alumniId)) || [];

  // Temporary localStorage approval flow for demo
  // Get user's own posts from both Supabase and localStorage
  const visiblePosts = focusedPostId
    ? followedPosts.filter((post) => post.id === focusedPostId)
    : followedPosts;

  const handleBackToFeed = () => {
    setFocusedPostId(null);
    setOpenCommentPost(null);
    setHighlightedCommentId(null);
    navigate('/dashboard');
  };

  const userPosts = [
    ...(posts?.filter(p => p.alumniId === user?.id) || []),
    ...getApprovedPosts().filter(p => p.alumniId === user?.id),
    ...getPostsByAuthor(user?.id || '').filter(p => p.status === 'pending' || p.status === 'rejected'),
  ].filter((post, index, self) => 
    index === self.findIndex((p) => p.id === post.id)
  );

  if (activeMenu === 'chat') {
    const isDark = chatTheme === 'dark';
    return (
      <div className={`h-[calc(100vh-4rem)] flex flex-col ${isDark ? 'bg-black' : 'bg-white'}`}>
        <div className={`h-16 px-6 border-b flex items-center justify-between ${isDark ? 'bg-black border-[#262626]' : 'bg-white border-gray-200'}`}>
          <button onClick={() => navigate('/dashboard')} className={`flex items-center gap-2 transition-colors ${isDark ? 'text-white hover:text-[#FFD700]' : 'text-black hover:text-yellow-600'}`}>
            <ArrowLeft size={20} />
            <span className="font-semibold text-sm">Back to Dashboard</span>
          </button>
          
          <button 
            onClick={() => setChatTheme(isDark ? 'light' : 'dark')} 
            className={`p-2 rounded-full transition-colors ${isDark ? 'bg-[#1a1a1a] text-white hover:bg-[#262626]' : 'bg-gray-100 text-black hover:bg-gray-200'}`}
            title="Toggle theme"
          >
             {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
        <div className="flex-1 overflow-hidden w-full">
          <Chat theme={chatTheme} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* Main Content Area */}
          <main className="flex-1 min-w-0 space-y-6">
            {activeMenu === 'home' && (
              <>
                {/* Recent Alumni Highlights */}
                <RecentAlumniHighlights userId={user?.id} />

                {/* Create Post (for Faculty and Alumni) */}
                {canPost && (
                  <div className="bg-slate-900 rounded-lg border border-slate-800 p-4">
                    <div className="flex items-start space-x-3">
                      <img 
                        src={user?.avatar || 'https://ui-avatars.com/api/?name=User&background=FDE68A&color=111827&size=256'} 
                        alt={user?.name || 'User'}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="Share something with the community..."
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Posts Feed */}
                <div className="space-y-4">
                  {focusedPostId && (
                    <div className="flex flex-col gap-3 rounded-3xl border border-yellow-300/40 bg-yellow-50 p-4 text-slate-900 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm leading-6">
                        Showing only the post from your notification. Comments are expanded automatically.
                      </p>
                      <button
                        type="button"
                        onClick={handleBackToFeed}
                        className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                      >
                        Back to full feed
                      </button>
                    </div>
                  )}

                  {visiblePosts.length === 0 && focusedPostId ? (
                    <div className="rounded-3xl border border-slate-700 bg-slate-900 p-8 text-center text-slate-300">
                      <p className="text-base">The requested post could not be found.</p>
                      <button
                        type="button"
                        onClick={handleBackToFeed}
                        className="mt-4 rounded-full bg-[#FFD700] px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-yellow-500"
                      >
                        Return to feed
                      </button>
                    </div>
                  ) : (
                    visiblePosts.map((post) => {
                    
                    /*const author = getAlumniById(post.alumniId);
                    if (!author) return null;
                    */
                  // const author = {
// name: "Admin",
// avatar: "https://ui-avatars.com/api/?name=Admin"
//};
const author =
  post.source === 'admin'
    ? {
        name: 'Admin',
        avatar: 'https://ui-avatars.com/api/?name=Admin',
        position: 'Admin',
        company: 'Alumni Connect',
      }
    : getAlumniById(post.alumniId) || {
        name: 'Unknown User',
        avatar: 'https://ui-avatars.com/api/?name=User',
        position: 'Faculty/Alumni',
        company: 'TKR College',
      };
                    return (
                      <article key={post.id} className="bg-slate-900 rounded-lg border border-slate-800 overflow-hidden">
                        {/* Post Header */}
                        <div className="p-4 flex items-start space-x-3">
                          <img 
                            src={author.avatar || 'https://ui-avatars.com/api/?name=User&background=FDE68A&color=111827&size=256'} 
                            alt={author.name || 'User'}
                            className="h-12 w-12 rounded-full object-cover"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-semibold text-white">{author.name || 'Unknown User'}</h4>
                                <p className="text-sm text-slate-400">
                                  {author.position || 'Alumni'} at {author.company || 'Company'}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {(() => {
                                    try {
                                      const dateValue = post.created_at || post.timestamp;
                                      if (!dateValue) return 'Recently';
                                      const d = new Date(dateValue);
                                      return isNaN(d.getTime()) ? 'Recently' : d.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
                                    } catch { return 'Recently'; }
                                  })()}
                                </p>
                              </div>
                              {post.type === 'opportunity' && (
                                <span className="px-3 py-1 bg-[#FFD700] text-black text-xs font-bold rounded-full">
                                  Opportunity
                                </span>
                              )}
                              {post.type === 'event' && (
                                <span className="px-3 py-1 bg-blue-500 text-white text-xs font-bold rounded-full">
                                  Event
                                </span>
                              )}
                              {post.type === 'mentorship' && (
                                <span className="px-3 py-1 bg-purple-500 text-white text-xs font-bold rounded-full">
                                  Mentorship
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Post Content */}
                        <div className="px-4 pb-3">
                          {post.title && <h3 className="text-lg font-semibold text-slate-100">{post.title}</h3>}
                          <p className="text-slate-200">{post.content}</p>
                        </div>

                        {/* Post Image */}
                        {post.image && (
                          <PostImageViewer
                            src={post.image}
                            alt="Post content"
                            className="max-h-96"
                          />
                        )}

                        {/* Post Actions */}
                        <div className="px-4 py-3 border-t border-slate-800">
                          <div className="flex items-center justify-between text-sm text-slate-400 mb-3">
                            <span>{post.likes || 0} likes</span>
                            <span>{post.comments || 0} comments</span>
                          </div>
                          <div className="flex items-center justify-around border-t border-slate-800 pt-2">
                            <button 
                              onClick={async () => {
                                const actions = getPostActions(post);
                                try {
                                  await actions.like(post.id);
                                  // Optimistically update UI
                                  setLikedPosts(prev => {
                                    const next = new Set(prev);
                                    if (next.has(post.id)) {
                                      next.delete(post.id);
                                    } else {
                                      next.add(post.id);
                                    }
                                    return next;
                                  });
                                } catch (error) {
                                  console.error('[MainDashboard] Error liking post:', error);
                                  showGlobalToast('Failed to like post', 'error');
                                }
                              }}
                              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                                likedPosts.has(post.id) 
                                  ? 'text-red-500 bg-slate-800' 
                                  : 'text-slate-300 hover:text-red-500 hover:bg-slate-800'
                              }`}
                            >
                              <span className="text-lg">{likedPosts.has(post.id) ? '♥' : '♡'}</span>
                              <span>{likedPosts.has(post.id) ? 'Liked' : 'Like'}</span>
                            </button>
                            <button 
                              onClick={async () => {
                                const actions = getPostActions(post);
                                if (!openCommentPost) {
                                  const comments = await actions.getComments(post.id);
                                  setPostComments(prev => ({ ...prev, [post.id]: comments }));
                                }
                                setOpenCommentPost(openCommentPost === post.id ? null : post.id);
                              }}
                              className="flex items-center space-x-2 px-4 py-2 text-slate-300 hover:text-blue-500 hover:bg-slate-800 rounded-lg transition-colors"
                            >
                              <span className="text-lg">💬</span>
                              <span>Comment</span>
                            </button>
                            <button 
                              onClick={async () => {
                                const actions = getPostActions(post);
                                const shareData = {
                                  title: post.title || 'Alumni Post',
                                  text: post.content.substring(0, 100),
                                  url: `${window.location.origin}/dashboard/activity?post=${post.id}`,
                                };

                                // Try Web Share API first (mobile)
                                if (navigator.share) {
                                  try {
                                    await navigator.share(shareData);
                                    await actions.share(post.id);
                                    showGlobalToast('Post shared successfully', 'success');
                                  } catch (err) {
                                    // User cancelled or error - fallback to copy
                                    if (err instanceof Error && err.name !== 'AbortError') {
                                      copyToClipboard(shareData.url);
                                    }
                                  }
                                } else {
                                  // Fallback: copy URL to clipboard
                                  copyToClipboard(shareData.url);
                                  await actions.share(post.id);
                                  showGlobalToast('Link copied to clipboard', 'success');
                                }
                              }}
                              className="flex items-center space-x-2 px-4 py-2 text-slate-300 hover:text-green-500 hover:bg-slate-800 rounded-lg transition-colors"
                            >
                              <span className="text-lg">↗</span>
                              <span>Share</span>
                            </button>
                          </div>

                              {/* Comments Section */}
                              {openCommentPost === post.id && (
                                <div className="mt-4 pt-4 border-t border-slate-800 space-y-3">
                                  {/* Existing Comments */}
                                  {postComments[post.id] && postComments[post.id].length > 0 && (
                                    <div className="space-y-2 max-h-96 overflow-y-auto">
                                      {buildCommentTree(postComments[post.id]).map((comment) => (
                                        <CommentItem
                                          key={comment.id}
                                          comment={comment}
                                          postId={post.id}
                                          user={user}
                                          replyingTo={replyingTo}
                                          replyText={replyText}
                                          onReplyClick={(commentId) => {
                                            setReplyingTo(prev => ({ ...prev, [post.id]: commentId }));
                                            setReplyText(prev => ({ ...prev, [post.id]: '' }));
                                          }}
                                          onReplyTextChange={(text) => {
                                            setReplyText(prev => ({ ...prev, [post.id]: text }));
                                          }}
                                          onReplySubmit={async (parentId) => {
                                            const actions = getPostActions(post);
                                            const text = replyText[post.id];
                                            if (text?.trim()) {
                                              await actions.comment(post.id, text, parentId);
                                              setReplyingTo(prev => ({ ...prev, [post.id]: null }));
                                              setReplyText(prev => ({ ...prev, [post.id]: '' }));
                                              const comments = await actions.getComments(post.id);
                                              setPostComments(prev => ({ ...prev, [post.id]: comments }));
                                            }
                                          }}
                                          onDelete={async (commentId) => {
                                            await deleteComment(commentId, post.id);
                                            setPostComments(prev => ({
                                              ...prev,
                                              [post.id]: prev[post.id].filter(c => c.id !== commentId)
                                            }));
                                          }}
                                          highlightedCommentId={highlightedCommentId}
                                          depth={0}
                                        />
                                      ))}
                                    </div>
                                  )}

                              {/* Add Comment Input */}
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  placeholder="Write a comment..."
                                  value={commentText[post.id] || ''}
                                  onChange={(e) => setCommentText(prev => ({ ...prev, [post.id]: e.target.value }))}
                                  onKeyPress={(e) => {
                                    const actions = getPostActions(post);
                                    if (e.key === 'Enter' && commentText[post.id]?.trim()) {
                                      actions.comment(post.id, commentText[post.id] || '');
                                      setCommentText(prev => ({ ...prev, [post.id]: '' }));
                                      // Refresh comments
                                      actions.getComments(post.id).then(comments => {
                                        setPostComments(prev => ({ ...prev, [post.id]: comments }));
                                      });
                                    }
                                  }}
                                  className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
                                />
                                <button
                                  onClick={async () => {
                                    const actions = getPostActions(post);
                                    if (commentText[post.id]?.trim()) {
                                      await actions.comment(post.id, commentText[post.id] || '');
                                      setCommentText(prev => ({ ...prev, [post.id]: '' }));
                                      // Refresh comments
                                      const comments = await actions.getComments(post.id);
                                      setPostComments(prev => ({ ...prev, [post.id]: comments }));
                                    }
                                  }}
                                  className="px-4 py-2 bg-[#FFD700] text-black rounded-lg font-semibold hover:bg-yellow-600 transition-colors"
                                >
                                  Post
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </article>
                    );
                  }))}
                  
                  {!focusedPostId && followedPosts.length === 0 && (
                    <div className="text-center py-12 bg-slate-800 rounded-lg border border-slate-700">
                      <Bell className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-white">No posts yet</h3>
                      <p className="text-slate-400">Follow some alumni to see their posts here.</p>
                    </div>
                  )}
                </div>
              </>
            )}

            {activeMenu === 'post' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white">Create Post</h2>

                {!canPost ? (
                  <div className="text-center py-12 bg-slate-800 rounded-lg border border-slate-700">
                    <p className="text-slate-400">You do not have permission to create posts.</p>
                  </div>
                ) : (
                  <div className="bg-slate-900 rounded-lg border border-slate-800 p-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Type</label>
                        <select
                          value={postType}
                          onChange={(e) => setPostType(e.target.value as any)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                        >
                          {role === 'alumni' && <option value="job">Job</option>}
                          {role === 'alumni' && <option value="internship">Internship</option>}
                          {role === 'alumni' && <option value="referral">Referral</option>}
                          <option value="mentorship">Mentorship</option>
                          <option value="event">Event</option>
                          {role === 'alumni' && <option value="business">Business</option>}
                          {role === 'faculty' && <option value="higher-education">Higher Education</option>}
                          <option value="general">General Post</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Title</label>
                        <input
                          type="text"
                          value={postTitle}
                          onChange={(e) => setPostTitle(e.target.value)}
                          placeholder="Post title (optional)"
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-400"
                        />
                        <label className="block text-sm font-medium text-slate-300 mb-1 mt-3">Content</label>
                        <textarea
                          value={postContent}
                          onChange={(e) => setPostContent(e.target.value)}
                          rows={6}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-400"
                          placeholder="Write your post here..."
                        />
                      </div>

                      {/* Dynamic fields based on post type */}
                      {postType === 'job' && (
                        <div className="space-y-4 p-4 bg-slate-800 rounded-lg">
                          <h3 className="text-lg font-semibold text-white">Job Details</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-slate-300 mb-1">Company Name *</label>
                              <input type="text" required value={postDetails.companyName || ''} onChange={(e) => setPostDetails({...postDetails, companyName: e.target.value})} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-300 mb-1">Job Role *</label>
                              <input type="text" required value={postDetails.jobRole || ''} onChange={(e) => setPostDetails({...postDetails, jobRole: e.target.value})} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-300 mb-1">Location *</label>
                              <input type="text" required value={postDetails.location || ''} onChange={(e) => setPostDetails({...postDetails, location: e.target.value})} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-300 mb-1">Eligibility *</label>
                              <input type="text" required value={postDetails.eligibility || ''} onChange={(e) => setPostDetails({...postDetails, eligibility: e.target.value})} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-300 mb-1">Required Skills *</label>
                              <input type="text" required value={postDetails.requiredSkills || ''} onChange={(e) => setPostDetails({...postDetails, requiredSkills: e.target.value})} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-300 mb-1">Salary/Package *</label>
                              <input type="text" required value={postDetails.salary || ''} onChange={(e) => setPostDetails({...postDetails, salary: e.target.value})} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-300 mb-1">Apply Link *</label>
                              <input type="url" required value={postDetails.applyLink || ''} onChange={(e) => setPostDetails({...postDetails, applyLink: e.target.value})} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-300 mb-1">Deadline *</label>
                              <input type="date" required value={postDetails.deadline || ''} onChange={(e) => setPostDetails({...postDetails, deadline: e.target.value})} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white" />
                            </div>
                          </div>
                        </div>
                      )}

                      {postType === 'internship' && (
                        <div className="space-y-4 p-4 bg-slate-800 rounded-lg">
                          <h3 className="text-lg font-semibold text-white">Internship Details</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-slate-300 mb-1">Company Name *</label>
                              <input type="text" required value={postDetails.companyName || ''} onChange={(e) => setPostDetails({...postDetails, companyName: e.target.value})} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-300 mb-1">Internship Role *</label>
                              <input type="text" required value={postDetails.internshipRole || ''} onChange={(e) => setPostDetails({...postDetails, internshipRole: e.target.value})} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-300 mb-1">Duration *</label>
                              <input type="text" required value={postDetails.duration || ''} onChange={(e) => setPostDetails({...postDetails, duration: e.target.value})} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-300 mb-1">Stipend *</label>
                              <input type="text" required value={postDetails.stipend || ''} onChange={(e) => setPostDetails({...postDetails, stipend: e.target.value})} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-300 mb-1">Required Skills *</label>
                              <input type="text" required value={postDetails.requiredSkills || ''} onChange={(e) => setPostDetails({...postDetails, requiredSkills: e.target.value})} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-300 mb-1">Location/Remote *</label>
                              <input type="text" required value={postDetails.locationType || ''} onChange={(e) => setPostDetails({...postDetails, locationType: e.target.value})} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-300 mb-1">Apply Link *</label>
                              <input type="url" required value={postDetails.applyLink || ''} onChange={(e) => setPostDetails({...postDetails, applyLink: e.target.value})} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-300 mb-1">Deadline *</label>
                              <input type="date" required value={postDetails.deadline || ''} onChange={(e) => setPostDetails({...postDetails, deadline: e.target.value})} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white" />
                            </div>
                          </div>
                        </div>
                      )}

                      {postType === 'business' && (
                        <div className="space-y-4 p-4 bg-slate-800 rounded-lg">
                          <h3 className="text-lg font-semibold text-white">Business Details</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-slate-300 mb-1">Business/Startup Name *</label>
                              <input type="text" required value={postDetails.businessName || ''} onChange={(e) => setPostDetails({...postDetails, businessName: e.target.value})} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-300 mb-1">Opportunity Title *</label>
                              <input type="text" required value={postDetails.opportunityTitle || ''} onChange={(e) => setPostDetails({...postDetails, opportunityTitle: e.target.value})} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white" />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-slate-300 mb-1">Business Category *</label>
                              <input type="text" required value={postDetails.businessCategory || ''} onChange={(e) => setPostDetails({...postDetails, businessCategory: e.target.value})} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white" />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-slate-300 mb-1">Collaboration Details *</label>
                              <textarea required value={postDetails.collaborationDetails || ''} onChange={(e) => setPostDetails({...postDetails, collaborationDetails: e.target.value})} rows={3} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white" />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-slate-300 mb-1">Support Needed *</label>
                              <textarea required value={postDetails.supportNeeded || ''} onChange={(e) => setPostDetails({...postDetails, supportNeeded: e.target.value})} rows={3} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white" />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-slate-300 mb-1">Contact Link/Email *</label>
                              <input type="text" required value={postDetails.contactLink || ''} onChange={(e) => setPostDetails({...postDetails, contactLink: e.target.value})} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white" />
                            </div>
                          </div>
                        </div>
                      )}

                      {postType === 'referral' && (
                        <div className="space-y-4 p-4 bg-slate-800 rounded-lg">
                          <h3 className="text-lg font-semibold text-white">Referral Details</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-slate-300 mb-1">Company Name *</label>
                              <input type="text" required value={postDetails.companyName || ''} onChange={(e) => setPostDetails({...postDetails, companyName: e.target.value})} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-300 mb-1">Role *</label>
                              <input type="text" required value={postDetails.role || ''} onChange={(e) => setPostDetails({...postDetails, role: e.target.value})} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-300 mb-1">Eligibility *</label>
                              <input type="text" required value={postDetails.eligibility || ''} onChange={(e) => setPostDetails({...postDetails, eligibility: e.target.value})} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-300 mb-1">Required Skills *</label>
                              <input type="text" required value={postDetails.requiredSkills || ''} onChange={(e) => setPostDetails({...postDetails, requiredSkills: e.target.value})} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white" />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-slate-300 mb-1">Referral Process *</label>
                              <textarea required value={postDetails.referralProcess || ''} onChange={(e) => setPostDetails({...postDetails, referralProcess: e.target.value})} rows={3} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white" />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-slate-300 mb-1">Resume Submission Link *</label>
                              <input type="url" required value={postDetails.resumeLink || ''} onChange={(e) => setPostDetails({...postDetails, resumeLink: e.target.value})} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-300 mb-1">Deadline *</label>
                              <input type="date" required value={postDetails.deadline || ''} onChange={(e) => setPostDetails({...postDetails, deadline: e.target.value})} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white" />
                            </div>
                          </div>
                        </div>
                      )}

                      {postType === 'higher-education' && (
                        <div className="space-y-4 p-4 bg-slate-800 rounded-lg">
                          <h3 className="text-lg font-semibold text-white">Higher Education Details</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-slate-300 mb-1">Title *</label>
                              <input type="text" required value={postDetails.heTitle || postTitle || ''} onChange={(e) => { setPostTitle(e.target.value); setPostDetails({...postDetails, heTitle: e.target.value}); }} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white" />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-slate-300 mb-1">Description *</label>
                              <textarea required value={postDetails.description || ''} onChange={(e) => setPostDetails({...postDetails, description: e.target.value})} rows={3} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-300 mb-1">Country *</label>
                              <input type="text" required value={postDetails.country || ''} onChange={(e) => setPostDetails({...postDetails, country: e.target.value})} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-300 mb-1">University/College Name *</label>
                              <input type="text" required value={postDetails.university || ''} onChange={(e) => setPostDetails({...postDetails, university: e.target.value})} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-300 mb-1">Course/Program Name *</label>
                              <input type="text" required value={postDetails.course || ''} onChange={(e) => setPostDetails({...postDetails, course: e.target.value})} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-300 mb-1">Branch/Specialization *</label>
                              <input type="text" required value={postDetails.branch || ''} onChange={(e) => setPostDetails({...postDetails, branch: e.target.value})} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-300 mb-1">Eligibility *</label>
                              <input type="text" required value={postDetails.eligibility || ''} onChange={(e) => setPostDetails({...postDetails, eligibility: e.target.value})} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-300 mb-1">Exams Required *</label>
                              <input type="text" required value={postDetails.examsRequired || ''} onChange={(e) => setPostDetails({...postDetails, examsRequired: e.target.value})} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-300 mb-1">Scholarship Information</label>
                              <input type="text" value={postDetails.scholarship || ''} onChange={(e) => setPostDetails({...postDetails, scholarship: e.target.value})} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-300 mb-1">Application Deadline *</label>
                              <input type="date" required value={postDetails.applicationDeadline || ''} onChange={(e) => setPostDetails({...postDetails, applicationDeadline: e.target.value})} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white" />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-slate-300 mb-1">Application/Info Link *</label>
                              <input type="url" required value={postDetails.applicationLink || ''} onChange={(e) => setPostDetails({...postDetails, applicationLink: e.target.value})} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white" />
                            </div>
                          </div>
                        </div>
                      )}

                      {postType === 'mentorship' && (
                        <div className="space-y-4 p-4 bg-slate-800 rounded-lg">
                          <h3 className="text-lg font-semibold text-white">Mentorship Details</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-slate-300 mb-1">Mentorship Topic *</label>
                              <input type="text" required value={postDetails.mentorshipTopic || ''} onChange={(e) => setPostDetails({...postDetails, mentorshipTopic: e.target.value})} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white" placeholder="e.g., Career Guidance, Technical Skills" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-300 mb-1">Mentor Name *</label>
                              <input type="text" required value={postDetails.mentorName || ''} onChange={(e) => setPostDetails({...postDetails, mentorName: e.target.value})} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-300 mb-1">Mentor Role/Designation *</label>
                              <input type="text" required value={postDetails.mentorRole || ''} onChange={(e) => setPostDetails({...postDetails, mentorRole: e.target.value})} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white" placeholder="e.g., Senior Software Engineer at Google" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-300 mb-1">Session Date *</label>
                              <input type="date" required value={postDetails.sessionDate || ''} onChange={(e) => setPostDetails({...postDetails, sessionDate: e.target.value})} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-300 mb-1">Session Time *</label>
                              <input type="time" required value={postDetails.sessionTime || ''} onChange={(e) => setPostDetails({...postDetails, sessionTime: e.target.value})} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-300 mb-1">Duration *</label>
                              <input type="text" required value={postDetails.duration || ''} onChange={(e) => setPostDetails({...postDetails, duration: e.target.value})} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white" placeholder="e.g., 1 hour, 2 hours" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-300 mb-1">Mode *</label>
                              <select required value={postDetails.mode || ''} onChange={(e) => setPostDetails({...postDetails, mode: e.target.value})} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white">
                                <option value="">Select Mode</option>
                                <option value="Online">Online</option>
                                <option value="Offline">Offline</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-300 mb-1">Meeting Link or Venue *</label>
                              <input type="text" required value={postDetails.meetingLinkOrVenue || ''} onChange={(e) => setPostDetails({...postDetails, meetingLinkOrVenue: e.target.value})} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white" placeholder="Zoom link or physical venue" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-300 mb-1">Maximum Participants *</label>
                              <input type="number" required min="1" value={postDetails.maxParticipants || ''} onChange={(e) => setPostDetails({...postDetails, maxParticipants: e.target.value})} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white" placeholder="e.g., 20" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-300 mb-1">Eligibility / Target Students *</label>
                              <input type="text" required value={postDetails.eligibility || ''} onChange={(e) => setPostDetails({...postDetails, eligibility: e.target.value})} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white" placeholder="e.g., 2nd year CSE students" />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-slate-300 mb-1">Description *</label>
                              <textarea required value={postDetails.description || ''} onChange={(e) => setPostDetails({...postDetails, description: e.target.value})} rows={4} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white" placeholder="Describe the mentorship session, what students will learn..." />
                            </div>
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Attach file / image (optional)</label>
                        <label className="mt-2 flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-4 cursor-pointer transition-colors bg-slate-800 border-slate-700 hover:border-yellow-500">
                          <input
                            type="file"
                            accept="image/*,.pdf,.doc,.docx"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              setPostFileName(file.name);
                              const reader = new FileReader();
                              reader.onload = (ev) => setPostImage((ev.target?.result as string) || null);
                              reader.readAsDataURL(file);
                            }}
                            className="hidden"
                          />
                          <div className="text-slate-400 text-sm">Click to choose a file, or drop it here</div>
                          {postFileName && <div className="text-slate-200 text-sm mt-2">{postFileName}</div>}
                        </label>
                        {postImage && (
                          <div className="mt-3">
                            <img src={postImage} alt="preview" className="max-h-48 rounded-md object-contain" />
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => {
                            if (!postContent.trim()) return;
                            addPost({
                              title: postTitle || undefined,
                              alumniId: user?.id || 'unknown',
                              authorRole: role,
                              content: postContent.trim(),
                              type: postType,
                              likes: 0,
                              comments: 0,
                              image: postImage || undefined,
                              post_details: Object.keys(postDetails).length > 0 ? postDetails : undefined,
                            });
                            setPostTitle('');
                            setPostContent('');
                            setPostType('general');
                            setPostImage(null);
                            setPostDetails({});
                            navigate('/dashboard/contributions');
                          }}
                          className="px-4 py-2 bg-[#FFD700] text-black rounded-lg font-semibold hover:bg-yellow-600"
                        >
                          Publish
                        </button>
                        <button
                          onClick={() => { setPostContent(''); setPostType('general'); setPostImage(null); setPostDetails({}); }}
                          className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeMenu === 'events' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">Events</h2>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => setEventView('upcoming')}
                      className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                        eventView === 'upcoming' 
                          ? 'bg-[#FFD700] text-black hover:bg-yellow-600' 
                          : 'bg-slate-700 text-white hover:bg-slate-600'
                      }`}
                    >
                      Upcoming Events
                    </button>
                    <button 
                      onClick={() => setEventView('current')}
                      className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                        eventView === 'current' 
                          ? 'bg-[#FFD700] text-black hover:bg-yellow-600' 
                          : 'bg-slate-700 text-white hover:bg-slate-600'
                      }`}
                    >
                      Current Events
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {(eventView === 'upcoming' ? upcomingEvents : currentEvents).map((event) => (
                    <div key={event.id} className="bg-slate-900 rounded-lg border border-slate-800 overflow-hidden hover:border-[#FFD700] transition-colors">
                      <img 
                        src={event.image} 
                        alt={event.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-white mb-2">{event.title}</h3>
                        <p className="text-slate-300 mb-4">{event.date} at {event.time}</p>
                        <p className="text-slate-400 text-sm mb-4">{event.location}</p>
                        <button className="w-full py-2 bg-[#FFD700] text-black rounded-lg font-semibold hover:bg-yellow-600 transition-colors">
                          Register
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {(eventView === 'upcoming' ? upcomingEvents : currentEvents).length === 0 && (
                    <div className="col-span-full text-center py-12 bg-slate-800 rounded-lg border border-slate-700">
                      <Briefcase className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-white">No events available</h3>
                      <p className="text-slate-400">
                        {eventView === 'upcoming' 
                          ? 'Check back later for upcoming events.' 
                          : 'No events are available'
                        }
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeMenu === 'community' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white">Community Discussion</h2>
                
                <div className="bg-slate-900 rounded-lg border border-slate-800 p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Joined Communities</h3>
                  <p className="text-slate-400 mb-4">You haven't joined any communities yet.</p>
                  <button className="px-4 py-2 bg-[#FFD700] text-black rounded-lg font-semibold hover:bg-yellow-600 transition-colors">
                    Browse Communities
                  </button>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-white">Recent Discussions</h3>
                  <div className="text-center py-12 bg-slate-800 rounded-lg border border-slate-700">
                    <MessageSquare className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white">No discussions yet</h3>
                    <p className="text-slate-400">Join a community to see discussions here.</p>
                  </div>
                </div>
              </div>
            )}

            {activeMenu === 'opportunities' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white">Opportunities</h2>
                
                <div className="space-y-4">
                  {followedJobs.map((job) => (
                    <div key={job.id} className="bg-slate-900 rounded-lg border border-slate-800 p-6 hover:border-[#FFD700] transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white mb-2">{job.title}</h3>
                          <p className="text-slate-300 mb-3">{job.company}</p>
                          <div className="flex items-center space-x-4 text-sm text-slate-400 mb-4">
                            <span className="px-2 py-1 bg-slate-700 rounded">{job.type}</span>
                            <span>{job.location}</span>
                            <span>Posted {(() => {
                              try {
                                const d = new Date(job.postedDate);
                                return isNaN(d.getTime()) ? job.postedDate : d.toLocaleDateString();
                              } catch { return job.postedDate; }
                            })()}</span>
                          </div>
                          <p className="text-slate-200">{job.description}</p>
                        </div>
                        <button className="px-6 py-2 bg-[#FFD700] text-black rounded-lg font-semibold hover:bg-yellow-600 transition-colors ml-6">
                          Apply
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {followedJobs.length === 0 && (
                    <div className="text-center py-12 bg-slate-800 rounded-lg border border-slate-700">
                      <Briefcase className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-white">No opportunities available</h3>
                      <p className="text-slate-400">Check back later for new opportunities.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeMenu === 'activity' && role !== 'faculty' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white">Activity</h2>
                
                {/* Activity Cards - Top Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {(role === "alumni") && (
                    <div
                      onClick={() => setSelectedActivityCard("postsCreated")}
                      className={`cursor-pointer transition rounded-lg border p-6 ${
                        selectedActivityCard === "postsCreated"
                          ? "border-yellow-400 bg-yellow-400/10"
                          : "border-slate-800 bg-slate-900 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-white">Posts Created</h4>
                          <p className="text-sm text-slate-400">Your contributions</p>
                        </div>
                        <span className="text-2xl font-bold text-[#FFD700]">
                          {posts?.filter(p => p.alumniId === user?.id).length || 0}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  <div
                    onClick={() => setSelectedActivityCard("following")}
                    className={`cursor-pointer transition rounded-lg border p-6 ${
                      selectedActivityCard === "following"
                        ? "border-yellow-400 bg-yellow-400/10"
                        : "border-slate-800 bg-slate-900 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-white">Following</h4>
                        <p className="text-sm text-slate-400">Alumni you follow</p>
                      </div>
                      <span className="text-2xl font-bold text-[#FFD700]">
                        {following?.length || 0}
                      </span>
                    </div>
                  </div>

                  {(role === "alumni" || role === "student") && (
                    <>
                      <div
                        onClick={() => setSelectedActivityCard("registeredEvents")}
                        className={`cursor-pointer transition rounded-lg border p-6 ${
                          selectedActivityCard === "registeredEvents"
                            ? "border-yellow-400 bg-yellow-400/10"
                            : "border-slate-800 bg-slate-900 hover:border-slate-700"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-white">Registered Events</h4>
                            <p className="text-sm text-slate-400">Events joined</p>
                          </div>
                          <span className="text-2xl font-bold text-[#FFD700]">
                            {registeredEvents?.length || 0}
                          </span>
                        </div>
                      </div>

                      <div
                        onClick={() => setSelectedActivityCard("attendedEvents")}
                        className={`cursor-pointer transition rounded-lg border p-6 ${
                          selectedActivityCard === "attendedEvents"
                            ? "border-yellow-400 bg-yellow-400/10"
                            : "border-slate-800 bg-slate-900 hover:border-slate-700"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-white">Attended Events</h4>
                            <p className="text-sm text-slate-400">Events attended</p>
                          </div>
                          <span className="text-2xl font-bold text-[#FFD700]">
                            {attendedEvents?.length || 0}
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Activity Details Section */}
                {!selectedActivityCard ? (
                  <div className="text-center py-12 bg-slate-800 rounded-lg border border-slate-700">
                    <p className="text-slate-400 text-lg">Select an activity card to view details</p>
                  </div>
                ) : (
                  <>
                    {/* Posts Created Details */}
                    {selectedActivityCard === "postsCreated" && (role === "alumni") && (
                      <div className="bg-slate-900 rounded-lg border border-slate-800 p-6">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-xl font-bold text-white">Your Posts</h3>
                          <span className="px-3 py-1 rounded-full text-sm font-semibold bg-slate-800 text-slate-300">
                            {userPosts.length} total
                          </span>
                        </div>
                        <div className="space-y-4">
                          {userPosts.length > 0 ? (
                            userPosts.map((post) => (
                              <div key={post.id} className="bg-slate-800 rounded-lg p-4 border border-slate-700 hover:border-[#FFD700] transition-colors group">
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-white">{post.title || 'Untitled Post'}</h4>
                                    <p className="text-sm text-slate-400 mt-1 line-clamp-2">{post.content?.substring(0, 150) || 'No content'}{post.content && post.content.length > 150 ? '...' : ''}</p>
                                  </div>
                                  <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ml-2 flex-shrink-0 ${
                                    post.status === 'approved' ? 'bg-green-900/30 text-green-200 border border-green-800' :
                                    post.status === 'rejected' ? 'bg-red-900/30 text-red-200 border border-red-800' :
                                    'bg-yellow-900/30 text-yellow-200 border border-yellow-800'
                                  }`}>
                                    {post.status === 'pending' && 'Pending'}
                                    {post.status === 'approved' && 'Approved'}
                                    {post.status === 'rejected' && 'Rejected'}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <p className="text-xs text-slate-500">
                                    {(() => {
                                      try {
                                        const d = new Date(post.created_at || post.timestamp);
                                        return isNaN(d.getTime()) ? 'Recently' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                                      } catch { return 'Recently'; }
                                    })()}
                                  </p>
                                  <div className="flex items-center space-x-3">
                                    {(post.status === 'rejected' && post.rejection_reason) && (
                                      <div className="flex items-start space-x-2">
                                        <span className="text-red-400 text-xs">💡</span>
                                        <p className="text-xs text-red-300 max-w-[200px]">{post.rejection_reason}</p>
                                      </div>
                                    )}
                                    {deleteConfirmPost === post.id ? (
                                      <div className="flex items-center space-x-2">
                                        <span className="text-xs text-slate-300">Delete?</span>
                                        <button
                                          onClick={() => handleDeletePost(post.id)}
                                          className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                                        >
                                          Yes
                                        </button>
                                        <button
                                          onClick={() => setDeleteConfirmPost(null)}
                                          className="px-2 py-1 bg-slate-600 text-white text-xs rounded hover:bg-slate-500"
                                        >
                                          No
                                        </button>
                                      </div>
                                    ) : (
                                      <button
                                        onClick={() => setDeleteConfirmPost(post.id)}
                                        className="text-red-400 hover:text-red-300 text-xs flex items-center space-x-1"
                                      >
                                        <span>Delete</span>
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-12 bg-slate-800/50 rounded-lg border border-dashed border-slate-700">
                              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-700/50 mb-4">
                                <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </div>
                              <h3 className="text-lg font-medium text-white mb-2">No posts yet</h3>
                              <p className="text-slate-400 text-sm">Create your first post to share with the community</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Following Details */}
                    {selectedActivityCard === "following" && (
                      <div className="bg-slate-900 rounded-lg border border-slate-800 p-6">
                        <h3 className="text-xl font-bold text-white mb-4">Following</h3>
                        <div className="space-y-4">
                          {following && following.length > 0 ? (
                            following.map((alumnusId) => {
                              const alumnusData = getAlumniById(alumnusId);
                              if (!alumnusData) return null;
                              return (
                                <div key={alumnusId} className="bg-slate-800 rounded-lg p-4 border border-slate-700 hover:border-[#FFD700] transition-colors">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <h4 className="font-semibold text-white">{alumnusData.name}</h4>
                                      <p className="text-sm text-slate-400 mt-1">
                                        {alumnusData.role && alumnusData.role.charAt(0).toUpperCase() + alumnusData.role.slice(1)}
                                        {alumnusData.department && ` • ${alumnusData.department}`}
                                      </p>
                                    </div>
                                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-900 text-blue-200">
                                      Following
                                    </span>
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <p className="text-slate-400 text-center py-8">You're not following anyone yet.</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Registered Events Details */}
                    {selectedActivityCard === "registeredEvents" && (role === "alumni" || role === "student") && (
                      <div className="bg-slate-900 rounded-lg border border-slate-800 p-6">
                        <h3 className="text-xl font-bold text-white mb-4">Registered Events</h3>
                        <div className="space-y-4">
                          {registeredEvents && registeredEvents.length > 0 ? (
                            registeredEvents.map((event) => (
                              <div key={event.registrationId || event.id} className="bg-slate-800 rounded-lg p-4 border border-slate-700 hover:border-[#FFD700] transition-colors">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-white">{event.title}</h4>
                                    <p className="text-sm text-slate-400 mt-1">{event.location}</p>
                                  </div>
                                  <span className="px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ml-2 bg-blue-900 text-blue-200">
                                    Registered
                                  </span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                  <div className="text-slate-400">
                                    {(() => {
                                      try {
                                        const d = new Date(event.date);
                                        const t = event.time ? ` at ${event.time}` : '';
                                        return isNaN(d.getTime()) ? event.date + t : d.toLocaleDateString() + t;
                                      } catch { return event.date; }
                                    })()}
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-slate-400 text-center py-8">No registered events yet</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Attended Events Details */}
                    {selectedActivityCard === "attendedEvents" && (role === "alumni" || role === "student") && (
                      <div className="bg-slate-900 rounded-lg border border-slate-800 p-6">
                        <h3 className="text-xl font-bold text-white mb-4">Attended Events</h3>
                        <div className="space-y-4">
                          {attendedEvents && attendedEvents.length > 0 ? (
                            attendedEvents.map((event) => (
                              <div key={event.registrationId || event.id} className="bg-slate-800 rounded-lg p-4 border border-slate-700 hover:border-[#FFD700] transition-colors">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-white">{event.title}</h4>
                                    <p className="text-sm text-slate-400 mt-1">{event.location}</p>
                                  </div>
                                  <span className="px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ml-2 bg-green-900 text-green-200">
                                    Attended
                                  </span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                  <div className="text-slate-400">
                                    {(() => {
                                      try {
                                        const d = new Date(event.date);
                                        const t = event.time ? ` at ${event.time}` : '';
                                        return isNaN(d.getTime()) ? event.date + t : d.toLocaleDateString() + t;
                                      } catch { return event.date; }
                                    })()}
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-slate-400 text-center py-8">No attended events yet</p>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {activeMenu === 'profile' && (
              <div className="space-y-6 pb-24">
                {/* Profile Header */}
                <div className="flex items-end justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white">{user?.name}</h2>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={startEditing} 
                      className="bg-[#FFD700] text-black px-4 py-2 rounded-lg font-medium hover:bg-yellow-400"
                    >
                      Edit Profile
                    </button>
                                      </div>
                </div>

                {/* Edit Form */}
                {isEditing ? (
                  <div className="bg-slate-900 rounded-lg border border-slate-800 p-6 space-y-4">
                    {/* Avatar Section */}
                    <div className="flex items-center gap-4">
                      <label htmlFor="profile-avatar" className="cursor-pointer">
                        <img 
                          src={formData.avatar || user?.avatar || 'https://ui-avatars.com/api/?name=User&background=FDE68A&color=111827&size=256'} 
                          alt="Profile"
                          className="h-24 w-24 rounded-full object-cover border-2 border-[#FFD700] hover:opacity-80 transition-opacity"
                        />
                      </label>
                      <input id="profile-avatar" type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                      <div>
                        <p className="text-white font-medium">Click avatar to change profile image</p>
                        <p className="text-xs text-slate-400">Supports: JPG, PNG, GIF</p>
                      </div>
                    </div>

                    <hr className="border-slate-700" />

                    {/* Form Fields */}
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">College Name *</label>
                        <input
                          type="text"
                          placeholder="Your college name"
                          value={formData.collegeName}
                          onChange={(e) => setFormData(prev => ({ ...prev, collegeName: e.target.value }))}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Roll Number *</label>
                        <input
                          type="text"
                          placeholder="Your roll number"
                          value={formData.rollNumber}
                          onChange={(e) => setFormData(prev => ({ ...prev, rollNumber: e.target.value }))}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Department *</label>
                        <input
                          type="text"
                          placeholder="Your department"
                          value={formData.department}
                          onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-1">Year of Joining</label>
                          <input
                            type="number"
                            min="1950"
                            max={new Date().getFullYear()}
                            placeholder="e.g., 2020"
                            value={user?.yearOfJoining || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, yearOfJoining: parseInt(e.target.value) }))}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-1">Year of Passing Out</label>
                          <input
                            type="number"
                            min="1950"
                            max={new Date().getFullYear() + 10}
                            placeholder="e.g., 2024"
                            value={user?.passedOutYear || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, passedOutYear: parseInt(e.target.value) }))}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Study Year *</label>
                        <input
                          type="text"
                          placeholder="Your year (e.g., 2nd Year)"
                          value={formData.year}
                          onChange={(e) => setFormData(prev => ({ ...prev, year: e.target.value }))}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">About</label>
                        <textarea
                          placeholder="Tell us about yourself (optional)"
                          value={formData.about}
                          onChange={(e) => setFormData(prev => ({ ...prev, about: e.target.value }))}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
                          rows={4}
                        />
                      </div>

                      {/* Skills */}
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Skills *</label>
                        <div className="flex gap-2 mb-2">
                          <input
                            type="text"
                            placeholder="Add a skill"
                            value={newSkill}
                            onChange={(e) => setNewSkill(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                            className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
                          />
                          <button onClick={addSkill} className="bg-[#FFD700] text-black px-4 py-2 rounded-lg font-medium hover:bg-yellow-400">
                            Add Skill
                          </button>
                        </div>
                        {skills.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {skills.map((skill, idx) => (
                              <div key={idx} className="bg-slate-700 text-white px-3 py-1 rounded-lg text-sm flex items-center gap-2">
                                {skill}
                                <button onClick={() => removeSkill(idx)} className="text-red-400 hover:text-red-300 font-bold">×</button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">LinkedIn URL *</label>
                        <input
                          type="text"
                          placeholder="https://linkedin.com/in/your-profile"
                          value={formData.linkedin}
                          onChange={(e) => setFormData(prev => ({ ...prev, linkedin: e.target.value }))}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
                        />
                      </div>

                      {/* Other Links */}
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Other Links</label>
                        <div className="space-y-2 mb-3">
                          <input
                            type="text"
                            placeholder="Link title (e.g., Portfolio)"
                            value={newLink.title}
                            onChange={(e) => setNewLink(prev => ({ ...prev, title: e.target.value }))}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
                          />
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Link URL"
                              value={newLink.url}
                              onChange={(e) => setNewLink(prev => ({ ...prev, url: e.target.value }))}
                              className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
                            />
                            <button onClick={addLink} className="bg-[#FFD700] text-black px-4 py-2 rounded-lg font-medium hover:bg-yellow-400">
                              Add Link
                            </button>
                          </div>
                        </div>
                        {links.length > 0 && (
                          <div className="space-y-2">
                            {links.map((link: any, idx: number) => (
                              <div key={idx} className="bg-slate-700 px-4 py-2 rounded-lg flex items-center justify-between">
                                <div>
                                  <p className="text-white text-sm font-medium">{link.title}</p>
                                  <p className="text-slate-400 text-xs truncate">{link.url}</p>
                                </div>
                                <button onClick={() => removeLink(idx)} className="text-red-400 hover:text-red-300 font-bold">×</button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Resume Upload */}
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Resume Upload *</label>
                        <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2">
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={handleResumeUpload}
                            className="text-white text-sm flex-1"
                          />
                        </div>
                        {formData.resume && <p className="text-xs text-green-400 mt-2">✓ Resume selected</p>}
                      </div>
                    </div>

                    <hr className="border-slate-700" />

                    {/* Save/Cancel Buttons */}
                    <div className="flex gap-3">
                      <button 
                        onClick={handleSave} 
                        className="flex-1 bg-[#FFD700] text-black py-3 px-4 rounded-lg font-semibold hover:bg-yellow-400"
                      >
                        Save Profile
                      </button>
                      <button 
                        onClick={handleCancel} 
                        className="flex-1 bg-slate-700 text-white py-3 px-4 rounded-lg font-semibold hover:bg-slate-600"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Profile View */
                  <div className="bg-slate-900 rounded-lg border border-slate-800 p-6 space-y-6">
                    {/* Profile Avatar and Basic Info */}
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                      <img 
                        src={user?.avatar || 'https://ui-avatars.com/api/?name=User&background=FDE68A&color=111827&size=256'} 
                        alt={user?.name}
                        className="h-32 w-32 rounded-full object-cover border-4 border-[#FFD700]"
                      />
                      <div className="flex-1 w-full text-center md:text-left">
                        <h3 className="text-2xl font-bold text-white mb-4">{user?.name}</h3>
                        
                        <div className="flex justify-center md:justify-start gap-8 mb-4 text-white text-lg">
                          <div><span className="font-bold">{posts?.filter(p => p.alumniId === user?.id).length || 0}</span> posts</div>
                        </div>

                        <div className="text-sm">
                          {user?.department && <p className="text-white font-medium text-base">{user.department} {user?.year ? `- ${user.year}` : ''}</p>}
                          {user?.collegeName && <p className="text-slate-300">{user.collegeName}</p>}
                          {user?.about && <p className="text-slate-200 mt-2 whitespace-pre-wrap">{user.about}</p>}
                          {user?.email && <p className="text-slate-400 mt-1">{user.email}</p>}
                          {user?.linkedin && (
                            <a href={user.linkedin.startsWith('http') ? user.linkedin : `https://${user.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 hover:underline mt-1 block">
                              {user.linkedin.replace(/^https?:\/\/(www\.)?/, '')}
                            </a>
                          )}
                        </div>
                      </div>
                    </div>

                    <hr className="border-slate-700" />

                    {/* Profile Grid */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {user?.rollNumber && (
                        <div className="rounded-lg bg-slate-800 p-4">
                          <p className="text-sm text-slate-400">Roll Number</p>
                          <p className="text-white">{user.rollNumber}</p>
                        </div>
                      )}
                      {user?.year && (
                        <div className="rounded-lg bg-slate-800 p-4">
                          <p className="text-sm text-slate-400">Study Year</p>
                          <p className="text-white">{user.year}</p>
                        </div>
                      )}
                      {user?.yearOfJoining && (
                        <div className="rounded-lg bg-slate-800 p-4">
                          <p className="text-sm text-slate-400">Year of Joining</p>
                          <p className="text-white">{user.yearOfJoining}</p>
                        </div>
                      )}
                      {user?.passedOutYear && (
                        <div className="rounded-lg bg-slate-800 p-4">
                          <p className="text-sm text-slate-400">Year of Passing Out</p>
                          <p className="text-white">{user.passedOutYear}</p>
                        </div>
                      )}
                      {user?.linkedin && (
                        <div className="rounded-lg bg-slate-800 p-4">
                          <p className="text-sm text-slate-400">LinkedIn</p>
                          <a href={user.linkedin.startsWith('http') ? user.linkedin : `https://${user.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-[#FFD700] hover:underline block truncate">
                            View Profile
                          </a>
                        </div>
                      )}
                      {user?.resume && (
                        <div className="rounded-lg bg-slate-800 p-4">
                          <p className="text-sm text-slate-400">Resume</p>
                          <a href={user.resume} target="_blank" rel="noopener noreferrer" className="text-[#FFD700] hover:underline block truncate">
                            View Resume
                          </a>
                        </div>
                      )}
                    </div>

                    {/* About Section */}
                    {user?.about && (
                      <>
                        <hr className="border-slate-700" />
                        <div>
                          <p className="text-sm text-slate-400 mb-2">About</p>
                          <p className="text-white">{user.about}</p>
                        </div>
                      </>
                    )}

                    {/* Skills Section */}
{(() => {
  const skillsValue = user?.skills as unknown;

  const skillsList: string[] = Array.isArray(skillsValue)
    ? skillsValue.map((skill: unknown) => String(skill))
    : typeof skillsValue === "string"
    ? skillsValue
        .split(",")
        .map((skill: string) => skill.trim())
        .filter((skill: string) => skill.length > 0)
    : [];

  return skillsList.length > 0 ? (
    <>
      <hr className="border-slate-700" />
      <div>
        <p className="text-sm text-slate-400 mb-3">Skills</p>

        <div className="flex flex-wrap gap-2">
          {skillsList.map((skill: string, idx: number) => (
            <span
              key={idx}
              className="bg-slate-700 text-white px-3 py-1 rounded-lg text-sm"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
    </>
  ) : null;
})()}

                    {/* Career Interest Section - Students Only */}
                    {role === 'student' && user?.careerInterest && (
                      <>
                        <hr className="border-slate-700" />
                        <div>
                          <p className="text-sm text-slate-400 mb-3">Career Interest</p>
                          <div className="space-y-3">
                            <div>
                              <p className="text-slate-300 text-sm">Interest</p>
                              <p className="text-white font-medium">
                                {user.careerInterest === 'HigherEducation' ? 'Higher Education' : user.careerInterest}
                              </p>
                            </div>
                            {user.careerInterest === 'Job' && user?.jobInterest && (
                              <div>
                                <p className="text-slate-300 text-sm">Interested Job</p>
                                <p className="text-white font-medium">{user.jobInterest}</p>
                              </div>
                            )}
                            {user.careerInterest === 'Business' && user?.businessInterest && (
                              <div>
                                <p className="text-slate-300 text-sm">Business Type</p>
                                <p className="text-white font-medium">{user.businessInterest}</p>
                              </div>
                            )}
                            {user.careerInterest === 'HigherEducation' && (
                              <>
                                {user?.higherCourse && (
                                  <div>
                                    <p className="text-slate-300 text-sm">Course</p>
                                    <p className="text-white font-medium">{user.higherCourse}</p>
                                  </div>
                                )}
                                {user?.higherCountry && (
                                  <div>
                                    <p className="text-slate-300 text-sm">Country</p>
                                    <p className="text-white font-medium">{user.higherCountry}</p>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </>
                    )}

                    {/* Other Links */}
                    {(user?.links?.length! > 0) && (
                      <>
                        <hr className="border-slate-700" />
                        <div>
                          <p className="text-sm text-slate-400 mb-3">Links</p>
                          <div className="space-y-2">
                            {user.links?.map((link: any, idx: number) => (
                              <a 
                                key={idx}
                                href={link.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="block bg-slate-800 px-4 py-2 rounded-lg text-[#FFD700] hover:bg-slate-700 hover:underline"
                              >
                                {link.title}
                              </a>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    {/* Logout */}
                    {role && (
                      <>
                        <hr className="border-slate-700" />
                        <div className="flex justify-center">
                          <span 
                            onClick={logout} 
                            className="text-red-600 hover:text-red-700 py-3 px-4 text-center cursor-pointer font-semibold"
                          >
                            Logout
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeMenu === 'chat' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white">Chat</h2>
                
                <div className="text-center py-12 bg-slate-800 rounded-lg border border-slate-700">
                  <MessageCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white">Chat functionality</h3>
                  <p className="text-slate-400">Coming soon...</p>
                </div>
              </div>
            )}

            {activeMenu === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white">Notifications</h2>
                
                <div className="text-center py-12 bg-slate-800 rounded-lg border border-slate-700">
                  <Bell className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white">Notifications</h3>
                  <p className="text-slate-400">Coming soon...</p>
                </div>
              </div>
            )}
          </main>

          {/* Alumni Insights Widget - Right Side on Desktop, Below on Mobile */}
          {role?.toLowerCase() !== 'admin' && activeMenu === 'home' && (
            <aside className="w-full lg:w-[360px] shrink-0 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="sticky top-[156px]">
                <AlumniStatisticsWidget />
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}