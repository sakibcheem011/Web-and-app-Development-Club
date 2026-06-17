import { ArrowRight, Terminal, Eye, Sparkles, ExternalLink, Smartphone } from 'lucide-react';
import { images } from '../data';
import { AuroraBackground } from './ui/aurora-background';
import { TextEffect } from './ui/text-effect';
import { GradientText } from './ui/gradient-text';
import { VerticalTabs } from './ui/vertical-tabs';
import DisplayCards from './ui/display-cards';

interface HomeViewProps {
  onViewChange: (view: string) => void;
  chapter: 'GSTU' | 'BSMRSTU';
}

export default function HomeView({ onViewChange, chapter }: HomeViewProps) {
  // Select data according to the active chapter modes
  const isGstu = chapter === 'GSTU';
  const membersCount = isGstu ? '100+' : '500+';
  const eventsCount = isGstu ? '8+' : '20+';
  const projectsCount = '50+';

  return (
    <div className="font-sans bg-transparent min-h-screen text-slate-800 dark:text-slate-200 transition-colors duration-300">
      
      {/* 1. HERO SECTION */}
      <section className="relative py-12 sm:py-20 lg:py-24 overflow-hidden border-b border-slate-100 dark:border-slate-900 bg-transparent transition-all">
        
        {/* Subtle grid bg effect with dynamic colorful gradient */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <AuroraBackground className="absolute inset-0 w-full h-full bg-transparent dark:bg-transparent" showRadialGradient={true} />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Side Content Column */}
            <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-center lg:text-left flex flex-col items-center lg:items-start justify-center">
              
              {/* Badge */}
              <div className="inline-flex items-center space-x-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/40 rounded-full px-3.5 py-1.5 text-xs font-mono font-medium tracking-wide mx-auto lg:mx-0 animate-fade-in shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 animate-pulse" />
                <span className="uppercase font-semibold tracking-wider">beyond bits and bytes</span>
              </div>
              
              {/* Title */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-display leading-[1.12] tracking-tight text-center lg:text-left">
                <TextEffect per="word" as="span" preset="blur" className="text-slate-950 dark:text-white inline-block">
                  Welcome to
                </TextEffect>{" "}
                <br className="hidden sm:block" />
                <TextEffect per="word" as="span" preset="blur" delay={0.15} className="text-slate-900 dark:text-slate-100 inline-block">
                  {isGstu ? 'Web and App' : 'Computer Science &'}
                </TextEffect>{" "}
                <br className="hidden sm:block" />
                <TextEffect per="word" as="span" preset="blur" delay={0.3} className="text-slate-900 dark:text-slate-100 inline-block">
                  {isGstu ? 'Development Club' : 'Engineering Club, '}
                </TextEffect>{" "}
                <TextEffect per="word" as="span" preset="blur" delay={0.45} className="text-emerald-600 dark:text-emerald-400 block sm:inline-block">
                  {isGstu ? 'GSTU' : 'BSMRSTU'}
                </TextEffect>
              </h1>
              
              {/* Subtitle */}
              <TextEffect
                per="word"
                preset="fade"
                delay={0.15}
                className="text-sm sm:text-base text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-medium block text-center lg:text-left"
              >
                A hub for innovators, problem-solvers, and tech enthusiasts. We bridge the gap between academic theory and industry reality through peer-to-peer mentorship, hands-on workshops, and collaborative project building.
              </TextEffect>
              
              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2 w-full lg:w-auto">
                <button
                  onClick={() => onViewChange('join')}
                  className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-black dark:bg-emerald-600 hover:bg-emerald-950 dark:hover:bg-emerald-700 text-white font-display text-sm font-semibold px-6 py-3.5 rounded-lg hover:shadow-md active:scale-95 transition-all text-center cursor-pointer"
                >
                  <span>Join the Community</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onViewChange('projects')}
                  className="w-full sm:w-auto bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-display text-sm font-semibold px-6 py-3.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-slate-300 active:scale-95 transition-all text-center cursor-pointer"
                >
                  View Our Projects
                </button>
              </div>

            </div>

            {/* Right Side Visual Device Mockup Frame containing custom DisplayCards */}
            <div className="lg:col-span-5 relative flex flex-col items-center justify-center py-6 sm:py-8">
              <div className="relative w-full max-w-[420px] aspect-[4/5] bg-transparent flex items-center justify-center">
                
                {/* Simulated hardware line grid graphics in background */}
                <div className="absolute inset-0 bg-[radial-gradient(#10b981_0.8px,transparent_0.8px)] [bg-size:16px_16px] opacity-10 pointer-events-none rounded-2xl"></div>
                
                {/* Display Cards Stack */}
                <div className="relative z-10 w-full flex items-center justify-center">
                  <DisplayCards 
                    cards={[
                      {
                        icon: <Terminal className="size-4 text-emerald-500" />,
                        title: isGstu ? "GSTU Workspace" : "BSMRSTU Workspace",
                        description: isGstu ? "Web & App Dev Club active" : "Computer Science & Engineering Club",
                        date: "sys_core.sh active",
                        iconClassName: "text-emerald-600 dark:text-emerald-400",
                        titleClassName: "text-emerald-600 dark:text-emerald-400",
                        className: "[grid-area:stack] hover:-translate-y-6 sm:hover:-translate-y-12 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-slate-205 dark:before:outline-slate-800 before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-white/50 dark:before:bg-slate-905/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0 transition-transform duration-500",
                      },
                      {
                        icon: <Sparkles className="size-4 text-purple-500" />,
                        title: "Creative Workshops",
                        description: "Deep dive into web & software design",
                        date: "Every Saturday",
                        iconClassName: "text-purple-600 dark:text-purple-400",
                        titleClassName: "text-purple-600 dark:text-purple-400",
                        className: "[grid-area:stack] translate-x-4 translate-y-6 sm:translate-x-12 sm:translate-y-10 hover:-translate-y-2 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-slate-205 dark:before:outline-slate-800 before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-white/50 dark:before:bg-slate-950/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0 transition-transform duration-500",
                      },
                      {
                        icon: <Eye className="size-4 text-cyan-500" />,
                        title: "Interactive Projects",
                        description: "Building production-grade systems together",
                        date: "Updated just now",
                        iconClassName: "text-cyan-600 dark:text-cyan-400",
                        titleClassName: "text-cyan-600 dark:text-cyan-400",
                        className: "[grid-area:stack] translate-x-8 translate-y-12 sm:translate-x-24 sm:translate-y-20 hover:translate-y-12 transition-transform duration-500",
                      },
                    ]}
                  />
                </div>
                
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. THREE CORE COUNTERS BANNER */}
      <section className="bg-transparent border-b border-slate-100 dark:border-slate-900 py-10 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-slate-800">
            
            <div className="py-2 sm:py-0">
              <p className="text-3xl sm:text-4xl font-extrabold font-display text-slate-900 dark:text-white tracking-tight">{membersCount}</p>
              <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-400 mt-1">Active Members</p>
            </div>
            
            <div className="py-2 sm:py-0">
              <p className="text-3xl sm:text-4xl font-extrabold font-display text-slate-900 dark:text-white tracking-tight">{eventsCount}</p>
              <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-400 mt-1">Annual Events</p>
            </div>
            
            <div className="py-2 sm:py-0">
              <p className="text-3xl sm:text-4xl font-extrabold font-display text-slate-900 dark:text-white tracking-tight">{projectsCount}</p>
              <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-400 mt-1">Student Projects</p>
            </div>
            
          </div>
        </div>
      </section>

      {/* CLUB FEATURES VERTICAL TABS SHOWCASE */}
      <section className="bg-slate-50/50 dark:bg-slate-900/10 border-b border-slate-100 dark:border-slate-900 overflow-hidden">
        <VerticalTabs />
      </section>

      {/* 3. LATEST NOTICE CARD BANNER */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold font-display tracking-tight text-slate-900 dark:text-white">Latest Notice</h2>
            <button
              onClick={() => onViewChange('announcements')}
              className="text-emerald-700 dark:text-emerald-400 hover:text-emerald-850 text-sm font-semibold flex items-center space-x-1 hover:underline cursor-pointer"
            >
              <span>All Announcements</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Structured Notice Layout Panel */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/85 dark:border-slate-805 rounded-2xl p-6 sm:p-8 hover:shadow-md dark:shadow-slate-950/30 transition-shadow">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Notice visual preview image */}
              <div className="lg:col-span-4 rounded-xl overflow-hidden aspect-video lg:aspect-square relative group bg-emerald-950">
                <img 
                  src={images.event_genai} 
                  referrerPolicy="no-referrer"
                  alt="Hackathon Event Banner"
                  className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-emerald-950/20 to-transparent"></div>
              </div>

              {/* Notice core text details */}
              <div className="lg:col-span-8 space-y-4">
                
                {/* Metadata label row */}
                <div className="flex items-center space-x-2">
                  <span className="bg-rose-100 dark:bg-rose-950/50 text-rose-800 dark:text-rose-350 border border-rose-200 dark:border-rose-900/60 text-[10px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded-md">
                    URGENT
                  </span>
                  <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">Oct 24, 2024</span>
                </div>

                {/* Notice Heading */}
                <h3 className="text-xl sm:text-2xl font-bold font-display text-slate-900 dark:text-white tracking-tight leading-tight">
                  Registration Open for TechStorm 2024
                </h3>

                {/* Subtext explanation details */}
                <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm leading-relaxed font-normal">
                  The annual flagship hackathon of GSTU is back. Form your teams and register before the deadline to compete for prizes worth $2000 and internship opportunities. Explore cross-disciplinary problem statements spanning edge AI, smart contract ledger protocols, and sustainable hardware interfaces.
                </p>

                {/* External-style details anchor link */}
                <div className="pt-2">
                  <button
                    onClick={() => onViewChange('announcements')}
                    className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-900 dark:text-slate-200 hover:text-emerald-700 dark:hover:text-emerald-450 uppercase tracking-widest font-mono border-b-2 border-slate-900 dark:border-slate-200 hover:border-emerald-700 pb-0.5 cursor-pointer"
                  >
                    <span>Read Full Details</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>

              </div>

            </div>
          </div>

        </div>
      </section>

      {/* 4. MISSION AND VISION GRID (BENTO SYSTEM) */}
      <section className="py-12 sm:py-16 bg-transparent border-y border-slate-100 dark:border-slate-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column Description */}
            <div className="lg:col-span-6 space-y-8">
              
              <div className="space-y-3">
                <h2 className="text-3xl font-bold font-display tracking-tight text-slate-900 dark:text-white">
                  Engineering Excellence for Tomorrow
                </h2>
                <div className="h-1.5 w-16 bg-emerald-500 rounded-full"></div>
              </div>

              {/* Modular Mission Row Block */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <Terminal className="w-5 h-5" />
                </div>
                <div className="space-y-1.5">
                  <h4 className="text-base font-bold font-display text-slate-900 dark:text-white">Our Mission</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                    To foster a dynamic learning environment where students can master competitive programming, software engineering, and emerging technologies through peer-to-peer mentorship and hands-on projects, preparing them for top-tier worldwide tech careers.
                  </p>
                </div>
              </div>

              {/* Vision Row Block */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <Eye className="w-5 h-5" />
                </div>
                <div className="space-y-1.5">
                  <h4 className="text-base font-bold font-display text-slate-900 dark:text-white">Our Vision</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                    To become a leading student-led tech community in the nation, producing world-class developers and researchers who drive innovation in the global technology landscape and solve real campus environmental problems.
                  </p>
                </div>
              </div>

            </div>

            {/* Right Column Grid Staggered Image Frame */}
            <div className="lg:col-span-6 grid grid-cols-12 gap-4">
              <div className="col-span-7 rounded-2xl overflow-hidden aspect-square border border-slate-200 dark:border-slate-800 shadow-md">
                <img 
                  src={images.team_coding_1} 
                  referrerPolicy="no-referrer"
                  alt="Students Collaborating"
                  className="w-full h-full object-cover" 
                />
              </div>
              <div className="col-span-5 rounded-2xl overflow-hidden aspect-square relative self-end border border-slate-200 dark:border-slate-800 shadow-sm">
                <img 
                  src={images.coding_laptop_light} 
                  referrerPolicy="no-referrer"
                  alt="Writing React Code"
                  className="w-full h-full object-cover" 
                />
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 5. DOWNLOAD APP CTA BANNER */}
      <section className="py-12 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden border border-slate-200 bg-gradient-to-r from-emerald-500/10 via-emerald-50/40 to-cyan-500/5 p-8 sm:p-12 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
            {/* Ambient subtle blur dots */}
            <div className="absolute top-1/2 left-0 -translate-y-1/2 w-64 h-64 bg-emerald-500/5 rounded-full filter blur-3xl pointer-events-none"></div>
            <div className="absolute top-1/2 right-0 -translate-y-1/2 w-64 h-64 bg-cyan-500/5 rounded-full filter blur-3xl pointer-events-none"></div>

            <div className="relative z-10 max-w-xl space-y-4 text-center md:text-left">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold font-mono tracking-wider rounded-full uppercase">
                Progressive Web App (PWA)
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-slate-900">
                GSTU Dev Club on Your Home Screen
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-normal">
                Enjoy ultra-fast startup times, direct app store-free installability, and instant updates. Pin the official Web & App Development portal directly onto your device's dock.
              </p>
            </div>

            <div className="relative z-10 flex flex-col sm:flex-row items-center gap-4 shrink-0">
              {/* Custom Mockup Icon */}
              <div className="flex -space-x-3 items-center mr-2">
                <div className="w-12 h-12 rounded-2xl border-2 border-white bg-slate-900 shadow-md overflow-hidden transform -rotate-12 transition-transform hover:rotate-0 duration-300">
                  <img src="/icon-512.jpg" alt="App Icon" className="w-full h-full object-cover" />
                </div>
              </div>
              <button
                onClick={() => onViewChange('download-app')}
                className="bg-black hover:bg-slate-850 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-semibold text-xs py-3 px-6 rounded-xl shadow-md font-mono uppercase tracking-wider transition-all active:scale-[0.98] cursor-pointer inline-flex items-center gap-2"
              >
                <Smartphone className="w-4 h-4 text-emerald-400 animate-pulse" />
                Install Web App
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
