import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';
import { Link, useNavigate } from 'react-router';
import {
  GraduationCap,
  Users,
  Briefcase,
  Eye,
  EyeOff
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import type { UserProfile } from '../data/mock';

type Role = 'alumni' | 'faculty' | null;

export function Register() {

  const [selectedRole, setSelectedRole] = useState<Role>(null);

  const [showPassword, setShowPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [currentStatus, setCurrentStatus] = useState<
    'job' | 'higher-education' | null
  >(null);

  const { login } = useAuth();

  const navigate = useNavigate();

  const handleRoleSelection = (role: Role) => {
    setSelectedRole(role);
  };

  const togglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const toggleConfirmPassword = () => {
    setShowConfirmPassword((prev) => !prev);
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {

    e.preventDefault();

    if (!selectedRole) return;

    const form = e.currentTarget;

    const formData = new FormData(form);

    // Get form values

    const firstName = formData.get('firstName') as string;

    const lastName = formData.get('lastName') as string;

    const email = formData.get('email') as string;

    const phone = formData.get('phone') as string;

    const password = formData.get('password') as string;

    const confirmPassword =
      formData.get('confirmPassword') as string;

    const idProof = formData.get('idProof') as File;

    const photo = formData.get('photo') as File;

    const resume = formData.get('resume') as File;

    const collegeName =
      formData.get('collegeName') as string;

    const department =
      formData.get('department') as string;

    const yearOfJoining =
      formData.get('yearOfJoining') as string;

    const passedOutYear =
      formData.get('passedOutYear') as string;

    const rollNumber =
      formData.get('rollNumber') as string;

    const linkedin =
      formData.get('linkedin') as string;

    const currentStatus =
      formData.get('currentStatus') as string;

    // Current Status specific fields

    const organization =
      formData.get('organization') as string;

    const jobRole =
      formData.get('jobRole') as string;

    const package_ =
      formData.get('package') as string;

    const jobProof =
      formData.get('jobProof') as File;

    const university =
      formData.get('university') as string;

    const country =
      formData.get('country') as string;

    const city =
      formData.get('city') as string;

    const course =
      formData.get('course') as string;

    const branch =
      formData.get('branch') as string;

    // Validation

    if (!firstName || !lastName) {
      alert('Please enter both first and last name');
      return;
    }

    if (!email || !email.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }

    if (!phone || phone.length < 10) {
      alert('Please enter a valid phone number');
      return;
    }

    // LinkedIn URL validation (optional field)
    if (linkedin && linkedin.trim()) {
      const linkedinRegex = /^https?:\/\/(www\.)?linkedin\.com\/.+/i;
      if (!linkedinRegex.test(linkedin.trim())) {
        alert('Please enter a valid LinkedIn profile URL (e.g., https://linkedin.com/in/yourprofile)');
        return;
      }
    }

    // Resume file validation (optional field)
    if (resume) {
      // Check file size (5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (resume.size > maxSize) {
        alert('Resume file size must be less than 5MB');
        return;
      }

      // Check file format
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(resume.type)) {
        alert('Resume must be in PDF, DOC, or DOCX format');
        return;
      }
    }

    // ID Proof file validation (optional field)
    if (idProof) {
      // Check file size (5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (idProof.size > maxSize) {
        alert('ID Proof file size must be less than 5MB');
        return;
      }

      // Check file type
      const allowedIdTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!allowedIdTypes.includes(idProof.type)) {
        alert('ID Proof must be in JPG, PNG, or PDF format');
        return;
      }
    }

    if (!password || password.length < 8) {
      alert(
        'Password must be at least 8 characters long'
      );
      return;
    }

    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    // Academic Details Validation

    if (!collegeName) {
      alert('Please enter your college name');
      return;
    }

    if (!department) {
      alert('Please enter your department');
      return;
    }

    if (!yearOfJoining) {
      alert('Please enter your year of joining');
      return;
    }

    if (!passedOutYear) {
      alert('Please enter your passed out year');
      return;
    }

    if (!rollNumber) {
      alert('Please enter your roll number');
      return;
    }

    // LinkedIn Validation

    if (
      linkedin &&
      !linkedin.includes('linkedin.com')
    ) {
      alert('Please enter a valid LinkedIn URL');
      return;
    }

    // Validate year ranges

    const joiningYear =
      parseInt(yearOfJoining);

    const graduationYear =
      parseInt(passedOutYear);

    const currentYear =
      new Date().getFullYear();

    if (
      joiningYear < 1950 ||
      joiningYear > currentYear
    ) {
      alert('Please enter a valid year of joining');
      return;
    }

    if (
      graduationYear < 1950 ||
      graduationYear > currentYear + 10
    ) {
      alert('Please enter a valid passed out year');
      return;
    }

    if (graduationYear <= joiningYear) {
      alert(
        'Passed out year must be after year of joining'
      );
      return;
    }

    // Current Status Validation

    if (!currentStatus) {
      alert('Please select your current status');
      return;
    }

    if (currentStatus === 'job') {

      if (!organization) {
        alert('Please enter your organization name');
        return;
      }

      if (!jobRole) {
        alert('Please enter your role/position');
        return;
      }

      if (!package_) {
        alert('Please enter your package/CTC');
        return;
      }

      if (!jobProof) {
        alert(
          'Please upload your proof (LOR/Joining Letter)'
        );
        return;
      }
    }

    if (currentStatus === 'higher-education') {

      if (!university) {
        alert(
          'Please enter your university/college'
        );
        return;
      }

      if (!country) {
        alert('Please enter your country');
        return;
      }

      if (!city) {
        alert('Please enter your city');
        return;
      }

      if (!course) {
        alert('Please enter your course');
        return;
      }

      if (!branch) {
        alert(
          'Please enter your branch/specialization'
        );
        return;
      }
    }

    const name =
      `${firstName} ${lastName}`.trim();

    try {

      const {
        data: authData,
        error: authError
      } = await supabase.auth.signUp({

        email: email.trim(),

        password: password

      });

      if (authError) {
        alert(authError.message);
        return;
      }

      const newUser: UserProfile = {

        id: `u-${Date.now()}`,

        name,

        role: selectedRole,

        avatar: photo
          ? URL.createObjectURL(photo)
          : `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=FDE68A&color=111827&size=256`,

        graduationYear:
          parseInt(passedOutYear),

        degree:
          currentStatus === 'job'
            ? `${department} - ${collegeName}`
            : currentStatus === 'higher-education'
            ? `${course} at ${university}`
            : `${department} - ${collegeName}`,

        company:
          currentStatus === 'job'
            ? organization
            : undefined,

        position:
          currentStatus === 'job'
            ? jobRole
            : undefined,

        bio:
          `${selectedRole.charAt(0).toUpperCase() +
          selectedRole.slice(1)} registered user`,

        skills: [],

        email: email.trim(),

        phone: phone.trim(),

        linkedin: linkedin
          ? linkedin.trim()
          : undefined,

        collegeName:
          currentStatus === 'higher-education'
            ? university.trim()
            : collegeName.trim(),

        department:
          currentStatus === 'higher-education'
            ? branch.trim()
            : department.trim(),

        rollNumber:
          rollNumber.trim(),

        year: yearOfJoining,

        resume:
          resume
            ? resume.name
            : undefined,

        idProof: idProof
          ? idProof.name
          : undefined,

        ...(currentStatus === 'job' && {

          package: package_.trim()

        }),

        ...(currentStatus === 'higher-education' && {

          country: country.trim(),

          city: city.trim(),

          course: course.trim()

        })
      };

      login(newUser);

      navigate('/dashboard');

    } catch (error) {

      alert(
        'Registration failed. Please try again.'
      );

      console.error(
        'Registration error:',
        error
      );
    }
  };

  // Role Selection Cards
if (!selectedRole) {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Join Our Alumni Network</h1>
          <p className="text-xl text-slate-300">Choose your role to get started</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Alumni Card */}
          <div
            onClick={() => handleRoleSelection('alumni')}
            className="group relative bg-gradient-to-br from-orange-600 via-amber-500 to-yellow-400 backdrop-blur-2xl bg-white/10 backdrop-saturate-200 rounded-3xl p-10 shadow-2xl cursor-pointer transform transition-all duration-500 hover:scale-105 hover:shadow-3xl hover:from-orange-700 hover:via-amber-600 hover:to-yellow-500 border-2 border-orange-200/50 hover:border-orange-300/50"
          >
            {/* Premium glassmorphism layers */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/30 via-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
            
            {/* Top light reflection effect */}
            <div className="absolute top-2 left-1/2 w-20 h-20 bg-gradient-to-br from-white/60 via-white/20 to-transparent rounded-full blur-2xl opacity-60 group-hover:opacity-80 transition-all duration-500"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-center mb-8">
                <div className="relative">
                  {/* Icon with glossy background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-400 via-amber-300 to-yellow-200 rounded-full blur-2xl opacity-90 animate-pulse"></div>
                  <GraduationCap className="relative z-10 w-20 h-20 text-white drop-shadow-2xl" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-white text-center mb-6 drop-shadow-2xl">Alumni</h2>
              <p className="text-orange-50 text-center mb-8 leading-relaxed text-lg">
                Connect with fellow graduates, share your achievements, and stay connected with your alma mater.
              </p>
              <div className="flex items-center justify-center">
                <span className="relative bg-gradient-to-r from-white via-orange-100 to-orange-50 text-orange-900 px-10 py-4 rounded-2xl font-bold shadow-2xl backdrop-blur-sm hover:from-orange-50 hover:to-white hover:shadow-2xl transform transition-all duration-500 hover:scale-110 hover:shadow-3xl border border-orange-200/50 hover:border-orange-300/50">
                  <span className="relative z-10">Register as Alumni</span>
                </span>
              </div>
            </div>
          </div>

          {/* Faculty Card */}
          <div
            onClick={() => handleRoleSelection('faculty')}
            className="group relative bg-gradient-to-br from-green-600 via-emerald-500 to-lime-300 backdrop-blur-2xl bg-white/10 backdrop-saturate-200 rounded-3xl p-10 shadow-2xl cursor-pointer transform transition-all duration-500 hover:scale-105 hover:shadow-3xl hover:from-green-700 hover:via-emerald-600 hover:to-lime-400 border-2 border-green-200/50 hover:border-green-300/50"
          >
            {/* Premium glassmorphism layers */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/40 via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
            
            {/* Top light reflection effect */}
            <div className="absolute top-2 right-2 w-24 h-24 bg-gradient-to-br from-white/60 via-white/20 to-transparent rounded-full blur-3xl opacity-70 group-hover:opacity-90 transition-all duration-500"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-center mb-8">
                <div className="relative">
                  {/* Icon with glossy background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-green-400 via-emerald-300 to-lime-200 rounded-full blur-2xl opacity-95 animate-pulse"></div>
                  <Users className="relative z-10 w-20 h-20 text-white drop-shadow-2xl" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-white text-center mb-6 drop-shadow-2xl">Faculty</h2>
              <p className="text-green-50 text-center mb-8 leading-relaxed text-lg">
                Join our faculty network, mentor students, and contribute to academic excellence.
              </p>
              <div className="flex items-center justify-center">
                <span className="relative bg-gradient-to-r from-white via-green-100 to-lime-50 text-green-900 px-10 py-4 rounded-2xl font-bold shadow-2xl backdrop-blur-sm hover:from-green-50 hover:to-white hover:shadow-2xl transform transition-all duration-500 hover:scale-110 hover:shadow-3xl border border-green-200/50 hover:border-green-300/50">
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
            <h2 className="text-3xl font-bold text-white">Alumni Registration</h2>
          </div>

          <div className="bg-white py-8 px-6 shadow-xl rounded-xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Details Section */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 mb-6">
                <div className="flex items-center mb-4">
                  <div className="w-1 h-6 bg-yellow-500 rounded-full mr-3"></div>
                  <h3 className="text-lg font-semibold text-slate-900">Personal Details</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
                    <label htmlFor="lastName" className="block text-sm font-medium text-slate-700 mb-1">
                      Last Name *
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label htmlFor="linkedin" className="block text-sm font-medium text-slate-700 mb-1">
                    LinkedIn Profile URL
                  </label>
                  <input
                    id="linkedin"
                    name="linkedin"
                    type="url"
                    placeholder="https://linkedin.com/in/yourprofile"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    Optional: Add your LinkedIn profile URL
                  </p>
                </div>

                <div className="mb-4">
                  <label htmlFor="resume" className="block text-sm font-medium text-slate-700 mb-1">
                    Resume/CV
                  </label>
                  <input
                    id="resume"
                    name="resume"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 file:mr-3 file:py-2 file:border-0 file:text-sm file:font-medium file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100"
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    Optional: Upload your resume (PDF, DOC, DOCX - Max size: 5MB)
                  </p>
                </div>

                <div className="mb-4">
                  <label htmlFor="idProof" className="block text-sm font-medium text-slate-700 mb-1">
                    ID Proof (College ID/Company ID) *
                  </label>
                  <input
                    id="idProof"
                    name="idProof"
                    type="file"
                    accept="image/*,.pdf"
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 file:mr-3 file:py-2 file:border-0 file:text-sm file:font-medium file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100"
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    Accepted formats: JPG, PNG, PDF (Max size: 5MB)
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                      Password *
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        minLength={8}
                        required
                        placeholder="Create a strong password"
                        className="w-full pr-11 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      />
                      <button
                        type="button"
                        onClick={togglePassword}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-slate-400" />
                        ) : (
                          <Eye className="h-5 w-5 text-slate-400" />
                        )}
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
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        minLength={8}
                        required
                        placeholder="Confirm your password"
                        className="w-full pr-11 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      />
                      <button
                        type="button"
                        onClick={toggleConfirmPassword}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5 text-slate-400" />
                        ) : (
                          <Eye className="h-5 w-5 text-slate-400" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Academic Details Section */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 mb-6">
                <div className="flex items-center mb-4">
                  <div className="w-1 h-6 bg-yellow-500 rounded-full mr-3"></div>
                  <h3 className="text-lg font-semibold text-slate-900">Academic Details</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="collegeName" className="block text-sm font-medium text-slate-700 mb-1">
                      College Name *
                    </label>
                    <input
                      id="collegeName"
                      name="collegeName"
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
                      name="department"
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="yearOfJoining" className="block text-sm font-medium text-slate-700 mb-1">
                      Year of Joining *
                    </label>
                    <input
                      id="yearOfJoining"
                      name="yearOfJoining"
                      type="number"
                      min="1950"
                      max="2030"
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="passedOutYear" className="block text-sm font-medium text-slate-700 mb-1">
                      Passed Out Year *
                    </label>
                    <input
                      id="passedOutYear"
                      name="passedOutYear"
                      type="number"
                      min="1950"
                      max="2030"
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="rollNumber" className="block text-sm font-medium text-slate-700 mb-1">
                    Roll Number *
                  </label>
                  <input
                    id="rollNumber"
                    name="rollNumber"
                    type="text"
                    placeholder="e.g., CS12345"
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  />
                </div>
              </div>

              {/* Current Status Section */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 mb-6">
                <div className="flex items-center mb-4">
                  <div className="w-1 h-6 bg-yellow-500 rounded-full mr-3"></div>
                  <h3 className="text-lg font-semibold text-slate-900">Current Status</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="currentStatus"
                        value="job"
                        checked={currentStatus === 'job'}
                        onChange={() => setCurrentStatus('job')}
                        className="w-4 h-4 text-yellow-600 focus:ring-yellow-500 border-slate-300"
                      />
                      <span className="text-sm font-medium text-slate-700">Job</span>
                    </label>
                  </div>
                  <div>
                    <label className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="currentStatus"
                        value="higher-education"
                        checked={currentStatus === 'higher-education'}
                        onChange={() => setCurrentStatus('higher-education')}
                        className="w-4 h-4 text-yellow-600 focus:ring-yellow-500 border-slate-300"
                      />
                      <span className="text-sm font-medium text-slate-700">Higher Education</span>
                    </label>
                  </div>
                </div>

                {/* Job Details */}
                {currentStatus === 'job' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="organization" className="block text-sm font-medium text-slate-700 mb-1">
                          Organization Name *
                        </label>
                        <input
                          id="organization"
                          name="organization"
                          type="text"
                          required
                          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="jobRole" className="block text-sm font-medium text-slate-700 mb-1">
                          Role/Position *
                        </label>
                        <input
                          id="jobRole"
                          name="jobRole"
                          type="text"
                          required
                          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="package" className="block text-sm font-medium text-slate-700 mb-1">
                          Package/CTC *
                        </label>
                        <input
                          id="package"
                          name="package"
                          type="text"
                          placeholder="e.g. 5 LPA – 6 LPA"
                          required
                          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="jobProof" className="block text-sm font-medium text-slate-700 mb-1">
                          Proof (LOR/Joining Letter) *
                        </label>
                        <input
                          id="jobProof"
                          name="jobProof"
                          type="file"
                          required
                          accept="image/*,.pdf"
                          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 file:mr-3 file:py-2 file:border-0 file:text-sm file:font-medium file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100"
                        />
                        <p className="mt-1 text-xs text-slate-500">
                          Accepted formats: JPG, PNG, PDF (Max size: 5MB)
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Higher Education Details */}
                {currentStatus === 'higher-education' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="university" className="block text-sm font-medium text-slate-700 mb-1">
                          University/College Applied *
                        </label>
                        <input
                          id="university"
                          name="university"
                          type="text"
                          required
                          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="country" className="block text-sm font-medium text-slate-700 mb-1">
                          Country *
                        </label>
                        <input
                          id="country"
                          name="country"
                          type="text"
                          required
                          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="city" className="block text-sm font-medium text-slate-700 mb-1">
                          City *
                        </label>
                        <input
                          id="city"
                          name="city"
                          type="text"
                          required
                          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="course" className="block text-sm font-medium text-slate-700 mb-1">
                          Course *
                        </label>
                        <input
                          id="course"
                          name="course"
                          type="text"
                          required
                          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="branch" className="block text-sm font-medium text-slate-700 mb-1">
                        Branch/Specialization *
                      </label>
                      <input
                        id="branch"
                        name="branch"
                        type="text"
                        required
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-center">
                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-yellow-500 text-slate-900 rounded-md font-semibold hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors"
                >
                  Create Account
                </button>
              </div>
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
            <h2 className="text-3xl font-bold text-white">Faculty Registration</h2>
          </div>

          <div className="bg-white py-8 px-6 shadow-xl rounded-xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Details Section */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 mb-6">
                <div className="flex items-center mb-4">
                  <div className="w-1 h-6 bg-yellow-500 rounded-full mr-3"></div>
                  <h3 className="text-lg font-semibold text-slate-900">Personal Details</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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
                      Middle Name *
                    </label>
                    <input
                      id="middleName"
                      name="middleName"
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-slate-700 mb-1">
                      Last Name *
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                      Password *
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        minLength={8}
                        required
                        placeholder="Create a strong password"
                        className="w-full pr-11 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      />
                      <button
                        type="button"
                        onClick={togglePassword}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-slate-400" />
                        ) : (
                          <Eye className="h-5 w-5 text-slate-400" />
                        )}
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
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        minLength={8}
                        required
                        placeholder="Confirm your password"
                        className="w-full pr-11 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      />
                      <button
                        type="button"
                        onClick={toggleConfirmPassword}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5 text-slate-400" />
                        ) : (
                          <Eye className="h-5 w-5 text-slate-400" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Academic Details Section */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 mb-6">
                <div className="flex items-center mb-4">
                  <div className="w-1 h-6 bg-yellow-500 rounded-full mr-3"></div>
                  <h3 className="text-lg font-semibold text-slate-900">Academic Details</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="collegeName" className="block text-sm font-medium text-slate-700 mb-1">
                      College Name *
                    </label>
                    <input
                      id="collegeName"
                      name="collegeName"
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
                      name="department"
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-yellow-500 text-slate-900 rounded-md font-semibold hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return null;
}