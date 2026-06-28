import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../supabaseClient';

type AlumniData = {
  name: string;
  role: string;
  company: string;
  achievement: string;
  batchYear: string;
  department: string;
  photo: string;
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

const GENERIC_ROLES = ['alumni', 'student', 'faculty', 'admin'];

function pickValue(row: Record<string, any>, candidates: string[], fallback: string): string {
  for (const key of candidates) {
    const val = row[key];
    if (val !== undefined && val !== null && String(val).trim() !== '') {
      return String(val).trim();
    }
  }
  return fallback;
}

function pickRoleValue(row: Record<string, any>): string {
  // Ordered candidates for job role/designation
  const roleCandidates = [
    'role_designation',
    'job_role',
    'jobRole',
    'Job_Role',
    'job',
    'designation',
    'position',
    'current_position',
  ];

  // First check specific job role fields
  for (const key of roleCandidates) {
    const val = row[key];
    if (val !== undefined && val !== null && String(val).trim() !== '') {
      return String(val).trim();
    }
  }

  // Check 'role' column but skip generic values
  const roleVal = row['role'];
  if (
    roleVal !== undefined &&
    roleVal !== null &&
    String(roleVal).trim() !== '' &&
    !GENERIC_ROLES.includes(String(roleVal).trim().toLowerCase())
  ) {
    return String(roleVal).trim();
  }

  return 'Successful Alumni';
}

export function AlumniWallOfFame() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [alumni, setAlumni] = useState<AlumniData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSuccessfulAlumni = async () => {
    setLoading(true);
    try {
      const { data: profiles, error } = await supabase
        .from('alumni_profiles')
        .select('*')
        .eq('wall_of_fame_status', 'approved')
        .eq('is_wall_of_fame', true);

      if (error) {
        console.error('Wall of Fame fetch error:', error);
        setAlumni([]);
        setLoading(false);
        return;
      }

      console.log('Wall of Fame raw approved alumni:', profiles);

      const visibleAlumni = (profiles || []).filter(
        (profile: any) => profile.is_hidden_from_wall !== true
      );

      console.log('Wall of Fame visible alumni after frontend filter:', visibleAlumni);

      const mapped: AlumniData[] = [];

      for (const profile of visibleAlumni) {
        const name = pickValue(profile, ['full_name', 'name'], '');
        let finalName = name;
        if (!finalName) {
          const first = pickValue(profile, ['First_Name', 'first_name', 'firstName'], '');
          const last = pickValue(profile, ['Last_name', 'last_name', 'lastName'], '');
          if (first && last) {
            finalName = `${first} ${last}`;
          } else {
            finalName = first || last || 'Unknown Alumnus';
          }
        }

        const role = pickRoleValue(profile);

        const company = pickValue(profile, [
          'company_name',
          'Company_name',
          'organization',
          'Organization',
          'organization_name',
          'company',
          'Company',
          'business_name',
          'Business_Name',
          'startup_name',
        ], 'Company details not added');

        const achievement = pickValue(profile, [
          'achievement',
          'career_highlight',
          'professional_highlight',
          'business_highlight',
        ], 'Recognized alumnus in professional career.');

        const batchYear = pickValue(profile, [
          'passed_out_year',
          'Passed_out_year',
          'passedOutYear',
          'batch',
          'graduation_year',
        ], '');

        const department = pickValue(profile, [
          'department',
          'Department',
          'branch',
        ], '');

        const photo = pickValue(profile, [
          'profile_photo',
          'profile_photo_url',
          'photo_url',
          'avatar_url',
          'Profile_Photo',
        ], '');

        console.log('Wall of Fame profile keys:', Object.keys(profile));
        console.log('Wall of Fame raw profile:', profile);

        console.log('Wall card mapping:', {
          id: profile.id,
          status: profile.wall_of_fame_status,
          isWall: profile.is_wall_of_fame,
          hidden: profile.is_hidden_from_wall,
          name: finalName,
          role,
          company,
          photo,
        });

        mapped.push({
          name: finalName,
          role,
          company,
          achievement,
          batchYear,
          department,
          photo,
        });
      }

      setAlumni(mapped);
    } catch (err) {
      console.error('Unexpected error fetching alumni_profiles:', err);
      setAlumni([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuccessfulAlumni();

    const channel = supabase
      .channel('wall-of-fame-alumni')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'alumni_profiles' },
        () => {
          fetchSuccessfulAlumni();
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log('[AlumniWallOfFame] Realtime subscription established');
        } else if (status === 'CHANNEL_ERROR' || err) {
          console.error('[AlumniWallOfFame] Realtime subscription error:', {
            status,
            error: err,
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const { current } = scrollRef;
    current.scrollBy({
      left: direction === 'left' ? -current.clientWidth * 0.75 : current.clientWidth * 0.75,
      behavior: 'smooth',
    });
  };

  return (
    <section id="wall-of-fame" className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Alumni Wall of Fame</h2>
          <p className="mt-4 text-lg text-slate-600 max-w-3xl mx-auto">
            Meet our successful alumni who are leading in top companies, startups, businesses, and professional careers.
          </p>
        </div>

        <div className="relative">
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 md:-translate-x-5 z-10 hidden md:flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-lg border border-slate-200 text-slate-700 hover:bg-yellow-500 hover:text-slate-900 hover:border-yellow-500 transition-all duration-200"
            aria-label="Scroll left"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 md:translate-x-5 z-10 hidden md:flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-lg border border-slate-200 text-slate-700 hover:bg-yellow-500 hover:text-slate-900 hover:border-yellow-500 transition-all duration-200"
            aria-label="Scroll right"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 -mx-4 px-4 md:mx-0 md:px-0"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {!loading && alumni.length === 0 && (
              <div className="snap-center shrink-0 w-full text-center py-12">
                <p className="text-slate-500 text-lg">Successful alumni profiles will appear here soon.</p>
              </div>
            )}

            {loading && (
              <div className="snap-center shrink-0 w-full text-center py-12">
                <p className="text-slate-500 text-lg">Loading alumni profiles...</p>
              </div>
            )}

            {alumni.map((alumnus, index) => {
              const showImage = alumnus.photo && alumnus.photo.trim().length > 0;
              const initials = getInitials(alumnus.name);

              return (
                <div
                  key={`${alumnus.name}-${index}`}
                  className="snap-center shrink-0 w-[85vw] md:w-[300px] bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group"
                >
                  <div className="relative h-52 w-full overflow-hidden bg-slate-100">
                    {showImage ? (
                      <img
                        src={alumnus.photo}
                        alt={alumnus.name}
                        className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-200">
                        <span className="text-4xl font-bold text-slate-600">{initials}</span>
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/40 to-transparent" />
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-slate-900 truncate">{alumnus.name}</h3>
                    <p className="text-sm text-slate-600 truncate">
                      {alumnus.role} · {alumnus.company}
                    </p>
                    <p className="text-sm text-slate-500 mt-2 line-clamp-2">{alumnus.achievement}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-semibold text-yellow-800">
                        {alumnus.batchYear ? `Batch of ${alumnus.batchYear}` : 'Alumni'}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">{alumnus.department || ''}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-slate-400 md:hidden">Swipe to explore more →</p>
      </div>
    </section>
  );
}
