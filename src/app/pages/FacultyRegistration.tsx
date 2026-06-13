import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';
import { Link, useNavigate } from 'react-router';
import { validateUploadedDocument } from "../../documentValidation";
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { UserProfile } from '../data/types';

interface FacultyRegistrationProps {
  onBack: () => void;
}

export function FacultyRegistration({ onBack }: FacultyRegistrationProps) {
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
    const idProof = formData.get('idProof') as File;
    const photo = formData.get('photo') as File;
    const collegeName = formData.get('collegeName') as string;
    const department = formData.get('department') as string;
    const facultyId = formData.get('facultyId') as string;
    const officeEmail = formData.get('officeEmail') as string;
    const designation = formData.get('designation') as string;
    const facultyType = formData.get('facultyType') as string;
    const yearsOfExperience = formData.get('yearsOfExperience') as string;
    const specialization = formData.get('specialization') as string;
    const researchInterests = formData.get('researchInterests') as string;
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

    if (!idProof || idProof.size === 0) {
      alert("Please upload valid ID proof");
      return;
    }

    if (idProof) {
      const maxSize = 5 * 1024 * 1024;
      if (idProof.size > maxSize) {
        alert('ID Proof file size must be less than 5MB');
        return;
      }

      const allowedIdTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!allowedIdTypes.includes(idProof.type)) {
        alert('ID Proof must be in JPG, PNG, or PDF format');
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

    if (!facultyId) {
      alert('Please enter your Faculty ID');
      return;
    }

    if (!officeEmail) {
      alert('Please enter your Office Email Address');
      return;
    }

    if (!designation) {
      alert('Please enter your Designation');
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

    if (!specialization) {
      alert('Please enter your Specialization');
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

      // Upload ID Proof
      const idProofFileName = `${Date.now()}-${idProof.name}`;
      const { data: idProofUpload, error: idProofError } = await supabase.storage
        .from('id-proofs')
        .upload(idProofFileName, idProof);

      if (idProofError) {
        console.log(idProofError);
        alert(idProofError.message);
        return;
      }

      const { data: idProofUrlData } = supabase.storage
        .from('id-proofs')
        .getPublicUrl(idProofFileName);

      const idProofUrl = idProofUrlData.publicUrl;

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
            Office_Email: officeEmail,
            Phone_Number: phone,
            LinkedIn_Profile_URL: linkedin,
            College_Name: collegeName,
            Department: department,
            Faculty_ID: facultyId,
            Designation: designation,
            Faculty_Type: facultyType,
            Years_Of_Experience: parseInt(yearsOfExperience),
            Specialization: specialization,
            Research_Interests: researchInterests || null,
            id_proof_url: idProofUrl,
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
        degree: `${specialization} - ${department}`,
        bio: `Faculty member at ${collegeName}`,
        skills: [],
        email: email.trim(),
        phone: phone.trim(),
        linkedin: linkedin ? linkedin.trim() : undefined,
        collegeName: collegeName.trim(),
        department: department.trim(),
        idProof: idProof ? idProof.name : undefined,
        facultyId: facultyId.trim(),
        officeEmail: officeEmail.trim(),
        designation: designation.trim(),
        facultyType: facultyType as any,
        yearsOfExperience: parseInt(yearsOfExperience),
        specialization: specialization.trim(),
        researchInterests: researchInterests ? researchInterests.split(',').map(interest => interest.trim()).filter(Boolean) : [],
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
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="officeEmail" className="block text-sm font-medium text-slate-700 mb-1">
                    Office Email Address *
                  </label>
                  <input
                    id="officeEmail"
                    name="officeEmail"
                    type="email"
                    required
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
                <label htmlFor="idProof" className="block text-sm font-medium text-slate-700 mb-1">
                  ID Proof (Faculty ID) *
                </label>
                <input
                  id="idProof"
                  name="idProof"
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

            {/* Faculty Details Section */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 mb-6">
              <div className="flex items-center mb-4">
                <div className="w-1 h-6 bg-yellow-500 rounded-full mr-3"></div>
                <h3 className="text-lg font-semibold text-slate-900">Faculty Details</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
                  <label htmlFor="designation" className="block text-sm font-medium text-slate-700 mb-1">
                    Designation *
                  </label>
                  <input
                    id="designation"
                    name="designation"
                    type="text"
                    placeholder="e.g., Assistant Professor, Associate Professor"
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="facultyType" className="block text-sm font-medium text-slate-700 mb-1">
                    Faculty Type *
                  </label>
                  <select
                    id="facultyType"
                    name="facultyType"
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  >
                    <option value="">Select Faculty Type</option>
                    <option value="Full-Time">Full-Time</option>
                    <option value="Part-Time">Part-Time</option>
                    <option value="Visiting">Visiting</option>
                    <option value="Contract">Contract</option>
                  </select>
                </div>
                <div>
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

              <div className="mb-4">
                <label htmlFor="specialization" className="block text-sm font-medium text-slate-700 mb-1">
                  Specialization *
                </label>
                <input
                  id="specialization"
                  name="specialization"
                  type="text"
                  placeholder="e.g., Data Science, Web Development"
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                />
              </div>

              <div className="mb-4">
                <label htmlFor="researchInterests" className="block text-sm font-medium text-slate-700 mb-1">
                  Research Interests
                </label>
                <input
                  id="researchInterests"
                  name="researchInterests"
                  type="text"
                  placeholder="e.g., Machine Learning, Artificial Intelligence (comma-separated)"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                />
                <p className="mt-1 text-xs text-slate-500">
                  Optional: Add comma-separated research interests
                </p>
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
