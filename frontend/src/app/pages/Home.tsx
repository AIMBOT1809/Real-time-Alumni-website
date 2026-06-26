import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { RecentAlumniHighlights } from '../components/RecentAlumniHighlights';
import collegeLogo from '../../assests/college-logo.png';

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

export function Home() {
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [showHighlights, setShowHighlights] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

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

      {/* Recent Alumni Highlights Section */}
      <section className="py-12 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <RecentAlumniHighlights />
        </div>
      </section>

      {/* Statistics Circles Section - Small circles below banner */}
      <section className="relative py-8 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-3 gap-4 sm:gap-6 md:gap-8">

            {/* Circle 1: Total Registrations */}
            <div className="flex justify-center">
              <div className="group relative">
                <div className="w-40 h-40 sm:w-44 sm:h-44 md:w-48 md:h-48 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-xl hover:shadow-blue-500/40 transition-all duration-500 hover:scale-105 flex flex-col items-center justify-center text-white">
                  {/* Icon (inline) */}
                  <div className="mb-2 p-2 bg-white/20 rounded-full backdrop-blur-sm group-hover:bg-white/30 transition-all duration-300">
                    <svg className="h-7 w-7 sm:h-8 sm:w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  </div>

                  {/* Count */}
                  <div className="text-3xl sm:text-4xl font-bold mb-1 group-hover:scale-110 transition-transform duration-300">
                    2,450+
                  </div>

                  {/* Label */}
                  <div className="text-xs sm:text-sm font-semibold uppercase tracking-wide px-2 text-center">
                    Total Registrations
                  </div>

                  {/* Decorative pulse ring */}
                  <div className="absolute inset-0 rounded-full border-2 border-blue-300 opacity-20 animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* Circle 2: Total Posts */}
            <div className="flex justify-center">
              <div className="group relative">
                <div className="w-40 h-40 sm:w-44 sm:h-44 md:w-48 md:h-48 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 shadow-xl hover:shadow-purple-500/40 transition-all duration-500 hover:scale-105 flex flex-col items-center justify-center text-white">
                  {/* Icon (inline) */}
                  <div className="mb-2 p-2 bg-white/20 rounded-full backdrop-blur-sm group-hover:bg-white/30 transition-all duration-300">
                    <svg className="h-7 w-7 sm:h-8 sm:w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/></svg>
                  </div>

                  {/* Count */}
                  <div className="text-3xl sm:text-4xl font-bold mb-1 group-hover:scale-110 transition-transform duration-300">
                    8,750+
                  </div>

                  {/* Label */}
                  <div className="text-xs sm:text-sm font-semibold uppercase tracking-wide px-2 text-center">
                    Total Posts
                  </div>

                  {/* Decorative pulse ring */}
                  <div className="absolute inset-0 rounded-full border-2 border-purple-300 opacity-20 animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* Circle 3: Total Alumni */}
            <div className="flex justify-center">
              <div className="group relative">
                <div className="w-40 h-40 sm:w-44 sm:h-44 md:w-48 md:h-48 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 shadow-xl hover:shadow-amber-500/40 transition-all duration-500 hover:scale-105 flex flex-col items-center justify-center text-white">
                  {/* Icon (inline) */}
                  <div className="mb-3 p-3 bg-white/20 rounded-full backdrop-blur-sm group-hover:bg-white/30 transition-all duration-300">
                    <svg className="h-10 w-10 sm:h-12 sm:w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l2 5h5l-4 3 2 5-5-3-5 3 2-5-4-3h5z"/></svg>
                  </div>

                  {/* Count */}
                  <div className="text-3xl sm:text-4xl font-bold mb-1 group-hover:scale-110 transition-transform duration-300">
                    1,890+
                  </div>

                  {/* Label */}
                  <div className="text-xs sm:text-sm font-semibold uppercase tracking-wide px-2 text-center">
                    Total Alumni
                  </div>

                  {/* Decorative pulse ring */}
                  <div className="absolute inset-0 rounded-full border-2 border-amber-300 opacity-20 animate-pulse"></div>
                </div>
              </div>
            </div>

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
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="h-48 bg-gradient-to-br from-blue-400 to-blue-600"></div>
              <div className="p-6">
                <div className="text-sm text-blue-600 font-semibold mb-2">March 15, 2025</div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Annual Alumni Meet 2025</h3>
                <p className="text-slate-600 mb-4">Reconnect with classmates and faculty at our annual gathering.</p>
                <button className="text-yellow-600 font-semibold hover:text-yellow-700">Learn More →</button>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="h-48 bg-gradient-to-br from-purple-400 to-purple-600"></div>
              <div className="p-6">
                <div className="text-sm text-purple-600 font-semibold mb-2">April 20, 2025</div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Tech Talk: AI & Future</h3>
                <p className="text-slate-600 mb-4">Industry leaders share insights on emerging technologies.</p>
                <button className="text-yellow-600 font-semibold hover:text-yellow-700">Learn More →</button>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="h-48 bg-gradient-to-br from-amber-400 to-orange-600"></div>
              <div className="p-6">
                <div className="text-sm text-amber-600 font-semibold mb-2">May 10, 2025</div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Career Fair 2025</h3>
                <p className="text-slate-600 mb-4">Explore job opportunities from top companies hiring alumni.</p>
                <button className="text-yellow-600 font-semibold hover:text-yellow-700">Learn More →</button>
              </div>
            </div>
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
              to="/gallery"
              className="hidden md:flex items-center space-x-2 px-6 py-3 bg-yellow-500 text-slate-900 rounded-lg font-semibold hover:bg-yellow-400 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              <span>View More</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>

          {/* Gallery Grid - 3 Recent Images */}
          <div className="grid md:grid-cols-3 gap-8">
            {/* Gallery Card 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="group relative aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300"
            >
              <img
                src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop"
                alt="Annual Alumni Meet 2024"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <div className="text-xs font-semibold text-yellow-400 mb-2">Events</div>
                  <h3 className="font-bold text-xl mb-1">Annual Alumni Meet 2024</h3>
                  <p className="text-sm text-slate-200">March 15, 2024</p>
                </div>
              </div>
              <div className="absolute top-4 right-4 bg-yellow-500 text-slate-900 px-3 py-1 rounded-full text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                View
              </div>
            </motion.div>

            {/* Gallery Card 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="group relative aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300"
            >
              <img
                src="https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=2070&auto=format&fit=crop"
                alt="Graduation Ceremony"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <div className="text-xs font-semibold text-yellow-400 mb-2">Ceremony</div>
                  <h3 className="font-bold text-xl mb-1">Graduation Ceremony</h3>
                  <p className="text-sm text-slate-200">May 10, 2024</p>
                </div>
              </div>
              <div className="absolute top-4 right-4 bg-yellow-500 text-slate-900 px-3 py-1 rounded-full text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                View
              </div>
            </motion.div>

            {/* Gallery Card 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="group relative aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300"
            >
              <img
                src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=2070&auto=format&fit=crop"
                alt="Workshop on AI & ML"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <div className="text-xs font-semibold text-yellow-400 mb-2">Workshop</div>
                  <h3 className="font-bold text-xl mb-1">Workshop on AI & ML</h3>
                  <p className="text-sm text-slate-200">April 5, 2024</p>
                </div>
              </div>
              <div className="absolute top-4 right-4 bg-yellow-500 text-slate-900 px-3 py-1 rounded-full text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                View
              </div>
            </motion.div>
          </div>

          {/* Mobile View More Button */}
          <div className="mt-12 text-center md:hidden">
            <Link
              to="/gallery"
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

    </div>
  );
}