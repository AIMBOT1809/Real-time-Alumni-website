import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';
import { Link, useNavigate } from 'react-router';
import { validateUploadedDocument } from "../../documentValidation";
import { useAuth } from '../context/AuthContext';
import type { UserProfile } from '../data/types';

interface StudentRegistrationProps {
  onBack: () => void;
}

export function StudentRegistration({ onBack }: StudentRegistrationProps) {
  const [isDocumentVerified, setIsDocumentVerified] = useState(false);
  const [verifiedDocument, setVerifiedDocument] = useState<File | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
      alert("Please upload valid memo");
      return;
    }

    if (memo) {
      const maxSize = 5 * 1024 * 1024;
      if (memo.size > maxSize) {
        alert('Memo file size must be less than 5MB');
        return;
      }

      const allowedMemoTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!allowedMemoTypes.includes(memo.type)) {
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
  const rollRegex = /^[0-9]{2}K9.*$/i;
  if (!rollRegex.test(rollNumber.trim())) {
  alert('Please enter a valid roll number ');
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

    const name = `${firstName} ${lastName}`.trim();

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            role: 'student',
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
        .from('id-proofs')
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
        .from('student_profiles')
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
            id_proof_url: memoUrl,
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
        role: 'student',
        avatar: photo && photo.size > 0
          ? URL.createObjectURL(photo)
          : `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=FDE68A&color=111827&size=256`,
        graduationYear: parseInt(passedOutYear),
        degree: `${department} - ${collegeName}`,
        bio: `Student at ${collegeName}`,
        skills: [],
        email: email.trim(),
        phone: phone.trim(),
        linkedin: linkedin ? linkedin.trim() : undefined,
        collegeName: collegeName.trim(),
        department: department.trim(),
        rollNumber: rollNumber.trim(),
        memo: memo ? memo.name : undefined,
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

          <h2 className="text-3xl font-bold text-white mb-4">
            Student Registration
          </h2>

          <p className="text-slate-300">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-yellow-400 hover:text-yellow-300 font-medium"
            >
              Login
            </Link>
          </p>
        </div>

        <div className="bg-white py-8 px-6 shadow-xl rounded-xl">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Personal Details */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 mb-6">
              <div className="flex items-center mb-4">
                <div className="w-1 h-6 bg-yellow-500 rounded-full mr-3"></div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Personal Details
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    First Name *
                  </label>
                  <input
                    name="firstName"
                    type="text"
                    required
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Last Name *
                  </label>
                  <input
                    name="lastName"
                    type="text"
                    required
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-md
                    focus:outline-none focus:ring-2 focus:ring-yellow-500
                    focus:border-yellow-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-md
                    focus:outline-none focus:ring-2 focus:ring-yellow-500
                    focus:border-yellow-500"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  LinkedIn URL
                </label>
                <input
                  name="linkedin"
                  type="url"
                  placeholder="https://linkedin.com/in/username"
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Memo *
                </label>
                <input
                  name="memo"
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  required
                  onChange={handleDocumentValidation}
                  className="w-full border border-slate-300 rounded-md p-2
                  file:bg-yellow-50 file:text-yellow-700 file:border-0
                  file:px-3 file:py-2 file:rounded-md"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Photo / Profile Picture
                </label>
                <input
                  name="photo"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  className="w-full border border-slate-300 rounded-md p-2
                  file:bg-yellow-50 file:text-yellow-700 file:border-0
                  file:px-3 file:py-2 file:rounded-md"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Password *
                  </label>
                  <input
                    name="password"
                    type="password"
                    minLength={8}
                    required
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Confirm Password *
                  </label>
                  <input
                    name="confirmPassword"
                    type="password"
                    minLength={8}
                    required
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </div>
            </div>

            {/* Academic Details */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 mb-6">
              <div className="flex items-center mb-4">
                <div className="w-1 h-6 bg-yellow-500 rounded-full mr-3"></div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Academic Details
                </h3>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  College Name *
                </label>
                <input
                  name="collegeName"
                  type="text"
                  required
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Roll Number *
                </label>
                <input
                  name="rollNumber"
                  type="text"
                  required
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Department *
                </label>
                <input
                  name="department"
                  type="text"
                  required
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Year of Joining *
                  </label>
                  <input
                    name="yearOfJoining"
                    type="number"
                    min="1950"
                    max={new Date().getFullYear()}
                    required
                    placeholder="e.g., 2020"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Year of Passing Out *
                  </label>
                  <input
                    name="passedOutYear"
                    type="number"
                    min="1950"
                    max={new Date().getFullYear() + 10}
                    required
                    placeholder="e.g., 2024"
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
                Register as Student
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
