import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';
import { Link, useNavigate } from 'react-router';
import { validateUploadedDocument } from "../../documentValidation";
import {
  GraduationCap,
  Users,
  Briefcase,
  Eye,
  EyeOff
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import type { UserProfile } from '../data/types';

type Role = 'student' | 'alumni' | 'faculty' | null;

export function Register() {
const [isDocumentVerified, setIsDocumentVerified] =
  useState(false);

const [verifiedDocument, setVerifiedDocument] =
  useState<File | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role>(null);

  const [showPassword, setShowPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [currentStatus, setCurrentStatus] = useState<
    'working-professional' | 'higher-education' | 'career-aspirant' | null
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
const handleDocumentValidation = async (
  e: React.ChangeEvent<HTMLInputElement>
) => {

  const file = e.target.files?.[0];

  if (!file) return;

  try {

    const validationResult =
      await validateUploadedDocument(file);

    if (!validationResult.valid) {

      alert(
        validationResult.reason ||
        "Invalid document."
      );

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
if (!idProof || idProof.size === 0) {

  alert("Please upload valid ID proof");

  return;
}
    const photo = formData.get('photo') as File;

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

    const skills =
      formData.get('skills') as string;

    const resumeUpload =
      formData.get('resumeUpload') as File;

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

    const name =
      `${firstName} ${lastName}`.trim();

    try {

      const {
        data: authData,
        error: authError
      } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            role: selectedRole,
          },
        },
      });

      if (authError) {
        alert(authError.message);
        return;
      }

<<<<<<< HEAD
      // Handle Faculty-specific profile insertion
      if (selectedRole === 'faculty') {
        const facultyId = formData.get('facultyId') as string;
        const officeEmail = formData.get('officeEmail') as string;
        const designation = formData.get('designation') as string;
        const facultyType = formData.get('facultyType') as string;
        const yearsOfExperience = formData.get('yearsOfExperience') as string;
        const specialization = formData.get('specialization') as string;
        const researchInterests = formData.get('researchInterests') as string;

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
            }
          ]);

        if(profileError) {
          console.log(profileError);
          alert(profileError.message);
          return;
        }

        const newUser: UserProfile = {
          id: authData.user?.id ?? `u-${Date.now()}`,
          name,
          role: selectedRole,
          avatar: photo
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
          // Faculty-specific fields
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
        return;
      }
=======

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

/*if (idProofError) {
  alert('Failed to upload ID proof');
  return;
}  */

const { data: idProofUrlData } = supabase.storage
  .from('id-proofs')
  .getPublicUrl(idProofFileName);

const idProofUrl = idProofUrlData.publicUrl;

// Upload Photo
const photoFileName = `${Date.now()}-${photo.name}`;

const { data: photoUpload, error: photoError } = await supabase.storage
  .from('profile-photos')
  .upload(photoFileName, photo);

if (photoError) {
  alert('Failed to upload profile photo');
  return;
}

const { data: photoUrlData } = supabase.storage
  .from('profile-photos')
  .getPublicUrl(photoFileName);

const photoUrl = photoUrlData.publicUrl;
>>>>>>> f1c8b6a05866db61162c429c5955cff0e93e237f

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
      id_proof_url:idProofUrl,
      photo_url:photoUrl,
    }
  ]);

  if(profileError) {
    console.log(profileError);
    alert(profileError.message);
    return;
  }

      const newUser: UserProfile = {
        id: authData.user?.id ?? `u-${Date.now()}`,
        name,
        role: selectedRole,

        avatar: photo
          ? URL.createObjectURL(photo)
          : `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=FDE68A&color=111827&size=256`,

        graduationYear:
          parseInt(passedOutYear),

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

        bio:
          `${selectedRole.charAt(0).toUpperCase() +
          selectedRole.slice(1)} registered user`,

        skills:
          currentStatus === 'career-aspirant' && skills
            ? skills.split(',').map((skill) => skill.trim()).filter(Boolean)
            : [],

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

        idProof: idProof
          ? idProof.name
          : undefined,

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
if (selectedRole === "student") {
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
                  GitHub URL
                </label>
                <input
                  name="github"
                  type="url"
                  placeholder="https://github.com/username"
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  ID Proof *
                </label>
                <input
  name="idProof"
  type="file"
  accept=".jpg,.jpeg,.png,.pdf"
  required
  onChange={handleDocumentValidation}
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
                  Year *
                </label>
                <select
                  name="year"
                  required
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="">Select Year</option>
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                </select>
              </div>

              <div>
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
                  <label htmlFor="idProof" className="block text-sm font-medium text-slate-700 mb-1">
                    ID Proof (College ID/Company ID) *
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
                          University/College Applied
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
                          Country
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
                          City
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
                          Course
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
                        Branch/Specialization
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
        <div className="max-w-3xl w-full">
          <div className="text-center mb-8">
            <button
              onClick={() => setSelectedRole(null)}
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
                      Personal Email Address *
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
                    <label htmlFor="CollegeEmail" className="block text-sm font-medium text-slate-700 mb-1">
                      College Email Address 
                    </label>
                    <input
                      id="CollegeEmail"
                      name="CollegeEmail"
                      type="email"
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
                    ID Proof (Faculty ID/Government ID) *
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
                    Accepted formats: JPG, JPEG, PNG (Max 5MB)
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
                      placeholder="e.g., FAC-2024-001"
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="collegeName" className="block text-sm font-medium text-slate-700 mb-1">
                      College/Institute Name *
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="Designation" className="block text-sm font-medium text-slate-700 mb-1">
                      Designation *
                    </label>
                    <select
                      id="designation"
                      name="designation"
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    >
                      <option value="">Select designation</option>
                      <option value="Professor">Professor</option>
                      <option value="Associate Professor">Associate Professor</option>
                      <option value="Assistant Professor">Assistant Professor</option>
                      <option value="HOD">HOD (Head of Department)</option>
                      <option value="Lecturer">Lecturer</option>
                      <option value="Other">Other</option>
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
                      max="70"
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="specialization" className="block text-sm font-medium text-slate-700 mb-1">
                      Specialization *
                    </label>
                    <input
                      id="specialization"
                      name="specialization"
                      type="text"
                      required
                      placeholder="e.g., Data Science, Machine Learning"
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="researchInterests" className="block text-sm font-medium text-slate-700 mb-1">
                      Research Interests
                    </label>
                    <input
                      id="researchInterests"
                      name="researchInterests"
                      type="text"
                      placeholder="e.g., AI, NLP, Computer Vision (comma-separated)"
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    />
                    <p className="mt-1 text-xs text-slate-500">
                      Enter comma-separated research interests
                    </p>
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