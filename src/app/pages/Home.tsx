import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { ArrowRight, Users, Briefcase, Calendar, GraduationCap, ChevronLeft, ChevronRight, UserCheck, FileText, Award } from 'lucide-react';
import collegeLogo from '../../assests/college-logo.png';

// Banner images configuration - You can replace these URLs with your own images
const bannerImages = [
  {
    url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070&auto=format&fit=crop',
    alt: 'University Campus',
    title: 'Welcome to Alumni Connect',
    subtitle: 'Building Bridges Between Past and Present'
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

  // Auto-rotate banners every 5 seconds
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentBannerIndex((prevIndex) => 
        prevIndex === bannerImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const nextBanner = () => {
    setIsAutoPlaying(false);
    setCurrentBannerIndex((prevIndex) => 
      prevIndex === bannerImages.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevBanner = () => {
    setIsAutoPlaying(false);
    setCurrentBannerIndex((prevIndex) => 
      prevIndex === 0 ? bannerImages.length - 1 : prevIndex - 1
    );
  };

  const goToBanner = (index: number) => {
    setIsAutoPlaying(false);
    setCurrentBannerIndex(index);
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Banner Carousel Section */}
      <section className="relative bg-slate-900 text-white overflow-hidden">
        <div className="relative h-[500px] md:h-[600px] lg:h-[700px]">
          {/* Banner Images */}
          {bannerImages.map((banner, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                index === currentBannerIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            >
              {/* Dark Overlay for better text readability */}
              <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-900/40 to-slate-900/60 z-10"></div>
              
              {/* Banner Image */}
              <img
                src={banner.url}
                alt={banner.alt}
                className="w-full h-full object-cover"
                loading={index === 0 ? 'eager' : 'lazy'}
              />
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
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 drop-shadow-lg">
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
            <ChevronLeft className="h-5 w-5 md:h-6 md:w-6 group-hover:scale-110 transition-transform" />
          </button>
          
          <button
            onClick={nextBanner}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-2 md:p-3 rounded-full transition-all duration-300 hover:scale-110 group"
            aria-label="Next banner"
          >
            <ChevronRight className="h-5 w-5 md:h-6 md:w-6 group-hover:scale-110 transition-transform" />
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

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">Why Join Alumni?</h2>
            <p className="mt-4 text-xl text-slate-600">Everything you need to accelerate your career and stay connected.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-6 bg-slate-50 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-yellow-700" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-slate-900">Mentorship</h3>
              <p className="text-slate-600">Connect with experienced alumni willing to guide you through your career journey.</p>
            </div>

            <div className="p-6 bg-slate-50 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                <Briefcase className="h-6 w-6 text-yellow-700" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-slate-900">Opportunities</h3>
              <p className="text-slate-600">Access exclusive job postings and internships from alumni-affiliated companies.</p>
            </div>

            <div className="p-6 bg-slate-50 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 text-yellow-700" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-slate-900">Events</h3>
              <p className="text-slate-600">Participate in networking mixers, workshops, and reunions both virtually and in-person.</p>
            </div>

            <div className="p-6 bg-slate-50 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                <GraduationCap className="h-6 w-6 text-yellow-700" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-slate-900">Community</h3>
              <p className="text-slate-600">Join special interest groups and discuss topics relevant to your industry and interests.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Image Text Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
            <div className="relative mb-12 lg:mb-0">
              <div className="absolute top-0 left-0 -ml-4 -mt-4 w-24 h-24 bg-yellow-200 rounded-full z-0"></div>
              <img
                src="https://images.unsplash.com/photo-1515187029135-18ee286d815b?q=80&w=2070&auto=format&fit=crop"
                alt="Mentorship"
                className="relative z-10 rounded-2xl shadow-xl w-full"
              />
              <div className="absolute bottom-0 right-0 -mr-4 -mb-4 w-32 h-32 bg-slate-200 rounded-full z-0"></div>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-6">Grow Your Professional Network</h2>
              <p className="text-lg text-slate-600 mb-6">
                Whether you're a student looking for guidance or an alumnus looking to give back, Alumni provides the platform to make meaningful connections.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-100 flex items-center justify-center mt-1">
                    <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-3 text-base text-slate-600">Direct messaging with industry professionals</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-100 flex items-center justify-center mt-1">
                    <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-3 text-base text-slate-600">Exclusive job boards only available to alumni</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-100 flex items-center justify-center mt-1">
                    <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-3 text-base text-slate-600">Personalized event recommendations</p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}