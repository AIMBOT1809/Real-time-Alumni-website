import React, { useState } from 'react';
import { Link } from 'react-router';
import { GraduationCap, Users } from 'lucide-react';
import { StudentRegistration } from './StudentRegistration';
import { AlumniRegistration } from './AlumniRegistration';
import { FacultyRegistration } from './FacultyRegistration';

type Role = 'student' | 'alumni' | 'faculty' | null;

export function Register() {
  const [selectedRole, setSelectedRole] = useState<Role>(null);

  const handleRoleSelection = (role: Role) => {
    setSelectedRole(role);
  };

  // Role Selection Cards
  if (!selectedRole) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl w-full">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-white mb-3">Join Our Alumni Network</h1>
            <p className="text-lg text-slate-300 mb-4">Choose your role to get started</p>
          </div>
          <div className="text-center mb-6">
            <p className="text-slate-300">Already have an account? <Link to="/login" className="text-yellow-400 hover:text-yellow-300 font-medium transition-colors cursor-pointer">Login</Link></p>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            {/* Student Card */}
            <div
              onClick={() => handleRoleSelection("student")}
              className="group relative w-full h-full bg-blue-500/15 backdrop-blur-xl backdrop-saturate-200 rounded-2xl p-8 shadow-xl cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:bg-blue-500/25 border border-blue-300/40 hover:border-blue-400/60 hover:ring-2 hover:ring-blue-500/20"
            >
              {/* Glassmorphism Layer */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-400/10 via-transparent to-blue-500/5"></div>

              {/* Shine Effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/25 via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-all duration-300"></div>

              {/* Glow */}
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-32 h-32 bg-gradient-to-br from-white/40 via-blue-200/20 to-transparent rounded-full blur-3xl opacity-30 group-hover:opacity-60 transition-all duration-300"></div>

              <div className="relative z-10">
                <div className="flex items-center justify-center mb-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-cyan-300 to-sky-200 rounded-full blur-2xl opacity-60 group-hover:opacity-80 transition-all duration-300 animate-pulse"></div>

                    <GraduationCap className="relative z-10 w-14 h-14 text-white drop-shadow-lg" />
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-white text-center mb-3 drop-shadow-lg">
                  Student
                </h2>

                <p className="text-blue-50 text-center mb-6 leading-relaxed">
                  Connect with alumni, faculty members and discover opportunities.
                </p>

                <div className="flex items-center justify-center">
                  <span className="relative bg-gradient-to-r from-blue-100/85 to-blue-100/65 text-blue-900 px-6 py-2 rounded-lg font-bold shadow-lg backdrop-blur-md hover:from-blue-100 hover:to-blue-200 hover:shadow-xl transform transition-all duration-300 hover:scale-105 border border-blue-300/60 hover:border-blue-400/80 hover:ring-2 hover:ring-blue-500/30">
                    <span className="relative z-10">
                      Register as Student
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Alumni Card */}
            <div
              onClick={() => handleRoleSelection('alumni')}
              className="group relative w-full h-full bg-orange-500/15 backdrop-blur-xl backdrop-saturate-200 rounded-2xl p-8 shadow-xl cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:bg-orange-500/25 border border-orange-300/40 hover:border-orange-400/60 hover:ring-2 hover:ring-orange-500/20"
            >
              {/* Enhanced glassmorphism base layer */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-orange-400/10 via-transparent to-orange-500/5"></div>
              
              {/* Premium glossy shine effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/25 via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
              
              {/* Top light reflection */}
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-32 h-32 bg-gradient-to-br from-white/40 via-orange-200/20 to-transparent rounded-full blur-3xl opacity-30 group-hover:opacity-60 transition-all duration-300"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-center mb-6">
                  <div className="relative">
                    {/* Icon glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-400 via-amber-300 to-yellow-200 rounded-full blur-2xl opacity-60 group-hover:opacity-80 transition-all duration-300 animate-pulse"></div>
                    <GraduationCap className="relative z-10 w-14 h-14 text-white drop-shadow-lg" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-white text-center mb-3 drop-shadow-lg">Alumni</h2>
                <p className="text-orange-50 text-center mb-6 leading-relaxed">
                  Connect with fellow graduates, share your achievements.
                </p>
                <div className="flex items-center justify-center">
                  <span className="relative bg-gradient-to-r from-orange-100/85 to-orange-100/65 text-orange-900 px-6 py-2 rounded-lg font-bold shadow-lg backdrop-blur-md hover:from-orange-100 hover:to-orange-200 hover:shadow-xl transform transition-all duration-300 hover:scale-105 border border-orange-300/60 hover:border-orange-400/80 hover:ring-2 hover:ring-orange-500/30">
                    <span className="relative z-10">Register as Alumni</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Faculty Card */}
            <div
              onClick={() => handleRoleSelection('faculty')}
              className="group relative w-full h-full bg-green-500/15 backdrop-blur-xl backdrop-saturate-200 rounded-2xl p-8 shadow-xl cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:bg-green-500/25 border border-green-300/40 hover:border-green-400/60 hover:ring-2 hover:ring-green-500/20"
            >
              {/* Enhanced glassmorphism base layer */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-green-400/10 via-transparent to-green-500/5"></div>
              
              {/* Premium glossy shine effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/25 via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
              
              {/* Top light reflection */}
              <div className="absolute -top-10 right-1/4 w-32 h-32 bg-gradient-to-br from-white/40 via-green-200/20 to-transparent rounded-full blur-3xl opacity-30 group-hover:opacity-60 transition-all duration-300"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-center mb-6">
                  <div className="relative">
                    {/* Icon glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-green-400 via-emerald-300 to-lime-200 rounded-full blur-2xl opacity-70 group-hover:opacity-90 transition-all duration-300 animate-pulse"></div>
                    <Users className="relative z-10 w-14 h-14 text-white drop-shadow-lg" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-white text-center mb-3 drop-shadow-lg">Faculty</h2>
                <p className="text-green-50 text-center mb-6 leading-relaxed">
                  Join our faculty network, mentor students, and contribute to academic excellence.
                </p>
                <div className="flex items-center justify-center">
                  <span className="relative bg-gradient-to-r from-green-100/85 to-green-100/65 text-green-900 px-6 py-2 rounded-lg font-bold shadow-lg backdrop-blur-md hover:from-green-100 hover:to-green-200 hover:shadow-xl transform transition-all duration-300 hover:scale-105 border border-green-300/60 hover:border-green-400/80 hover:ring-2 hover:ring-green-500/30">
                    <span className="relative z-10">Register as Faculty</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (selectedRole === 'student') {
    return <StudentRegistration onBack={() => setSelectedRole(null)} />;
  }

  if (selectedRole === 'alumni') {
    return <AlumniRegistration onBack={() => setSelectedRole(null)} />;
  }

  if (selectedRole === 'faculty') {
    return <FacultyRegistration onBack={() => setSelectedRole(null)} />;
  }

  return null;
}
