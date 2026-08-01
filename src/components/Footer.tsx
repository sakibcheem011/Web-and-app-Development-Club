import React, { useState, ReactNode } from 'react';
import { 
  Globe, 
  Github, 
  Linkedin, 
  Facebook, 
  ShieldCheck, 
  X, 
  Heart, 
  Code, 
  Sparkles, 
  Award, 
  FileText, 
  Scale, 
  BookOpen,
  Instagram,
  Youtube
} from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';

interface FooterProps {
  chapter: 'GSTU' | 'BSMRSTU';
  onViewChange: (view: string) => void;
}

export default function Footer({ chapter, onViewChange }: FooterProps) {
  const [showCredits, setShowCredits] = useState(false);
  const [activeLegalTab, setActiveLegalTab] = useState<'privacy' | 'terms' | 'guidelines' | null>(null);

  const isGstu = chapter === 'GSTU';

  const footerSections = [
    {
      label: 'Club Resources',
      links: [
        { title: 'History & Vision', onClick: () => onViewChange('about') },
        { title: 'Faculty Advisor', onClick: () => onViewChange('about') },
        { title: 'Club Events', onClick: () => onViewChange('events') },
        { 
          title: 'University Site', 
          href: isGstu ? 'https://gstu.edu.bd/s/' : 'https://bsmrstu.edu.bd', 
          target: '_blank' 
        },
      ],
    },
    {
      label: 'Legal Hub',
      links: [
        { title: 'Privacy Policy', onClick: () => setActiveLegalTab('privacy') },
        { title: 'Terms of Service', onClick: () => setActiveLegalTab('terms') },
        { title: 'Club Guidelines', onClick: () => setActiveLegalTab('guidelines') },
      ],
    },
    {
      label: 'Interactive',
      links: [
        { title: 'Webapp Credits', onClick: () => setShowCredits(true), highlight: true },
        { title: 'Admin Verification', onClick: () => onViewChange('admin') },
      ],
    },
    {
      label: 'Connect With Us',
      links: [
        { title: 'Facebook', href: 'https://facebook.com', icon: Facebook, target: '_blank' },
        { title: 'LinkedIn', href: 'https://linkedin.com', icon: Linkedin, target: '_blank' },
        { title: 'GitHub', href: 'https://github.com', icon: Github, target: '_blank' },
        { title: 'Club Gateway', onClick: () => onViewChange('admin'), icon: Globe },
      ],
    },
  ];

  const shouldReduceMotion = useReducedMotion();

  function AnimatedContainer({ className, delay = 0.1, children }: { className?: string; delay?: number; children: ReactNode; key?: string }) {
    if (shouldReduceMotion) {
      return <div className={className}>{children}</div>;
    }

    return (
      <motion.div
        initial={{ filter: 'blur(4px)', translateY: -8, opacity: 0 }}
        whileInView={{ filter: 'blur(0px)', translateY: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay, duration: 0.8 }}
        className={className}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <footer className="relative w-full border-t border-white/[0.08] bg-zinc-950 bg-[radial-gradient(35%_128px_at_50%_0%,rgba(16,185,129,0.12),transparent)] px-6 py-12 lg:py-16 text-slate-450 font-sans shadow-2xl flex flex-col items-center justify-center">
      <div className="bg-emerald-500/30 absolute top-0 right-1/2 left-1/2 h-[1px] w-1/3 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[2px]" />

      <div className="max-w-7xl mx-auto w-full grid gap-8 xl:grid-cols-3 xl:gap-8">
        
        {/* Left column brand info */}
        <AnimatedContainer className="space-y-4">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-2">
              <div className="relative w-8 h-8 flex items-center justify-center">
                <div className="absolute inset-0 bg-emerald-500/20 rounded-full"></div>
                <div className="relative w-5 h-5 bg-zinc-900 border border-emerald-500/50 rounded-full flex items-center justify-center">
                  <span className="text-[10px] font-mono font-bold text-emerald-400">&lt;/&gt;</span>
                </div>
              </div>
              <span className="text-white font-bold font-display text-base tracking-tight leading-tight">
                {isGstu ? 'GSTU Dev Club' : 'BSMRSTU CSE Club'}
              </span>
            </div>
            

          </div>

          <p className="text-slate-500 text-xs pt-4">
            © {new Date().getFullYear()} {isGstu ? 'GSTU Dev Club' : 'BSMRSTU CSE Club'}. All rights reserved.
          </p>
        </AnimatedContainer>

        {/* Right columns grid */}
        <div className="mt-8 grid grid-cols-2 gap-8 md:grid-cols-4 xl:col-span-2 xl:mt-0">
          {footerSections.map((section, index) => (
            <AnimatedContainer key={section.label} delay={0.1 + index * 0.1}>
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
                  {section.label}
                </h3>
                <ul className="space-y-4 text-xs">
                  {section.links.map((link) => (
                    <li key={link.title}>
                      {link.href ? (
                        <a
                          href={link.href}
                          target={link.target}
                          rel="noopener noreferrer"
                          className="hover:text-emerald-400 text-slate-400 inline-flex items-center transition-all duration-300"
                        >
                          {link.icon && <link.icon className="me-1.5 w-3.5 h-3.5 text-slate-550 hover:text-emerald-400" />}
                          {link.title}
                        </a>
                      ) : (
                        <button
                          onClick={link.onClick}
                          className={`hover:text-emerald-400 text-slate-400 text-left inline-flex items-center transition-all duration-300 cursor-pointer ${
                            link.highlight ? 'text-emerald-400 font-semibold shadow-none' : ''
                          }`}
                        >
                          {link.icon && <link.icon className="me-1.5 w-3.5 h-3.5 text-slate-550 hover:text-emerald-400" />}
                          {link.title}
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </AnimatedContainer>
          ))}
        </div>
      </div>

      {/* Credits Modal */}
      {showCredits && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in" id="webapp-credits-modal">
          <div className="bg-[#10002A] border border-[#5524B7]/70 rounded-2xl max-w-md w-full p-6 relative overflow-hidden shadow-2xl">
            
            {/* Glowing violet background orb inside the modal */}
            <div className="absolute -top-12 -right-12 w-36 h-36 bg-[#5524B7]/30 rounded-full blur-2xl"></div>
            
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 relative z-10">
              <div className="flex items-center space-x-2">
                <Code className="w-5 h-5 text-purple-400" />
                <h3 className="text-white font-bold font-display text-lg tracking-tight">Creators &amp; Credits</h3>
              </div>
              <button 
                onClick={() => setShowCredits(false)}
                className="text-slate-400 hover:text-white transition-colors bg-[#1E093D] border border-white/10 p-1.5 rounded-lg hover:border-purple-500/50 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="py-5 space-y-6 relative z-10 font-sans">
              
              {/* Core Attribution Card */}
              <div className="bg-[#1B053C] border border-[#5524B7]/30 rounded-xl p-4 text-center space-y-2">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 mb-1">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h4 className="text-white font-semibold text-sm">{isGstu ? 'GSTU Web & App Development Club' : 'BSMRSTU CSE Club'}</h4>
                <p className="text-xs text-slate-300 text-center">
                  Dedicated team of innovators, coders, and designers driving software excellence and real-world technology preparedness.
                </p>
              </div>

              {/* Roles and contributors */}
              <div className="space-y-3.5">
                <div className="flex items-center justify-between text-xs py-1 border-b border-white/5">
                  <span className="text-slate-400">Lead Developer &amp; Architect</span>
                  <span className="text-white font-medium flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-amber-400" />
                    Shakib (General Secretary)
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs py-1 border-b border-white/5">
                  <span className="text-slate-400">UI/UX &amp; Design Curation</span>
                  <span className="text-white font-medium">{isGstu ? 'GSTU Design Board' : 'BSMRSTU Design Board'}</span>
                </div>

                <div className="flex items-center justify-between text-xs py-1">
                  <span className="text-slate-400">Technology Stack</span>
                  <span className="text-purple-300 font-mono font-medium">React + Vite + Firebase</span>
                </div>
              </div>

              {/* Footer info or motivational note */}
              <p className="text-[11px] text-purple-200/60 text-center leading-relaxed">
                Crafted with passion to foster peer learning and real-world technology preparedness.
              </p>

            </div>

            {/* Footer Close Button */}
            <div className="pt-4 border-t border-white/10 flex justify-end relative z-10">
              <button
                onClick={() => setShowCredits(false)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold font-sans tracking-wide transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Heart className="w-3.5 h-3.5 fill-white" />
                Close Credits
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Legal Information Modal */}
      {activeLegalTab !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-fade-in" id="legal-documents-modal">
          <div className="bg-[#10002A] border border-[#5524B7]/70 rounded-2xl max-w-lg w-full p-6 relative overflow-hidden shadow-2xl">
            
            {/* Decorative background glow */}
            <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-[#5524B7]/20 rounded-full blur-2xl"></div>
            
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 relative z-10">
              <div className="flex items-center space-x-2">
                <Scale className="w-5 h-5 text-purple-400" />
                <h3 className="text-white font-bold font-display text-lg tracking-tight">Legal Hub &amp; Guidelines</h3>
              </div>
              <button 
                onClick={() => setActiveLegalTab(null)}
                className="text-slate-400 hover:text-white transition-colors bg-[#1E093D] border border-white/10 p-1.5 rounded-lg hover:border-purple-500/50 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Document Interactive Tab Controls */}
            <div className="flex border-b border-white/10 my-4 text-xs font-medium font-sans relative z-10 bg-[#12002E] p-1 rounded-xl">
              <button
                onClick={() => setActiveLegalTab('privacy')}
                className={`flex-1 py-2 rounded-lg transition-all duration-200 cursor-pointer flex items-center justify-center space-x-1.5 ${
                  activeLegalTab === 'privacy' 
                    ? 'bg-purple-600/30 text-purple-300 border border-purple-550/30 font-semibold' 
                    : 'text-slate-400 hover:text-white hover:bg-[#1C003D]/60 border border-transparent'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Privacy</span>
              </button>
              <button
                onClick={() => setActiveLegalTab('terms')}
                className={`flex-1 py-1.5 rounded-lg transition-all duration-200 cursor-pointer flex items-center justify-center space-x-1.5 ${
                  activeLegalTab === 'terms' 
                    ? 'bg-purple-600/30 text-purple-300 border border-purple-550/30 font-semibold' 
                    : 'text-slate-400 hover:text-white hover:bg-[#1C003D]/60 border border-transparent'
                }`}
              >
                <Scale className="w-3.5 h-3.5" />
                <span>Terms</span>
              </button>
              <button
                onClick={() => setActiveLegalTab('guidelines')}
                className={`flex-1 py-1.5 rounded-lg transition-all duration-200 cursor-pointer flex items-center justify-center space-x-1.5 ${
                  activeLegalTab === 'guidelines' 
                    ? 'bg-purple-600/30 text-purple-300 border border-purple-550/30 font-semibold' 
                    : 'text-slate-400 hover:text-white hover:bg-[#1C003D]/60 border border-transparent'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Club Rules</span>
              </button>
            </div>

            {/* Document Dynamic Text Panel */}
            <div className="py-2 overflow-y-auto max-h-[300px] text-xs leading-relaxed text-slate-300 pr-1 relative z-10 custom-scrollbar select-text space-y-4 font-sans animate-fade-in">
              {activeLegalTab === 'privacy' && (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-white font-semibold text-sm">
                    <FileText className="w-4 h-4 text-purple-400" />
                    <span>Member Data Protection &amp; Integrity</span>
                  </div>
                  <p>
                    At our club, we prioritize the protection and security of our student community's digital records.
                  </p>
                  <ul className="list-disc pl-4 space-y-2 text-[11px] text-slate-350">
                    <li>
                      <strong className="text-white">Data Minimization:</strong> We only collect your registration email, name, and avatar directly through authorized OAuth providers or user-generated forms.
                    </li>
                    <li>
                      <strong className="text-white">No Third-party Access:</strong> Your profiles, contribution stats, and peer-learning schedules are stored securely in Google Cloud Platform services.
                    </li>
                    <li>
                      <strong className="text-white">Authentication:</strong> We utilize local sessions and Firebase keys to maintain stable sign-in.
                    </li>
                  </ul>
                  <p className="text-[11px] text-slate-500 italic">
                    Last updated: June 2026. For questions regarding privacy, please contact the General Secretary.
                  </p>
                </div>
              )}

              {activeLegalTab === 'terms' && (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-white font-semibold text-sm">
                    <Scale className="w-4 h-4 text-purple-400" />
                    <span>Terms of Academic &amp; Developer Conduct</span>
                  </div>
                  <p>
                    By logging into our learning resource portals, collaborative repositories, and registering for events, you agree to:
                  </p>
                  <ul className="list-disc pl-4 space-y-2 text-[11px] text-slate-350">
                    <li>
                      <strong className="text-white">Academic Integrity:</strong> Code reviews and challenge submissions must represent authentic work compiled by you or explicitly cite group collaboration.
                    </li>
                    <li>
                      <strong className="text-white">Constructive Reviewing:</strong> Feedback provided on peer code must strictly align with guidelines of kindness, engineering objectiveness, and inclusivity.
                    </li>
                    <li>
                      <strong className="text-white">Resource Responsibility:</strong> Do not exploit, fuzz, or perform security dry-runs on our hosted sandbox nodes, APIs, or database endpoints.
                    </li>
                  </ul>
                </div>
              )}

              {activeLegalTab === 'guidelines' && (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-white font-semibold text-sm">
                    <BookOpen className="w-4 h-4 text-purple-400" />
                    <span>Official Club Guidelines</span>
                  </div>
                  <p>
                    To ensure a robust, high-performance learning ecosystem and secure placement-ready portfolios:
                  </p>
                  <ul className="list-disc pl-4 space-y-2 text-[11px] text-slate-350">
                    <li>
                      <strong className="text-white">Continuous Participation:</strong> Members are encouraged to join weekly dev jams, algorithm hacknights, and contribute to active club directories.
                    </li>
                    <li>
                      <strong className="text-white">Peer Cooperation:</strong> Experienced club members must commit 1 hour/week assisting new learners in masterclasses or code debug sessions.
                    </li>
                  </ul>
                  <p className="text-[11px] text-slate-400">
                    Your contribution directly reflects standard professionalism requested by top product recruiters!
                  </p>
                </div>
              )}
            </div>

            {/* Footer buttons */}
            <div className="pt-4 border-t border-white/10 flex justify-end relative z-10 space-x-2">
              <button
                onClick={() => setActiveLegalTab(null)}
                className="px-4 py-2 bg-gradient-to-r from-red-650/40 to-purple-600/20 border border-white/15 text-slate-100 hover:text-white rounded-lg text-xs font-semibold font-sans transition-all cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}
    </footer>
  );
}
