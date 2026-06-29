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

function pickValue(row: Record<string, any>, candidates: string[], fallback: string): string {
  for (const key of candidates) {
    const val = row[key];
    if (val !== undefined && val !== null && String(val).trim() !== '') {
      return String(val).trim();
    }
  }
  return fallback;
}

function normalizeValue(value: string): string {
  return value.toLowerCase().trim().replace(/[-_]/g, ' ');
}

const SUCCESSFUL_STATUSES = [
  'working professional',
  'entrepreneur',
  'startup founder',
  'business',
  'startup',
  'business startup',
];

const SUCCESSFUL_KEYWORDS = [
  'hr',
  'hr manager',
  'human resources',
  'recruiter',
  'talent acquisition',
  'ceo',
  'founder',
  'co-founder',
  'cto',
  'director',
  'manager',
  'senior manager',
  'team lead',
  'lead',
  'project manager',
  'product manager',
  'data analyst',
  'data scientist',
  'senior software engineer',
  'software engineer',
  'business analyst',
  'salesforce consultant',
  'entrepreneur',
  'business owner',
  'startup founder',
];

const GENERIC_ROLES = ['alumni', 'student', 'faculty', 'admin'];

function isSuccessfulAlumni(profile: Record<string, any>): boolean {
  const rawStatus = pickValue(
    profile,
    ['current_status', 'currentStatus', 'Current_Status', 'career_status', 'status'],
    ''
  );

  if (!rawStatus) return false;

  const normalizedStatus = normalizeValue(rawStatus);
  const isStatusValid = SUCCESSFUL_STATUSES.some((s) => normalizedStatus === s);
  if (!isStatusValid) return false;

  const rawRole = pickValue(
    profile,
    [
      'role_position',
      'rolePosition',
      'Role_Position',
      'job_role',
      'jobRole',
      'role_designation',
      'designation',
      'position',
      'founder_role',
      'founderRole',
      'Founder_Role',
      'role',
    ],
    ''
  );

  if (!rawRole) return false;

  const normalizedRole = normalizeValue(rawRole);
  const isGenericRole = GENERIC_ROLES.some((r) => normalizedRole === r);
  if (isGenericRole) return false;

  const hasSuccessfulKeyword = SUCCESSFUL_KEYWORDS.some((keyword) =>
    normalizedRole.includes(keyword)
  );
  if (!hasSuccessfulKeyword) return false;

  const company = pickValue(
    profile,
    [
      'organization_name',
      'organizationName',
      'Organization_Name',
      'organization',
      'Organization',
      'company_name',
      'companyName',
      'company',
      'startup_name',
      'startupName',
      'Startup_Name',
      'business_name',
      'businessName',
    ],
    ''
  );

  if (!company) return false;

  return true;
}

export function AlumniWallOfFame() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [alumni, setAlumni] = useState<AlumniData[]>([]);
  const [loading, setLoading] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const autoSlideRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isHoveredRef = useRef(false);

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

      const successfulAlumni = visibleAlumni.filter(isSuccessfulAlumni);
      console.log('Wall of Fame successful alumni after success filter:', successfulAlumni);

      const mapped: AlumniData[] = [];

      for (const profile of successfulAlumni) {
        console.log("Wall of Fame passed out year raw profile:", profile);
        console.log("Wall of Fame profile keys:", Object.keys(profile));
        console.log("Wall of Fame batch/department raw profile:", profile);

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

        const role = pickValue(profile, [
          'role_position',
          'rolePosition',
          'Role_Position',
          'job_role',
          'jobRole',
          'role_designation',
          'designation',
          'position',
          'founder_role',
          'founderRole',
          'Founder_Role',
          'role',
        ], '');

        const company = pickValue(profile, [
          'organization_name',
          'organizationName',
          'Organization_Name',
          'organization',
          'Organization',
          'company_name',
          'companyName',
          'company',
          'startup_name',
          'startupName',
          'Startup_Name',
          'business_name',
          'businessName',
        ], '');

        const achievement = pickValue(profile, [
          'achievement',
          'career_highlight',
          'professional_highlight',
          'business_highlight',
        ], 'Recognized alumnus in professional career.');

        const batchYear = pickValue(profile, [
          'passed_out_year',
          'passedOutYear',
          'Passed_out_year',
          'PassedOutYear',
          'passedoutyear',
          'passout_year',
          'passoutYear',
          'passed_year',
          'year_of_passing',
          'yearOfPassing',
          'graduation_year',
          'graduationYear',
          'batch',
          'Batch',
        ], '');
        
        console.log("Mapped passed out year:", batchYear);

        const department = pickValue(profile, [
          'department',
          'Department',
          'dept',
          'Dept',
          'branch',
          'Branch',
          'specialization',
          'Specialization',
          'course_branch',
          'courseBranch',
        ], '');

        const photo = pickValue(profile, [
          'profile_photo',
          'profile_photo_url',
          'photo_url',
          'avatar_url',
        ], '');

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

  useEffect(() => {
    if (alumni.length < 2) return;

    autoSlideRef.current = setInterval(() => {
      if (!scrollRef.current || isHoveredRef.current) return;

      const { current } = scrollRef;
      const cardWidth = current.clientWidth * 0.75;
      const { scrollLeft, scrollWidth, clientWidth } = current;
      const maxScroll = scrollWidth - clientWidth;

      if (scrollLeft >= maxScroll - 1) {
        current.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        current.scrollTo({ left: scrollLeft + cardWidth, behavior: 'smooth' });
      }
    }, 3000);

    return () => {
      if (autoSlideRef.current) {
        clearInterval(autoSlideRef.current);
        autoSlideRef.current = null;
      }
    };
  }, [alumni.length]);

  const handleMouseEnter = () => {
    setIsHovered(true);
    isHoveredRef.current = true;
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    isHoveredRef.current = false;
  };

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const { current } = scrollRef;
    const scrollAmount = direction === 'left' ? -current.clientWidth * 0.75 : current.clientWidth * 0.75;
    current.scrollBy({
      left: scrollAmount,
      behavior: 'smooth',
    });
  };

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    const maxScroll = scrollWidth - clientWidth;
    setScrollProgress(maxScroll > 0 ? scrollLeft / maxScroll : 0);
  };

  return (
    <section id="wall-of-fame" className="relative pt-28 pb-20 md:pt-32 md:pb-24 overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* Subtle Background Decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: 'radial-gradient(circle, #1e3a5f 1px, transparent 1px)',
            backgroundSize: '30px 30px',
          }}
        />
        <div className="absolute -top-60 -right-60 w-96 h-96 rounded-full bg-yellow-400/5 blur-3xl" />
        <div className="absolute -bottom-60 -left-60 w-96 h-96 rounded-full bg-yellow-400/5 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-12 md:mb-14">
          {/* Featured Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-yellow-100 to-amber-100 border border-yellow-300/50 shadow-sm mb-6">
            <svg className="w-3.5 h-3.5 text-yellow-700" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l2.4 7.2H22l-6 4.8 2.4 7.2L12 16.8 5.6 21.2 8 14 2 9.2h7.6z" />
            </svg>
            <span className="text-xs font-bold uppercase tracking-wider text-yellow-800">Featured Alumni</span>
          </div>

          {/* Title */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight leading-tight">
            Alumni{' '}
            <span className="bg-gradient-to-r from-yellow-600 to-amber-500 bg-clip-text text-transparent">Wall of Fame</span>
          </h2>

          {/* Subtle Gold Divider */}
          <div className="flex items-center justify-center gap-3 mt-4 mb-5">
            <div className="h-px w-16 bg-gradient-to-r from-transparent via-yellow-400 to-yellow-500" />
            <svg className="w-4 h-4 text-yellow-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l2.4 7.2H22l-6 4.8 2.4 7.2L12 16.8 5.6 21.2 8 14 2 9.2h7.6z" />
            </svg>
            <div className="h-px w-16 bg-gradient-to-r from-yellow-500 via-yellow-400 to-transparent" />
          </div>

          {/* Subtitle */}
          <p className="text-base md:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Celebrating our remarkable alumni who are leading in top companies, startups, businesses, and professional careers.
          </p>
        </div>

        {/* Carousel Section */}
        <div className="relative">
          {/* Left Arrow */}
          <button
            onClick={() => scroll('left')}
            className="absolute -left-3 md:-left-5 top-1/2 -translate-y-1/2 z-20 hidden md:flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg border border-slate-200 text-slate-700 hover:bg-slate-900 hover:text-yellow-400 hover:border-slate-900 transition-all duration-300"
            aria-label="Scroll left"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Right Arrow */}
          <button
            onClick={() => scroll('right')}
            className="absolute -right-3 md:-right-5 top-1/2 -translate-y-1/2 z-20 hidden md:flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg border border-slate-200 text-slate-700 hover:bg-slate-900 hover:text-yellow-400 hover:border-slate-900 transition-all duration-300"
            aria-label="Scroll right"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Cards Container */}
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-8 -mx-4 px-4 md:mx-0 md:px-0"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {!loading && alumni.length === 0 && (
              <div className="snap-center shrink-0 w-full text-center py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 mb-4">
                  <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 2l2.4 7.2H22l-6 4.8 2.4 7.2L12 16.8 5.6 21.2 8 14 2 9.2h7.6z" />
                  </svg>
                </div>
                <p className="text-slate-500 text-lg font-medium">Successful alumni profiles will appear here soon.</p>
                <p className="text-slate-400 text-sm mt-2">Stay tuned for inspiring stories from our alumni community.</p>
              </div>
            )}

            {loading && (
              <div className="snap-center shrink-0 w-full text-center py-16">
                <div className="inline-flex items-center justify-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-yellow-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-3 h-3 rounded-full bg-yellow-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-3 h-3 rounded-full bg-yellow-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <p className="text-slate-500 text-lg font-medium">Loading alumni profiles...</p>
              </div>
            )}

            {alumni.map((alumnus, index) => {
              const showImage = alumnus.photo && alumnus.photo.trim().length > 0;
              const initials = getInitials(alumnus.name);

              return (
                <div
                  key={`${alumnus.name}-${index}`}
                  className="snap-center shrink-0 w-[85vw] md:w-[calc(50%-12px)] lg:w-[calc(25%-18px)] bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden hover:shadow-xl hover:-translate-y-1.5 transition-all duration-400 group flex flex-col"
                >
                  {/* Image Section */}
                  <div className="relative h-52 w-full overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
                    {showImage ? (
                      <img
                        src={alumnus.photo}
                        alt={alumnus.name}
                        className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                        <div className="w-20 h-20 rounded-full bg-white shadow-inner flex items-center justify-center">
                          <span className="text-3xl font-bold text-slate-500">{initials}</span>
                        </div>
                      </div>
                    )}
                    
                    {/* Gradient overlay */}
                    <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
                    
                    {/* Featured Badge on Card */}
                    <div className="absolute top-3 left-3 z-10">
                      <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-yellow-400 to-amber-400 shadow-md">
                        <svg className="w-3 h-3 text-yellow-900" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2l2.4 7.2H22l-6 4.8 2.4 7.2L12 16.8 5.6 21.2 8 14 2 9.2h7.6z" />
                        </svg>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-yellow-900">Featured</span>
                      </div>
                    </div>

                    {/* Star Icon */}
                    <div className="absolute top-3 right-3 z-10">
                      <div className="w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm shadow flex items-center justify-center">
                        <svg className="w-3.5 h-3.5 text-yellow-500" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2l2.4 7.2H22l-6 4.8 2.4 7.2L12 16.8 5.6 21.2 8 14 2 9.2h7.6z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-5 flex flex-col flex-1 min-h-0">
                    {/* Name */}
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-yellow-700 transition-colors duration-300 leading-snug">
                      {alumnus.name}
                    </h3>
                    
                    {/* Role & Company - allow wrapping into 2 lines */}
                    <p className="text-sm text-slate-600 mt-1 leading-snug">
                      <span className="font-medium text-slate-700">{alumnus.role}</span>
                      {alumnus.company && (
                        <>
                          <span className="text-slate-400 mx-1.5">·</span>
                          <span className="text-slate-500">{alumnus.company}</span>
                        </>
                      )}
                    </p>
                    
                    {/* Achievement - line-clamp-2 is fine here */}
                    <p className="text-sm text-slate-500 mt-2.5 line-clamp-2 leading-relaxed">
                      {alumnus.achievement}
                    </p>
                    
                    {/* Spacer to push footer down */}
                    <div className="flex-1 min-h-2" />
                    
                    {/* Batch & Department - flex layout: left batch, right department */}
                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                      {/* Batch - Gold Pill */}
                      <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-yellow-100 to-amber-100 px-3 py-1 text-xs font-semibold text-yellow-800 border border-yellow-200/50 shadow-sm shrink-0">
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                        {alumnus.batchYear ? `Batch of ${alumnus.batchYear}` : 'Batch not added'}
                      </span>
                      
                      {/* Department - no truncation, no max-width restriction */}
                      <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md text-right shrink-0">
                        {alumnus.department || 'Dept. not added'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dots Indicator */}
          {alumni.length > 0 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              {Array.from({ length: Math.min(alumni.length, 6) }).map((_, index) => {
                const dotCount = Math.min(alumni.length, 6);
                const activeIndex = Math.round(scrollProgress * (dotCount - 1));
                return (
                  <button
                    key={index}
                    onClick={() => {
                      if (!scrollRef.current) return;
                      const cardWidth = scrollRef.current.clientWidth * 0.75;
                      scrollRef.current.scrollTo({
                        left: index * cardWidth,
                        behavior: 'smooth',
                      });
                    }}
                    className={`rounded-full transition-all duration-300 ${
                      index === activeIndex
                        ? 'w-8 h-2.5 bg-gradient-to-r from-yellow-500 to-amber-500 shadow-sm'
                        : 'w-2.5 h-2.5 bg-slate-300 hover:bg-slate-400'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Mobile Swipe Hint */}
        <p className="mt-6 text-center text-sm text-slate-400 md:hidden flex items-center justify-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
          </svg>
          Swipe to explore more
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
          </svg>
        </p>
      </div>
    </section>
  );
}