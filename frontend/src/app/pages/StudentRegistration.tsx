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
  // Step management
  const [step, setStep] = useState(1);
  
  // Step 1: Personal & Academic Details
  const [isDocumentVerified, setIsDocumentVerified] = useState(false);
  const [verifiedDocument, setVerifiedDocument] = useState<File | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Step 2: Career Interest
  const [careerInterest, setCareerInterest] = useState("");
  const [jobInterest, setJobInterest] = useState("");
  const [businessInterest, setBusinessInterest] = useState("");
  const [higherCourse, setHigherCourse] = useState("");
  const [higherCountry, setHigherCountry] = useState("");
  // "Other" input fields
  const [otherJobInterest, setOtherJobInterest] = useState("");
  const [otherBusinessInterest, setOtherBusinessInterest] = useState("");
  const [otherHigherCourse, setOtherHigherCourse] = useState("");
  const [otherHigherCountry, setOtherHigherCountry] = useState("");

  // Form data to carry between steps
  const [step1Data, setStep1Data] = useState<any>(null);

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
      const formData = new FormData();

    // Backend expects upload.single("idCard")
    formData.append("idCard", file);

    // Backend uses role to call collegeIdValidator.js
    formData.append("role", "student");

    const response = await fetch("/verify-id", {
      method: "POST",
      body: formData,
    });
      const validationResult = await response.json();

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

  // Step 1: Validate and move to Step 2
  const handleNext = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);

    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;
    const idproof = formData.get('idproof') as File;
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

    if (!idproof || idproof.size === 0) {
      alert("Please upload valid ID proof");
      return;
    }

    if (idproof) {
      const maxSize = 5 * 1024 * 1024;
      if (idproof.size > maxSize) {
        alert('ID proof file size must be less than 5MB');
        return;
      }

      const allowedIdProofTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!allowedIdProofTypes.includes(idproof.type)) {
        alert('ID proof must be in JPG, PNG, or PDF format');
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

    // Save Step 1 data and move to Step 2
    setStep1Data({
      firstName,
      lastName,
      email,
      phone,
      password,
      confirmPassword,
      idproof,
      photo,
      collegeName,
      department,
      yearOfJoining,
      passedOutYear,
      rollNumber,
      linkedin,
    });

    setStep(2);
  };

  // Step 2: Validate career interest and create account
  const handleCreateAccount = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate career interest is selected
    if (!careerInterest) {
      alert('Please select a career interest');
      return;
    }

    // Validate conditional fields
    if (careerInterest === 'Job') {
      if (!jobInterest) {
        alert('Please select a job interest');
        return;
      }
      if (jobInterest === 'Other' && !otherJobInterest.trim()) {
        alert('Please specify your job interest');
        return;
      }
    }

    if (careerInterest === 'Business') {
      if (!businessInterest) {
        alert('Please select a business type');
        return;
      }
      if (businessInterest === 'Other' && !otherBusinessInterest.trim()) {
        alert('Please specify your business type');
        return;
      }
    }

    if (careerInterest === 'HigherEducation') {
      if (!higherCourse) {
        alert('Please select a course');
        return;
      }
      if (higherCourse === 'Other' && !otherHigherCourse.trim()) {
        alert('Please specify your course');
        return;
      }
      if (!higherCountry) {
        alert('Please select a country');
        return;
      }
      if (higherCountry === 'Other' && !otherHigherCountry.trim()) {
        alert('Please specify your country');
        return;
      }
    }

    if (!step1Data) {
      alert('Please complete Step 1 first');
      return;
    }

    const {
      firstName,
      lastName,
      email,
      phone,
      password,
      idproof,
      photo,
      collegeName,
      department,
      yearOfJoining,
      passedOutYear,
      rollNumber,
      linkedin,
    } = step1Data;

    const name = `${firstName} ${lastName}`.trim();
    
    // Use textbox values for "Other" selections
    const finalJobInterest = jobInterest === 'Other' ? otherJobInterest.trim() : jobInterest;
    const finalBusinessInterest = businessInterest === 'Other' ? otherBusinessInterest.trim() : businessInterest;
    const finalHigherCourse = higherCourse === 'Other' ? otherHigherCourse.trim() : higherCourse;
    const finalHigherCountry = higherCountry === 'Other' ? otherHigherCountry.trim() : higherCountry;

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

      // Upload ID Proof
      const idProofFileName = `${Date.now()}-${idproof.name}`;
      const { data: idProofUpload, error: idProofError } = await supabase.storage
        .from('id-proofs')
        .upload(idProofFileName, idproof);

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
            id_proof_url: idProofUrl,
            photo_url: photoUrl,
            career_interest: careerInterest,
            job_interest: careerInterest === 'Job' ? finalJobInterest : null,
            business_interest: careerInterest === 'Business' ? finalBusinessInterest : null,
            higher_course: careerInterest === 'HigherEducation' ? finalHigherCourse : null,
            higher_country: careerInterest === 'HigherEducation' ? finalHigherCountry : null,
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
        idproof: idproof ? idproof.name : undefined,
        careerInterest: careerInterest as 'Job' | 'Business' | 'HigherEducation',
        jobInterest: careerInterest === 'Job' ? finalJobInterest : undefined,
        businessInterest: careerInterest === 'Business' ? finalBusinessInterest : undefined,
        higherCourse: careerInterest === 'HigherEducation' ? finalHigherCourse : undefined,
        higherCountry: careerInterest === 'HigherEducation' ? finalHigherCountry : undefined,
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
            onClick={step === 1 ? onBack : () => setStep(1)}
            className="text-yellow-500 hover:text-yellow-400 mb-4 inline-flex items-center"
          >
            ← {step === 1 ? 'Back to role selection' : 'Back to Step 1'}
          </button>

          <h2 className="text-3xl font-bold text-white mb-4">
            Student Registration {step === 2 && '- Step 2'}
          </h2>

          {step === 2 && (
            <div className="text-center mb-6">
              <p className="text-slate-300">Complete your career interest details to create your account</p>
            </div>
          )}

          <p className="text-slate-300">
            {step === 1 ? (
              <>
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-yellow-400 hover:text-yellow-300 font-medium"
                >
                  Login
                </Link>
              </>
            ) : null}
          </p>
        </div>

        <div className="bg-white py-8 px-6 shadow-xl rounded-xl">
          {step === 1 ? (
            // Step 1: Registration Form
            <form onSubmit={handleNext} className="space-y-6">

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
                    ID proof(only pdf) *
                  </label>
                  <input
                    name="idproof"
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
                  Next
                </button>
              </div>
            </form>
          ) : (
            // Step 2: Career Interest Form
            <form onSubmit={handleCreateAccount} className="space-y-6">

              {/* Career Interest Section */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 mb-6">
                <div className="flex items-center mb-4">
                  <div className="w-1 h-6 bg-yellow-500 rounded-full mr-3"></div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Career Interest
                  </h3>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    What are you interested in? *
                  </label>
                  <div className="space-y-3">
                    <div>
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="careerInterest"
                          value="Job"
                          checked={careerInterest === 'Job'}
                          onChange={(e) => setCareerInterest(e.target.value)}
                          className="mr-2"
                        />
                        <span className="text-slate-700">Job</span>
                      </label>
                    </div>
                    <div>
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="careerInterest"
                          value="Business"
                          checked={careerInterest === 'Business'}
                          onChange={(e) => setCareerInterest(e.target.value)}
                          className="mr-2"
                        />
                        <span className="text-slate-700">Business</span>
                      </label>
                    </div>
                    <div>
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="careerInterest"
                          value="HigherEducation"
                          checked={careerInterest === 'HigherEducation'}
                          onChange={(e) => setCareerInterest(e.target.value)}
                          className="mr-2"
                        />
                        <span className="text-slate-700">Higher Education</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Job Interest */}
                {careerInterest === 'Job' && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-700 mb-3">
                      What kind of job are you interested in? *
                    </label>
                    <select
                      value={jobInterest}
                      onChange={(e) => setJobInterest(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    >
                      <option value="">Select an option</option>
                      <option value="Software Developer">Software Developer</option>
                      <option value="Salesforce Admin">Salesforce Admin</option>
                      <option value="Data Analyst">Data Analyst</option>
                      <option value="Web Developer">Web Developer</option>
                      <option value="Government Job">Government Job</option>
                      <option value="Other">Other</option>
                    </select>
                    {jobInterest === 'Other' && (
                      <div className="mt-3">
                        <input
                          type="text"
                          placeholder="Please specify your job interest"
                          value={otherJobInterest}
                          onChange={(e) => setOtherJobInterest(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Business Interest */}
                {careerInterest === 'Business' && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-700 mb-3">
                      What type of business are you interested in? *
                    </label>
                    <select
                      value={businessInterest}
                      onChange={(e) => setBusinessInterest(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    >
                      <option value="">Select an option</option>
                      <option value="Family Business">Family Business</option>
                      <option value="Startup">Startup</option>
                      <option value="Own Business Idea">Own Business Idea</option>
                      <option value="Other">Other</option>
                    </select>
                    {businessInterest === 'Other' && (
                      <div className="mt-3">
                        <input
                          type="text"
                          placeholder="Please specify your business type"
                          value={otherBusinessInterest}
                          onChange={(e) => setOtherBusinessInterest(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Higher Education */}
                {careerInterest === 'HigherEducation' && (
                  <>
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-slate-700 mb-3">
                        Which course are you interested in? *
                      </label>
                      <select
                        value={higherCourse}
                        onChange={(e) => setHigherCourse(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      >
                        <option value="">Select a course</option>
                        <option value="M.Tech">M.Tech</option>
                        <option value="MBA">MBA</option>
                        <option value="MS">MS</option>
                        <option value="MCA">MCA</option>
                        <option value="Other">Other</option>
                      </select>
                      {higherCourse === 'Other' && (
                        <div className="mt-3">
                          <input
                            type="text"
                            placeholder="Please specify your course"
                            value={otherHigherCourse}
                            onChange={(e) => setOtherHigherCourse(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                          />
                        </div>
                      )}
                    </div>

                    <div className="mb-6">
                      <label className="block text-sm font-medium text-slate-700 mb-3">
                        Which country are you interested in? *
                      </label>
                      <select
                        value={higherCountry}
                        onChange={(e) => setHigherCountry(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      >
                        <option value="">Select a country</option>
                        <option value="India">India</option>
                        <option value="USA">USA</option>
                        <option value="UK">UK</option>
                        <option value="Canada">Canada</option>
                        <option value="Australia">Australia</option>
                        <option value="Germany">Germany</option>
                        <option value="Other">Other</option>
                      </select>
                      {higherCountry === 'Other' && (
                        <div className="mt-3">
                          <input
                            type="text"
                            placeholder="Please specify your country"
                            value={otherHigherCountry}
                            onChange={(e) => setOtherHigherCountry(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                          />
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 px-4 bg-slate-400 text-white rounded-md font-semibold hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 bg-yellow-500 text-slate-900 rounded-md font-semibold hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors"
                >
                  Create Account
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
