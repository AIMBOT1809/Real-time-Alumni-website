import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { supabase } from '../../supabaseClient';
import ArrowLeft from 'lucide-react/dist/esm/icons/arrow-left';
import FileText from 'lucide-react/dist/esm/icons/file-text';
import CalendarCheck from 'lucide-react/dist/esm/icons/calendar-check';

export function AdminUserProfile() {
  const { email } = useParams();
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!email) return;
      try {
        // Fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from('alumni_profiles')
          .select('*')
          .eq('Email_Address', email)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error("Error fetching profile", profileError);
        }

        if (profileData) {
          setProfile(profileData);
          
          // Fetch posts (the schema has user_id or alumni_id)
          const { data: postsData } = await supabase
            .from('posts')
            .select('*')
            .eq('alumni_id', profileData.user_id)
            .order('created_at', { ascending: false });
          
          if (postsData) setPosts(postsData);

          // Fetch events
          const { data: eventsData } = await supabase
            .from('events')
            .select('*')
            .eq('user_id', profileData.user_id)
            .order('created_at', { ascending: false });

          if (eventsData) setEvents(eventsData);
        }
      } catch (err) {
        console.error("Error loading user profile", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [email]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-yellow-400 border-t-transparent"></div>
          <p className="mt-4 text-slate-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 flex items-center justify-center">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-xl border border-slate-100">
          <h2 className="text-2xl font-bold text-slate-900">User Not Found</h2>
          <p className="mt-3 text-slate-500">Could not find a user with email <span className="font-semibold text-slate-700">{email}</span></p>
          <Link to="/admin" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-slate-800 hover:shadow-lg">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-slate-200 px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl flex items-center gap-4">
          <Link to="/admin" className="rounded-xl p-2 text-slate-500 bg-slate-100 hover:bg-yellow-400 hover:text-slate-900 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{profile.First_Name} {profile.Last_name}</h1>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{profile.role}</p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Profile Details Sidebar */}
          <div className="space-y-6">
            <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-200 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-yellow-400 to-amber-500"></div>
              <div className="relative flex flex-col items-center mt-12 text-center">
                <img
                  src={profile.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.First_Name || 'User')}&background=e2e8f0&color=475569&size=128`}
                  alt="Profile"
                  className="h-32 w-32 rounded-full border-4 border-white shadow-xl object-cover bg-white"
                />
                <h2 className="mt-6 text-2xl font-bold text-slate-900">{profile.First_Name} {profile.Last_name}</h2>
                <span className="mt-3 inline-flex items-center rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white uppercase tracking-wider shadow-md">
                  {profile.role}
                </span>
              </div>

              <div className="mt-8 space-y-6">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Email Address</p>
                  <p className="text-slate-900 font-medium">{profile.Email_Address || '—'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Phone Number</p>
                  <p className="text-slate-900 font-medium">{profile.Phone_Number || '—'}</p>
                </div>
                {(profile.Year_of_Joining || profile.Passed_Out_Year) && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Joined</p>
                      <p className="text-slate-900 font-medium">{profile.Year_of_Joining || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Graduated</p>
                      <p className="text-slate-900 font-medium">{profile.Passed_Out_Year || '—'}</p>
                    </div>
                  </div>
                )}
                {profile.College_Name && (
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Institution</p>
                    <p className="text-slate-900 font-medium">{profile.College_Name}</p>
                  </div>
                )}
                {profile.Department && (
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Department</p>
                    <p className="text-slate-900 font-medium">{profile.Department}</p>
                  </div>
                )}
                {profile.about && (
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">About</p>
                    <p className="text-slate-700 whitespace-pre-wrap leading-relaxed text-sm">{profile.about}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Activity Main Area */}
          <div className="lg:col-span-2 space-y-8">
            <section className="rounded-3xl bg-white shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-slate-50/50 border-b border-slate-100 p-6 flex items-center gap-3">
                <div className="p-2.5 bg-blue-100 text-blue-600 rounded-xl">
                  <FileText className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">User Activity (Posts)</h3>
                <span className="ml-auto bg-slate-100 text-slate-600 py-1 px-3 rounded-full text-sm font-semibold">{posts.length}</span>
              </div>
              <div className="p-6 space-y-6">
                {posts.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl">
                    <p className="text-slate-500 font-medium">No posts published yet.</p>
                  </div>
                ) : (
                  posts.map(post => (
                    <div key={post.id} className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                      {post.title && <h4 className="text-lg font-bold text-slate-900 mb-2">{post.title}</h4>}
                      <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{post.content}</p>
                      {post.image && (
                        <img src={post.image} alt="Post attachment" className="mt-4 w-full max-h-80 rounded-xl object-cover" />
                      )}
                      <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                        <p className="text-sm font-medium text-slate-500">
                          {new Date(post.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wider
                          ${post.status === 'approved' ? 'bg-green-100 text-green-700' : post.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                          {post.status || 'Published'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            {events.length > 0 && (
              <section className="rounded-3xl bg-white shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-50/50 border-b border-slate-100 p-6 flex items-center gap-3">
                  <div className="p-2.5 bg-orange-100 text-orange-600 rounded-xl">
                    <CalendarCheck className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Events Organized</h3>
                  <span className="ml-auto bg-slate-100 text-slate-600 py-1 px-3 rounded-full text-sm font-semibold">{events.length}</span>
                </div>
                <div className="p-6 space-y-6">
                  {events.map(event => (
                    <div key={event.id} className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow border-l-4 border-l-orange-400">
                      <h4 className="text-lg font-bold text-slate-900">{event.title}</h4>
                      <p className="mt-2 text-slate-700 leading-relaxed">{event.description}</p>
                      <div className="mt-4 flex flex-wrap gap-4 text-sm font-medium text-slate-500 bg-slate-50 p-4 rounded-xl">
                        {event.date && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-400">Date:</span> {event.date}
                          </div>
                        )}
                        {event.location && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-400">Location:</span> {event.location}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
