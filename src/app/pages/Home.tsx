import React from 'react';
import { Link } from 'react-router';
import { ArrowRight, Users, Briefcase, Calendar, GraduationCap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import collegeLogo from '../../assests/college-logo.png';

export function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="relative bg-white text-slate-900 py-12 lg:py-20 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20">
          <img
            src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070&auto=format&fit=crop"
            alt="University Campus"
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-6">
            <img 
              src={collegeLogo} 
              alt="College Logo" 
              className="h-40 md:h-48 lg:h-64 w-auto object-contain"
            />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">Welcome to Alumni Connect</h1>
          <p className="text-xl md:text-2xl text-slate-900 max-w-4xl mx-auto mb-8">
            A professional platform connecting Alumni and Faculty for career growth, mentorship, networking, and opportunities.
          </p>
          {!isAuthenticated && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="px-8 py-3 bg-yellow-500 text-slate-900 rounded-lg font-semibold hover:bg-yellow-400 transition-colors"
              >
                Register
              </Link>
              <Link
                to="/login"
                className="px-8 py-3 bg-black/80 backdrop-blur-md text-white rounded-lg font-semibold hover:bg-black/90 transition-all duration-300 border border-white/20 shadow-lg hover:shadow-xl hover:scale-105"
              >
                Login
              </Link>
            </div>
          )}
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