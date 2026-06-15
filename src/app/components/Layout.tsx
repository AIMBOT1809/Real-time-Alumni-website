import { useState } from 'react';
import { NavLink, Link, Outlet, useLocation } from 'react-router';
import { Menu, X, GraduationCap, User, Bell, Search, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'motion/react';

export function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Network', path: '/network' },
    { name: 'Opportunities', path: '/opportunities' },
    { name: 'Events', path: '/events' },
    { name: 'Community', path: '/community' },
    { name: 'Dashboard', path: '/dashboard' },
  ];

  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  // Hide layout components on dashboard
  const isDashboard = location.pathname === '/dashboard';
  const isAdminPage = location.pathname === '/admin';
  const isLandingPage = location.pathname === '/';
  const isLoginPage = location.pathname === '/login';
  const isRegisterPage = location.pathname === '/register';

  if (isDashboard) {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900 text-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 font-bold text-xl tracking-tight">
            <div className="bg-yellow-500 p-1.5 rounded-md text-slate-900">
              <GraduationCap size={24} />
            </div>
            <span className="text-white">Alumni Connect</span>
          </Link>

          {/* Desktop Nav */}
          

          {/* User Controls */}
          <div className="hidden md:flex items-center space-x-4">
<<<<<<< HEAD
            <button
              onClick={() => {
                document.documentElement.classList.toggle('dark');
              }}
              className="p-2 text-slate-300 hover:text-white transition-colors"
              title="Toggle Dark Mode"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/></svg>
            </button>
            {isLandingPage || isLoginPage || isRegisterPage ? (
              // Hide buttons on landing, login, and register pages
=======
            {isLandingPage || isLoginPage || isRegisterPage || isAdminPage ? (
              // Hide buttons on landing, login, register, and admin dashboard pages
>>>>>>> 87145ccc75d32615ebf1d3f69adfe87388a747f3
              <div className="flex items-center space-x-3">
              </div>
            ) : isAuthenticated ? (
              // Show dashboard items when authenticated (not on landing page)
              <>
                <button className="text-slate-300 hover:text-white transition-colors">
                  <Search size={20} />
                </button>
                <button className="text-slate-300 hover:text-white transition-colors relative">
                  <Bell size={20} />
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-slate-900"></span>
                </button>
                <div className="flex items-center space-x-3 pl-4 border-l border-slate-700">
                  <div className="text-right hidden lg:block">
                    <div className="text-sm font-semibold">{user?.name}</div>
                    <div className="text-xs text-slate-400 capitalize">{user?.role}</div>
                  </div>
                  <img
                    src={user?.avatar || "https://ui-avatars.com/api/?name=User&background=random"}
                    alt="Profile"
                    className="w-9 h-9 rounded-full border-2 border-slate-700 object-cover"
                  />
                </div>
              </>
            ) : (
              // Show Login/Register when not authenticated (and not on landing page)
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-white border border-slate-400 rounded-md hover:bg-slate-800 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-yellow-500 text-slate-900 rounded-md font-semibold hover:bg-yellow-400 transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button onClick={toggleMenu} className="md:hidden text-white focus:outline-none">
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden bg-slate-800 border-t border-slate-700 overflow-hidden"
            >
              <nav className="flex flex-col p-4 space-y-4">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }: { isActive: boolean }) =>
                      clsx(
                        "text-base font-medium transition-colors duration-200 block py-2",
                        isActive ? "text-yellow-400" : "text-slate-300"
                      )
                    }
                  >
                    {link.name}
                  </NavLink>
                ))}
                <div className="border-t border-slate-700 pt-4 mt-4">
                  {isLandingPage || isLoginPage || isRegisterPage || isAdminPage ? (
                    // Hide buttons on landing, login, register, and admin pages mobile menu
                    <div></div>
                  ) : isAuthenticated ? (
                    // Show profile info when authenticated
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <img
                          src={user?.avatar}
                          alt="Profile"
                          className="w-10 h-10 rounded-full border-2 border-slate-600 object-cover"
                        />
                        <div>
                          <div className="text-white font-medium">{user?.name}</div>
                          <div className="text-slate-400 text-sm capitalize">{user?.role}</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Show Login/Register when not authenticated
                    <div className="flex flex-col space-y-3">
                      <Link 
                        to="/login" 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-center w-full py-2 border border-slate-600 rounded text-white hover:bg-slate-700"
                      >
                        Login
                      </Link>
                      <Link 
                        to="/register" 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-center w-full py-2 bg-yellow-500 rounded text-slate-900 font-bold hover:bg-yellow-400"
                      >
                        Join Now
                      </Link>
                    </div>
                  )}
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main className={`flex-grow container mx-auto px-4 ${isLandingPage ? 'py-0' : 'py-8'}`}>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-10 mt-auto">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center space-x-2 font-bold text-xl text-white mb-4">
              <div className="bg-yellow-500 p-1 rounded-md text-slate-900">
                <GraduationCap size={18} />
              </div>
              <span>Alumni</span>
            </div>
            <p className="text-sm leading-relaxed">
              Connecting alumni for a brighter future. Bridging the gap between education and professional success.
            </p>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">Platform</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/network" className="hover:text-yellow-400 transition-colors">Alumni Network</Link></li>
              <li><Link to="/opportunities" className="hover:text-yellow-400 transition-colors">Jobs & Internships</Link></li>
              <li><Link to="/events" className="hover:text-yellow-400 transition-colors">Events</Link></li>
              <li><Link to="/mentorship" className="hover:text-yellow-400 transition-colors">Find a Mentor</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Community</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="hover:text-yellow-400 transition-colors">About Us</Link></li>
              <li><Link to="/guidelines" className="hover:text-yellow-400 transition-colors">Community Guidelines</Link></li>
              <li><Link to="/success-stories" className="hover:text-yellow-400 transition-colors">Success Stories</Link></li>
              <li><Link to="/contact" className="hover:text-yellow-400 transition-colors">Contact Support</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Subscribe</h3>
            <p className="text-sm mb-4">Get the latest updates and opportunities.</p>
            <div className="flex">
              <input 
                type="email" 
                placeholder="Email address" 
                className="bg-slate-800 text-white px-3 py-2 rounded-l w-full focus:outline-none focus:ring-1 focus:ring-yellow-500"
              />
              <button className="bg-yellow-500 text-slate-900 px-4 py-2 rounded-r font-medium hover:bg-yellow-400 transition-colors">
                Join
              </button>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 mt-8 pt-8 border-t border-slate-800 text-center text-xs">
          &copy; {new Date().getFullYear()} Alumni University Network. All rights reserved.
        </div>
      </footer>
    </div>
  );
}