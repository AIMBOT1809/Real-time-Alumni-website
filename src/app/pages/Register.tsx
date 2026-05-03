import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { GraduationCap, Users, Briefcase } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

type Role = 'student' | 'alumni' | 'faculty' | null;

export function Register() {
  const [selectedRole, setSelectedRole] = useState<Role>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRoleSelection = (role: Role) => {
    setSelectedRole(role);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle registration logic here
    if (selectedRole) {
      login(selectedRole);
      navigate('/dashboard');
    }
  };

  // Role Selection View
  if (!selectedRole) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-12">
            <div className="mx-auto h-16 w-16 bg-yellow-500 rounded-lg flex items-center justify-center text-slate-900 mb-6">
              <GraduationCap className="h-10 w-10" />
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">
              Join the Allumini Network
            </h2>
            <p className="text-xl text-slate-300">
              Select your role to get started
            </p>
            <p className="mt-4 text-sm text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-yellow-500 hover:text-yellow-400">
                Login
              </Link>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Student Card */}
            <button
              onClick={() => handleRoleSelection('student')}
              className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all transform hover:scale-105 text-center group"
            >
              <div className="mx-auto h-16 w-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-yellow-200 transition-colors">
                <GraduationCap className="h-8 w-8 text-yellow-700" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Student</h3>
              <p className="text-slate-600">
                Current university student looking for mentorship and opportunities
              </p>
            </button>

            {/* Alumni Card */}
            <button
              onClick={() => handleRoleSelection('alumni')}
              className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all transform hover:scale-105 text-center group"
            >
              <div className="mx-auto h-16 w-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-yellow-200 transition-colors">
                <Briefcase className="h-8 w-8 text-yellow-700" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Alumni</h3>
              <p className="text-slate-600">
                Graduate ready to mentor and connect with the network
              </p>
            </button>

            {/* Faculty Card */}
            <button
              onClick={() => handleRoleSelection('faculty')}
              className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all transform hover:scale-105 text-center group"
            >
              <div className="mx-auto h-16 w-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-yellow-200 transition-colors">
                <Users className="h-8 w-8 text-yellow-700" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Faculty</h3>
              <p className="text-slate-600">
                Faculty member supporting student and alumni growth
              </p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Student Registration Form
  if (selectedRole === 'student') {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-8">
            <button
              onClick={() => setSelectedRole(null)}
              className="text-yellow-500 hover:text-yellow-400 mb-4 inline-flex items-center"
            >
              ← Back to role selection
            </button>
            <h2 className="text-3xl font-bold text-white">
              Student Registration
            </h2>
          </div>

          <div className="bg-white py-8 px-6 shadow-xl rounded-xl">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Common Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-slate-700 mb-1">
                    First Name *
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  />
                </div>
                <div>
                  <label htmlFor="middleName" className="block text-sm font-medium text-slate-700 mb-1">
                    Middle Name
                  </label>
                  <input
                    id="middleName"
                    type="text"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-slate-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                  Email *
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">
                  Phone *
                </label>
                <input
                  id="phone"
                  type="tel"
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                />
              </div>

              <div>
                <label htmlFor="idUpload" className="block text-sm font-medium text-slate-700 mb-1">
                  College ID Upload *
                </label>
                <input
                  id="idUpload"
                  type="file"
                  required
                  accept="image/*,.pdf"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                />
              </div>

              {/* Student-specific Fields */}
              <div>
                <label htmlFor="collegeName" className="block text-sm font-medium text-slate-700 mb-1">
                  College Name *
                </label>
                <input
                  id="collegeName"
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="department" className="block text-sm font-medium text-slate-700 mb-1">
                    Department *
                  </label>
                  <input
                    id="department"
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  />
                </div>
                <div>
                  <label htmlFor="year" className="block text-sm font-medium text-slate-700 mb-1">
                    Year *
                  </label>
                  <select
                    id="year"
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  >
                    <option value="">Select Year</option>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> After 4th year, your account will be disclosed.
                </p>
              </div>

              <div>
                <label htmlFor="cgpa" className="block text-sm font-medium text-slate-700 mb-1">
                  CGPA *
                </label>
                <input
                  id="cgpa"
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                />
              </div>

              <div>
                <label htmlFor="resume" className="block text-sm font-medium text-slate-700 mb-1">
                  Resume Upload *
                </label>
                <input
                  id="resume"
                  type="file"
                  required
                  accept=".pdf,.doc,.docx"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                />
              </div>

              <div>
                <label htmlFor="linkedin" className="block text-sm font-medium text-slate-700 mb-1">
                  LinkedIn Profile *
                </label>
                <input
                  id="linkedin"
                  type="url"
                  required
                  placeholder="https://linkedin.com/in/yourprofile"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                />
              </div>

              <div>
                <label htmlFor="github" className="block text-sm font-medium text-slate-700 mb-1">
                  GitHub (Optional)
                </label>
                <input
                  id="github"
                  type="url"
                  placeholder="https://github.com/yourusername"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                />
              </div>

              <div>
                <label htmlFor="portfolio" className="block text-sm font-medium text-slate-700 mb-1">
                  Portfolio (Optional)
                </label>
                <input
                  id="portfolio"
                  type="url"
                  placeholder="https://yourportfolio.com"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                />
              </div>

              <div>
                <label htmlFor="website" className="block text-sm font-medium text-slate-700 mb-1">
                  Website (Optional)
                </label>
                <input
                  id="website"
                  type="url"
                  placeholder="https://yourwebsite.com"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 bg-yellow-500 text-slate-900 rounded-md font-semibold hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors"
              >
                Create Account
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Alumni Registration Form
  if (selectedRole === 'alumni') {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-8">
            <button
              onClick={() => setSelectedRole(null)}
              className="text-yellow-500 hover:text-yellow-400 mb-4 inline-flex items-center"
            >
              ← Back to role selection
            </button>
            <h2 className="text-3xl font-bold text-white">
              Alumni Registration
            </h2>
          </div>

          <div className="bg-white py-8 px-6 shadow-xl rounded-xl">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Common Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-slate-700 mb-1">
                    First Name *
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  />
                </div>
                <div>
                  <label htmlFor="middleName" className="block text-sm font-medium text-slate-700 mb-1">
                    Middle Name
                  </label>
                  <input
                    id="middleName"
                    type="text"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-slate-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                  Email *
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">
                  Phone *
                </label>
                <input
                  id="phone"
                  type="tel"
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                />
              </div>

              <div>
                <label htmlFor="idUpload" className="block text-sm font-medium text-slate-700 mb-1">
                  Office ID Upload *
                </label>
                <input
                  id="idUpload"
                  type="file"
                  required
                  accept="image/*,.pdf"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                />
              </div>

              {/* Alumni-specific Fields */}
              <div>
                <label htmlFor="company" className="block text-sm font-medium text-slate-700 mb-1">
                  Company *
                </label>
                <input
                  id="company"
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                />
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-slate-700 mb-1">
                  Role/Position *
                </label>
                <input
                  id="role"
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                />
              </div>

              <div>
                <label htmlFor="experience" className="block text-sm font-medium text-slate-700 mb-1">
                  Years of Experience *
                </label>
                <input
                  id="experience"
                  type="number"
                  min="0"
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                />
              </div>

              <div>
                <label htmlFor="resume" className="block text-sm font-medium text-slate-700 mb-1">
                  Resume Upload *
                </label>
                <input
                  id="resume"
                  type="file"
                  required
                  accept=".pdf,.doc,.docx"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                />
              </div>

              <div>
                <label htmlFor="linkedin" className="block text-sm font-medium text-slate-700 mb-1">
                  LinkedIn Profile *
                </label>
                <input
                  id="linkedin"
                  type="url"
                  required
                  placeholder="https://linkedin.com/in/yourprofile"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                />
              </div>

              <div>
                <label htmlFor="github" className="block text-sm font-medium text-slate-700 mb-1">
                  GitHub (Optional)
                </label>
                <input
                  id="github"
                  type="url"
                  placeholder="https://github.com/yourusername"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                />
              </div>

              <div>
                <label htmlFor="portfolio" className="block text-sm font-medium text-slate-700 mb-1">
                  Portfolio (Optional)
                </label>
                <input
                  id="portfolio"
                  type="url"
                  placeholder="https://yourportfolio.com"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                />
              </div>

              <div>
                <label htmlFor="website" className="block text-sm font-medium text-slate-700 mb-1">
                  Website (Optional)
                </label>
                <input
                  id="website"
                  type="url"
                  placeholder="https://yourwebsite.com"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 bg-yellow-500 text-slate-900 rounded-md font-semibold hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors"
              >
                Create Account
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Faculty Registration Form
  if (selectedRole === 'faculty') {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-8">
            <button
              onClick={() => setSelectedRole(null)}
              className="text-yellow-500 hover:text-yellow-400 mb-4 inline-flex items-center"
            >
              ← Back to role selection
            </button>
            <h2 className="text-3xl font-bold text-white">
              Faculty Registration
            </h2>
          </div>

          <div className="bg-white py-8 px-6 shadow-xl rounded-xl">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Common Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-slate-700 mb-1">
                    First Name *
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  />
                </div>
                <div>
                  <label htmlFor="middleName" className="block text-sm font-medium text-slate-700 mb-1">
                    Middle Name
                  </label>
                  <input
                    id="middleName"
                    type="text"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-slate-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                  Email *
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">
                  Phone *
                </label>
                <input
                  id="phone"
                  type="tel"
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                />
              </div>

              <div>
                <label htmlFor="idUpload" className="block text-sm font-medium text-slate-700 mb-1">
                  College ID Upload *
                </label>
                <input
                  id="idUpload"
                  type="file"
                  required
                  accept="image/*,.pdf"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                />
              </div>

              {/* Faculty-specific Fields */}
              <div>
                <label htmlFor="collegeName" className="block text-sm font-medium text-slate-700 mb-1">
                  College Name *
                </label>
                <input
                  id="collegeName"
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                />
              </div>

              <div>
                <label htmlFor="department" className="block text-sm font-medium text-slate-700 mb-1">
                  Department *
                </label>
                <input
                  id="department"
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                />
              </div>

              <div>
                <label htmlFor="linkedin" className="block text-sm font-medium text-slate-700 mb-1">
                  LinkedIn Profile (Optional)
                </label>
                <input
                  id="linkedin"
                  type="url"
                  placeholder="https://linkedin.com/in/yourprofile"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 bg-yellow-500 text-slate-900 rounded-md font-semibold hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors"
              >
                Create Account
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return null;
}