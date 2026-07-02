import { useState, useEffect } from 'react';
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router';
import Activity from 'lucide-react/dist/esm/icons/activity';
import Bell from 'lucide-react/dist/esm/icons/bell';
import BriefcaseBusiness from 'lucide-react/dist/esm/icons/briefcase-business';
import Building2 from 'lucide-react/dist/esm/icons/building-2';
import CalendarCheck from 'lucide-react/dist/esm/icons/calendar-check';
import FileText from 'lucide-react/dist/esm/icons/file-text';
import GraduationCap from 'lucide-react/dist/esm/icons/graduation-cap';
import Home from 'lucide-react/dist/esm/icons/home';
import LogOut from 'lucide-react/dist/esm/icons/log-out';
import Menu from 'lucide-react/dist/esm/icons/menu';
import MessageSquare from 'lucide-react/dist/esm/icons/message-square';
import Plus from 'lucide-react/dist/esm/icons/plus';
import Rocket from 'lucide-react/dist/esm/icons/rocket';
import School from 'lucide-react/dist/esm/icons/school';
import Search from 'lucide-react/dist/esm/icons/search';
import UserCheck from 'lucide-react/dist/esm/icons/user-check';
import UserRound from 'lucide-react/dist/esm/icons/user-round';
import Users from 'lucide-react/dist/esm/icons/users';
import X from 'lucide-react/dist/esm/icons/x';
import ChevronLeft from 'lucide-react/dist/esm/icons/chevron-left';
import ChevronRight from 'lucide-react/dist/esm/icons/chevron-right';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';

// Temporary localStorage approval flow for demo
// Filter top nav links for faculty (hide Activity)
const topNavLinks = [
  { label: 'Home',      icon: Home,       path: '/dashboard/home',      end: false },
  { label: 'Activity',  icon: Activity,   path: '/dashboard/activity',  end: false },
  { label: 'Profile',   icon: UserRound,  path: '/dashboard/profile',   end: false },
] as const;

// Temporary localStorage approval flow for demo
// Hide sidebar for faculty
const sidebarLinks = [
  { label: 'Alumni Directory',    icon: Users,             path: '/network'           },
  { label: 'Mentorship Sessions', icon: GraduationCap,     path: '/mentorship'        },
  { label: 'Jobs',                icon: BriefcaseBusiness, path: '/jobs'              },
  { label: 'Referrals',           icon: UserCheck,         path: '/referrals'         },
  { label: 'Internships',         icon: Building2,         path: '/internships'       },
  { label: 'Higher Education',    icon: School,            path: '/higher-education'  },
  { label: 'Business & Startups', icon: Rocket,            path: '/business-startups' },
  { label: 'Events',              icon: CalendarCheck,     path: '/events'            },
] as const;

export function DashboardLayout() {
  const [open, setOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, role, logout, unreadNotificationCount } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Temporary localStorage approval flow for demo
  // Redirect faculty away from activity page
  useEffect(() => {
    if (role?.toLowerCase() === 'faculty' && location.pathname === '/dashboard/activity') {
      navigate('/dashboard/home', { replace: true });
    }
  }, [role, location.pathname, navigate]);

  const extendedUser = user as typeof user & { jobType?: string; employmentType?: string };
  const canPost = role === 'alumni' || role === 'faculty';

  const avatar = user?.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=FDE68A&color=111827&size=256`;

  const profileDetails =
    role === 'student'
      ? [user?.department]
      : role === 'alumni'
      ? [user?.position, user?.company, extendedUser?.jobType || extendedUser?.employmentType]
      : role === 'faculty'
      ? [user?.department, user?.designation || (user as any)?.facultyType]
      : [user?.department];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Temporary localStorage approval flow for demo
  // Filter top nav links based on role
  const filteredTopNavLinks = role?.toLowerCase() === 'faculty'
    ? topNavLinks.filter(link => link.label !== 'Activity')
    : topNavLinks;

  return (
    <div className="dashboard-shell glass-page min-h-screen text-slate-900 dark:text-slate-100">

      {/* ─────────────────────────────────────────────────────────
          TOP HEADER  –  theme-aware glass panel
      ───────────────────────────────────────────────────────── */}
      <header className="glass-panel sticky top-0 z-50 flex items-center justify-between px-6 py-4 min-h-[88px] bg-white/90 dark:bg-slate-950/90 border border-slate-900/10 dark:border-yellow-400/20 shadow-lg">

        {/* Row 1 : Logo  +  Action icons */}
        <div className="flex items-center justify-between w-full">

          {/* Logo / Brand */}
          <Link to="/dashboard" className="flex items-center gap-2 font-bold tracking-tight shrink-0">
            <span className="rounded-lg bg-yellow-400 p-1.5 text-slate-950">
              <GraduationCap className="h-5 w-5" />
            </span>
            <span className="text-lg text-slate-900 dark:text-slate-100">Alumni Connect</span>
          </Link>

          {/* Action Icons */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Hamburger – mobile sidebar toggle */}
            {role?.toLowerCase() !== 'faculty' && (
              <button
                aria-label="Open navigation"
                onClick={() => setOpen(true)}
                className="icon-hover rounded-lg p-2 text-slate-700 dark:text-slate-300 hover:text-yellow-600 dark:hover:text-yellow-300 lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>
            )}

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Chat */}
            <NavLink
              to="/dashboard/chat"
              aria-label="Chat"
              title="Chat"
              className={({ isActive }: { isActive: boolean }) =>
                `icon-hover w-10 h-10 rounded-xl flex items-center justify-center bg-white/70 dark:bg-slate-900/70 border border-slate-900/10 dark:border-yellow-400/20 text-slate-700 dark:text-slate-200 hover:text-yellow-600 dark:hover:text-yellow-300 transition-all duration-300 ${
                  isActive
                    ? 'bg-yellow-400 text-slate-950'
                    : ''
                }`
              }
            >
              <MessageSquare className="h-5 w-5" />
            </NavLink>

            {/* Notifications */}
            <NavLink
              to="/dashboard/notifications"
              aria-label="Notifications"
              title="Notifications"
              className={({ isActive }: { isActive: boolean }) =>
                `icon-hover w-10 h-10 rounded-xl flex items-center justify-center bg-white/70 dark:bg-slate-900/70 border border-slate-900/10 dark:border-yellow-400/20 text-slate-700 dark:text-slate-200 hover:text-yellow-600 dark:hover:text-yellow-300 transition-all duration-300 ${
                  isActive
                    ? 'bg-yellow-400 text-slate-950'
                    : ''
                }`
              }
            >
              <Bell className="h-5 w-5" />
              {unreadNotificationCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-semibold leading-none text-white">
                  {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                </span>
              )}
            </NavLink>

            {/* User Avatar */}
            <NavLink
              to="/dashboard/profile"
              aria-label="Profile"
              title={user?.name || 'Profile'}
              className="ml-1 shrink-0"
            >
              <div className="icon-hover w-10 h-10 rounded-xl flex items-center justify-center bg-white/70 dark:bg-slate-900/70 border border-slate-900/10 dark:border-yellow-400/20 overflow-hidden transition-all duration-300">
                <img
                  src={avatar}
                  alt={user?.name || 'User'}
                  className="h-8 w-8 rounded-full border-2 border-yellow-400 object-cover"
                />
              </div>
            </NavLink>

            {/* Logout */}
            <button
              onClick={handleLogout}
              aria-label="Log out"
              title="Log out"
              className="icon-hover w-10 h-10 rounded-xl flex items-center justify-center bg-white/70 dark:bg-slate-900/70 border border-slate-900/10 dark:border-yellow-400/20 text-slate-700 dark:text-slate-200 hover:text-yellow-600 dark:hover:text-yellow-300 transition-all duration-300"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Row 2 : Search Bar */}
        <div className="px-6 pb-3">
          <div className="relative mx-auto max-w-xl">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" />
            <input
              type="search"
              placeholder="Search alumni, posts, jobs…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl bg-white/70 dark:bg-slate-900/70 border border-slate-300 dark:border-yellow-400/20 py-2 pl-9 pr-4 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 focus:outline-none"
            />
          </div>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────
          GLASS TOP NAV PILL  –  sits just below the dark header
      ───────────────────────────────────────────────────────── */}
      <div className="sticky top-[88px] z-40 px-4 py-2 sm:px-6">
        <nav
          aria-label="Top dashboard navigation"
          className="bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl border border-slate-900/10 dark:border-yellow-400/20 shadow-lg w-full mx-auto flex max-w-3xl items-center justify-center gap-1
                     px-3 py-2 rounded-2xl
                     overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {filteredTopNavLinks.map(({ label, icon: Icon, path, end }) => (
            <NavLink
              key={path}
              to={path}
              end={end}
              className={({ isActive }: { isActive: boolean }) =>
                `flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-semibold transition-all duration-300
                 ${isActive
                   ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-slate-950 shadow-md shadow-yellow-400/30'
                   : 'text-slate-700 dark:text-slate-300 hover:bg-yellow-50/80 dark:hover:bg-yellow-400/10 hover:text-slate-950 dark:hover:text-yellow-300 hover:-translate-y-1'}`
              }
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </NavLink>
          ))}

          {canPost && (
            <NavLink
              to="/dashboard/contributions"
              className={({ isActive }: { isActive: boolean }) =>
                `flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-semibold transition-all duration-300 whitespace-nowrap
                 ${isActive
                   ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-slate-950 shadow-md shadow-yellow-400/30'
                   : 'text-slate-700 dark:text-slate-300 hover:bg-yellow-50/80 dark:hover:bg-yellow-400/10 hover:text-slate-950 dark:hover:text-yellow-300 hover:-translate-y-1'}`
              }
            >
              <FileText className="h-4 w-4" />
              <span>My Contributions</span>
            </NavLink>
          )}

          {canPost && (
            <NavLink
              to="/dashboard/post"
              className={({ isActive }: { isActive: boolean }) =>
                `flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-semibold transition-all duration-300
                 ${isActive
                   ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-slate-950 shadow-md shadow-yellow-400/30'
                   : 'text-slate-700 dark:text-slate-300 hover:bg-yellow-50/80 dark:hover:bg-yellow-400/10 hover:text-slate-950 dark:hover:text-yellow-300 hover:-translate-y-1'}`
              }
            >
              <Plus className="h-4 w-4" />
              <span>Create Post</span>
            </NavLink>
          )}

        </nav>
      </div>

      {/* ─────────────────────────────────────────────────────────
          BODY  –  Sidebar (left)  +  Content (right)
      ───────────────────────────────────────────────────────── */}
      <div className="flex">
        {/* Mobile overlay */}
        {open && role?.toLowerCase() !== 'faculty' && (
          <button
            aria-label="Close navigation"
            className="fixed inset-0 top-0 z-30 bg-slate-950/50 lg:hidden"
            onClick={() => setOpen(false)}
          />
        )}

        {/* ── SIDEBAR ── */}
        {role?.toLowerCase() !== 'faculty' && (
          <aside
            className={`
              relative fixed bottom-0 left-0 top-0 z-40 overflow-y-auto
              glass-panel p-4
              transition-all duration-300
              lg:sticky lg:top-[180px] lg:h-[calc(100vh-200px)] lg:z-30
              lg:shrink-0 lg:translate-x-0
              ${desktopCollapsed ? 'lg:w-20' : 'lg:w-64'}
              ${open ? 'w-72 translate-x-0' : 'w-72 -translate-x-full'}
            `}
          >
            {/* Desktop toggle button */}
            <button
              onClick={() => setDesktopCollapsed(!desktopCollapsed)}
              className={`hidden lg:flex absolute top-2 z-50 items-center justify-center rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 h-8 w-8 transition ${desktopCollapsed ? 'right-2' : 'right-4'}`}
            >
              {desktopCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
            </button>
            {/* Close button – mobile only */}
            <div className="mb-3 flex justify-end lg:hidden">
              <button
                aria-label="Close menu"
                onClick={() => setOpen(false)}
                className="rounded-lg p-2 hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Profile / Introduction Card */}
            <section
              className={`glass-card p-4 ${desktopCollapsed ? 'hidden lg:block lg:p-2' : ''}`}
              aria-label="Profile introduction"
            >
              <div className={`flex items-center ${desktopCollapsed ? 'lg:justify-center' : 'gap-3'}`}>
                <img
                  src={avatar}
                  alt={user?.name || 'User'}
                  className={`rounded-full border-2 border-yellow-400 object-cover ${desktopCollapsed ? 'lg:h-10 lg:w-10' : 'h-14 w-14'}`}
                />
                <div className={`min-w-0 ${desktopCollapsed ? 'lg:hidden' : ''}`}>
                  <h2 className="truncate font-semibold text-slate-900 dark:text-slate-100">{user?.name || 'User'}</h2>
                  <p className="text-sm capitalize text-yellow-600 dark:text-yellow-400">{role || (user as any)?.role || 'Member'}</p>
                </div>
              </div>
              <div className={`mt-3 space-y-1 border-t border-slate-900/10 dark:border-yellow-400/20 pt-3 text-sm text-slate-500 dark:text-slate-400 ${desktopCollapsed ? 'lg:hidden' : ''}`}>
                {profileDetails.filter(Boolean).map((detail) => (
                  <p key={detail} className="truncate">{detail}</p>
                ))}
                {!profileDetails.some(Boolean) && (
                  <p className="text-slate-500 dark:text-slate-400">Profile details not added</p>
                )}
              </div>
            </section>

            {/* Sidebar Nav Links */}
            <p className={`px-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 ${desktopCollapsed ? 'lg:hidden' : ''}`}>
              Dashboard
            </p>
            <nav className="mt-2 space-y-1" aria-label="Dashboard sidebar navigation">
              {sidebarLinks.map(({ label, icon: Icon, path }) => (
                <NavLink
                  key={path}
                  to={path}
                  onClick={() => setOpen(false)}
                  title={desktopCollapsed ? label : undefined}
                   className={({ isActive }: { isActive: boolean }) =>
                    `sidebar-hover flex items-center gap-3 px-4 py-3 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-yellow-50/80 dark:hover:bg-yellow-400/10 hover:text-yellow-600 dark:hover:text-yellow-300 transition-all duration-300
                     ${desktopCollapsed ? 'lg:justify-center' : ''}
                     ${isActive
                       ? 'gold-active rounded-xl font-semibold'
                       : ''}`
                  }
                >
                  <Icon className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:text-yellow-600 dark:group-hover:text-yellow-300 transition-all duration-300" />
                  <span className={desktopCollapsed ? 'lg:hidden' : ''}>{label}</span>
                </NavLink>
              ))}
            </nav>
          </aside>
        )}

        {/* ── FACULTY LEFT PROFILE CARD (no nav links) ── */}
        {role?.toLowerCase() === 'faculty' && (
          <aside
            className="glass-panel p-4 border-r border-slate-900/10 dark:border-yellow-400/20 sticky top-[180px] h-[calc(100vh-200px)] z-30 w-64 shrink-0 overflow-y-auto max-lg:hidden"
          >
            <section
              className="glass-card p-4"
              aria-label="Faculty introduction"
            >
              <div className="flex items-center gap-3">
                <img
                  src={avatar}
                  alt={user?.name || 'User'}
                  className="h-14 w-14 rounded-full border-2 border-yellow-400 object-cover"
                />
                <div className="min-w-0">
                  <h2 className="truncate font-semibold text-slate-900 dark:text-slate-100">{user?.name || 'User'}</h2>
                  <p className="text-sm capitalize text-yellow-600 dark:text-yellow-400">{role || (user as any)?.role || 'Faculty'}</p>
                </div>
              </div>
              <div className="mt-3 space-y-1 border-t border-slate-900/10 dark:border-yellow-400/20 pt-3 text-sm text-slate-500 dark:text-slate-400">
                {profileDetails.filter(Boolean).map((detail) => (
                  <p key={detail} className="truncate">{detail}</p>
                ))}
                {!profileDetails.some(Boolean) && (
                  <p className="text-slate-500 dark:text-slate-400">Profile details not added</p>
                )}
              </div>
            </section>
          </aside>
        )}

        {/* ── MAIN CONTENT ── */}
        <div className={`dashboard-content min-w-0 pt-6 ${role?.toLowerCase() === 'faculty' ? 'flex-1' : 'flex-1'}`}>
          {/* Mobile Faculty Introduction Card - shown only for Faculty on mobile */}
          {role?.toLowerCase() === 'faculty' && (
            <div className="lg:hidden mx-auto max-w-4xl px-4 py-6 sm:px-6">
              <section
                className="glass-card p-4"
                aria-label="Faculty introduction"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={avatar}
                    alt={user?.name || 'User'}
                    className="h-14 w-14 rounded-full border-2 border-yellow-400 object-cover"
                  />
                  <div className="min-w-0">
                    <h2 className="truncate font-semibold text-slate-900 dark:text-slate-100">{user?.name || 'User'}</h2>
                    <p className="text-sm capitalize text-yellow-600 dark:text-yellow-400">{role || (user as any)?.role || 'Faculty'}</p>
                  </div>
                </div>
                <div className="mt-3 space-y-1 border-t border-slate-900/10 dark:border-yellow-400/20 pt-3 text-sm text-slate-500 dark:text-slate-400">
                  {profileDetails.filter(Boolean).map((detail) => (
                    <p key={detail} className="truncate">{detail}</p>
                  ))}
                  {!profileDetails.some(Boolean) && (
                    <p className="text-slate-500 dark:text-slate-400">Profile details not added</p>
                  )}
                </div>
              </section>
            </div>
          )}
          <Outlet />
        </div>
      </div>
    </div>
  );
}