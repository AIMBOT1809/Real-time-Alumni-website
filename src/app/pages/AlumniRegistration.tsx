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
    'working-professional' | 'higher-education' | 'career-aspirant' | 'entrepreneur' | null
  >(null);
  const [step, setStep] = useState<1 | 2>(1);
  const [step1Data, setStep1Data] = useState<FormData | null>(null);

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

    // Backend expects this name
    formData.append("idCard", file);

    // Backend will call memoValidator.js for alumni
    formData.append("role", "alumni");

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

  const validateStep1 = (formData: FormData): boolean => {
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;
    const memo = formData.get('memo') as File;
    const linkedin = formData.get('linkedin') as string;
    const collegeName = formData.get('collegeName') as string;
    const department = formData.get('department') as string;
    const yearOfJoining = formData.get('yearOfJoining') as string;
    const passedOutYear = formData.get('passedOutYear') as string;
    const rollNumber = formData.get('rollNumber') as string;

    if (!firstName || !lastName) {
      alert('Please enter both first and last name');
      return false;
    }

    if (!email || !email.includes('@')) {
      alert('Please enter a valid email address');
      return false;
    }

    if (!phone || phone.length < 10) {
      alert('Please enter a valid phone number');
      return false;
    }

    if (linkedin && linkedin.trim()) {
      const linkedinRegex = /^https?:\/\/(www\.)?linkedin\.com\/.+/i;
      if (!linkedinRegex.test(linkedin.trim())) {
        alert('Please enter a valid LinkedIn profile URL (e.g., https://linkedin.com/in/yourprofile)');
        return false;
      }
    }

    if (!memo || memo.size === 0) {
      alert("Please upload valid proof");
      return false;
    }

    if (memo) {
      const maxSize = 5 * 1024 * 1024;
      if (memo.size > maxSize) {
        alert('Memo file size must be less than 5MB');
        return false;
      }

      const allowedIdTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!allowedIdTypes.includes(memo.type)) {
        alert('Memo must be in JPG, PNG, or PDF format');
        return false;
      }
    }

    if (!password || password.length < 8) {
      alert('Password must be at least 8 characters long');
      return false;
    }

    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return false;
    }

    if (!collegeName) {
      alert('Please enter your college name');
      return false;
    }

    if (!department) {
      alert('Please enter your department');
      return false;
    }

    if (!yearOfJoining) {
      alert('Please enter your year of joining');
      return false;
    }

    if (!passedOutYear) {
      alert('Please enter your passed out year');
      return false;
    }

    if (!rollNumber) {
      alert('Please enter your roll number');
      return false;
    }

    const rollRegex = /^[0-9]{2}K9.*$/i;
    if (!rollRegex.test(rollNumber.trim())) {
      alert('Please enter a valid roll number');
      return false;
    }

    const joiningYear = parseInt(yearOfJoining);
    const graduationYear = parseInt(passedOutYear);
    const currentYear = new Date().getFullYear();

    if (joiningYear < 1950 || joiningYear > currentYear) {
      alert('Please enter a valid year of joining');
      return false;
    }

    if (graduationYear < 1950 || graduationYear > currentYear + 10) {
      alert('Please enter a valid passed out year');
      return false;
    }

    if (graduationYear <= joiningYear) {
      alert('Passed out year must be after year of joining');
      return false;
    }

    return true;
  };
const handleNext = (e: React.MouseEvent<HTMLButtonElement>) => {
  e.preventDefault();

  const form = e.currentTarget.form;
  if (!form) return;

  const formData = new FormData(form);

  if (validateStep1(formData)) {
    setStep1Data(formData);
    setStep(2);
  }
};
  

  const handlePrevious = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setStep(1);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!step1Data) {
  alert("Please complete Step 1 first");
  setStep(1);
  return;
}

const form = e.currentTarget;
const step2Data = new FormData(form);

const formData = new FormData();

step1Data.forEach((value, key) => {
  formData.append(key, value);
});

step2Data.forEach((value, key) => {
  formData.append(key, value);
});

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
    const companyIdproof = formData.get('companyIdproof') as File;
    const skills = formData.get('skills') as string;
    const resumeUpload = formData.get('resumeUpload') as File;
    const university = formData.get('university') as string;
    const country = formData.get('country') as string;
    const city = formData.get('city') as string;
    const course = formData.get('course') as string;
    const branch = formData.get('branch') as string;
    const startupName = formData.get('startupName') as string;
    const founderRole = formData.get('founderRole') as string;
    const industry = formData.get('industry') as string;
    const yearFounded = formData.get('yearFounded') as string;
    const website = formData.get('website') as string;
    const location = formData.get('location') as string;
    const employeeCount = formData.get('employeeCount') as string;
    const startupStage = formData.get('startupStage') as string;
    const lookingFor = formData.get('lookingFor') as string;
    const startupDescription = formData.get('startupDescription') as string;
    const businessVerification = formData.get('businessVerification') as File;

    if (!currentStatus) {
      alert('Please select your current status');
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

    if (currentStatus === 'entrepreneur') {
      if (!startupName) {
        alert('Please enter your startup name');
        return;
      }

      if (!founderRole) {
        alert('Please enter your founder role');
        return;
      }

      if (!industry) {
        alert('Please enter the industry');
        return;
      }

      if (!yearFounded) {
        alert('Please enter the year founded');
        return;
      }

      if (!location) {
        alert('Please enter the location');
        return;
      }

      if (!startupStage) {
        alert('Please select the startup stage');
        return;
      }

      if (businessVerification && businessVerification.size > 0) {
        const maxVerificationSize = 5 * 1024 * 1024;
        if (businessVerification.size > maxVerificationSize) {
          alert('Business verification document must be less than 5MB');
          return;
        }

        const allowedVerificationTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
        if (!allowedVerificationTypes.includes(businessVerification.type)) {
          alert('Business verification document must be in JPG, PNG, or PDF format');
          return;
        }
      }

      if (website && website.trim()) {
        const websiteRegex = /^https?:\/\/.+/i;
        if (!websiteRegex.test(website.trim())) {
          alert('Please enter a valid website URL (e.g., https://yourstartup.com)');
          return;
        }
      }
    }

    const name = `${firstName} ${lastName}`.trim();
    if (!firstName || !lastName || !email || !password || !memo || memo.size === 0) {
  alert("Step 1 details are missing. Please go back and fill all required fields.");
  setStep(1);
  return;
}

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

      // Upload Business Verification Document for entrepreneurs
      let businessVerificationUrl = '';
      if (currentStatus === 'entrepreneur' && businessVerification && businessVerification.size > 0) {
        const verificationFileName = `${Date.now()}-${businessVerification.name}`;
        const { data: verificationUpload, error: verificationError } = await supabase.storage
          .from('business-verifications')
          .upload(verificationFileName, businessVerification);

        if (verificationError) {
          console.log(verificationError);
          alert(verificationError.message);
          return;
        }

        const { data: verificationUrlData } = supabase.storage
          .from('business-verifications')
          .getPublicUrl(verificationFileName);

        businessVerificationUrl = verificationUrlData.publicUrl;
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
            ...(currentStatus === 'entrepreneur' && {
              Startup_Name: startupName,
              Founder_Role: founderRole,
              Industry: industry,
              Year_Founded: yearFounded,
              Website: website,
              Location: location,
              Employee_Count: employeeCount,
              Startup_Stage: startupStage,
              Looking_For: lookingFor,
              Startup_Description: startupDescription,
              Business_Verification_URL: businessVerificationUrl,
            }),
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
        }),
        ...(currentStatus === 'entrepreneur' && {
          startupName: startupName.trim(),
          founderRole: founderRole.trim(),
          industry: industry.trim(),
          yearFounded: yearFounded.trim(),
          website: website ? website.trim() : undefined,
          location: location.trim(),
          employeeCount: employeeCount ? employeeCount.trim() : undefined,
          startupStage: startupStage.trim(),
          lookingFor: lookingFor ? lookingFor.trim() : undefined,
          startupDescription: startupDescription ? startupDescription.trim() : undefined,
          businessVerification: businessVerification ? businessVerification.name : undefined,
        })
      };

      await login(newUser);

localStorage.setItem("allumini_user", JSON.stringify(newUser));
localStorage.setItem("allumini_role", "alumni");

navigate("/dashboard", { replace: true });
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
            {step === 1 && (
              <>
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
                      College ID/College Memo*
                    </label>
                    <input
                      id="memo"
                      name="memo"
                      type="file"
                      accept=".pdf"
                      required
                      onChange={handleDocumentValidation}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 file:mr-3 file:py-2 file:border-0 file:text-sm file:font-medium file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100"   
                    />
                    <p className="mt-1 text-xs text-slate-500">
                      Accepted format: PDF (Max 5MB)
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
                      placeholder="e.g., 23K91A6737"
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    />
                  </div>
                </div>

                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={handleNext}
                    className="w-full py-3 px-4 bg-yellow-500 text-slate-900 rounded-md font-semibold hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors"
                  >
                    Next
                  </button>
                  </div>
                  </>
  )}
                {step === 2 && (
                  <>
                 <button
                   type="button"
                   onClick={handlePrevious}
                   className="text-yellow-500 hover:text-yellow-400 mb-6 inline-flex items-center text-sm font-medium"
                 >
                   ← Back to Step 1
                 </button>

                  {/* Current Status Section */}
                 <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 mb-6">
                   <div className="flex items-center mb-4">
                     <div className="w-1 h-6 bg-yellow-500 rounded-full mr-3"></div>
                     <h3 className="text-lg font-semibold text-slate-900">Current Status</h3>
                   </div>
                   
                   <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                     {[
                       { value: 'working-professional', label: 'Working Professional' },
                       { value: 'higher-education', label: 'Higher Education' },
                       { value: 'career-aspirant', label: 'Career Aspirant' },
                       { value: 'entrepreneur', label: 'Entrepreneur / Startup Founder' }
                     ].map((option) => (
                       <label
                         key={option.value}
                         className={`
                           relative flex flex-col items-center justify-center
                           p-4 rounded-lg border-2 cursor-pointer
                           transition-all duration-200 ease-in-out
                           min-h-[100px]
                           ${currentStatus === option.value
                             ? 'border-yellow-500 bg-yellow-50 shadow-md'
                             : 'border-slate-200 bg-white hover:border-yellow-300 hover:shadow-sm'
                           }
                         `}
                       >
                         <input
                           type="radio"
                           name="currentStatus"
                           value={option.value}
                           checked={currentStatus === option.value}
                           onChange={() => setCurrentStatus(option.value as typeof currentStatus)}
                           className="w-5 h-5 text-yellow-600 focus:ring-yellow-500 border-slate-300 mb-2"
                         />
                         <span className={`
                           text-sm font-medium text-center leading-tight
                           ${currentStatus === option.value ? 'text-yellow-900' : 'text-slate-700'}
                         `}>
                           {option.label}
                         </span>
                       </label>
                     ))}
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
                        <label htmlFor="companyIdProof" className="block text-sm font-medium text-slate-700 mb-1">
          Company ID Proof *
        </label>
        <input
          id="companyIdProof"
          name="companyIdProof"
          type="file"
          required
          accept=".jpg,.jpeg,.png,.pdf"
          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 file:mr-3 file:py-2 file:border-0 file:text-sm file:font-medium file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100"
        />
        <p className="mt-1 text-xs text-slate-500">
          Upload company ID card. Accepted formats: JPG, JPEG, PNG, PDF.
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

                  {/* Startup Details */}
                  {currentStatus === 'entrepreneur' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="startupName" className="block text-sm font-medium text-slate-700 mb-1">
                            Startup Name *
                          </label>
                          <input
                            id="startupName"
                            name="startupName"
                            type="text"
                            required
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                          />
                        </div>
                        <div>
                          <label htmlFor="founderRole" className="block text-sm font-medium text-slate-700 mb-1">
                            Founder Role *
                          </label>
                          <input
                            id="founderRole"
                            name="founderRole"
                            type="text"
                            placeholder="e.g. CEO, Co-Founder, CTO"
                            required
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="industry" className="block text-sm font-medium text-slate-700 mb-1">
                            Industry *
                          </label>
                          <input
                            id="industry"
                            name="industry"
                            type="text"
                            placeholder="e.g. Technology, Healthcare, FinTech"
                            required
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                          />
                        </div>
                        <div>
                          <label htmlFor="yearFounded" className="block text-sm font-medium text-slate-700 mb-1">
                            Year Founded *
                          </label>
                          <input
                            id="yearFounded"
                            name="yearFounded"
                            type="number"
                            min="1900"
                            max="2030"
                            required
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="website" className="block text-sm font-medium text-slate-700 mb-1">
                            Website
                          </label>
                          <input
                            id="website"
                            name="website"
                            type="url"
                            placeholder="https://yourstartup.com"
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                          />
                          <p className="mt-1 text-xs text-slate-500">
                            Optional: Your startup website URL
                          </p>
                        </div>
                        <div>
                          <label htmlFor="location" className="block text-sm font-medium text-slate-700 mb-1">
                            Location *
                          </label>
                          <input
                            id="location"
                            name="location"
                            type="text"
                            placeholder="e.g. Hyderabad, India"
                            required
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="employeeCount" className="block text-sm font-medium text-slate-700 mb-1">
                            Employee Count
                          </label>
                          <input
                            id="employeeCount"
                            name="employeeCount"
                            type="text"
                            placeholder="e.g. 1-10, 11-50, 50+"
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                          />
                          <p className="mt-1 text-xs text-slate-500">
                            Optional: Approximate number of employees
                          </p>
                        </div>
                        <div>
                          <label htmlFor="startupStage" className="block text-sm font-medium text-slate-700 mb-1">
                            Startup Stage *
                          </label>
                          <select
                            id="startupStage"
                            name="startupStage"
                            required
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                          >
                            <option value="">Select stage</option>
                            <option value="idea">Idea Stage</option>
                            <option value="mvp">MVP / Prototype</option>
                            <option value="seed">Seed Stage</option>
                            <option value="series-a">Series A</option>
                            <option value="series-b">Series B+</option>
                            <option value="growth">Growth Stage</option>
                            <option value="established">Established</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label htmlFor="lookingFor" className="block text-sm font-medium text-slate-700 mb-1">
                          Looking For
                        </label>
                        <input
                          id="lookingFor"
                          name="lookingFor"
                          type="text"
                          placeholder="e.g. Co-founders, Investors, Mentors, Talent"
                          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                        />
                        <p className="mt-1 text-xs text-slate-500">
                          Optional: What are you looking for?
                        </p>
                      </div>

                      <div>
                        <label htmlFor="startupDescription" className="block text-sm font-medium text-slate-700 mb-1">
                          Startup Description
                        </label>
                        <textarea
                          id="startupDescription"
                          name="startupDescription"
                          rows={4}
                          placeholder="Describe your startup, its mission, and what problem it solves..."
                          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                        />
                        <p className="mt-1 text-xs text-slate-500">
                          Optional: Brief description of your startup
                        </p>
                      </div>

                      <div>
                        <label htmlFor="businessVerification" className="block text-sm font-medium text-slate-700 mb-1">
                          Business Verification Document
                        </label>
                        <input
                          id="businessVerification"
                          name="businessVerification"
                          type="file"
                          accept=".jpg,.jpeg,.png,.pdf"
                          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 file:mr-3 file:py-2 file:border-0 file:text-sm file:font-medium file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100"
                        />
                        <p className="mt-1 text-xs text-slate-500">
                          Optional: Upload GST certificate, Startup India registration, MSME certificate, or other business proof if available (Max 5MB)
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

                <div className="flex justify-center space-x-4">
                  <button
                    type="button"
                    onClick={handlePrevious}
                    className="w-1/3 py-3 px-4 bg-slate-200 text-slate-900 rounded-md font-semibold hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    type="submit"
                    className="w-2/3 py-3 px-4 bg-yellow-500 text-slate-900 rounded-md font-semibold hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors"
                  >
                    Create Account
                  </button>
                </div>
                </>
                )}
          </form>
        </div>
      </div>
    </div>
    
  );
}