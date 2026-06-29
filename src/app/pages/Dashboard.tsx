
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Briefcase, CalendarDays, MessageCircle, User, Plus, Settings, FileText, Bell } from 'lucide-react';
import { Link } from 'react-router';

export function Dashboard() {
  const { user, role, logout, following, posts, jobs, events, isFollowing, isAdminId } = useAuth();

  React.useEffect(() => {
    console.log('[Dashboard] AuthContext user on render:', user);
    console.log('[Dashboard] localStorage allumini_user:', (() => { try { return JSON.parse(localStorage.getItem('allumini_user')||'null'); } catch { return null; } })());
  }, [user]);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <h2 className="text-2xl font-bold mb-4">Please log in to view your dashboard</h2>
        <Link to="/login" className="px-6 py-2 bg-yellow-500 text-slate-900 rounded-md font-bold hover:bg-yellow-400">
          Login
        </Link>
      </div>
    );
  }

  const isAlumni = role === 'alumni';

<<<<<<< Updated upstream
  // Filter data based on who the user follows plus admin-managed content
  // Show admin content (alumniId === 'admin') to ALL users regardless of follow status
  const followedPosts = posts.filter(
    post => following.includes(post.alumniId) || isAdminId(post.alumniId) || (role === 'admin' && user?.id === post.alumniId) || post.alumniId === 'admin'
  );
  const feedPosts = posts;
  const followedJobs = jobs.filter(
    job => following.includes(job.alumniId) || isAdminId(job.alumniId) || (role === 'admin' && user?.id === job.alumniId) || job.alumniId === 'admin'
  );
  const followedEvents = events.filter(
    event => following.includes(event.alumniId) || isAdminId(event.alumniId) || (role === 'admin' && user?.id === event.alumniId) || event.alumniId === 'admin'
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Welcome back{user?.name ? `, ${user.name}` : ''}!
          </h1>
          <p className="text-slate-600 mt-2 capitalize">
            {role || ''} Dashboard • {user?.degree || ''}
          </p>
        </div>
        <div className="flex space-x-4 mt-4 md:mt-0">
          <button className="p-2 bg-white border border-slate-200 rounded-full hover:bg-slate-50 transition-colors relative">
            <Bell className="h-5 w-5 text-slate-600" />
            <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full border border-white"></span>
          </button>
          <button className="p-2 bg-white border border-slate-200 rounded-full hover:bg-slate-50 transition-colors">
            <Settings className="h-5 w-5 text-slate-600" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Stats / Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-3 mb-2">
                <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-slate-900">Messages</h3>
              </div>
<<<<<<< Updated upstream
              <p className="text-2xl font-bold text-slate-900">{followedPosts.length}</p>
              <p className="text-xs text-slate-500">Posts from followed alumni</p>
              <p className="text-2xl font-bold text-slate-900">{feedPosts.length}</p>
              <p className="text-xs text-slate-500">Community posts</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-3 mb-2">
                <div className="bg-green-100 p-2 rounded-lg text-green-600">
                  <CalendarDays className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-slate-900">Events</h3>
              </div>
              <p className="text-2xl font-bold text-slate-900">{followedEvents.length}</p>
              <p className="text-xs text-slate-500">Events from followed alumni</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
               <div className="flex items-center space-x-3 mb-2">
                <div className="bg-purple-100 p-2 rounded-lg text-purple-600">
                  <Briefcase className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-slate-900">Job Posts</h3>
              </div>
              <p className="text-2xl font-bold text-slate-900">{followedJobs.length}</p>
              <p className="text-xs text-slate-500">Job posts from followed alumni</p>
            </div>
          </div>

          {/* Role Specific Content */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900">Mentorship Requests</h3>
              <p className="text-sm text-slate-500 mt-2">Track incoming mentorship requests from your network.</p>
            </div>
            <div className="p-8 text-center text-slate-500">
              <p className="text-lg font-semibold text-slate-900 mb-2">No mentorship requests yet</p>
              <p className="text-sm">Once alumni start connecting with you, their requests will appear here.</p>
            </div>
          </div>

        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {!(user?.profileComplete || user?.collegeName || user?.rollNumber) && (
           <div className="bg-slate-900 text-white p-6 rounded-lg shadow-lg relative overflow-hidden">
             <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-yellow-500/20 rounded-full blur-2xl"></div>
             <h3 className="font-bold text-lg mb-2 relative z-10">Complete Your Profile</h3>
             <div className="w-full bg-slate-800 h-2 rounded-full mb-4 relative z-10">
               <div className="bg-yellow-500 h-2 rounded-full w-3/4"></div>
             </div>
             <p className="text-sm text-slate-300 mb-4 relative z-10">You're 75% there! Add your past work experience to reach 100%.</p>
             <button className="w-full py-2 bg-yellow-500 text-slate-900 font-bold rounded hover:bg-yellow-400 transition-colors relative z-10">
               Update Profile
             </button>
           </div>
          )}

           <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
             <h3 className="font-bold text-slate-900 mb-4">Upcoming Events</h3>
             <div className="space-y-4">
               {followedEvents.slice(0, 2).map((event) => (
                 <div key={event.id} className="flex space-x-3">
                   <div className="bg-slate-100 px-3 py-2 rounded text-center min-w-[3.5rem]">
                     <span className="block text-xs text-slate-500 font-bold uppercase">
                       {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
                     </span>
                     <span className="block text-xl font-bold text-slate-900">
                       {new Date(event.date).getDate()}
                     </span>
                   </div>
                   <div>
                     <h4 className="font-semibold text-slate-900 text-sm">{event.title}</h4>
                     <p className="text-xs text-slate-500">{event.time} • {event.location}</p>
                   </div>
                 </div>
               ))}
               {followedEvents.length === 0 && (
                 <p className="text-sm text-slate-500 text-center py-4">No upcoming events from followed alumni</p>
               )}
             </div>
             <Link to="/events" className="block text-center text-sm text-yellow-600 font-medium mt-4 hover:underline">
               View Calendar
             </Link>
           </div>
        </div>
      </div>
    </div>
  );
}
