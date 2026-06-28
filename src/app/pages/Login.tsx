

import React, { useState } from 'react';

import { useNavigate, Link } from 'react-router';

import { useAuth } from '../context/AuthContext';
import { UserProfile } from '../data/types';

import { GraduationCap, Eye, EyeOff } from 'lucide-react';

import { supabase } from '../../supabaseClient';



export function Login() {

  const { login } = useAuth();

  const navigate = useNavigate();

  const [email, setEmail] = useState('');

  const [password, setPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleForgotPassword = async () => {
    if (!email) {
      alert('Please enter your email first');
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      alert(error.message);
    } else {
      alert('Password reset email sent!');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);


/*
    const predefinedAdminEmail = 'alumniconnect03@gmail.com';
    const predefinedAdminPassword = 'Alumni123@';

    if (
      email.trim().toLowerCase() === predefinedAdminEmail &&
      password === predefinedAdminPassword
    ) {
      await login({
        id: 'admin-predefined',
        name: 'Admin',
        role: 'admin',
        avatar: 'https://ui-avatars.com/api/?name=Admin&background=FDE68A&color=111827&size=256',
        graduationYear: new Date().getFullYear(),
        degree: '',
        skills: [],
        email: predefinedAdminEmail,
      });
      navigate('/admin');
      return;
    }
*/
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    if (!data.user.email_confirmed_at) {
      setErrorMessage('Please verify your email before logging in.');
      return;
    }

    const signedInUser = data.user || data.session?.user;
    if (!signedInUser) {
      setErrorMessage('Login succeeded, but no user was returned. Please try again.');
      return;
    }

    console.log('[LOGIN] SignedInUser details:', {
      id: signedInUser.id,
      email: signedInUser.email,
      metadata: signedInUser.user_metadata,
    });

    const metadata = signedInUser.user_metadata || {};

    // Try to load the registered profile (prefer exact match by user_id, fallback to email)
    let profile: any = null;
    try {
      console.log('[LOGIN] Attempting to fetch profile for signedInUser:', { id: signedInUser.id, email: signedInUser.email });

      // First, check by user_id which is authoritative
      let profileResp = await supabase
        .from('alumni_profiles')
        .select('*')
        .eq('user_id', signedInUser.id)
        .maybeSingle();

      if (profileResp.error) {
        console.warn('[LOGIN] Profile fetch by user_id error:', profileResp.error.message, profileResp.error);
      }

      if (profileResp.data) {
        console.log('[LOGIN] Profile found by user_id, columns:', Object.keys(profileResp.data));
        profile = profileResp.data;
      } else if (signedInUser.email) {
        // Fallback to email match (case-insensitive)
        const profileByEmail = await supabase
          .from('alumni_profiles')
          .select('*')
          .ilike('Email_Address', signedInUser.email || '')
          .maybeSingle();

        console.log('[LOGIN] Profile fetch by email result:', { profileByEmail });

        if (profileByEmail.error) {
          console.warn('[LOGIN] Profile fetch by email error:', profileByEmail.error.message, profileByEmail.error);
        } else if (profileByEmail.data) {
          console.log('[LOGIN] Profile found by email, columns:', Object.keys(profileByEmail.data));
          profile = profileByEmail.data;
        } else {
          console.log('[LOGIN] No profile data returned by user_id or email');
        }
      }
    } catch (err) {
      console.error('[LOGIN] Profile fetch exception:', err);
      // ignore profile fetch errors and fall back to metadata
    }

    const firstName = profile?.First_Name || profile?.first_name || profile?.firstName || '';
    const lastName = profile?.Last_name || profile?.last_name || profile?.lastName || '';
    const passedOutYear = profile?.Passed_Out_Year || profile?.passed_out_year || profile?.passedOutYear;
    const fullName = (firstName || lastName)
      ? `${firstName.toString().trim()} ${lastName.toString().trim()}`.trim()
      : null;
    console.log('[LOGIN] Constructed full name from profile:', { firstName, lastName, fullName, passedOutYear });

    const mappedUser: UserProfile = {
      id: signedInUser.id,
      name: fullName
        ? fullName
        : (metadata.name as string) || signedInUser.email?.split('@')[0] || 'User',
      role:
  signedInUser.email === 'alumniconnect03@gmail.com'
    ? 'admin'
    : ((profile?.role as any) || (metadata.role as any) || 'alumni'),
      avatar:
        profile?.photo_url || profile?.Photo_URL ||
        (metadata.avatar_url as string) ||
        (metadata.avatar as string) ||
        'https://ui-avatars.com/api/?name=User&background=FDE68A&color=111827&size=256',
      graduationYear:
        Number(passedOutYear) || Number(metadata.graduationYear) || Number(metadata.graduation_year) || new Date().getFullYear(),
      degree:
        profile?.Department && profile?.College_Name
          ? `${profile.Department} - ${profile.College_Name}`
          : (metadata.degree as string) || '',
      skills: (metadata.skills as string[]) || (profile?.Skills || profile?.skills) || [],
      email: signedInUser.email || undefined,
      phone: profile?.Phone_Number || profile?.phone_number || profile?.phone || metadata.phone || undefined,
      collegeName: profile?.College_Name || profile?.college_name || metadata.collegeName || '',
      rollNumber: profile?.Roll_Number || profile?.roll_number || metadata.rollNumber || '',
      department: profile?.Department || profile?.department || metadata.department || '',
      year: profile?.passed_out_year || profile?.Passed_Out_Year || profile?.Year_of_Joining || profile?.year || metadata.year || '',
      about: profile?.about || profile?.About || '',
      linkedin: profile?.LinkedIn_Profile_URL || profile?.linkedin || (metadata.linkedin as string) || '',
      resume: profile?.Resume_File_Name || profile?.Resume_URL || profile?.resume || '',
      links: (metadata.links as { title: string; url: string }[]) || [],
    };

    console.log('[LOGIN] Final mappedUser state before login():', mappedUser);
    await login(mappedUser);
    console.log('[LOGIN] Login called with mappedUser, waiting for AuthContext/localStorage sync');

    // Wait briefly for AuthContext to persist to localStorage so downstream pages can read immediately
    const waitForStored = async (timeout = 500) => {
      const start = Date.now();
      while (Date.now() - start < timeout) {
        try {
          const saved = localStorage.getItem('allumini_user');
          if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed && parsed.id === mappedUser.id) return true;
          }
        } catch (e) {
          // ignore
        }
        // small delay
        // eslint-disable-next-line no-await-in-loop
        await new Promise((r) => setTimeout(r, 50));
      }
      return false;
    };

    const synced = await waitForStored(800);
    if (!synced) console.warn('[LOGIN] Timeout waiting for stored user in localStorage');

    console.log('[LOGIN] Navigating after login');
    if (mappedUser.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/dashboard');
    }

  };



  

  return (

    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">

      <div className="max-w-md w-full">

        <div className="text-center mb-8">

          <div className="mx-auto h-16 w-16 bg-yellow-500 rounded-lg flex items-center justify-center text-slate-900 mb-6">

            <GraduationCap className="h-10 w-10" />

          </div>

          <h2 className="text-4xl font-bold text-white mb-4">

            Login

          </h2>

          <p className="text-slate-300">

            Welcome back to Alumni Network

          </p>

          <p className="mt-4 text-sm text-slate-400">

            Don't have an account?{' '}

            <Link to="/register" className="font-medium text-yellow-500 hover:text-yellow-400">

              Register

            </Link>

          </p>

        </div>



        <div className="bg-white py-8 px-6 shadow-xl rounded-xl">

          <form onSubmit={handleSubmit} className="space-y-6">
            {errorMessage && (
              <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                {errorMessage}
              </div>
            )}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrorMessage(null);
                }}
                required
                placeholder="Enter your email"
                className="w-full px-4 py-3 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              />
            </div>



            <div>

              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">

                Password

              </label>

              <div className="relative">

                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrorMessage(null);
                  }}
                  required
                  placeholder="Enter your password"
                  className="w-full pr-11 px-4 py-3 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                />

                <button

                  type="button"

                  onClick={() => setShowPassword(!showPassword)}

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



            <div className="flex items-center justify-between">

              <div className="flex items-center">

                <input

                  id="remember-me"

                  type="checkbox"

                  className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-slate-300 rounded"

                />

                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-700">

                  Remember me

                </label>

              </div>



              <div className="text-sm">

                <button

  type="button"

  onClick={handleForgotPassword}

  className="font-medium text-yellow-600 hover:text-yellow-500"

>

  Forgot password?

</button>

                

  

                

              </div>

            </div>



            <button

              type="submit"

              className="w-full py-3 px-4 bg-yellow-500 text-slate-900 rounded-md font-semibold hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors"

            >

              Login

            </button>

          </form>

        </div>

      </div>

    </div>

  );

}

