import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';
import { Link, useNavigate } from 'react-router';
import { validateUploadedDocument } from "../../documentValidation";
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { UserProfile } from '../data/types';

interface AlumniRegistrationProps {
  onBack: () => void;
}

export function AlumniRegistration({ onBack }: AlumniRegistrationProps) {
  const [isDocumentVerified, setIsDocumentVerified] = useState(false);
  const [verifiedDocument, setVerifiedDocument] = useState<File | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<
    'working-professional' | 'higher-education' | 'career-aspirant' | null
  >(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const togglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const toggleConfirmPassword = () => {
    setShowConfirmPassword((prev) => !prev);
  };

  const handleDocumentValidation = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const validationResult = await validateUploadedDocument(file);

      if (!validationResult.valid) {
        alert(validationResult.reason || "Invalid document.");
        setIsDocumentVerified(false);
        setVerifiedDocument(null);
        e.target.value = "";
        return;
      }

      setIsDocumentVerified(true);
      setVerifiedDocument(file);
    } catch (error) {
      console.error(error);
      alert("Unable to validate document");
      setIsDocumentVerified(false);
      setVerifiedDocument(null);
      e.target.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);

    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;
    const memo = formData.get('memo') as File;
    const photo = formData.get('photo') as File;
    const collegeName = formData.get('collegeName') as string;
    const department = formData.get('department') as string;
    const yearOfJoining = formData.get('yearOfJoining') as string;
    const passedOutYear = formData.get('passedOutYear') as string;
    const rollNumber = formData.get('rollNumber') as string;
    const linkedin = formData.get('linkedin') as string;
    const organization = formData.get('organization') as string;
    const jobRole = formData.get('jobRole') as string;
    const package_ = formData.get('package') as string;
    const jobProof = formData.get('jobProof') as File;
    const skills = formData.get('skills') as string;
    const resumeUpload = formData.get('resumeUpload') as File;
    const university = formData.get('university') as string;
    const country = formData.get('country') as string;
    const city = formData.get('city') as string;
    const course = formData.get('course') as string;
    const branch = formData.get('branch') as string;

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

    if (linkedin && linkedin.trim()) {
      const linkedinRegex = /^https?:\/\/(www\.)?linkedin\.com\/.+/i;
      if (!linkedinRegex.test(linkedin.trim())) {
        alert('Please enter a valid LinkedIn profile URL (e.g., https://linkedin.com/in/yourprofile)');
        return;
      }
    }

    if (!memo || memo.size === 0) {
      alert("Please upload valid  proof");
      return;
    }

    if (memo) {
      const maxSize = 5 * 1024 * 1024;
      if (memo.size > maxSize) {
        alert('Memo file size must be less than 5MB');
        return;
      }

      const allowedIdTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!allowedIdTypes.includes(memo.type)) {
        alert('Memo must be in JPG, PNG, or PDF format');
        return;
      }
    }

    if (!password || password.length < 8) {
      alert('Password must be at least 8 characters long');
      return;
    }

    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

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

    if (linkedin && !linkedin.includes('linkedin.com')) {
      alert('Please enter a valid LinkedIn URL');
      return;
    }

    const joiningYear = parseInt(yearOfJoining);
    const graduationYear = parseInt(passedOutYear);
    const currentYear = new Date().getFullYear();

    if (joiningYear < 1950 || joiningYear > currentYear) {
      alert('Please enter a valid year of joining');
      return;
    }

    if (graduationYear < 1950 || graduationYear > currentYear + 10) {
      alert('Please enter a valid passed out year');
      return;
    }

    if (graduationYear <= joiningYear) {
      alert('Passed out year must be after year of joining');
      return;
    }

    if (currentStatus === 'higher-education') {
      if (!university) {
        alert('Please enter your university/college');
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
        alert('Please enter your branch/specialization');
        return;
      }
    }

    if (currentStatus === 'career-aspirant') {
      if (!skills) {
        alert('Please enter your skills');
        return;
      }

      if (!resumeUpload || resumeUpload.size === 0) {
        alert('Please upload your resume');
        return;
      }

      const maxResumeSize = 5 * 1024 * 1024;
      if (resumeUpload.size > maxResumeSize) {
        alert('Resume must be less than 5MB');
        return;
      }

      const allowedResumeTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ];
      if (!allowedResumeTypes.includes(resumeUpload.type)) {
        alert('Resume must be PDF, DOC, or DOCX');
        return;
      }
    }

    const name = `${firstName} ${lastName}`.trim();

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            role: 'alumni',
          },
        },
      });

      if (authError) {
        alert(authError.message);
        return;
      }

      // Upload Memo
      const memoFileName = `${Date.now()}-${memo.name}`;
      const { data: memoUpload, error: memoError } = await supabase.storage
        .from('memos')
        .upload(memoFileName, memo);

      if (memoError) {
        console.log(memoError);
        alert(memoError.message);
        return;
      }

      const { data: memoUrlData } = supabase.storage
        .from('memos')
        .getPublicUrl(memoFileName);

      const memoUrl = memoUrlData.publicUrl;

      // Upload Photo
      let photoUrl = '';
      if (photo && photo.size > 0) {
        const photoFileName = `${Date.now()}-${photo.name}`;
        const { data: photoUpload, error: photoError } = await supabase.storage
          .from('profile-photos')
          .upload(photoFileName, photo);

        if (photoError) {
          console.log(photoError);
          alert(photoError.message);
          return;
        }

        const { data: photoUrlData } = supabase.storage
          .from('profile-photos')
          .getPublicUrl(photoFileName);

        photoUrl = photoUrlData.publicUrl;
      }

      const { error: profileError } = await supabase
        .from('alumni_profiles')
        .insert([
          {
            user_id: authData.user?.id,
            First_Name: firstName,
            Last_name: lastName,
            Email_Address: email,
            Phone_Number: phone,
            LinkedIn_Profile_URL: linkedin,
            College_Name: collegeName,
            Department: department,
            Year_of_Joining: yearOfJoining,
            Passed_Out_Year: passedOutYear,
            Roll_Number: rollNumber,
            Current_Status: currentStatus,
            Organization_Name: organization,
            Role_Position: jobRole,
            Package_CTC: package_, 
            University_Applied: university,
            Country: country,
            City: city,
            Course: course,
            Branch_Specialization: branch,
            id_proof_url: memoUrl,
            photo_url: photoUrl,
            Skills: skills,
            Resume_File_Name: currentStatus === 'career-aspirant' ? resumeUpload?.name : null,
          }
        ]);

      if (profileError) {
        console.log(profileError);
        alert(profileError.message);
        return;
      }

      const newUser: UserProfile = {
        id: authData.user?.id ?? `u-${Date.now()}`,
        name,
        role: 'alumni',
        avatar: photo && photo.size > 0
          ? URL.createObjectURL(photo)
          : `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=FDE68A&color=111827&size=256`,
        graduationYear: parseInt(passedOutYear),
        degree:
          currentStatus === 'working-professional'
            ? `${department} - ${collegeName}`
            : currentStatus === 'higher-education'
            ? `${course} at ${university}`
            : currentStatus === 'career-aspirant'
            ? skills
            : `${department} - ${collegeName}`,
        company:
          currentStatus === 'working-professional'
            ? organization
            : undefined,
        position:
          currentStatus === 'working-professional'
            ? jobRole
            : undefined,
        bio: `Alumni registered user`,
        skills:
          currentStatus === 'career-aspirant' && skills
            ? skills.split(',').map((skill) => skill.trim()).filter(Boolean)
            : [],
        email: email.trim(),
        phone: phone.trim(),
        linkedin: linkedin ? linkedin.trim() : undefined,
        collegeName:
          currentStatus === 'higher-education'
            ? university.trim()
            : collegeName.trim(),
        department:
          currentStatus === 'higher-education'
            ? branch.trim()
            : department.trim(),
        rollNumber: rollNumber.trim(),
        year: yearOfJoining,
        yearOfJoining: parseInt(yearOfJoining),
        passedOutYear: parseInt(passedOutYear),
        memo: memo ? memo.name : undefined,
        ...(currentStatus === 'working-professional' && {
          package: package_.trim()
        }),
        ...(currentStatus === 'higher-education' && {
          country: country.trim(),
          city: city.trim(),
          course: course.trim()
        })
      };

      await login(newUser);
      navigate('/dashboard');
    } catch (error) {
      alert('Registration failed. Please try again.');
      console.error('Registration error:', error);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <button
            onClick={onBack}
            className="text-yellow-500 hover:text-yellow-400 mb-4 inline-flex items-center"
          >
            ← Back to role selection
          </button>
          <h2 className="text-3xl font-bold text-white mb-4">Alumni Registration</h2>
          <p className="text-slate-300">
            Already have an account? <Link to="/login" className="text-yellow-400 hover:text-yellow-300 font-medium transition-colors cursor-pointer">Login</Link>
          </p>
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
                <label htmlFor="memo" className="block text-sm font-medium text-slate-700 mb-1">
                  Memo *
                </label>
                <input
                  id="memo"
                  name="memo"
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  required
                  onChange={handleDocumentValidation}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 file:mr-3 file:py-2 file:border-0 file:text-sm file:font-medium file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100"   
                />
                <p className="mt-1 text-xs text-slate-500">
                  Accepted formats: JPG, JPEG, PNG, PDF (Max 5MB)
                </p>
              </div>

              <div className="mb-4">
                <label htmlFor="photo" className="block text-sm font-medium text-slate-700 mb-1">
                  Upload Photo / Profile Picture
                </label>
                <input
                  id="photo"
                  name="photo"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 file:mr-3 file:py-2 file:border-0 file:text-sm file:font-medium file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100"
                />
                <p className="mt-1 text-xs text-slate-500">
                  Accepted formats: JPG, JPEG, PNG (Max size: 5MB)
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
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="currentStatus"
                      value="working-professional"
                      checked={currentStatus === 'working-professional'}
                      onChange={() => setCurrentStatus('working-professional')}
                      className="w-4 h-4 text-yellow-600 focus:ring-yellow-500 border-slate-300"
                    />
                    <span className="text-sm font-medium text-slate-700">Working Professional</span>
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
                <div>
                  <label className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="currentStatus"
                      value="career-aspirant"
                      checked={currentStatus === 'career-aspirant'}
                      onChange={() => setCurrentStatus('career-aspirant')}
                      className="w-4 h-4 text-yellow-600 focus:ring-yellow-500 border-slate-300"
                    />
                    <span className="text-sm font-medium text-slate-700">Career Aspirant</span>
                  </label>
                </div>
              </div>

              {/* Job Details */}
              {currentStatus === 'working-professional' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="organization" className="block text-sm font-medium text-slate-700 mb-1">
                        Organization Name
                      </label>
                      <input
                        id="organization"
                        name="organization"
                        type="text"
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="jobRole" className="block text-sm font-medium text-slate-700 mb-1">
                        Role/Position
                      </label>
                      <input
                        id="jobRole"
                        name="jobRole"
                        type="text"
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="package" className="block text-sm font-medium text-slate-700 mb-1">
                        Package/CTC
                      </label>
                      <input
                        id="package"
                        name="package"
                        type="text"
                        placeholder="e.g. 5 LPA – 6 LPA"
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="jobProof" className="block text-sm font-medium text-slate-700 mb-1">
                        Proof (LOR/Joining Letter)
                      </label>
                      <input
                        id="jobProof"
                        name="jobProof"
                        type="file"
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

              {currentStatus === 'career-aspirant' && (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="skills" className="block text-sm font-medium text-slate-700 mb-1">
                      Skills
                    </label>
                    <input
                      id="skills"
                      name="skills"
                      type="text"
                      placeholder="e.g. JavaScript, Data Analysis"
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    />
                    <p className="mt-1 text-xs text-slate-500">
                      Add comma-separated skills relevant to your job search.
                    </p>
                  </div>
                  <div>
                    <label htmlFor="resumeUpload" className="block text-sm font-medium text-slate-700 mb-1">
                      Resume Upload
                    </label>
                    <input
                      id="resumeUpload"
                      name="resumeUpload"
                      type="file"
                      required
                      accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 file:mr-3 file:py-2 file:border-0 file:text-sm file:font-medium file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100"
                    />
                    <p className="mt-1 text-xs text-slate-500">
                      Accepted formats: PDF, DOC, DOCX (Max size: 5MB)
                    </p>
                  </div>
                </div>
              )}

              {/* Higher Education Details */}
              {currentStatus === 'higher-education' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="university" className="block text-sm font-medium text-slate-700 mb-1">
                        University/College Name *
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
                        Course Name *
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
