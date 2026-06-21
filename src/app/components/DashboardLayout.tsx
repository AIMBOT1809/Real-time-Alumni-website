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
import { useAuth } from '../context/AuthContext';

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
  { label: 'Mentorship Sessions', icon: GraduationCap,    path: '/mentorship'        },
  { label: 'Jobs',                icon: BriefcaseBusiness, path: '/jobs'              },
  { label: 'Referrals',           icon: UserCheck,         path: '/referrals'         },
  { label: 'Internships',         icon: Building2,         path: '/internships'       },
  { label: 'Higher Education',    icon: School,            path: '/higher-education'  },
  { label: 'Business & Startups', icon: Rocket,            path: '/business-startups' },
  { label: 'Events',              icon: CalendarCheck,     path: '/events'            },
] as const;

export function DashboardLayout() {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, role, logout } = useAuth();
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
    <div className="dashboard-shell min-h-screen bg-slate-100 text-slate-900">

      {/* ─────────────────────────────────────────────────────────
          TOP HEADER  –  full-width dark navy
      ───────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 w-full bg-slate-900 text-white shadow-lg">

        {/* Row 1 : Logo  +  Action icons */}
        <div className="flex items-center justify-between px-4 pt-3 pb-2 sm:px-6">

          {/* Logo / Brand */}
          <Link to="/dashboard" className="flex items-center gap-2 font-bold tracking-tight shrink-0">
            <span className="rounded-lg bg-yellow-400 p-1.5 text-slate-950">
              <GraduationCap className="h-5 w-5" />
            </span>
            <span className="text-lg text-white">Alumni Connect</span>
          </Link>

          {/* Action Icons */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Hamburger – mobile sidebar toggle */}
            {role?.toLowerCase() !== 'faculty' && (
              <button
                aria-label="Open navigation"
                onClick={() => setOpen(true)}
                className="rounded-lg p-2 text-slate-300 hover:bg-slate-800 lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>
            )}

            {/* Chat */}
            <NavLink
              to="/dashboard/chat"
              aria-label="Chat"
              title="Chat"
              className={({ isActive }: { isActive: boolean }) =>
                `rounded-lg p-2 transition ${
                  isActive
                    ? 'bg-yellow-400 text-slate-950'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
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
                `relative rounded-lg p-2 transition ${
                  isActive
                    ? 'bg-yellow-400 text-slate-950'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <Bell className="h-5 w-5" />
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full border-2 border-slate-900 bg-red-500" />
            </NavLink>

            {/* User Avatar */}
            <NavLink
              to="/dashboard/profile"
              aria-label="Profile"
              title={user?.name || 'Profile'}
              className="ml-1 shrink-0"
            >
              <img
                src={avatar}
                alt={user?.name || 'User'}
                className="h-8 w-8 rounded-full border-2 border-yellow-400 object-cover"
              />
            </NavLink>

            {/* Logout */}
            <button
              onClick={handleLogout}
              aria-label="Log out"
              title="Log out"
              className="rounded-lg p-2 text-slate-300 hover:bg-slate-800 hover:text-yellow-400 transition"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Row 2 : Search Bar */}
        <div className="px-4 pb-3 sm:px-6">
          <div className="relative mx-auto max-w-xl">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="search"
              placeholder="Search alumni, posts, jobs…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl bg-slate-800 py-2 pl-9 pr-4 text-sm text-white placeholder-slate-400
                         border border-slate-700 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────
          WHITE ROUNDED NAV PILL  –  sits just below the dark header
      ───────────────────────────────────────────────────────── */}
      <div className="sticky top-[100px] z-40 bg-slate-100 px-4 py-2 sm:px-6">
        <nav
          aria-label="Top dashboard navigation"
          className="mx-auto flex max-w-3xl items-center justify-center gap-1
                     rounded-2xl bg-white px-3 py-2 shadow-md border border-slate-200
                     overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {filteredTopNavLinks.map(({ label, icon: Icon, path, end }) => (
            <NavLink
              key={path}
              to={path}
              end={end}
              className={({ isActive }: { isActive: boolean }) =>
                `flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-semibold transition
                 ${isActive
                   ? 'bg-yellow-400 text-slate-950 shadow-sm'
                   : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`
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
                `flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-semibold transition
                 ${isActive
                   ? 'bg-yellow-400 text-slate-950 shadow-sm'
                   : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`
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
                `flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-semibold transition
                 ${isActive
                   ? 'bg-yellow-400 text-slate-950 shadow-sm'
                   : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`
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
              fixed bottom-0 left-0 top-0 z-40 w-72 overflow-y-auto
              border-r border-slate-800 bg-slate-900 p-4 text-white
              transition-transform duration-300
              lg:sticky lg:top-[156px] lg:h-[calc(100vh-156px)]
              lg:w-64 lg:shrink-0 lg:translate-x-0
              ${open ? 'translate-x-0' : '-translate-x-full'}
            `}
          >
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
              className="mb-5 rounded-2xl border border-slate-700 bg-slate-800/80 p-4"
              aria-label="Profile introduction"
            >
              <div className="flex items-center gap-3">
                <img
                  src={avatar}
                  alt={user?.name || 'User'}
                  className="h-14 w-14 rounded-full border-2 border-yellow-400 object-cover"
                />
                <div className="min-w-0">
                  <h2 className="truncate font-semibold text-white">{user?.name || 'User'}</h2>
                  <p className="text-sm capitalize text-yellow-400">{role || (user as any)?.role || 'Member'}</p>
                </div>
              </div>
              <div className="mt-3 space-y-1 border-t border-slate-700 pt-3 text-sm text-slate-300">
                {profileDetails.filter(Boolean).map((detail) => (
                  <p key={detail} className="truncate">{detail}</p>
                ))}
                {!profileDetails.some(Boolean) && (
                  <p className="text-slate-500">Profile details not added</p>
                )}
              </div>
            </section>

            {/* Sidebar Nav Links */}
            <p className="px-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Dashboard
            </p>
            <nav className="mt-2 space-y-1" aria-label="Dashboard sidebar navigation">
              {sidebarLinks.map(({ label, icon: Icon, path }) => (
                <NavLink
                  key={path}
                  to={path}
                  onClick={() => setOpen(false)}
                  className={({ isActive }: { isActive: boolean }) =>
                    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition
                     ${isActive
                       ? 'bg-yellow-400 text-slate-950 shadow-sm'
                       : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`
                  }
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {label}
                </NavLink>
              ))}
            </nav>
          </aside>
        )}

        {/* ── FACULTY LEFT PROFILE CARD (no nav links) ── */}
        {role?.toLowerCase() === 'faculty' && (
          <aside
            className="sticky top-[156px] h-[calc(100vh-156px)] w-64 shrink-0 border-r border-slate-800 bg-slate-900 p-4 overflow-y-auto max-lg:hidden"
          >
            <section
              className="rounded-2xl border border-slate-700 bg-slate-800/80 p-4"
              aria-label="Faculty introduction"
            >
              <div className="flex items-center gap-3">
                <img
                  src={avatar}
                  alt={user?.name || 'User'}
                  className="h-14 w-14 rounded-full border-2 border-yellow-400 object-cover"
                />
                <div className="min-w-0">
                  <h2 className="truncate font-semibold text-white">{user?.name || 'User'}</h2>
                  <p className="text-sm capitalize text-yellow-400">{role || (user as any)?.role || 'Faculty'}</p>
                </div>
              </div>
              <div className="mt-3 space-y-1 border-t border-slate-700 pt-3 text-sm text-slate-300">
                {profileDetails.filter(Boolean).map((detail) => (
                  <p key={detail} className="truncate">{detail}</p>
                ))}
                {!profileDetails.some(Boolean) && (
                  <p className="text-slate-500">Profile details not added</p>
                )}
              </div>
            </section>
          </aside>
        )}

        {/* ── MAIN CONTENT ── */}
        <div className={`dashboard-content min-w-0 ${role?.toLowerCase() === 'faculty' ? 'flex-1' : 'flex-1'}`}>
          {/* Mobile Faculty Introduction Card - shown only for Faculty on mobile */}
          {role?.toLowerCase() === 'faculty' && (
            <div className="lg:hidden mx-auto max-w-4xl px-4 py-6 sm:px-6">
              <section
                className="rounded-2xl border border-slate-700 bg-slate-800/80 p-4"
                aria-label="Faculty introduction"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={avatar}
                    alt={user?.name || 'User'}
                    className="h-14 w-14 rounded-full border-2 border-yellow-400 object-cover"
                  />
                  <div className="min-w-0">
                    <h2 className="truncate font-semibold text-white">{user?.name || 'User'}</h2>
                    <p className="text-sm capitalize text-yellow-400">{role || (user as any)?.role || 'Faculty'}</p>
                  </div>
                </div>
                <div className="mt-3 space-y-1 border-t border-slate-700 pt-3 text-sm text-slate-300">
                  {profileDetails.filter(Boolean).map((detail) => (
                    <p key={detail} className="truncate">{detail}</p>
                  ))}
                  {!profileDetails.some(Boolean) && (
                    <p className="text-slate-500">Profile details not added</p>
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