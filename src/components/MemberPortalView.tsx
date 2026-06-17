import React from 'react';
import { Globe, CheckCircle2, Award, BookOpen, Calendar, Rocket, Sparkles, LogIn } from 'lucide-react';

interface MemberPortalViewProps {
  chapter: 'GSTU' | 'BSMRSTU';
}

export default function MemberPortalView({ chapter }: MemberPortalViewProps) {
  const isGstu = chapter === 'GSTU';
  const defaultDomain = isGstu ? '@gstu.edu.bd' : '@bsmrstu.edu.bd';
  
  // Dashboard view toggle tabs
  const [activeTab, setActiveTab] = React.useState<'register' | 'dashboard'>('register');
  const [loginMode, setLoginMode] = React.useState(false); // Quick toggle inside register for basic sign-in

  // Form registration field state
  const [formFields, setFormFields] = React.useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    agree: false
  });

  const [registerSuccess, setRegisterSuccess] = React.useState(false);

  // Active Simulated profile (loaded on successful register, or standard preset)
  const [memberProfile, setMemberProfile] = React.useState({
    firstName: 'Alan',
    lastName: 'Turing',
    email: `alan.turing${defaultDomain}`,
    role: 'General Member',
    cohort: '22-23',
    registered: true
  });

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (formFields.firstName && formFields.email) {
      setMemberProfile({
        firstName: formFields.firstName,
        lastName: formFields.lastName || 'Member',
        email: formFields.email,
        role: 'General Member',
        cohort: '22-23',
        registered: true
      });
      setRegisterSuccess(true);
      setTimeout(() => {
        setRegisterSuccess(false);
        setActiveTab('dashboard');
      }, 1500);
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveTab('dashboard');
  };

  return (
    <div className="font-sans bg-transparent py-12 sm:py-16 text-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* HEADER BRAND & TAB SWITCHER PILLS */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-slate-200 pb-6">
          <div className="space-y-1 text-center md:text-left">
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-910 tracking-tight">
              Member Portal
            </h1>
            <p className="text-slate-400 text-xs font-semibold">
              Manage your club profile, workshop RSVPs, and project spotlight requests.
            </p>
          </div>

          {/* Toggle pill switcher */}
          <div className="inline-flex bg-slate-100 rounded-xl p-1 border border-slate-200">
            <button
              onClick={() => { setActiveTab('register'); setLoginMode(false); }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'register' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Portal Access
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'dashboard' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              My Dashboard
            </button>
          </div>
        </div>

        {/* VIEW 1: REGISTRATION & LOGIN PORTAL */}
        {activeTab === 'register' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Left Description Canvas Panel */}
            <div className="lg:col-span-5 bg-gradient-to-br from-teal-950 to-zinc-950 text-white p-6 sm:p-8 rounded-2xl flex flex-col justify-between shadow-md relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(#059669_0.6px,transparent_0.6px)] [bg-size:12px_12px] opacity-10"></div>
              
              <div className="space-y-6 relative z-10">
                <div className="inline-flex items-center space-x-1 bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-3 py-1 rounded-full text-[10px] font-semibold tracking-wider font-mono">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  <span>NEW SESSION OPEN</span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-bold font-display tracking-tight leading-tight">
                  Forge Your Technical Legacy with {isGstu ? 'GSTU Club' : 'CSE Club'}.
                </h2>
                
                <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed font-normal">
                  Access exclusive hackathons, industry networking, and collaborative research projects designed specifically for the next generation of software engineers and innovators.
                </p>

                {/* Substats labels */}
                <div className="flex flex-wrap gap-3 pt-2">
                  <span className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-xs font-mono font-medium text-slate-300">
                    500+ Members
                  </span>
                  <span className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-xs font-mono font-medium text-slate-300">
                    50+ Active Projects
                  </span>
                </div>
              </div>

              <div className="border-t border-white/5 pt-6 mt-6 relative z-10 text-[11px] text-zinc-500">
                <span>By joining, you agree to comply with standard academic integrity codes.</span>
              </div>
            </div>

            {/* Right Registration/Login Card Panel */}
            <div className="lg:col-span-7 bg-white border border-slate-205 rounded-2xl p-6 sm:p-8 hover:shadow transition-shadow">
              
              {registerSuccess ? (
                <div className="h-full flex flex-col items-center justify-center py-16 text-center space-y-4 animate-scale-up">
                  <CheckCircle2 className="w-16 h-16 text-emerald-500 animate-bounce" />
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold font-display text-slate-900">Profile Form Created Successfully!</h3>
                    <p className="text-xs text-slate-500 max-w-sm">
                      Outstanding, {memberProfile.firstName}! Setting up secure database ledgers and routing to active cohort dashboards...
                    </p>
                  </div>
                </div>
              ) : loginMode ? (
                /* LOGIN SUB-VIEW */
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <h3 className="font-bold font-display text-lg text-slate-900">Member Sign In</h3>
                    <p className="text-xs text-slate-450 font-normal">
                      Welcome back! Enter credentials to access active portfolios.
                    </p>
                  </div>

                  <div className="space-y-4 pt-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 uppercase font-mono pb-1">University Email</label>
                      <input 
                        type="email" 
                        required
                        placeholder={`e.g. alan.turing${defaultDomain}`}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-emerald-500 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 uppercase font-mono pb-1">Password</label>
                      <input 
                        type="password" 
                        required
                        placeholder="••••••••"
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-emerald-500 font-medium"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full text-center bg-black hover:bg-emerald-950 text-white py-2.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider font-display transition-all shadow-sm active:scale-95 pt-3"
                  >
                    Authenticate profile
                  </button>

                  <div className="text-center pt-2">
                    <button 
                      type="button"
                      onClick={() => setLoginMode(false)}
                      className="text-xs text-emerald-700 font-semibold hover:underline cursor-pointer"
                    >
                      Need an account? Register cohort space here
                    </button>
                  </div>
                </form>
              ) : (
                /* REGISTRATION SUB-VIEW */
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-1">
                    <h3 className="font-bold font-display text-lg text-slate-900">Create Account</h3>
                    <p className="text-xs text-slate-450 font-normal">
                      Already a member?{' '}
                      <button 
                        type="button"
                        onClick={() => setLoginMode(true)}
                        className="text-emerald-700 hover:underline font-bold cursor-pointer"
                      >
                        Log in here
                      </button>
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 uppercase font-mono pb-1">First Name</label>
                      <input 
                        type="text" 
                        required
                        placeholder="e.g. Alan"
                        value={formFields.firstName}
                        onChange={(e) => setFormFields({...formFields, firstName: e.target.value})}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-emerald-500 font-medium text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 uppercase font-mono pb-1">Last Name</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Turing"
                        value={formFields.lastName}
                        onChange={(e) => setFormFields({...formFields, lastName: e.target.value})}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-emerald-500 font-medium text-slate-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 uppercase font-mono pb-1">University Email Address</label>
                    <input 
                      type="email" 
                      required
                      placeholder={`username${defaultDomain}`}
                      value={formFields.email}
                      onChange={(e) => setFormFields({...formFields, email: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-emerald-500 font-medium text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 uppercase font-mono pb-1">Secure Password</label>
                    <input 
                      type="password" 
                      required
                      placeholder="••••••••"
                      value={formFields.password}
                      onChange={(e) => setFormFields({...formFields, password: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-emerald-500 font-medium"
                    />
                  </div>

                  {/* Agree to guidelines checkbox */}
                  <div className="flex items-start space-x-2.5 pt-1.5 pb-2">
                    <input 
                      type="checkbox" 
                      id="agree-rules" 
                      required
                      checked={formFields.agree}
                      onChange={(e) => setFormFields({...formFields, agree: e.target.checked})}
                      className="mt-1 accent-emerald-600 rounded cursor-pointer"
                    />
                    <label htmlFor="agree-rules" className="text-xs text-slate-500 leading-snug cursor-pointer select-none">
                      I agree to the Club Regulations and Privacy Guidelines.
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="w-full text-center bg-black hover:bg-emerald-950 text-white py-2 rounded-lg text-xs font-mono font-bold uppercase tracking-wider font-display transition-all shadow active:scale-95 pt-3"
                  >
                    Create Profile
                  </button>

                  {/* Third party icons bar */}
                  <div className="pt-4 border-t border-slate-100 flex flex-col justify-center space-y-2.5 items-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider">
                      OR SIGN UP WITH
                    </span>
                    
                    <div className="w-full max-w-xs">
                      <button 
                        type="button" 
                        onClick={() => alert('Simulating secure Google OAuth registration...')}
                        className="w-full flex items-center justify-center space-x-2 border border-slate-200 hover:border-slate-350 p-2.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
                      >
                        <Globe className="w-3.5 h-3.5 text-blue-600" />
                        <span>Google Account</span>
                      </button>
                    </div>
                  </div>

                </form>
              )}

            </div>

          </div>
        )}

        {/* VIEW 2: LOGGED-IN PERSONAL DASHBOARD STATE */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-fade-in">
            
            {/* 1. Member welcome banner */}
            <div className="bg-gradient-to-r from-emerald-950 to-slate-950 text-white rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md border border-slate-900 relative overflow-hidden">
              <div className="absolute inset-0 bg-radial-gradient from-emerald-500/10 to-transparent"></div>
              
              <div className="flex items-center space-x-4 relative z-10 text-center sm:text-left flex-col sm:flex-row">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 font-display text-xl font-extrabold shadow mb-3 sm:mb-0">
                  {memberProfile.firstName?.[0] || 'U'}{memberProfile.lastName?.[0] || 'A'}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 justify-center sm:justify-start">
                    <h2 className="text-xl sm:text-2xl font-bold font-display">{memberProfile.firstName} {memberProfile.lastName}</h2>
                    <span className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-full">
                      {memberProfile.role}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 font-mono">{memberProfile.email}</p>
                </div>
              </div>

              {/* Stat panel summary inside header */}
              <div className="flex space-x-6 relative z-10 font-mono text-center">
                <div>
                  <span className="block text-[10px] font-semibold text-zinc-400 uppercase">ACADEMIC SESSION</span>
                  <span className="text-sm font-bold text-emerald-400">{memberProfile.cohort}</span>
                </div>
              </div>
            </div>

            {/* 2. CORE AGENDA GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Column stats modules */}
              <div className="lg:col-span-1 space-y-6">
                
                {/* Stats counter list card */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                  <h3 className="font-bold font-display text-sm uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">
                    Achievements Milestone
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <div className="flex items-center space-x-2">
                        <BookOpen className="w-4 h-4 text-emerald-600" />
                        <span className="text-slate-700">Workshop Attendances</span>
                      </div>
                      <span className="text-slate-900 font-mono">12 / 12 Hours</span>
                    </div>

                    <div className="flex items-center justify-between text-xs font-semibold">
                      <div className="flex items-center space-x-2">
                        <Award className="w-4 h-4 text-emerald-605 text-emerald-600" />
                        <span className="text-slate-700">Hackathons Entered</span>
                      </div>
                      <span className="text-slate-900 font-mono">2 Competitions</span>
                    </div>

                    <div className="flex items-center justify-between text-xs font-semibold">
                      <div className="flex items-center space-x-2">
                        <Rocket className="w-4 h-4 text-emerald-600" />
                        <span className="text-slate-700">Spotlight Showcases</span>
                      </div>
                      <span className="text-slate-900 font-mono">1 Featured Project</span>
                    </div>
                  </div>
                </div>

                {/* Account details links */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-3.5">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">Account Tools</h4>
                  <ul className="text-xs font-bold text-slate-700 space-y-2.5">
                    <li><a href="#rules" className="hover:text-emerald-700 block select-none">View Club Guidelines Rules</a></li>
                    <li><a href="#contributions" className="hover:text-emerald-700 block select-none">Contributor License (CLA)</a></li>
                    <li>
                      <button 
                        onClick={() => alert('Generating cryptographic backup profile...')} 
                        className="text-left hover:text-emerald-700 block cursor-pointer"
                      >
                        Security Key Credentials
                      </button>
                    </li>
                  </ul>
                </div>

              </div>

              {/* Right Column agenda / personal active schedule */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Agenda events */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h3 className="font-bold font-display text-sm tracking-uppercase text-slate-900">
                      My Personal Agenda Calendar
                    </h3>
                    <span className="text-[10px] font-mono text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                      2 RESERVATIONS SECURED
                    </span>
                  </div>

                  <div className="space-y-4">
                    
                    {/* Item 1 */}
                    <div className="flex items-start gap-4 p-3.5 bg-slate-50 border border-slate-150 rounded-xl">
                      <div className="bg-emerald-500/10 text-emerald-800 font-semibold font-mono text-[11px] p-2 rounded-lg text-center h-12 w-12 flex flex-col justify-center">
                        <span>24</span>
                        <span>SEP</span>
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-slate-900 leading-none">
                          The Future of Generative AI in Web Development
                        </h4>
                        <p className="text-[11px] font-medium text-slate-400">
                          10:00 AM @ Lab 402, CSE Dept. (Featured RSVP Locked)
                        </p>
                      </div>
                    </div>

                    {/* Item 2 */}
                    <div className="flex items-start gap-4 p-3.5 bg-slate-50 border border-slate-150 rounded-xl">
                      <div className="bg-emerald-500/10 text-emerald-800 font-semibold font-mono text-[11px] p-2 rounded-lg text-center h-12 w-12 flex flex-col justify-center">
                        <span>TMR</span>
                        <span>SPR</span>
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-slate-900 leading-none">
                          Bi-Weekly Competitive Programming Sprint
                        </h4>
                        <p className="text-[11px] font-medium text-slate-400">
                          6:00 PM @ CP Lab Annex, Room 101
                        </p>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Submissions checklist */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-3">
                  <h4 className="font-bold font-display text-sm text-slate-900">Active Spotlights</h4>
                  <div className="flex items-center space-x-3 text-xs text-slate-500 p-2 border border-slate-100 rounded-lg bg-emerald-50/20">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                    <span>No submissions pending review. Keep up the high standard of coding showcase!</span>
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
