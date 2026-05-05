import React, { useState , useEffect } from 'react';
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
  Share2
} from 'lucide-react';
import { useNavigate } from 'react-router';

export function MainDashboard() {
  const { user, role, logout, posts, jobs, events, following, getAlumniById, alumni } = useAuth();
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('home');
  const [eventView, setEventView] = useState('upcoming');
  useEffect(() => {
  if (!user) {
    navigate('/login');
  }
}, [user]);

if (!user) return null;
 
/*
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
                <h2 className="text-2xl font-bold text-white">Profile</h2>

                <div className="bg-slate-900 rounded-lg border border-slate-800 p-6 space-y-6">
                  <div className="flex items-center gap-4">
                    <img
                      src={user?.avatar || 'https://ui-avatars.com/api/?name=User&background=FDE68A&color=111827&size=256'}
                      alt={user?.name || 'User'}
                      className="h-20 w-20 rounded-full object-cover border-2 border-[#FFD700]"
                    />
                    <div>
                      <h3 className="text-xl font-bold text-white">{user?.name || 'User'}</h3>
                      <p className="text-slate-400 capitalize">{role}</p>
                      {user?.company && <p className="text-slate-400 text-sm">{user.company}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {user?.email && (
                      <div className="rounded-lg bg-slate-800 p-4">
                        <p className="text-sm text-slate-400">Email</p>
                        <p className="text-white">{user.email}</p>
                      </div>
                    )}
                    {user?.collegeName && (
                      <div className="rounded-lg bg-slate-800 p-4">
                        <p className="text-sm text-slate-400">College Name</p>
                        <p className="text-white">{user.collegeName}</p>
                      </div>
                    )}
                    {user?.department && (
                      <div className="rounded-lg bg-slate-800 p-4">
                        <p className="text-sm text-slate-400">Department</p>
                        <p className="text-white">{user.department}</p>
                      </div>
                    )}
                    {user?.year && (
                      <div className="rounded-lg bg-slate-800 p-4">
                        <p className="text-sm text-slate-400">Year</p>
                        <p className="text-white">{user.year}</p>
                      </div>
                    )}
                    {user?.cgpa && (
                      <div className="rounded-lg bg-slate-800 p-4">
                        <p className="text-sm text-slate-400">CGPA</p>
                        <p className="text-white">{user.cgpa}</p>
                      </div>
                    )}
                    {user?.phoneNumber && (
                      <div className="rounded-lg bg-slate-800 p-4">
                        <p className="text-sm text-slate-400">Phone Number</p>
                        <p className="text-white">{user.phoneNumber}</p>
                      </div>
                    )}
                    {user?.linkedin && (
                      <div className="rounded-lg bg-slate-800 p-4">
                        <p className="text-sm text-slate-400">LinkedIn</p>
                        <a href={user.linkedin} target="_blank" rel="noopener noreferrer" className="text-[#FFD700] hover:underline block truncate">
                          {user.linkedin}
                        </a>
                      </div>
                    )}
                    {user?.github && (
                      <div className="rounded-lg bg-slate-800 p-4">
                        <p className="text-sm text-slate-400">GitHub</p>
                        <a href={user.github} target="_blank" rel="noopener noreferrer" className="text-[#FFD700] hover:underline block truncate">
                          {user.github}
                        </a>
                      </div>
                    )}
                    {user?.portfolio && (
                      <div className="rounded-lg bg-slate-800 p-4">
                        <p className="text-sm text-slate-400">Portfolio</p>
                        <a href={user.portfolio} target="_blank" rel="noopener noreferrer" className="text-[#FFD700] hover:underline block truncate">
                          {user.portfolio}
                        </a>
                      </div>
                    )}
                    {user?.resume && (
                      <div className="rounded-lg bg-slate-800 p-4">
                        <p className="text-sm text-slate-400">Resume</p>
                        <a href={user.resume} target="_blank" rel="noopener noreferrer" className="text-[#FFD700] hover:underline block truncate">
                          View/Download Resume
                        </a>
                      </div>
                    )}
                  </div>

                  {user?.about && (
                    <div className="rounded-lg bg-slate-800 p-4">
                      <p className="text-sm text-slate-400 mb-2">About</p>
                      <p className="text-white">{user.about}</p>
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
