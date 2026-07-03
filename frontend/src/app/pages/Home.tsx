import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import collegeLogo from '../../assests/college-logo.png';
import { supabase } from '../../supabaseClient';
import { AlumniWallOfFame } from '../components/AlumniWallOfFame';

// Banner images configuration - You can replace these URLs with your own images
// Local video path: put your video at public/clgvideo.mp4
const LOCAL_VIDEO_PATH = '/clgvideo.mp4';
const bannerImages: Array<any> = [
  // Example video slide - change or remove if not needed
  {
    type: 'video',
    url: LOCAL_VIDEO_PATH,
    alt: 'TKR Educational Society Campus',
    title: 'Welcome to Alumni Connect',
    subtitle: 'Building Bridges Between Past and Present'
  },
  {
    url: "campus.png",
    title: 'Connect • Inspire • Grow',
    subtitle: 'Watch moments from our community'
  },
  {
    url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070&auto=format&fit=crop',
    alt: 'Graduation Ceremony',
    title: 'Celebrate Success Together',
    subtitle: 'Connect with Thousands of Alumni Worldwide'
  },
  {
    url: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=2070&auto=format&fit=crop',
    alt: 'Students Collaboration',
    title: 'Mentorship & Growth',
    subtitle: 'Learn from Experienced Professionals'
  },
  {
    url: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?q=80&w=2069&auto=format&fit=crop',
    alt: 'Professional Networking',
    title: 'Career Opportunities Await',
    subtitle: 'Discover Jobs and Internships from Alumni Network'
  }
];
type AlumniHighlight = {
  id: string;
  title: string;
  images: string[];
  published: boolean;
  created_at?: string;
};
type SiteStats = {
  totalRegistrations: number;
  totalPosts: number;
  totalAlumni: number;
};
type HomeEvent = {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  type: string;
  image: string;
  description?: string;
};

export function Home() {
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [showHighlights, setShowHighlights] = useState(false);
  const [alumniHighlights, setAlumniHighlights] = useState<AlumniHighlight[]>([]);
const [loadingHighlights, setLoadingHighlights] = useState(true);
const [selectedHighlight, setSelectedHighlight] = useState<AlumniHighlight | null>(null);

const [siteStats, setSiteStats] = useState<SiteStats>({
  totalRegistrations: 0,
  totalPosts: 0,
  totalAlumni: 0,
});

const [loadingSiteStats, setLoadingSiteStats] = useState(true);

const [homeEvents, setHomeEvents] = useState<HomeEvent[]>([]);
const [loadingEvents, setLoadingEvents] = useState(true);

const videoRef = useRef<HTMLVideoElement | null>(null);
const campusVideoRef = useRef<HTMLVideoElement | null>(null);
const formatCount = (count: number) => {
  return count.toLocaleString();
};

const fetchSiteStats = async () => {
  setLoadingSiteStats(true);

  try {
    console.log('[Home] Fetching site stats...');
    const [alumniResult, studentResult, facultyResult, postsResult] = await Promise.all([
      supabase.from('alumni_profiles').select('*'),
      supabase.from('student_profiles').select('*'),
      supabase.from('faculty_profiles').select('*'),
      supabase.from('posts').select('*'),
    ]);

    console.log('[Home] Alumni data:', alumniResult.data);
    console.log('[Home] Alumni error:', alumniResult.error);
    console.log('[Home] Student data:', studentResult.data);
    console.log('[Home] Faculty data:', facultyResult.data);
    console.log('[Home] Posts data:', postsResult.data);

    if (alumniResult.error) {
      console.error('[Home] Alumni count error:', alumniResult.error);
    }

    if (studentResult.error) {
      console.error('[Home] Student count error:', studentResult.error);
    }

    if (facultyResult.error) {
      console.error('[Home] Faculty count error:', facultyResult.error);
    }

    if (postsResult.error) {
      console.error('[Home] Posts count error:', postsResult.error);
    }

    const alumniCount = alumniResult.data?.length || 0;
    const studentCount = studentResult.data?.length || 0;
    const facultyCount = facultyResult.data?.length || 0;
    const postsCount = postsResult.data?.length || 0;

    setSiteStats({
      totalRegistrations: alumniCount + studentCount + facultyCount,
      totalPosts: postsCount,
      totalAlumni: alumniCount,
    });
  } catch (error) {
    console.error('Error fetching site stats:', error);
  } finally {
    setLoadingSiteStats(false);
  }
};
  const fetchPublishedHighlights = async () => {
  setLoadingHighlights(true);

  console.log('[Home] Fetching alumni highlights...');
  const { data, error } = await supabase
    .from('alumni_highlights')
    .select('id, title, images, published, created_at')
    .eq('published', true)
    .order('created_at', { ascending: false });

  console.log('[Home] Highlights data:', data);
  console.log('[Home] Highlights error:', error);

  if (error) {
    console.error('[Home] Error fetching alumni highlights:', error);
    setLoadingHighlights(false);
    return;
  }

  setAlumniHighlights(data || []);
  setLoadingHighlights(false);
};

  useEffect(() => {
    if (!isAutoPlaying) return;

    const delay = currentBannerIndex === 0 ? 4000 : 5000;
    const interval = setInterval(() => {
      setCurrentBannerIndex((prevIndex) => {
        // After showing first 2 banners, show highlights section
        if (prevIndex === 1 && !showHighlights) {
          setShowHighlights(true);
          return 0; // Reset to first banner
        }
        // If we're showing highlights and go past index 1, loop back
        if (prevIndex >= bannerImages.length - 1) {
          return 0;
        }
        return prevIndex + 1;
      });
    }, delay);

    return () => clearInterval(interval);
  }, [isAutoPlaying, currentBannerIndex, showHighlights]);

  useEffect(() => {
    if (currentBannerIndex === 0 && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {
        // ignore autoplay block if browser prevents it
      });
    }
  }, [currentBannerIndex]);
  useEffect(() => {
  if (currentBannerIndex === 0 && videoRef.current) {
    videoRef.current.currentTime = 0;
    videoRef.current.play().catch(() => {
      // ignore autoplay block if browser prevents it
    });
  }
}, [currentBannerIndex]);

useEffect(() => {
  fetchPublishedHighlights();

  const channel = supabase
    .channel('homepage_alumni_highlights')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'alumni_highlights' },
      () => {
        fetchPublishedHighlights();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, []);
const fetchHomeEvents = async () => {
  setLoadingEvents(true);
  console.log('[Home] Fetching events...');
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('created_at', { ascending: false });

  console.log('[Home] Events data:', data);
  console.log('[Home] Events error:', error);

  if (error) {
    console.error('[Home] Error fetching events:', error);
    setLoadingEvents(false);
    return;
  }

  const mapped = (data || []).map((r: any) => ({
    id: String(r.id),
    title: r.title ?? 'Untitled Event',
    date: r.event_date ?? r.date ?? '',
    time: r.event_time ?? r.time ?? '',
    location: r.location ?? '',
    type: r.type ?? 'Event',
    image: r.image_url ?? r.image ?? '',
    description: r.description ?? '',
  }));

  setHomeEvents(mapped);
  setLoadingEvents(false);
};

useEffect(() => {
  fetchHomeEvents();

  const channel = supabase
    .channel('homepage_events')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'events' },
      () => {
        fetchHomeEvents();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, []);

useEffect(() => {
  fetchSiteStats();

  const channel = supabase
    .channel('homepage_site_stats')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'alumni_profiles' },
      () => fetchSiteStats()
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'student_profiles' },
      () => fetchSiteStats()
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'faculty_profiles' },
      () => fetchSiteStats()
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'posts' },
      () => fetchSiteStats()
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, []);
  const nextBanner = () => {
    setIsAutoPlaying(false);
    setCurrentBannerIndex((prevIndex) => {
      if (prevIndex === 1 && !showHighlights) {
        setShowHighlights(true);
        return 0;
      }
      if (prevIndex >= bannerImages.length - 1) {
        return 0;
      }
      return prevIndex + 1;
    });
  };

  const prevBanner = () => {
    setIsAutoPlaying(false);
    setCurrentBannerIndex((prevIndex) => {
      if (showHighlights) {
        setShowHighlights(false);
        return 1;
      }
      return prevIndex === 0 ? bannerImages.length - 1 : prevIndex - 1;
    });
  };

  const goToBanner = (index: number) => {
    setIsAutoPlaying(false);
    setCurrentBannerIndex(index);
    // Only allow navigation to first 2 banners
    if (index >= 2) {
      setShowHighlights(true);
    } else {
      setShowHighlights(false);
    }
  };

  const isCurrentVideoBanner = bannerImages[currentBannerIndex]?.type === 'video';

  return (
    <div className="flex flex-col min-h-screen">
      <div className="h-4 bg-white" aria-hidden="true" />
      {/* Hero Banner Carousel Section - Full Width */}
      <section 
        id="home" 
        className="relative bg-slate-900 text-white overflow-hidden w-screen left-1/2 -translate-x-1/2"
      >
        <div className="relative h-[70vh] md:h-[85vh]">
          {/* Banner Images */}
          {bannerImages.map((banner, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                index === currentBannerIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            >
              {/* Dark Overlay for better text readability */}
              <div className="absolute inset-0 bg-black/35 z-10"></div>
              
              {/* Banner Image or Video */}
              {banner.type === 'video' ? (
                <video
                  ref={videoRef}
                  src={banner.url}
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                  controls
                  preload="auto"
                  poster="/video-poster.png"
                  onError={(event) => {
                    const target = event.currentTarget as HTMLVideoElement;
                    target.poster = '/video-poster.png';
                  }}
                />
              ) : (
                <img
                  src={banner.url}
                  alt={banner.alt}
                  className="w-full h-full object-cover"
                  loading={index === 0 ? 'eager' : 'lazy'}
                  style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                />
              )}
            </div>
          ))}

          {/* Banner Content Overlay */}
          <div className="relative z-20 h-full flex flex-col items-center justify-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                {/* College Logo */}
                <div className="flex justify-center mb-6">
                  <img
                    src={collegeLogo}
                    alt="College Logo"
                    className="h-24 md:h-32 lg:h-40 w-auto object-contain drop-shadow-2xl"
                  />
                </div>
            
            {/* Dynamic Title */}
            <h1 className={`font-bold mb-4 drop-shadow-lg ${isCurrentVideoBanner ? 'text-2xl md:text-4xl lg:text-5xl' : currentBannerIndex === 1 ? 'text-2xl md:text-3xl lg:text-4xl' : 'text-3xl md:text-5xl lg:text-6xl'}`}>
              {bannerImages[currentBannerIndex].title}
            </h1>
            
            {/* Dynamic Subtitle */}
            <p className="text-lg md:text-xl lg:text-2xl text-white/95 max-w-3xl mx-auto mb-8 drop-shadow-md">
              {bannerImages[currentBannerIndex].subtitle}
            </p>
            
            {/* Call to Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="px-8 py-3 bg-yellow-500 text-slate-900 rounded-lg font-semibold hover:bg-yellow-400 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 transform"
              >
                Get Started
              </Link>
              <Link
                to="/login"
                className="px-8 py-3 bg-white/10 backdrop-blur-md text-white rounded-lg font-semibold hover:bg-white/20 transition-all duration-300 border-2 border-white/40 shadow-xl hover:shadow-2xl hover:scale-105 transform"
              >
                Sign In
              </Link>
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevBanner}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-2 md:p-3 rounded-full transition-all duration-300 hover:scale-110 group"
            aria-label="Previous banner"
          >
            <svg className="h-5 w-5 md:h-6 md:w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          
          <button
            onClick={nextBanner}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-2 md:p-3 rounded-full transition-all duration-300 hover:scale-110 group"
            aria-label="Next banner"
          >
            <svg className="h-5 w-5 md:h-6 md:w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>

          {/* Dot Indicators */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
            {bannerImages.map((_, index) => (
              <button
                key={index}
                onClick={() => goToBanner(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentBannerIndex 
                    ? 'w-8 bg-yellow-500' 
                    : 'w-2 bg-white/50 hover:bg-white/80'
                }`}
                aria-label={`Go to banner ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      <div className="mt-[12px] mb-[12px] w-full overflow-hidden" style={{ marginLeft: 'calc(50% - 50vw)', width: '100vw' }}>
        <div className="mx-auto overflow-hidden rounded-[12px] shadow-[0_6px_18px_rgba(15,23,42,0.10)]" style={{ width: '100%', maxWidth: '100%' }}>
          <video
            ref={campusVideoRef}
            src="/tkr.mp4"
            className="block w-full"
            style={{ display: 'block', height: 'auto', objectFit: 'contain', objectPosition: 'center' }}
            preload="metadata"
            autoPlay
            muted
            loop
            playsInline
          />
        </div>
      </div>

      <AlumniWallOfFame />

      {/* Statistics Circles Section - Small circles below banner */}
      {/* Statistics Section - Modern Cards */}
<section className="relative overflow-hidden py-16 px-4 sm:px-6 lg:px-8 bg-slate-950">
  {/* Background glow */}
  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.25),transparent_35%),radial-gradient(circle_at_top_right,rgba(245,158,11,0.22),transparent_35%)]"></div>

  <div className="relative max-w-6xl mx-auto">
    <div className="text-center mb-12">
      <p className="text-yellow-400 font-semibold uppercase tracking-[0.25em] text-sm">
        Live Community Numbers
      </p>
      <h2 className="mt-3 text-3xl md:text-4xl font-bold text-white">
        Our Alumni Network at a Glance
      </h2>
      <p className="mt-3 text-slate-400 text-base md:text-lg">
        Real-time registrations, posts, and alumni strength
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Total Registrations */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        whileHover={{ y: -8, scale: 1.02 }}
        transition={{ duration: 0.4 }}
        className="group relative overflow-hidden rounded-3xl bg-white/10 backdrop-blur-xl border border-white/10 p-7 shadow-2xl"
      >
        <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-blue-500/30 blur-2xl group-hover:bg-blue-400/40 transition-all"></div>

        <div className="relative">
          <div className="h-14 w-14 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center mb-6">
            <svg className="h-7 w-7 text-blue-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>

          <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider">
            Total Registrations
          </p>

          <div className="mt-3 text-5xl font-extrabold text-white tracking-tight">
            {loadingSiteStats ? '...' : formatCount(siteStats.totalRegistrations)}
          </div>

          <p className="mt-4 text-sm text-blue-200">
            Students + Faculty + Alumni
          </p>
        </div>
      </motion.div>

      {/* Total Posts */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        whileHover={{ y: -8, scale: 1.02 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="group relative overflow-hidden rounded-3xl bg-white/10 backdrop-blur-xl border border-white/10 p-7 shadow-2xl"
      >
        <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-purple-500/30 blur-2xl group-hover:bg-purple-400/40 transition-all"></div>

        <div className="relative">
          <div className="h-14 w-14 rounded-2xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center mb-6">
            <svg className="h-7 w-7 text-purple-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
            </svg>
          </div>

          <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider">
            Total Posts
          </p>

          <div className="mt-3 text-5xl font-extrabold text-white tracking-tight">
            {loadingSiteStats ? '...' : formatCount(siteStats.totalPosts)}
          </div>

          <p className="mt-4 text-sm text-purple-200">
            Community posts shared
          </p>
        </div>
      </motion.div>

      {/* Total Alumni */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        whileHover={{ y: -8, scale: 1.02 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="group relative overflow-hidden rounded-3xl bg-white/10 backdrop-blur-xl border border-white/10 p-7 shadow-2xl"
      >
        <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-orange-500/30 blur-2xl group-hover:bg-orange-400/40 transition-all"></div>

        <div className="relative">
          <div className="h-14 w-14 rounded-2xl bg-orange-500/20 border border-orange-400/30 flex items-center justify-center mb-6">
            <svg className="h-7 w-7 text-orange-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2l2 5h5l-4 3 2 5-5-3-5 3 2-5-4-3h5z" />
            </svg>
          </div>

          <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider">
            Total Alumni
          </p>

          <div className="mt-3 text-5xl font-extrabold text-white tracking-tight">
            {loadingSiteStats ? '...' : formatCount(siteStats.totalAlumni)}
          </div>

          <p className="mt-4 text-sm text-orange-200">
            Registered alumni profiles
          </p>
        </div>
      </motion.div>
    </div>
  </div>
</section>
      {/* About Us Section */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">About Us</h2>
          </div>

          <div className="space-y-6 text-slate-700 text-base sm:text-lg leading-8">
            <p>
              <strong>TKR College of Engineering and Technology (TKRCET)</strong> is a premier institution established in 2002 under the aegis of TKR Educational Society. Situated on a sprawling 20-acre green campus at Meerpet, Hyderabad, the college provides a serene and inspiring environment that nurtures academic excellence and personal growth.
            </p>
            <p>
              The institution was founded by <strong>Sri Teegala Krishna Reddy</strong>, former Mayor of Hyderabad and Founder Chairman of TKR Educational Society. His vision was to make quality education accessible to students from all backgrounds while promoting strong moral and ethical values.
            </p>
            <p>
              Under the leadership of <strong>Dr. T. Harinath Reddy</strong>, Secretary of the institution, and <strong>Dr. A. Ramaswami Reddy</strong>, Principal, TKRCET continues to provide excellent academic, research, and professional opportunities for students.
            </p>
            <p>
              The college is affiliated with <strong>JNTUH</strong> and approved by <strong>AICTE, New Delhi</strong>. It offers Undergraduate, Postgraduate, MBA, and Polytechnic programs across various engineering and technology disciplines.
            </p>
            <p>
              With modern infrastructure, experienced faculty, industry-oriented training, and a vibrant alumni network, TKRCET empowers students to become skilled professionals and responsible citizens capable of meeting global challenges.
            </p>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section id="events" className="py-20 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">Upcoming Events</h2>
            <p className="mt-4 text-lg text-slate-600">Join us for exciting alumni events and networking opportunities</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {loadingEvents ? (
              <div className="col-span-full rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">
                Loading events...
              </div>
            ) : homeEvents.length > 0 ? (
              homeEvents.slice(0, 3).map((event) => (
                <div key={event.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                  {event.image && !event.image.startsWith('blob:') ? (
                    <img src={event.image} alt={event.title} className="h-48 w-full object-cover" />
                  ) : (
                    <div className="h-48 bg-gradient-to-br from-blue-400 to-blue-600"></div>
                  )}
                  <div className="p-6">
                    <div className="text-sm text-blue-600 font-semibold mb-2">{event.date}{event.time ? ` at ${event.time}` : ''}</div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{event.title}</h3>
                    <p className="text-slate-600 mb-4">{event.description || event.location || 'Join us for this exciting event.'}</p>
                    <Link to="/events" className="text-yellow-600 font-semibold hover:text-yellow-700">Learn More →</Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
                No upcoming events at the moment. Check back later!
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Opportunities Section */}
      <section id="opportunities" className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">Career Opportunities</h2>
            <p className="mt-4 text-lg text-slate-600">Discover exclusive opportunities from our alumni network</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-slate-50 rounded-2xl p-8 hover:shadow-lg transition-shadow duration-300">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.93 23.93 0 0112 21c-5.383 0-10.255-2.155-13.255-5.745M12 3v10m0 0l-3-3m3 3l3-3M12 13a4 4 0 100-8 4 4 0 000 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Job Board</h3>
              <p className="text-slate-600 mb-4">Access exclusive job listings from alumni working at top companies worldwide.</p>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-center">✓ 500+ Active Listings</li>
                <li className="flex items-center">✓ Direct Application Links</li>
                <li className="flex items-center">✓ Alumni Referrals Available</li>
              </ul>
            </div>

            <div className="bg-slate-50 rounded-2xl p-8 hover:shadow-lg transition-shadow duration-300">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Internships</h3>
              <p className="text-slate-600 mb-4">Find internship opportunities to kickstart your career with guidance from alumni.</p>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-center">✓ Summer Internships</li>
                <li className="flex items-center">✓ Research Positions</li>
                <li className="flex items-center">✓ Mentorship Programs</li>
              </ul>
            </div>

            <div className="bg-slate-50 rounded-2xl p-8 hover:shadow-lg transition-shadow duration-300">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Mentorship</h3>
              <p className="text-slate-600 mb-4">Connect with experienced alumni mentors to guide your professional journey.</p>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-center">✓ 1-on-1 Mentoring</li>
                <li className="flex items-center">✓ Career Guidance</li>
                <li className="flex items-center">✓ Skill Development</li>
              </ul>
            </div>

            <div className="bg-slate-50 rounded-2xl p-8 hover:shadow-lg transition-shadow duration-300">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Higher Education</h3>
              <p className="text-slate-600 mb-4">Explore advanced degree programs and research opportunities abroad.</p>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-center">✓ Study Abroad Programs</li>
                <li className="flex items-center">✓ Scholarship Information</li>
                <li className="flex items-center">✓ Alumni in Academia</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Alumni Highlights Section */}
      <section id="gallery" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Alumni Highlights</h2>
              <p className="text-lg text-slate-600">Recent moments, events, and memories from our alumni community</p>
            </div>
            <Link
              to="/register"
              className="hidden md:flex items-center space-x-2 px-6 py-3 bg-yellow-500 text-slate-900 rounded-lg font-semibold hover:bg-yellow-400 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              <span>View More</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
          {/* Gallery Grid - Published Alumni Highlights */}
{loadingHighlights ? (
  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-10 text-center text-slate-500">
    Loading alumni highlights...
  </div>
) : alumniHighlights.length > 0 ? (
  <div className="grid md:grid-cols-3 gap-8">
    {alumniHighlights.map((highlight, index) => (
      <motion.div
  key={highlight.id}
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.5, delay: index * 0.1 }}
  onClick={() => setSelectedHighlight(highlight)}
  className="group relative aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300"
>
  {highlight.images && highlight.images.length > 0 ? (
    <img
      src={highlight.images[0]}
      alt={highlight.title}
      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
    />
  ) : (
    <div className="w-full h-full bg-slate-200 flex items-center justify-center">
      <p className="text-slate-500 font-semibold">No Image</p>
    </div>
  )}

  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent opacity-100 transition-opacity duration-300">
    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
      <h3 className="font-bold text-xl mb-1">
        {highlight.title}
      </h3>

      {highlight.images && highlight.images.length > 1 && (
        <p className="text-sm text-slate-200">
          Click to view all {highlight.images.length} photos
        </p>
      )}
    </div>
  </div>
</motion.div>
    ))}
  </div>
) : (
  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-slate-500">
    No alumni highlights available yet.
  </div>
)}

          
          {/* Mobile View More Button */}
          <div className="mt-12 text-center md:hidden">
            <Link
  to="/register"
  className="inline-flex items-center space-x-2 px-6 py-3 bg-yellow-500 text-slate-900 rounded-lg font-semibold hover:bg-yellow-400 transition-all duration-300 shadow-md hover:shadow-lg"
>
              <span>View More</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">Send a Query</h2>
            <p className="mt-4 text-lg text-slate-600">Have a question? Send us a message and we'll get back to you shortly.</p>
          </div>
          <form className="grid gap-6 bg-slate-50 p-8 rounded-3xl shadow-sm border border-slate-200">
            <div className="grid gap-4 md:grid-cols-2">
              <input type="text" placeholder="Full Name" className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-yellow-500 focus:outline-none" />
              <input type="email" placeholder="Email Address" className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-yellow-500 focus:outline-none" />
            </div>
            <textarea placeholder="Your message" rows={6} className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-yellow-500 focus:outline-none"></textarea>
            <button type="submit" className="inline-flex justify-center rounded-2xl bg-yellow-500 px-6 py-3 text-slate-900 font-semibold hover:bg-yellow-400 transition-colors">
              Send Query
            </button>
          </form>
        </div>
      </section>
      {selectedHighlight && (
  <div className="fixed inset-0 z-[999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
    <div className="relative bg-white rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-y-auto p-6">
      <button
        type="button"
        onClick={() => setSelectedHighlight(null)}
        className="absolute top-4 right-4 z-10 h-10 w-10 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-slate-700"
      >
        ✕
      </button>

      <h2 className="text-2xl font-bold text-slate-900 mb-6 pr-12">
        {selectedHighlight.title}
      </h2>

      {selectedHighlight.images && selectedHighlight.images.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {selectedHighlight.images.map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`${selectedHighlight.title} ${index + 1}`}
              className="w-full h-64 object-cover rounded-2xl border border-slate-200"
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl bg-slate-100 p-10 text-center text-slate-500">
          No images available.
        </div>
      )}
    </div>
  </div>
)}

    </div>
  );
}