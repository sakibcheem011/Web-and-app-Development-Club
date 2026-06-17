import React from 'react';
import { Menu, X, Landmark, RefreshCw, Sun, Moon, Smartphone } from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  chapter: 'GSTU' | 'BSMRSTU';
  onChapterToggle: () => void;
  currentUser: any;
  isAdmin: boolean;
  onSignOut: () => void;
  userProfile?: any;
  onDownloadClick?: () => void;
}

export default function Navbar({ 
  currentView, 
  onViewChange, 
  chapter, 
  onChapterToggle,
  currentUser,
  isAdmin,
  onSignOut,
  userProfile,
  onDownloadClick
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'events', label: 'Events' },
    { id: 'projects', label: 'Projects' },
    { id: 'achievements', label: 'Achievements' },
    { id: 'announcements', label: 'Announcements' },
    { id: 'contact', label: 'Contact' },
    ...(isAdmin ? [{ id: 'admin', label: 'Admin Panel' }] : [])
  ];


  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Authentic Hover Logo & Branding */}
          <div 
            onClick={() => onViewChange('home')}
            className="flex items-center cursor-pointer space-x-3 group"
          >
            {/* Overlay Venn SVG Logo */}
            <div className="relative w-10 h-10 flex items-center justify-center">
              {/* Outer Venn circles */}
              <div className="absolute inset-0 bg-teal-500/10 rounded-full scale-100 group-hover:scale-105 transition-transform duration-300"></div>
              <div className="absolute w-7 h-7 -translate-x-1.5 bg-emerald-500/20 rounded-full mix-blend-multiply filter blur-[0.5px]"></div>
              <div className="absolute w-7 h-7 translate-x-1.5 bg-cyan-500/20 rounded-full mix-blend-multiply filter blur-[0.5px]"></div>
              
              {/* Central badge with </> */}
              <div className="relative w-6 h-6 bg-white dark:bg-slate-800 border border-emerald-500/30 dark:border-emerald-500/20 rounded-full flex items-center justify-center shadow-sm">
                <span className="text-[11px] font-mono font-bold text-emerald-800 dark:text-emerald-400 leading-none">&lt;/&gt;</span>
              </div>
            </div>

            {/* Typography */}
            <div className="flex flex-col">
              <span className="text-sm font-bold font-display tracking-tight text-slate-900 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                {chapter === 'GSTU' ? 'Web and App Development Club' : 'CSE Club'}
              </span>
              <span className="text-[10px] font-mono leading-none font-semibold text-slate-400 dark:text-slate-500 tracking-wider">
                {chapter === 'GSTU' ? 'GSTU' : 'BSMRSTU'}
              </span>
            </div>
          </div>

          {/* Desktop Navigation Link Targets */}
          <nav className="hidden md:flex space-x-1 lg:space-x-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onViewChange(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  currentView === item.id
                    ? 'text-emerald-700 bg-emerald-50/70 dark:text-emerald-450 dark:bg-emerald-950/40 shadow-[inset_0_-2px_0_0_#10b981]'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Desktop Right Hand Control Actions */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Download App Trigger */}
            <button
              onClick={onDownloadClick}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 border border-emerald-500/20 hover:border-emerald-500/40 hover:bg-emerald-50 rounded-lg text-emerald-700 font-semibold text-xs tracking-wide transition-colors cursor-pointer"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Download App</span>
            </button>

            {currentUser ? (
              <div className="flex items-center space-x-3">
                <div className="flex flex-col text-right">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {userProfile ? `${userProfile.firstName} ${userProfile.lastName || ''}` : (currentUser.displayName || currentUser.email)}
                  </span>
                  <span className="text-[9px] font-mono font-bold text-emerald-600 dark:text-emerald-450 flex items-center justify-end gap-1 uppercase">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                    {isAdmin ? 'Admin Authorized' : 'Member Active'}
                  </span>
                </div>
                {!isAdmin && (
                  <button
                    onClick={() => onViewChange('admin')}
                    className="text-xs font-semibold px-2.5 py-1.5 border border-purple-500/20 hover:bg-purple-500/10 rounded-lg text-purple-600 dark:text-purple-400 transition-colors cursor-pointer"
                  >
                    Admin Login
                  </button>
                )}
                <button
                  onClick={onSignOut}
                  className="bg-black hover:bg-slate-850 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white px-3.5 py-1.8 rounded-lg text-xs font-medium font-mono uppercase tracking-wider transition-all cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <>
                <button 
                  onClick={() => onViewChange('admin')}
                  className="text-sm font-medium px-4 py-2 hover:bg-purple-50/50 dark:hover:bg-purple-950/20 rounded-lg text-purple-600 dark:text-purple-400 transition-colors cursor-pointer"
                >
                  Admin Login
                </button>
                <button 
                  onClick={() => onViewChange('login')}
                  className="text-sm font-medium px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                >
                  Login
                </button>
                <button
                  onClick={() => onViewChange('join')}
                  className="bg-black hover:bg-emerald-950 dark:bg-emerald-600 dark:hover:bg-emerald-700 hover:shadow-md text-white px-4 py-2 rounded-md text-sm font-medium font-display tracking-wide transition-all active:scale-95 shadow-sm cursor-pointer"
                >
                  Join Us
                </button>
              </>
            )}
          </div>

          {/* Mobile hamburger & menu trigger */}
          <div className="flex md:hidden items-center space-x-1">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 py-3 px-4 shadow-lg animate-fade-in">
          {/* Mobile Download/Install Link */}
          <button
            onClick={() => {
              onDownloadClick?.();
              setMobileMenuOpen(false);
            }}
            className="w-full mb-3 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-500/20 hover:border-emerald-500 hover:bg-emerald-100 text-emerald-700 rounded-lg text-sm font-semibold shadow-sm transition-all cursor-pointer"
          >
            <Smartphone className="w-4 h-4" />
            Download Mobile App
          </button>

          <div className="space-y-1 pb-3">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onViewChange(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left block px-3 py-2 rounded-md text-base font-medium ${
                  currentView === item.id
                    ? 'text-emerald-700 bg-emerald-50 dark:text-emerald-450 dark:bg-emerald-950/40'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex items-center justify-between px-3">
            {currentUser ? (
              <div className="flex items-center justify-between w-full">
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-850 dark:text-slate-300">
                    {userProfile ? `${userProfile.firstName} ${userProfile.lastName || ''}` : (currentUser.displayName || currentUser.email)}
                  </span>
                  <span className="text-[9px] font-mono font-bold text-emerald-600 dark:text-emerald-450 uppercase">
                    {isAdmin ? 'Admin' : 'Member'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {!isAdmin && (
                    <button
                      onClick={() => {
                        onViewChange('admin');
                        setMobileMenuOpen(false);
                      }}
                      className="text-purple-600 dark:text-purple-400 text-xs font-semibold cursor-pointer"
                    >
                      Admin Login
                    </button>
                  )}
                  <button
                    onClick={() => {
                      onSignOut();
                      setMobileMenuOpen(false);
                    }}
                    className="bg-black dark:bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5 w-full">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => {
                      onViewChange('login');
                      setMobileMenuOpen(false);
                    }}
                    className="text-slate-600 dark:text-slate-300 text-sm font-medium hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => {
                      onViewChange('admin');
                      setMobileMenuOpen(false);
                    }}
                    className="text-purple-600 dark:text-purple-400 text-sm font-semibold hover:text-purple-700 cursor-pointer"
                  >
                    Admin Login
                  </button>
                </div>
                <button
                  onClick={() => {
                    onViewChange('join');
                    setMobileMenuOpen(false);
                  }}
                  className="bg-black hover:bg-emerald-950 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white px-4 py-2 rounded-md text-sm font-medium font-display cursor-pointer w-full text-center"
                >
                  Join Us
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
