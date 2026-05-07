import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';

import { Link, useNavigate } from 'react-router';
import { GraduationCap, Users, Briefcase, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { UserProfile } from '../data/mock';

type Role = 'student' | 'alumni' | 'faculty' | null;

export function Register() {
  const [selectedRole, setSelectedRole] = useState<Role>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRoleSelection = (role: Role) => {
    setSelectedRole(role);
  };

  const togglePassword = () => setShowPassword((prev) => !prev);
  const toggleConfirmPassword = () => setShowConfirmPassword((prev) => !prev);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedRole) return;

    const getInputValue = (id: string) => {
      const element = document.getElementById(id) as HTMLInputElement | HTMLSelectElement | null;
      return element?.value.trim() || '';
    };

    const firstName = getInputValue('firstName');
    const middleName = getInputValue('middleName');
    const lastName = getInputValue('lastName');
    const name = [firstName, middleName, lastName].filter(Boolean).join(' ').trim() || 'New User';
    const email = getInputValue('email');
    const password = getInputValue('password');
    const confirmPassword = getInputValue('confirmPassword');

    if (!password) {
      alert('Password cannot be empty');
      return;
    }

    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
/*
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      alert(authError.message);
      return;
    }
      */
    const phone = getInputValue('phone');
    const company = getInputValue('company') || undefined;
    const position = getInputValue('role') || undefined;
    const department = getInputValue('department') || undefined;
    const collegeName = getInputValue('collegeName') || undefined;
    const graduationYear = Number(getInputValue('year')) || new Date().getFullYear();
    const degree = selectedRole === 'student'
      ? `${department || 'Student'} Student`
      : selectedRole === 'faculty'
      ? `${department || 'Faculty'} Faculty`
      : 'Alumni Professional';
    const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=FDE68A&color=111827&size=256`;

    const newUser: UserProfile = {
      id: `u-${Date.now()}`,
      name,
      role: selectedRole,
      avatar,
      graduationYear,
      degree,
      company: selectedRole === 'alumni' ? company : selectedRole === 'faculty' ? collegeName : undefined,
      position: selectedRole === 'alumni' ? position : selectedRole === 'faculty' ? department : undefined,
      bio: `${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)} registered user`,
      skills: [],
      email,
      phone,
    };
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
  email: email,
  password: password
});

if (authError) {
  alert(authError.message);
  return;
}

const userId = authData.user?.id;
  
const { error: insertError } = await supabase
  .from("students")
  .insert([
    {
      id:userId,
      first_name: firstName,
      middle_name: middleName,
      last_name: lastName,
      email: email,
      phone: phone,
      college_name: collegeName,
      department: department,
      year: graduationYear.toString()
    }
  ]);

if (insertError) {
  alert(insertError.message);
  console.log(insertError);
  return;
}

    login(newUser);
    navigate('/dashboard');
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
              Join the Alumni Network
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
              className="relative bg-blue-500/10 backdrop-blur-xl p-8 rounded-2xl border-2 border-blue-400/50 shadow-xl hover:shadow-2xl hover:shadow-blue-500/40 transition-all duration-300 transform hover:scale-[1.03] text-center group overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="mx-auto h-16 w-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-500/30 transition-colors border border-blue-400/30 group-hover:border-blue-400/60">
                  <GraduationCap className="h-8 w-8 text-blue-300 group-hover:text-blue-200" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Student</h3>
                <p className="text-slate-200">
                  Current university student looking for mentorship and opportunities
                </p>
              </div>
            </button>

            {/* Alumni Card */}
            <button
              onClick={() => handleRoleSelection('alumni')}
              className="relative bg-orange-500/10 backdrop-blur-xl p-8 rounded-2xl border-2 border-orange-400/50 shadow-xl hover:shadow-2xl hover:shadow-orange-500/40 transition-all duration-300 transform hover:scale-[1.03] text-center group overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="mx-auto h-16 w-16 bg-orange-500/20 rounded-full flex items-center justify-center mb-4 group-hover:bg-orange-500/30 transition-colors border border-orange-400/30 group-hover:border-orange-400/60">
                  <Briefcase className="h-8 w-8 text-orange-300 group-hover:text-orange-200" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Alumni</h3>
                <p className="text-slate-200">
                  Graduate ready to mentor and connect with the network
                </p>
              </div>
            </button>

            {/* Faculty Card */}
            <button
              onClick={() => handleRoleSelection('faculty')}
              className="relative bg-green-500/10 backdrop-blur-xl p-8 rounded-2xl border-2 border-green-400/50 shadow-xl hover:shadow-2xl hover:shadow-green-500/40 transition-all duration-300 transform hover:scale-[1.03] text-center group overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="mx-auto h-16 w-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4 group-hover:bg-green-500/30 transition-colors border border-green-400/30 group-hover:border-green-400/60">
                  <Users className="h-8 w-8 text-green-300 group-hover:text-green-200" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Faculty</h3>
                <p className="text-slate-200">
                  Faculty member supporting student and alumni growth
                </p>
              </div>
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
                    name="firstName"
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
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                  Password *
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Create Password"
                    className="w-full pr-11 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  />
                  <button
                    type="button"
                    onClick={togglePassword}
                    className="absolute inset-y-0 right-3 flex items-center text-slate-500 hover:text-slate-900"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-1">
                  Confirm Password *
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    placeholder="Confirm Password"
                    className="w-full pr-11 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  />
                  <button
                    type="button"
                    onClick={toggleConfirmPassword}
                    className="absolute inset-y-0 right-3 flex items-center text-slate-500 hover:text-slate-900"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
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
                    name="department"
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
                    name="year"
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
                  name="cgpa"
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
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                  Password *
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Create Password"
                    className="w-full pr-11 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  />
                  <button
                    type="button"
                    onClick={togglePassword}
                    className="absolute inset-y-0 right-3 flex items-center text-slate-500 hover:text-slate-900"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-1">
                  Confirm Password *
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    placeholder="Confirm Password"
                    className="w-full pr-11 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  />
                  <button
                    type="button"
                    onClick={toggleConfirmPassword}
                    className="absolute inset-y-0 right-3 flex items-center text-slate-500 hover:text-slate-900"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
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
                  name="company"
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
                  name="role"
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
                  name="experience"
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
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                  Password *
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Create Password"
                    className="w-full pr-11 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  />
                  <button
                    type="button"
                    onClick={togglePassword}
                    className="absolute inset-y-0 right-3 flex items-center text-slate-500 hover:text-slate-900"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-1">
                  Confirm Password *
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    placeholder="Confirm Password"
                    className="w-full pr-11 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  />
                  <button
                    type="button"
                    onClick={toggleConfirmPassword}
                    className="absolute inset-y-0 right-3 flex items-center text-slate-500 hover:text-slate-900"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
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
                  name="linkedin"
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