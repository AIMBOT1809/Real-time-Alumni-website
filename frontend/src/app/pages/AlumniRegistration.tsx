import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';
import { Link, useNavigate } from 'react-router';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { showGlobalToast } from '../components/Toast';
import type { UserProfile } from '../data/types';

interface AlumniRegistrationProps {
  onBack: () => void;
}

export function AlumniRegistration({ onBack }: AlumniRegistrationProps) {
  const [isDocumentVerified, setIsDocumentVerified] = useState(false);
  const [verifiedDocument, setVerifiedDocument] = useState<File | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1: Personal & Academic Details
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [memo, setMemo] = useState<File | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [department, setDepartment] = useState('');
  const [yearOfJoining, setYearOfJoining] = useState('');
  const [passedOutYear, setPassedOutYear] = useState('');
  const [rollNumber, setRollNumber] = useState('');

  // Step 2: Current Status
  const [currentStatus, setCurrentStatus] = useState<
    'working-professional' | 'higher-education' | 'career-aspirant' | 'entrepreneur' | null
  >(null);
  const [organization, setOrganization] = useState('');
  const [jobRole, setJobRole] = useState('');
  const [package_, setPackage] = useState('');
  const [companyIdProof, setCompanyIdProof] = useState<File | null>(null);
  const [skills, setSkills] = useState('');
  const [resumeUpload, setResumeUpload] = useState<File | null>(null);
  const [startupName, setStartupName] = useState('');
  const [founderRole, setFounderRole] = useState('');
  const [industry, setIndustry] = useState('');
  const [yearFounded, setYearFounded] = useState('');
  const [website, setWebsite] = useState('');
  const [location, setLocation] = useState('');
  const [employeeCount, setEmployeeCount] = useState('');
  const [startupStage, setStartupStage] = useState('');
  const [lookingFor, setLookingFor] = useState('');
  const [startupDescription, setStartupDescription] = useState('');
  const [businessVerification, setBusinessVerification] = useState<File | null>(null);
  const [university, setUniversity] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [course, setCourse] = useState('');
  const [branch, setBranch] = useState('');

  // Step 3: Alumni Association
  const [alumniAssociationMember, setAlumniAssociationMember] = useState<string>('');
  const [contributionArea, setContributionArea] = useState<string>('');

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
      formData.append("idCard", file);
      formData.append("role", "alumni");

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/verify-id`, {
        method: "POST",
        body: formData,
      });

      const validationResult = await response.json();

      if (!validationResult.valid) {
        showGlobalToast(validationResult.reason || "Please upload a valid college ID or memo.", 'error');
        setIsDocumentVerified(false);
        setVerifiedDocument(null);
        e.target.value = "";
        return;
      }
      showGlobalToast("Document verified successfully.", 'success');
      setIsDocumentVerified(true);
      setVerifiedDocument(file);
      setMemo(file);
    } catch (error) {
      console.error(error);
      showGlobalToast("Unable to verify the uploaded document.", 'error');
      setIsDocumentVerified(false);
      setVerifiedDocument(null);
      e.target.value = "";
    }
  };

  const validateStep1 = (): boolean => {
    if (!firstName || !lastName) {
      showGlobalToast('Please enter both first and last name', 'warning');
      return false;
    }

    if (!email || !email.includes('@')) {
      showGlobalToast('Please enter a valid email address', 'warning');
      return false;
    }

    const phoneRegex = /^\d{10}$/;
    if (!phone || !phoneRegex.test(phone)) {
      showGlobalToast('Please enter a valid phone number (exactly 10 digits, numbers only)', 'warning');
      return false;
    }

    if (linkedin && linkedin.trim()) {
      const linkedinRegex = /^https?:\/\/(www\.)?linkedin\.com\/.+/i;
      if (!linkedinRegex.test(linkedin.trim())) {
        showGlobalToast('Please enter a valid LinkedIn profile URL (e.g., https://linkedin.com/in/yourprofile)', 'warning');
        return false;
      }
    }

    if (!memo) {
      showGlobalToast("Please upload a valid college ID or memo.", 'warning');
      return false;
    }

    if (!password || password.length < 8) {
      showGlobalToast('Password must be at least 8 characters long', 'warning');
      return false;
    }

    if (password !== confirmPassword) {
      showGlobalToast('Passwords do not match', 'warning');
      return false;
    }

    if (!department) {
      showGlobalToast('Please select your department', 'warning');
      return false;
    }

    if (!yearOfJoining) {
      showGlobalToast('Please enter your year of joining', 'warning');
      return false;
    }

    if (!passedOutYear) {
      showGlobalToast('Please enter your passed out year', 'warning');
      return false;
    }

    if (!rollNumber) {
      showGlobalToast('Please enter your roll number', 'warning');
      return false;
    }

    const rollRegex = /^[0-9]{2}K9.*$/i;
    if (!rollRegex.test(rollNumber.trim())) {
      showGlobalToast('Please enter a valid roll number', 'warning');
      return false;
    }

    const joiningYear = parseInt(yearOfJoining);
    const graduationYear = parseInt(passedOutYear);
    const currentYear = new Date().getFullYear();

    if (joiningYear < 1950 || joiningYear > currentYear) {
      showGlobalToast('Please enter a valid year of joining', 'warning');
      return false;
    }

    if (graduationYear < 1950 || graduationYear > currentYear + 10) {
      showGlobalToast('Please enter a valid passed out year', 'warning');
      return false;
    }

    if (graduationYear > currentYear) {
      showGlobalToast('You are not eligible to register as Alumni. Please register as a Student.', 'warning');
      return false;
    }

    if (graduationYear <= joiningYear) {
      showGlobalToast('Passed out year must be after year of joining', 'warning');
      return false;
    }

    return true;
  };

  const handleNext = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    
    if (!validateStep1()) {
      return;
    }
    
    setStep(2);
  };

  const handlePrevious = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (step === 3) {
      setStep(2);
    } else {
      setStep(1);
    }
  };

  const handleNextFromStep2 = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    
    if (!currentStatus) {
      showGlobalToast('Please select your current status', 'warning');
      return;
    }
    
    setStep(3);
  };

  const validateStep3 = (): boolean => {
    if (!alumniAssociationMember) {
      showGlobalToast('Please select whether you want to be a member of the Alumni Association', 'warning');
      return false;
    }

    if (!contributionArea) {
      showGlobalToast('Please select an area where you can contribute', 'warning');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateStep3()) {
      return;
    }

    if (!currentStatus) {
      showGlobalToast('Please select your current status', 'warning');
      setStep(2);
      return;
    }

    // Validate conditional fields based on currentStatus
    if (currentStatus === 'higher-education') {
      if (!university || !country || !city || !course || !branch) {
        showGlobalToast('Please fill all higher education details', 'warning');
        setStep(2);
        return;
      }
    }

    if (currentStatus === 'career-aspirant') {
      if (!skills || !resumeUpload) {
        showGlobalToast('Please fill all career aspirant details', 'warning');
        setStep(2);
        return;
      }
    }

    if (currentStatus === 'entrepreneur') {
      if (!startupName || !founderRole || !industry || !yearFounded || !location || !startupStage) {
        showGlobalToast('Please fill all entrepreneur details', 'warning');
        setStep(2);
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
        showGlobalToast(authError.message, 'error');
        return;
      }

      // Upload Memo
      if (!memo) {
        showGlobalToast('Please upload your college ID/memo', 'error');
        return;
      }
      const memoFileName = `${Date.now()}-${memo.name}`;
      const { data: memoUpload, error: memoError } = await supabase.storage
        .from('memos')
        .upload(memoFileName, memo);

      if (memoError) {
        console.log(memoError);
        showGlobalToast(memoError.message, 'error');
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
          showGlobalToast(verificationError.message, 'error');
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
          showGlobalToast(photoError.message, 'error');
          return;
        }

        const { data: photoUrlData } = supabase.storage
          .from('profile-photos')
          .getPublicUrl(photoFileName);

        photoUrl = photoUrlData.publicUrl;
      }

      // Upload Company ID Proof for working professionals
      let companyIdProofUrl = '';
      if (currentStatus === 'working-professional' && companyIdProof && companyIdProof.size > 0) {
        const companyIdFileName = `${Date.now()}-${companyIdProof.name}`;
        const { data: companyIdUpload, error: companyIdError } = await supabase.storage
          .from('company-id-proofs')
          .upload(companyIdFileName, companyIdProof);

        if (companyIdError) {
          console.log(companyIdError);
          showGlobalToast(companyIdError.message, 'error');
          return;
        }

        const { data: companyIdUrlData } = supabase.storage
          .from('company-id-proofs')
          .getPublicUrl(companyIdFileName);

        companyIdProofUrl = companyIdUrlData.publicUrl;
      }

      // Determine effective company/business name for success check
      const effectiveCompany = currentStatus === 'entrepreneur' ? startupName : organization;

      // Successful alumni check
      const status = currentStatus || '';
      const role = jobRole || '';
      const company = effectiveCompany || '';

      const normalizedStatus = status.toLowerCase().replace(/[-_/]/g, ' ').trim();
      const normalizedRole = role.toLowerCase().replace(/[-_/]/g, ' ').trim();

      const isWorkingProfessionalOrBusiness =
        normalizedStatus.includes('working professional') ||
        normalizedStatus.includes('business') ||
        normalizedStatus.includes('startup') ||
        normalizedStatus.includes('entrepreneur') ||
        normalizedStatus.includes('business owner');

      const notSuccessfulPatterns = [
        'career aspirant', 'student', 'fresher', 'intern', 'trainee',
        'job seeker', 'looking for job', 'unemployed',
      ];
      const isFailedStatus = notSuccessfulPatterns.some((p) => normalizedStatus.includes(p));

      const successfulKeywords = [
        'HR Manager', 'Human Resources', 'Recruiter', 'Talent Acquisition',
        'CEO', 'Founder', 'Co-Founder', 'Director', 'Manager', 'Senior Manager',
        'Team Lead', 'Lead', 'Project Manager', 'Product Manager', 'Data Analyst',
        'Data Scientist', 'Senior Software Engineer', 'Software Engineer',
        'Business Analyst', 'Salesforce Consultant', 'Entrepreneur', 'Business Owner',
        'Startup Founder', 'HR',
      ];
      const isSuccessfulRole = successfulKeywords.some((k) => normalizedRole.includes(k.toLowerCase()));

      const hasCompany = Boolean(company && company.trim());
      const isSuccessfulAlumni = isWorkingProfessionalOrBusiness && !isFailedStatus && isSuccessfulRole && hasCompany;

      console.log('Registration successful check:', { status, role, company, isSuccessfulAlumni });

      const wallOfFameStatus = isSuccessfulAlumni ? 'approved' : 'not_submitted';
      const isWallOfFame = isSuccessfulAlumni;
      const isHiddenFromWall = false;
      const wallOfFameRejectionReason = null;

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
            Department: department,
            Year_of_Joining: yearOfJoining,
            passed_out_year: passedOutYear,
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
            wall_of_fame_status: wallOfFameStatus,
            is_wall_of_fame: isWallOfFame,
            is_hidden_from_wall: isHiddenFromWall,
            wall_of_fame_rejection_reason: wallOfFameRejectionReason,
            alumni_association_member: alumniAssociationMember,
            contribution_area: contributionArea,
          }
        ]);

      if (profileError) {
        console.log(profileError);
        showGlobalToast(profileError.message, 'error');
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
            ? department
            : currentStatus === 'higher-education'
            ? `${course} at ${university}`
            : currentStatus === 'career-aspirant'
            ? skills
            : department,
        company: currentStatus === 'working-professional' ? organization : undefined,
        position: currentStatus === 'working-professional' ? jobRole : undefined,
        bio: `Alumni registered user`,
        skills: currentStatus === 'career-aspirant' && skills
          ? skills.split(',').map((skill) => skill.trim()).filter(Boolean)
          : [],
        email: email.trim(),
        phone: phone.trim(),
        linkedin: linkedin ? linkedin.trim() : undefined,
        department: currentStatus === 'higher-education' ? branch.trim() : department.trim(),
        rollNumber: rollNumber.trim(),
        year: yearOfJoining,
        yearOfJoining: parseInt(yearOfJoining),
        passedOutYear: parseInt(passedOutYear),
        memo: memo ? memo.name : undefined,
        ...(currentStatus === 'working-professional' && { package: package_.trim() }),
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
      navigate("/login");
    } catch (error) {
      showGlobalToast('Registration failed. Please try again.', 'error');
      console.error('Registration error:', error);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-900 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <button
            onClick={onBack}
            className="text-yellow-500 hover:text-yellow-400 mb-4 inline-flex items-center"
          >
            ← Back to role selection
          </button>
          <h2 className="text-3xl font-bold text-white mb-4">Alumni Registration</h2>
          <p className="text-slate-300 dark:text-slate-400">
            Already have an account? <Link to="/login" className="text-yellow-400 hover:text-yellow-300 font-medium transition-colors cursor-pointer">Login</Link>
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 py-8 px-6 shadow-xl rounded-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {step === 1 && (
              <>
                <div className="bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg p-6 mb-6">
                  <div className="flex items-center mb-4">
                    <div className="w-1 h-6 bg-yellow-500 rounded-full mr-3"></div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Personal Details</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">First Name *</label>
                      <input id="firstName" name="firstName" type="text" required value={firstName} onChange={(e) => setFirstName(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-slate-700 dark:text-white dark:border-slate-500 dark:placeholder:text-slate-400" />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Last Name *</label>
                      <input id="lastName" name="lastName" type="text" required value={lastName} onChange={(e) => setLastName(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-slate-700 dark:text-white dark:border-slate-500 dark:placeholder:text-slate-400" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Email Address *</label>
                      <input id="email" name="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-slate-700 dark:text-white dark:border-slate-500 dark:placeholder:text-slate-400" />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Phone Number *</label>
                      <input id="phone" name="phone" type="tel" required maxLength={10} value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-slate-700 dark:text-white dark:border-slate-500 dark:placeholder:text-slate-400" />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="linkedin" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">LinkedIn Profile URL</label>
                    <input id="linkedin" name="linkedin" type="url" placeholder="https://linkedin.com/in/yourprofile" value={linkedin} onChange={(e) => setLinkedin(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-slate-700 dark:text-white dark:border-slate-500 dark:placeholder:text-slate-400" />
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Optional: Add your LinkedIn profile URL</p>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="memo" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">College ID / College Memo *</label>
                    <input id="memo" name="memo" type="file" accept=".jpg,.jpeg,.png,.pdf,application/pdf" required onChange={handleDocumentValidation}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 file:mr-3 file:py-2 file:border-0 file:text-sm file:font-medium file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100 dark:bg-slate-700 dark:text-white dark:border-slate-500 dark:file:bg-yellow-900/30 dark:file:text-yellow-300" />
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Accepted formats: JPG, JPEG, PNG, PDF (Max size: 5MB)</p>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="photo" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Upload Photo / Profile Picture</label>
                    <input id="photo" name="photo" type="file" accept="image/jpeg,image/jpg,image/png,.pdf,application/pdf" onChange={(e) => setPhoto(e.target.files?.[0] || null)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 file:mr-3 file:py-2 file:border-0 file:text-sm file:font-medium file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100 dark:bg-slate-700 dark:text-white dark:border-slate-500 dark:file:bg-yellow-900/30 dark:file:text-yellow-300" />
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Accepted formats: JPG, JPEG, PNG, PDF (Max size: 5MB)</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Password *</label>
                      <div className="relative">
                        <input id="password" name="password" type={showPassword ? 'text' : 'password'} minLength={8} required placeholder="Create a strong password" value={password} onChange={(e) => setPassword(e.target.value)}
                          className="w-full pr-11 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-slate-700 dark:text-white dark:border-slate-500 dark:placeholder:text-slate-400" />
                        <button type="button" onClick={togglePassword} className="absolute inset-y-0 right-0 pr-3 flex items-center">
                          {showPassword ? <EyeOff className="h-5 w-5 text-slate-400" /> : <Eye className="h-5 w-5 text-slate-400" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Confirm Password *</label>
                      <div className="relative">
                        <input id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} minLength={8} required placeholder="Confirm your password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full pr-11 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-slate-700 dark:text-white dark:border-slate-500 dark:placeholder:text-slate-400" />
                        <button type="button" onClick={toggleConfirmPassword} className="absolute inset-y-0 right-0 pr-3 flex items-center">
                          {showConfirmPassword ? <EyeOff className="h-5 w-5 text-slate-400" /> : <Eye className="h-5 w-5 text-slate-400" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg p-6 mb-6">
                  <div className="flex items-center mb-4">
                    <div className="w-1 h-6 bg-yellow-500 rounded-full mr-3"></div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Academic Details</h3>
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="department" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Department *</label>
                    <select id="department" name="department" required value={department} onChange={(e) => setDepartment(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-slate-700 dark:text-white dark:border-slate-500">
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor="yearOfJoining" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Year of Joining *</label>
                      <input id="yearOfJoining" name="yearOfJoining" type="number" min="1950" max="2030" required value={yearOfJoining} onChange={(e) => setYearOfJoining(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-slate-700 dark:text-white dark:border-slate-500 dark:placeholder:text-slate-400" />
                    </div>
                    <div>
                      <label htmlFor="passedOutYear" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Passed Out Year *</label>
                      <input id="passedOutYear" name="passedOutYear" type="number" min="1950" max="2030" required value={passedOutYear} onChange={(e) => setPassedOutYear(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-slate-700 dark:text-white dark:border-slate-500 dark:placeholder:text-slate-400" />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="rollNumber" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Roll Number *</label>
                    <input id="rollNumber" name="rollNumber" type="text" placeholder="e.g., 23K91A6737" required value={rollNumber} onChange={(e) => setRollNumber(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-slate-700 dark:text-white dark:border-slate-500 dark:placeholder:text-slate-400" />
                  </div>
                </div>

                <div className="flex justify-center">
                  <button type="button" onClick={handleNext}
                    className="w-full py-3 px-4 bg-yellow-500 text-slate-900 rounded-md font-semibold hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors">
                    Next
                  </button>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <button type="button" onClick={handlePrevious}
                  className="text-yellow-500 hover:text-yellow-400 mb-6 inline-flex items-center text-sm font-medium">
                  ← Back to Step 1
                </button>

                <div className="bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg p-6 mb-6">
                  <div className="flex items-center mb-4">
                    <div className="w-1 h-6 bg-yellow-500 rounded-full mr-3"></div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Current Status</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { value: 'working-professional', label: 'Working Professional' },
                      { value: 'higher-education', label: 'Higher Education' },
                      { value: 'career-aspirant', label: 'Career Aspirant' },
                      { value: 'entrepreneur', label: 'Entrepreneur / Startup Founder' }
                    ].map((option) => (
                      <label key={option.value}
                        className={`relative flex flex-col items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ease-in-out min-h-[100px] ${currentStatus === option.value ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 shadow-md' : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-yellow-300 hover:shadow-sm'}`}>
                        <input type="radio" name="currentStatus" value={option.value} checked={currentStatus === option.value} onChange={() => setCurrentStatus(option.value as typeof currentStatus)} className="w-5 h-5 text-yellow-600 focus:ring-yellow-500 border-slate-300 mb-2" />
                        <span className={`text-sm font-medium text-center leading-tight ${currentStatus === option.value ? 'text-yellow-900 dark:text-yellow-100' : 'text-slate-700 dark:text-slate-200'}`}>
                          {option.label}
                        </span>
                      </label>
                    ))}
                  </div>

                  {currentStatus === 'working-professional' && (
                    <div className="space-y-4 mt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="organization" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Organization Name</label>
                          <input id="organization" name="organization" type="text" value={organization} onChange={(e) => setOrganization(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-slate-700 dark:text-white dark:border-slate-500 dark:placeholder:text-slate-400" />
                        </div>
                        <div>
                          <label htmlFor="jobRole" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Role/Position</label>
                          <input id="jobRole" name="jobRole" type="text" value={jobRole} onChange={(e) => setJobRole(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-slate-700 dark:text-white dark:border-slate-500 dark:placeholder:text-slate-400" />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="package" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Package/CTC</label>
                          <input id="package" name="package" type="text" placeholder="e.g. 5 LPA – 6 LPA" value={package_} onChange={(e) => setPackage(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-slate-700 dark:text-white dark:border-slate-500 dark:placeholder:text-slate-400" />
                        </div>
                        <div>
                          <label htmlFor="companyIdProof" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Company ID Proof *</label>
                          <input id="companyIdProof" name="companyIdProof" type="file" required accept=".jpg,.jpeg,.png,.pdf" onChange={(e) => setCompanyIdProof(e.target.files?.[0] || null)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 file:mr-3 file:py-2 file:border-0 file:text-sm file:font-medium file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100 dark:bg-slate-700 dark:text-white dark:border-slate-500 dark:file:bg-yellow-900/30 dark:file:text-yellow-300" />
                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Upload company ID card. Accepted formats: JPG, JPEG, PNG, PDF.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {currentStatus === 'career-aspirant' && (
                    <div className="space-y-4 mt-4">
                      <div>
                        <label htmlFor="skills" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Skills</label>
                        <input id="skills" name="skills" type="text" placeholder="e.g. JavaScript, Data Analysis" value={skills} onChange={(e) => setSkills(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-slate-700 dark:text-white dark:border-slate-500 dark:placeholder:text-slate-400" />
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Add comma-separated skills relevant to your job search.</p>
                      </div>
                      <div>
                        <label htmlFor="resumeUpload" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Resume Upload</label>
                        <input id="resumeUpload" name="resumeUpload" type="file" required accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={(e) => setResumeUpload(e.target.files?.[0] || null)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 file:mr-3 file:py-2 file:border-0 file:text-sm file:font-medium file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100 dark:bg-slate-700 dark:text-white dark:border-slate-500 dark:file:bg-yellow-900/30 dark:file:text-yellow-300" />
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Accepted formats: PDF, DOC, DOCX (Max size: 5MB)</p>
                      </div>
                    </div>
                  )}

                  {currentStatus === 'entrepreneur' && (
                    <div className="space-y-4 mt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="startupName" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Startup Name *</label>
                          <input id="startupName" name="startupName" type="text" required value={startupName} onChange={(e) => setStartupName(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-slate-700 dark:text-white dark:border-slate-500 dark:placeholder:text-slate-400" />
                        </div>
                        <div>
                          <label htmlFor="founderRole" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Founder Role *</label>
                          <input id="founderRole" name="founderRole" type="text" placeholder="e.g. CEO, Co-Founder, CTO" required value={founderRole} onChange={(e) => setFounderRole(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-slate-700 dark:text-white dark:border-slate-500 dark:placeholder:text-slate-400" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="industry" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Industry *</label>
                          <input id="industry" name="industry" type="text" placeholder="e.g. Technology, Healthcare, FinTech" required value={industry} onChange={(e) => setIndustry(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-slate-700 dark:text-white dark:border-slate-500 dark:placeholder:text-slate-400" />
                        </div>
                        <div>
                          <label htmlFor="yearFounded" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Year Founded *</label>
                          <input id="yearFounded" name="yearFounded" type="number" min="1900" max="2030" required value={yearFounded} onChange={(e) => setYearFounded(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-slate-700 dark:text-white dark:border-slate-500 dark:placeholder:text-slate-400" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="website" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Website</label>
                          <input id="website" name="website" type="url" placeholder="https://yourstartup.com" value={website} onChange={(e) => setWebsite(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-slate-700 dark:text-white dark:border-slate-500 dark:placeholder:text-slate-400" />
                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Optional: Your startup website URL</p>
                        </div>
                        <div>
                          <label htmlFor="location" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Location *</label>
                          <input id="location" name="location" type="text" placeholder="e.g. Hyderabad, India" required value={location} onChange={(e) => setLocation(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-slate-700 dark:text-white dark:border-slate-500 dark:placeholder:text-slate-400" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="employeeCount" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Employee Count</label>
                          <input id="employeeCount" name="employeeCount" type="text" placeholder="e.g. 1-10, 11-50, 50+" value={employeeCount} onChange={(e) => setEmployeeCount(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-slate-700 dark:text-white dark:border-slate-500 dark:placeholder:text-slate-400" />
                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Optional: Approximate number of employees</p>
                        </div>
                        <div>
                          <label htmlFor="startupStage" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Startup Stage *</label>
                          <select id="startupStage" name="startupStage" required value={startupStage} onChange={(e) => setStartupStage(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-slate-700 dark:text-white dark:border-slate-500">
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
                        <label htmlFor="lookingFor" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Looking For</label>
                        <input id="lookingFor" name="lookingFor" type="text" placeholder="e.g. Co-founders, Investors, Mentors, Talent" value={lookingFor} onChange={(e) => setLookingFor(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-slate-700 dark:text-white dark:border-slate-500 dark:placeholder:text-slate-400" />
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Optional: What are you looking for?</p>
                      </div>

                      <div>
                        <label htmlFor="startupDescription" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Startup Description</label>
                        <textarea id="startupDescription" name="startupDescription" rows={4} placeholder="Describe your startup, its mission, and what problem it solves..." value={startupDescription} onChange={(e) => setStartupDescription(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-slate-700 dark:text-white dark:border-slate-500 dark:placeholder:text-slate-400"></textarea>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Optional: Brief description of your startup</p>
                      </div>

                      <div>
                        <label htmlFor="businessVerification" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Business Verification Document</label>
                        <input id="businessVerification" name="businessVerification" type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={(e) => setBusinessVerification(e.target.files?.[0] || null)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 file:mr-3 file:py-2 file:border-0 file:text-sm file:font-medium file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100 dark:bg-slate-700 dark:text-white dark:border-slate-500 dark:file:bg-yellow-900/30 dark:file:text-yellow-300" />
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Optional: Upload GST certificate, Startup India registration, MSME certificate, or other business proof if available (Max 5MB)</p>
                      </div>
                    </div>
                  )}

                  {currentStatus === 'higher-education' && (
                    <div className="space-y-4 mt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="university" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">University/College Name *</label>
                          <input id="university" name="university" type="text" required value={university} onChange={(e) => setUniversity(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-slate-700 dark:text-white dark:border-slate-500 dark:placeholder:text-slate-400" />
                        </div>
                        <div>
                          <label htmlFor="country" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Country *</label>
                          <input id="country" name="country" type="text" required value={country} onChange={(e) => setCountry(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-slate-700 dark:text-white dark:border-slate-500 dark:placeholder:text-slate-400" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="city" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">City *</label>
                          <input id="city" name="city" type="text" required value={city} onChange={(e) => setCity(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-slate-700 dark:text-white dark:border-slate-500 dark:placeholder:text-slate-400" />
                        </div>
                        <div>
                          <label htmlFor="course" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Course Name *</label>
                          <input id="course" name="course" type="text" required value={course} onChange={(e) => setCourse(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-slate-700 dark:text-white dark:border-slate-500 dark:placeholder:text-slate-400" />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="branch" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Branch/Specialization *</label>
                        <input id="branch" name="branch" type="text" required value={branch} onChange={(e) => setBranch(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-slate-700 dark:text-white dark:border-slate-500 dark:placeholder:text-slate-400" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-center space-x-4">
                  <button type="button" onClick={handlePrevious}
                    className="w-1/3 py-3 px-4 bg-slate-200 text-slate-900 rounded-md font-semibold hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors">
                    Previous
                  </button>
                  <button type="button" onClick={handleNextFromStep2}
                    className="w-2/3 py-3 px-4 bg-yellow-500 text-slate-900 rounded-md font-semibold hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors">
                    Next
                  </button>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <button type="button" onClick={handlePrevious}
                  className="text-yellow-500 hover:text-yellow-400 mb-6 inline-flex items-center text-sm font-medium">
                  ← Back to Step 2
                </button>

                <div className="bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg p-6 mb-6">
                  <div className="flex items-center mb-4">
                    <div className="w-1 h-6 bg-yellow-500 rounded-full mr-3"></div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Alumni Association</h3>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="alumniAssociationMember" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Would you like to be a member of the Alumni Association and actively participate in alumni activities? *</label>
                    <select id="alumniAssociationMember" name="alumniAssociationMember" value={alumniAssociationMember} onChange={(e) => setAlumniAssociationMember(e.target.value)} required
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-slate-700 dark:text-white dark:border-slate-500">
                      <option value="">Select an option</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="contributionArea" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">In which areas can you contribute in future to TKRCETians? *</label>
                    <select id="contributionArea" name="contributionArea" value={contributionArea} onChange={(e) => setContributionArea(e.target.value)} required
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-slate-700 dark:text-white dark:border-slate-500">
                      <option value="">Select an option</option>
                      <option value="Guest Lecture / Technical Talk">Guest Lecture / Technical Talk</option>
                      <option value="Student Mentoring">Student Mentoring</option>
                      <option value="Internship Support">Internship Support</option>
                      <option value="Placement Support">Placement Support</option>
                      <option value="Industry Projects">Industry Projects</option>
                      <option value="Curriculum Development (BoS Member / Dept Advisory Board)">Curriculum Development (BoS Member / Dept Advisory Board)</option>
                      <option value="Quality Enhancement (IQAC Member)">Quality Enhancement (IQAC Member)</option>
                      <option value="Research Collaboration">Research Collaboration</option>
                      <option value="Alumni Association Activities">Alumni Association Activities</option>
                      <option value="Donations / Scholarships">Donations / Scholarships</option>
                      <option value="Entrepreneurship Support">Entrepreneurship Support</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-center space-x-4">
                  <button type="button" onClick={handlePrevious}
                    className="w-1/3 py-3 px-4 bg-slate-200 text-slate-900 rounded-md font-semibold hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors">
                    Previous
                  </button>
                  <button type="submit"
                    className="w-2/3 py-3 px-4 bg-yellow-500 text-slate-900 rounded-md font-semibold hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors">
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