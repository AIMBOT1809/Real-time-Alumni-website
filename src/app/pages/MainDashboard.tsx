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
  Network,
  Calendar,
  Briefcase,
  Image as ImageIcon,
  Activity,
  ThumbsUp,
  MessageSquare,
  Share2
} from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { POSTS_DATA, EVENTS_DATA, JOBS_DATA } from '../data/mock';

export function MainDashboard() {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('home');

  if (!user) {
    navigate('/login');
    return null;
  }

  const canPost = role === 'faculty' || role === 'alumni';

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Top Navbar */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-yellow-500">Allumini</h1>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl mx-8 hidden md:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search alumni, posts, opportunities..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Right Icons */}
            <div className="flex items-center space-x-4">
              {canPost && (
                <button className="p-2 hover:bg-slate-800 rounded-lg transition-colors group">
                  <Plus className="h-6 w-6 text-yellow-500 group-hover:text-yellow-400" />
                </button>
              )}
              <button className="p-2 hover:bg-slate-800 rounded-lg transition-colors relative">
                <MessageCircle className="h-6 w-6 text-slate-300" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-yellow-500 rounded-full"></span>
              </button>
              <button className="p-2 hover:bg-slate-800 rounded-lg transition-colors relative">
                <Bell className="h-6 w-6 text-slate-300" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-yellow-500 rounded-full"></span>
              </button>
              <button className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
                <img 
                  src={user.avatar} 
                  alt={user.name}
                  className="h-8 w-8 rounded-full object-cover border-2 border-yellow-500"
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
                    src={user.avatar} 
                    alt={user.name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-semibold text-white">{user.name}</h3>
                    <p className="text-sm text-slate-400 capitalize">{role}</p>
                  </div>
                </div>
                {user.position && (
                  <p className="text-sm text-slate-300">{user.position}</p>
                )}
                {user.company && (
                  <p className="text-xs text-slate-400">{user.company}</p>
                )}
              </div>

              {/* Navigation Menu */}
              <nav className="p-2">
                <button
                  onClick={() => setActiveMenu('home')}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    activeMenu === 'home' ? 'bg-yellow-500 text-black' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Home className="h-5 w-5" />
                  <span className="font-medium">Home</span>
                </button>
                
                <button
                  onClick={() => setActiveMenu('community')}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    activeMenu === 'community' ? 'bg-yellow-500 text-black' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Users className="h-5 w-5" />
                  <span className="font-medium">Community Discussion</span>
                </button>
                
                <button
                  onClick={() => setActiveMenu('network')}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    activeMenu === 'network' ? 'bg-yellow-500 text-black' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Network className="h-5 w-5" />
                  <span className="font-medium">Network</span>
                </button>
                
                <button
                  onClick={() => setActiveMenu('events')}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    activeMenu === 'events' ? 'bg-yellow-500 text-black' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Calendar className="h-5 w-5" />
                  <span className="font-medium">Events</span>
                </button>
                
                <button
                  onClick={() => setActiveMenu('opportunities')}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    activeMenu === 'opportunities' ? 'bg-yellow-500 text-black' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Briefcase className="h-5 w-5" />
                  <span className="font-medium">Opportunities</span>
                </button>
                
                <button
                  onClick={() => setActiveMenu('past-events')}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    activeMenu === 'past-events' ? 'bg-yellow-500 text-black' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <ImageIcon className="h-5 w-5" />
                  <span className="font-medium">Past Events</span>
                </button>
                
                <button
                  onClick={() => setActiveMenu('status')}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    activeMenu === 'status' ? 'bg-yellow-500 text-black' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Activity className="h-5 w-5" />
                  <span className="font-medium">Status</span>
                </button>
              </nav>
            </div>
          </aside>

          {/* Main Feed */}
          <main className="lg:col-span-3 space-y-6">
            
            {/* Create Post (for Faculty and Alumni) */}
            {canPost && (
              <div className="bg-slate-900 rounded-lg border border-slate-800 p-4">
                <div className="flex items-start space-x-3">
                  <img 
                    src={user.avatar} 
                    alt={user.name}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Share something with the community..."
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                    <div className="flex items-center space-x-4 mt-3">
                      <button className="text-sm text-slate-400 hover:text-yellow-500 transition-colors">
                        <ImageIcon className="h-5 w-5 inline mr-1" />
                        Photo
                      </button>
                      <button className="text-sm text-slate-400 hover:text-yellow-500 transition-colors">
                        <Briefcase className="h-5 w-5 inline mr-1" />
                        Job
                      </button>
                      <button className="text-sm text-slate-400 hover:text-yellow-500 transition-colors">
                        <Calendar className="h-5 w-5 inline mr-1" />
                        Event
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Event Highlight */}
            <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-6 text-black">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-2">Upcoming Event: Tech Career Workshop</h3>
                  <p className="mb-4">March 25, 2024 at 2:00 PM • Online (Zoom)</p>
                  <button className="px-4 py-2 bg-black text-yellow-500 rounded-lg font-semibold hover:bg-slate-900 transition-colors">
                    Register Now
                  </button>
                </div>
                <Calendar className="h-16 w-16 opacity-50" />
              </div>
            </div>

            {/* Posts Feed */}
            <div className="space-y-4">
              {POSTS_DATA.map((post) => (
                <article key={post.id} className="bg-slate-900 rounded-lg border border-slate-800 overflow-hidden">
                  {/* Post Header */}
                  <div className="p-4 flex items-start space-x-3">
                    <img 
                      src={post.author.avatar} 
                      alt={post.author.name}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-white">{post.author.name}</h4>
                          <p className="text-sm text-slate-400">
                            {post.author.position} at {post.author.company}
                          </p>
                          <p className="text-xs text-slate-500">{post.timestamp}</p>
                        </div>
                        {post.type === 'opportunity' && (
                          <span className="px-3 py-1 bg-yellow-500 text-black text-xs font-bold rounded-full">
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
                      <span>{post.likes} likes</span>
                      <span>{post.comments} comments</span>
                    </div>
                    <div className="flex items-center justify-around border-t border-slate-800 pt-2">
                      <button className="flex items-center space-x-2 px-4 py-2 text-slate-300 hover:text-yellow-500 hover:bg-slate-800 rounded-lg transition-colors">
                        <ThumbsUp className="h-5 w-5" />
                        <span>Like</span>
                      </button>
                      <button className="flex items-center space-x-2 px-4 py-2 text-slate-300 hover:text-yellow-500 hover:bg-slate-800 rounded-lg transition-colors">
                        <MessageSquare className="h-5 w-5" />
                        <span>Comment</span>
                      </button>
                      <button className="flex items-center space-x-2 px-4 py-2 text-slate-300 hover:text-yellow-500 hover:bg-slate-800 rounded-lg transition-colors">
                        <Share2 className="h-5 w-5" />
                        <span>Share</span>
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Opportunity Highlights */}
            <div className="bg-slate-900 rounded-lg border border-slate-800 p-6">
              <h3 className="text-xl font-bold text-white mb-4">Latest Opportunities</h3>
              <div className="space-y-4">
                {JOBS_DATA.slice(0, 2).map((job) => (
                  <div key={job.id} className="bg-slate-800 rounded-lg p-4 border border-slate-700 hover:border-yellow-500 transition-colors">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-white mb-1">{job.title}</h4>
                        <p className="text-sm text-slate-300 mb-2">{job.company}</p>
                        <div className="flex items-center space-x-3 text-xs text-slate-400">
                          <span className="px-2 py-1 bg-slate-700 rounded">{job.type}</span>
                          <span>{job.location}</span>
                        </div>
                      </div>
                      <button className="px-4 py-2 bg-yellow-500 text-black rounded-lg font-semibold hover:bg-yellow-400 transition-colors text-sm">
                        Apply
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <Link 
                to="/opportunities" 
                className="block text-center text-yellow-500 hover:text-yellow-400 font-medium mt-4"
              >
                View All Opportunities →
              </Link>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
