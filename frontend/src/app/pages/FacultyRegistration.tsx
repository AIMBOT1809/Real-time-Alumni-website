import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';
import { Link, useNavigate } from 'react-router';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { UserProfile } from '../data/types';

interface FacultyRegistrationProps {
  onBack: () => void;
}

export function FacultyRegistration({ onBack }: FacultyRegistrationProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [facultyType, setFacultyType] = useState("");
  const [customFacultyType, setCustomFacultyType] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const togglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const toggleConfirmPassword = () => {
    setShowConfirmPassword((prev) => !prev);
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
    const id = formData.get('id') as File;
    const photo = formData.get('photo') as File;
    const department = formData.get('department') as string;
    const facultyId = formData.get('facultyId') as string;
    const officeEmail = formData.get('officeEmail') as string;
    const facultyType = formData.get('facultyType') as string;
    const yearsOfExperience = formData.get('yearsOfExperience') as string;
    const linkedin = formData.get('linkedin') as string;

    // Validation
    if (!firstName || !lastName) {
      alert('Please enter both first and last name');
      return;
    }

    if (!email || !email.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }

    // Phone validation - exactly 10 digits only
    const phoneRegex = /^\d{10}$/;
    if (!phone || !phoneRegex.test(phone)) {
      alert('Please enter a valid phone number (exactly 10 digits, numbers only)');
      return;
    }

    if (linkedin && linkedin.trim()) {
      const linkedinRegex = /^https?:\/\/(www\.)?linkedin\.com\/.+/i;
      if (!linkedinRegex.test(linkedin.trim())) {
        alert('Please enter a valid LinkedIn profile URL (e.g., https://linkedin.com/in/yourprofile)');
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

    if (!department) {
      alert('Please select your department');
      return;
    }

    if (!facultyId) {
      alert('Please enter your Faculty ID');
      return;
    }

    if (!facultyType) {
      alert('Please select your Faculty Type');
      return;
    }

    if (!yearsOfExperience) {
      alert('Please enter your Years of Experience');
      return;
    }

    // If "Other" is selected, validate custom faculty type
    const finalFacultyType = facultyType === 'Other' ? customFacultyType.trim() : facultyType;
    if (facultyType === 'Other' && !customFacultyType.trim()) {
      alert('Please specify your faculty type');
      return;
    }

    const name = `${firstName} ${lastName}`.trim();

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            role: 'faculty',
          },
        },
      });

      if (authError) {
        alert(authError.message);
        return;
      }

      // Upload ID (optional)
      let idUrl = '';
      if (id && id.size > 0) {
        const idFileName = `${Date.now()}-${id.name}`;
        const { data: idUpload, error: idError } = await supabase.storage
          .from('faculty-id-proofs')
          .upload(idFileName, id);

        if (idError) {
          console.log(idError);
          alert(idError.message);
          return;
        }

        const { data: idUrlData } = supabase.storage
          .from('faculty-id-proofs')
          .getPublicUrl(idFileName);

        idUrl = idUrlData.publicUrl;
      }

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
      //hellooo
      const { error: profileError } = await supabase
        .from('faculty_profiles')
        .insert([
          {
            user_id: authData.user?.id,
            First_Name: firstName,
            Last_name: lastName,
            Email_Address: email,
            Office_Email: officeEmail || null,
            Phone_Number: phone,
            LinkedIn_Profile_URL: linkedin,
            Department: department,
            Faculty_ID: facultyId,
            Faculty_Type: finalFacultyType,
            Years_Of_Experience: parseInt(yearsOfExperience),
            id_proof_url: idUrl,
            photo_url: photoUrl,
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
        role: 'faculty',
        avatar: photo && photo.size > 0
          ? URL.createObjectURL(photo)
          : `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=FDE68A&color=111827&size=256`,
        graduationYear: new Date().getFullYear(),
        degree: `${department}`,
        bio: `Faculty member`,
        skills: [],
        email: email.trim(),
        phone: phone.trim(),
        linkedin: linkedin ? linkedin.trim() : undefined,
        department: department.trim(),
        memo: id ? id.name : undefined,
        facultyId: facultyId.trim(),
        officeEmail: officeEmail.trim(),
        facultyType: facultyType as any,
        yearsOfExperience: parseInt(yearsOfExperience),
      };

      await login(newUser);
      navigate('/login');
    } catch (error) {
      alert('Registration failed. Please try again.');
      console.error('Registration error:', error);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl w-full">
        <div className="text-center mb-8">
          <button
            onClick={onBack}
            className="text-yellow-500 hover:text-yellow-400 mb-4 inline-flex items-center"
          >
            ← Back to role selection
          </button>
          <h2 className="text-3xl font-bold text-white mb-4">Faculty Registration</h2>
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
                      maxLength={10}
                      onInput={(e) => {
                        const target = e.target as HTMLInputElement;
                        target.value = target.value.replace(/\D/g, '').slice(0, 10);
                      }}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    />
                  </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="officeEmail" className="block text-sm font-medium text-slate-700 mb-1">
                    College Email Address (Optional)
                  </label>
                  <input
                    id="officeEmail"
                    name="officeEmail"
                    type="email"
                    placeholder="e.g., faculty@college.edu"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  />
                </div>
                <div>
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
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="id" className="block text-sm font-medium text-slate-700 mb-1">
                  ID Proof (Faculty ID)
                </label>
                <input
                  id="id"
                  name="id"
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 file:mr-3 file:py-2 file:border-0 file:text-sm file:font-medium file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100"   
                />
                <p className="mt-1 text-xs text-slate-500">
                  Accepted formats: JPG, JPEG, PNG, PDF
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

            {/* Faculty Details Section */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 mb-6">
              <div className="flex items-center mb-4">
                <div className="w-1 h-6 bg-yellow-500 rounded-full mr-3"></div>
                <h3 className="text-lg font-semibold text-slate-900">Faculty Details</h3>
              </div>
              
              <div className="mb-4">
                <label htmlFor="facultyId" className="block text-sm font-medium text-slate-700 mb-1">
                  Faculty ID *
                </label>
                <input
                  id="facultyId"
                  name="facultyId"
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="department" className="block text-sm font-medium text-slate-700 mb-1">
                    Department *
                  </label>
                  <select
                    id="department"
                    name="department"
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  >
                    <option value="">Select Department</option>
                    <option value="CSE">CSE</option>
                    <option value="CSD">CSD</option>
                    <option value="CSM">CSM</option>
                    <option value="ECE">ECE</option>
                    <option value="EEE">EEE</option>
                    <option value="IT">IT</option>
                    <option value="MECH">MECH</option>
                    <option value="CIVIL">CIVIL</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="facultyType" className="block text-sm font-medium text-slate-700 mb-1">
                    Faculty Type *
                  </label>
                  <select
                    id="facultyType"
                    name="facultyType"
                    required
                    value={facultyType}
                    onChange={(e) => {
                      setFacultyType(e.target.value);
                      if (e.target.value !== 'Other') {
                        setCustomFacultyType("");
                      }
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  >
                    <option value="">Select Faculty Type</option>
                    <option value="Full-Time">Professor</option>
                    <option value="Part-Time">Associate Professor</option>
                    <option value="Visiting">Assistant Professor</option>
                    <option value="Contract">HoD</option>
                    <option value="Lecturer">Lecturer</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {facultyType === 'Other' && (
                <div className="mb-4">
                  <label htmlFor="customFacultyType" className="block text-sm font-medium text-slate-700 mb-1">
                    Specify Faculty Type *
                  </label>
                  <input
                    id="customFacultyType"
                    name="customFacultyType"
                    type="text"
                    required
                    value={customFacultyType}
                    onChange={(e) => setCustomFacultyType(e.target.value)}
                    placeholder="e.g., Adjunct Faculty, Research Scholar"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  />
                </div>
              )}

              <div className="mb-4">
                <label htmlFor="yearsOfExperience" className="block text-sm font-medium text-slate-700 mb-1">
                  Years of Experience *
                </label>
                <input
                  id="yearsOfExperience"
                  name="yearsOfExperience"
                  type="number"
                  min="0"
                  required
                  placeholder="e.g., 5"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                />
              </div>
            </div>

            <div className="flex justify-center">
              <button
                type="submit"
                className="w-full py-3 px-4 bg-yellow-500 text-slate-900 rounded-md font-semibold hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors"
              >
                Register as Faculty
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
