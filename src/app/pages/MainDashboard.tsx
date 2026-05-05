import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Search, 
  MessageCircle, 
  Bell, 
  User, 
  Plus,
  Home,
  Users,
  Calendar,
  Briefcase,
  Image as ImageIcon,
  Activity,
  ThumbsUp,
  MessageSquare,
  Share2,
  LogOut,
  Eye,
  EyeOff,
  Edit,
  Save,
  X,
  Camera,
  ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router';

export function MainDashboard() {
  const { user, role, logout, login, posts, jobs, events, following, getAlumniById, alumni } = useAuth();
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('home');
  const [eventView, setEventView] = useState('upcoming');

  if (!user) {
    navigate('/login');
    return null;
  }
*/    

  const canPost = role === 'faculty' || role === 'alumni';

  // Filter posts to only show from followed alumni
  const followedPosts = posts?.filter(post => following?.includes(post.alumniId)) || [];
  
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
  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/';
  };

  const handleAvatarClick = () => {
    avatarInputRef.current?.click();
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setFormData(prev => ({ ...prev, avatar: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResumeUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setFormData(prev => ({ ...prev, resume: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const addLink = () => {
    if (newLinkTitle.trim() && newLinkUrl.trim()) {
      setFormData(prev => ({
        ...prev,
        links: [...prev.links, { title: newLinkTitle.trim(), url: newLinkUrl.trim() }]
      }));
      setNewLinkTitle('');
      setNewLinkUrl('');
    }
  };

  const removeLink = (index: number) => {
    setProfileData(prev => ({
      ...prev,
      links: prev.links.filter((_, i) => i !== index)
    }));
  };

  const saveProfile = () => {
    if (user) {
      login({ ...user, ...formData });
    }
    setIsEditing(false);
  };

  const cancelEdit = () => {
    setFormData({
      avatar: user?.avatar || '',
      collegeName: user?.collegeName || '',
      rollNumber: user?.rollNumber || '',
      year: user?.year || '',
      department: user?.department || '',
      about: user?.about || '',
      linkedin: user?.linkedin || '',
      resume: user?.resume || '',
      skills: user?.skills || [],
      links: user?.links || []
    });
    setIsEditing(false);
  };
  return (
    <div className="min-h-screen bg-black text-white pb-28">
      {/* Top Navbar */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-[#FFD700]">Alumni Connect</h1>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl mx-8 hidden md:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search alumni, posts, opportunities..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-transparent"
                />
              </div>
            </div>

            {/* Right Icons */}
            <div className="flex items-center space-x-4">
              {canPost && (
                <button className="p-2 hover:bg-slate-800 rounded-lg transition-colors group">
                  <Plus className="h-6 w-6 text-[#FFD700] group-hover:text-yellow-400" />
                </button>
              )}
              <button 
                onClick={() => setActiveMenu('chat')}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors relative"
              >
                <MessageCircle className="h-6 w-6 text-slate-300" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-[#FFD700] rounded-full"></span>
              </button>
              <button 
                onClick={() => setActiveMenu('notifications')}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors relative"
              >
                <Bell className="h-6 w-6 text-slate-300" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-[#FFD700] rounded-full"></span>
              </button>
              <button className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
                <img 
                  src={user?.avatar || 'https://ui-avatars.com/api/?name=User&background=FDE68A&color=111827&size=256'} 
                  alt={user?.name || 'User'}
                  className="h-8 w-8 rounded-full object-cover border-2 border-[#FFD700]"
                />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-slate-900 rounded-lg border border-slate-800 overflow-hidden sticky top-20">
              {/* User Profile Card */}
              <div className="p-4 border-b border-slate-800">
                <div className="flex items-center space-x-3 mb-3">
                  <img 
                    src={user?.avatar || 'https://ui-avatars.com/api/?name=User&background=FDE68A&color=111827&size=256'} 
                    alt={user?.name || 'User'}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-semibold text-white">{user?.name || 'User'}</h3>
                    <p className="text-sm text-slate-400 capitalize">{role}</p>
                  </div>
                </div>
                {user?.position && (
                  <p className="text-sm text-slate-300">{user.position}</p>
                )}
                {user?.company && (
                  <p className="text-xs text-slate-400">{user.company}</p>
                )}
                {user?.email && (
                  <p className="text-xs text-slate-400 mt-1">{user.email}</p>
                )}
                <div className="mt-2 space-y-1">
                  {user?.linkedin && (
                    <a 
                      href={user.linkedin} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block text-xs text-blue-400 hover:text-blue-300"
                    >
                      LinkedIn
                    </a>
                  )}
                  {user?.github && (
                    <a 
                      href={user.github} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block text-xs text-blue-400 hover:text-blue-300"
                    >
                      GitHub
                    </a>
                  )}
                  {user?.portfolio && (
                    <a 
                      href={user.portfolio} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block text-xs text-blue-400 hover:text-blue-300"
                    >
                      Portfolio
                    </a>
                  )}
                </div>
              </div>

            </div>
          </aside>

          {/* Main Content Area */}
          <main className="lg:col-span-3 space-y-6">
            {activeMenu === 'home' && (
              <>
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
                        <div className="flex items-center space-x-4 mt-3">
                          <button className="text-sm text-slate-400 hover:text-[#FFD700] transition-colors">
                            <ImageIcon className="h-5 w-5 inline mr-1" />
                            Photo
                          </button>
                          <button className="text-sm text-slate-400 hover:text-[#FFD700] transition-colors">
                            <Briefcase className="h-5 w-5 inline mr-1" />
                            Job
                          </button>
                          <button className="text-sm text-slate-400 hover:text-[#FFD700] transition-colors">
                            <Calendar className="h-5 w-5 inline mr-1" />
                            Event
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Posts Feed */}
                <div className="space-y-4">
                  {followedPosts.map((post) => {
                    const author = getAlumniById(post.alumniId);
                    if (!author) return null;
                    
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
                                <p className="text-xs text-slate-500">{post.timestamp}</p>
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
                            </div>
                          </div>
                        </div>

                        {/* Post Content */}
                        <div className="px-4 pb-3">
                          <p className="text-slate-200">{post.content}</p>
                        </div>

                        {/* Post Image */}
                        {post.image && (
                          <img 
                            src={post.image} 
                            alt="Post content"
                            className="w-full h-64 object-cover"
                          />
                        )}

                        {/* Post Actions */}
                        <div className="px-4 py-3 border-t border-slate-800">
                          <div className="flex items-center justify-between text-sm text-slate-400 mb-3">
                            <span>{post.likes || 0} likes</span>
                            <span>{post.comments || 0} comments</span>
                          </div>
                          <div className="flex items-center justify-around border-t border-slate-800 pt-2">
                            <button className="flex items-center space-x-2 px-4 py-2 text-slate-300 hover:text-[#FFD700] hover:bg-slate-800 rounded-lg transition-colors">
                              <ThumbsUp className="h-5 w-5" />
                              <span>Like</span>
                            </button>
                            <button className="flex items-center space-x-2 px-4 py-2 text-slate-300 hover:text-[#FFD700] hover:bg-slate-800 rounded-lg transition-colors">
                              <MessageSquare className="h-5 w-5" />
                              <span>Comment</span>
                            </button>
                            <button className="flex items-center space-x-2 px-4 py-2 text-slate-300 hover:text-[#FFD700] hover:bg-slate-800 rounded-lg transition-colors">
                              <Share2 className="h-5 w-5" />
                              <span>Share</span>
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                  
                  {followedPosts.length === 0 && (
                    <div className="text-center py-12 bg-slate-800 rounded-lg border border-slate-700">
                      <MessageSquare className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-white">No posts yet</h3>
                      <p className="text-slate-400">Follow some alumni to see their posts here.</p>
                    </div>
                  )}
                </div>
              </>
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
                      <Calendar className="h-12 w-12 text-slate-400 mx-auto mb-4" />
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
                            <span>Posted {job.postedDate}</span>
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

            {activeMenu === 'status' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white">Activity</h2>
                
                <div className="bg-slate-900 rounded-lg border border-slate-800 p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Your Activity</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg">
                      <div>
                        <h4 className="font-semibold text-white">Posts Created</h4>
                        <p className="text-sm text-slate-400">Content you've shared</p>
                      </div>
                      <span className="text-2xl font-bold text-[#FFD700]">0</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg">
                      <div>
                        <h4 className="font-semibold text-white">Following</h4>
                        <p className="text-sm text-slate-400">Alumni you follow</p>
                      </div>
                      <span className="text-2xl font-bold text-[#FFD700]">{following?.length || 0}</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg">
                      <div>
                        <h4 className="font-semibold text-white">Events Attended</h4>
                        <p className="text-sm text-slate-400">Events you've participated in</p>
                      </div>
                      <span className="text-2xl font-bold text-[#FFD700]">0</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeMenu === 'profile' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Profile</h2>
                    <p className="text-sm text-slate-400 mt-1">Keep your student profile up to date.</p>
                  </div>
                  <div className="flex items-center gap-4">
                    {!isEditing ? (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-[#FFD700] text-black rounded-lg font-semibold hover:bg-yellow-600 transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                        Edit Profile
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={saveProfile}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                        >
                          <Save className="h-4 w-4" />
                          Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
                        >
                          <X className="h-4 w-4" />
                          Cancel
                        </button>
                      </div>
                    )}
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                </div>

                <div className="bg-slate-900 rounded-lg border border-slate-800 p-6 space-y-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={handleAvatarClick}
                        className="h-24 w-24 rounded-full overflow-hidden border-4 border-[#FFD700] focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
                      >
                        <img
                          src={formData.avatar || user?.avatar || 'https://ui-avatars.com/api/?name=User&background=FDE68A&color=111827&size=256'}
                          alt={fullName}
                          className="h-full w-full object-cover"
                        />
                      </button>
                      <input
                        type="file"
                        accept="image/*"
                        ref={avatarInputRef}
                        hidden
                        onChange={handleAvatarUpload}
                      />
                      <div>
                        <h3 className="text-2xl font-bold text-white">{fullName}</h3>
                        {user?.email && <p className="text-slate-400">{user.email}</p>}
                        <p className="text-slate-400 capitalize">{role}</p>
                      </div>
                    </div>
                    {isEditing && (
                      <label className="inline-flex items-center gap-2 rounded-lg bg-[#FFD700] px-4 py-2 text-black hover:bg-yellow-600 transition-colors cursor-pointer">
                        <Camera className="h-4 w-4" />
                        Upload Avatar
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-slate-300 mb-2">College Name *</label>
                        <input
                          type="text"
                          value={formData.collegeName}
                          onChange={(e) => setFormData(prev => ({ ...prev, collegeName: e.target.value }))}
                          className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder-slate-400 focus:border-[#FFD700] focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Roll Number *</label>
                        <input
                          type="text"
                          value={formData.rollNumber}
                          onChange={(e) => setFormData(prev => ({ ...prev, rollNumber: e.target.value }))}
                          className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder-slate-400 focus:border-[#FFD700] focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Year *</label>
                        <select
                          value={formData.year}
                          onChange={(e) => setFormData(prev => ({ ...prev, year: e.target.value }))}
                          className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-[#FFD700] focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
                        >
                          <option value="">Select Year</option>
                          <option value="1st Year">1st Year</option>
                          <option value="2nd Year">2nd Year</option>
                          <option value="3rd Year">3rd Year</option>
                          <option value="4th Year">4th Year</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Department *</label>
                        <input
                          type="text"
                          value={formData.department}
                          onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                          className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder-slate-400 focus:border-[#FFD700] focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-slate-300 mb-2">LinkedIn URL *</label>
                        <input
                          type="url"
                          value={formData.linkedin}
                          onChange={(e) => setFormData(prev => ({ ...prev, linkedin: e.target.value }))}
                          className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder-slate-400 focus:border-[#FFD700] focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-slate-300 mb-2">About</label>
                        <textarea
                          placeholder="Write about yourself..."
                          value={formData.about || ""}
                          onChange={(e) => setFormData(prev => ({ ...prev, about: e.target.value }))}
                          rows={4}
                          className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder-slate-400 focus:border-[#FFD700] focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-slate-300 mb-2">Skills *</label>
                        <div className="space-y-3">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={newSkill}
                              onChange={(e) => setNewSkill(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                              className="flex-1 rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder-slate-400 focus:border-[#FFD700] focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
                              placeholder="Add a skill"
                            />
                            <button
                              type="button"
                              onClick={addSkill}
                              className="rounded-md bg-[#FFD700] px-4 py-2 font-semibold text-black hover:bg-yellow-600 transition-colors"
                            >
                              Add
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {formData.skills.map((skill, index) => (
                              <span key={index} className="inline-flex items-center gap-2 rounded-full bg-slate-700 px-3 py-1 text-sm text-white">
                                {skill}
                                <button type="button" onClick={() => removeSkill(skill)} className="text-slate-300 hover:text-red-400">
                                  <X className="h-3 w-3" />
                                </button>
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-slate-300 mb-2">Resume Upload *</label>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={handleResumeUpload}
                          className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#FFD700] file:text-black hover:file:bg-yellow-600"
                        />
                        {formData.resume && (
                          <p className="mt-2 text-slate-300 text-sm">Resume is ready to view after saving.</p>
                        )}
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-slate-300 mb-2">Other Links</label>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                          <input
                            type="text"
                            value={newLinkTitle}
                            onChange={(e) => setNewLinkTitle(e.target.value)}
                            className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder-slate-400 focus:border-[#FFD700] focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
                            placeholder="Title"
                          />
                          <input
                            type="url"
                            value={newLinkUrl}
                            onChange={(e) => setNewLinkUrl(e.target.value)}
                            className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder-slate-400 focus:border-[#FFD700] focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
                            placeholder="URL"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={addLink}
                          className="mt-3 rounded-md bg-[#FFD700] px-4 py-2 font-semibold text-black hover:bg-yellow-600 transition-colors"
                        >
                          + Add Link
                        </button>
                        {profileData.links.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {profileData.links.map((link, index) => (
                              <div key={index} className="flex items-center justify-between rounded-md bg-slate-800 px-3 py-2">
                                <div>
                                  <p className="text-white font-medium">{link.title}</p>
                                  <p className="text-slate-400 text-sm break-all">{link.url}</p>
                                </div>
                                <button type="button" onClick={() => removeLink(index)} className="text-red-400 hover:text-red-300">
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {hasProfileDetails ? (
                        <>
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {profileData.collegeName && (
                              <div>
                                <p className="text-sm font-medium text-slate-300 mb-2">College Name</p>
                                <p className="rounded-md bg-slate-800 p-3 text-white">{profileData.collegeName}</p>
                              </div>
                            )}
                            {profileData.rollNumber && (
                              <div>
                                <p className="text-sm font-medium text-slate-300 mb-2">Roll Number</p>
                                <p className="rounded-md bg-slate-800 p-3 text-white">{profileData.rollNumber}</p>
                              </div>
                            )}
                            {profileData.year && (
                              <div>
                                <p className="text-sm font-medium text-slate-300 mb-2">Year</p>
                                <p className="rounded-md bg-slate-800 p-3 text-white">{profileData.year}</p>
                              </div>
                            )}
                            {profileData.department && (
                              <div>
                                <p className="text-sm font-medium text-slate-300 mb-2">Department</p>
                                <p className="rounded-md bg-slate-800 p-3 text-white">{profileData.department}</p>
                              </div>
                            )}
                          </div>

                          {profileData.skills.length > 0 && (
                            <div>
                              <p className="text-sm font-medium text-slate-300 mb-2">Skills</p>
                              <div className="flex flex-wrap gap-2">
                                {profileData.skills.map((skill, index) => (
                                  <span key={index} className="rounded-full bg-slate-700 px-3 py-1 text-sm text-white">{skill}</span>
                                ))}
                              </div>
                            </div>
                          )}

                          {(profileData.linkedin || profileData.links.length > 0) && (
                            <div>
                              <p className="text-sm font-medium text-slate-300 mb-2">Links</p>
                              <div className="space-y-2">
                                {profileData.linkedin && (
                                  <a
                                    href={profileData.linkedin}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-[#FFD700] hover:text-yellow-400 transition-colors"
                                  >
                                    <ExternalLink className="h-4 w-4" />
                                    LinkedIn
                                  </a>
                                )}
                                {profileData.links.map((link, index) => (
                                  <a
                                    key={index}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-[#FFD700] hover:text-yellow-400 transition-colors"
                                  >
                                    <ExternalLink className="h-4 w-4" />
                                    {link.title}
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}

                          {profileData.about && (
                            <div>
                              <p className="text-sm font-medium text-slate-300 mb-2">About</p>
                              <p className="rounded-md bg-slate-800 p-3 text-slate-200 whitespace-pre-line">
                                {profileData.about}
                              </p>
                            </div>
                          )}

                          {profileData.resume && (
                            <div>
                              <p className="text-sm font-medium text-slate-300 mb-2">Resume</p>
                              <a
                                href={profileData.resume}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 rounded-md bg-[#FFD700] px-4 py-2 text-black font-semibold hover:bg-yellow-600 transition-colors"
                              >
                                <ExternalLink className="h-4 w-4" />
                                View Resume
                              </a>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="min-h-[220px] rounded-lg border border-dashed border-slate-700 bg-slate-950"></div>
                      )}
                    </div>
                  )}
                </div>
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
        </div>
      </div>

      <footer className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-800 bg-black/95 backdrop-blur-xl shadow-[0_-4px_30px_rgba(0,0,0,0.55)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-5 gap-1 py-2">
            <button
              onClick={() => setActiveMenu('home')}
              className={`flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[0.72rem] transition ${
                activeMenu === 'home' ? 'bg-[#FFD700] text-black' : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Home className="h-5 w-5" />
              <span>Home</span>
            </button>
            <button
              onClick={() => setActiveMenu('status')}
              className={`flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[0.72rem] transition ${
                activeMenu === 'status' ? 'bg-[#FFD700] text-black' : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Activity className="h-5 w-5" />
              <span>Activity</span>
            </button>
            <button
              onClick={() => setActiveMenu('events')}
              className={`flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[0.72rem] transition ${
                activeMenu === 'events' ? 'bg-[#FFD700] text-black' : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Calendar className="h-5 w-5" />
              <span>Events</span>
            </button>
            <button
              onClick={() => setActiveMenu('community')}
              className={`flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[0.72rem] transition ${
                activeMenu === 'community' ? 'bg-[#FFD700] text-black' : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Users className="h-5 w-5" />
              <span>Community</span>
            </button>
            <button
              onClick={() => setActiveMenu('profile')}
              className={`flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[0.72rem] transition ${
                activeMenu === 'profile' ? 'bg-[#FFD700] text-black' : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <User className="h-5 w-5" />
              <span>Profile</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
