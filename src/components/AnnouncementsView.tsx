import React from 'react';
import { Megaphone, AlertCircle, Calendar, ChevronDown, ChevronUp, RefreshCw, Sparkles, CheckCircle2 } from 'lucide-react';
import { announcements } from '../data';
import { Announcement } from '../types';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, doc, setDoc, onSnapshot } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { useScreenSize } from '../hooks/use-screen-size';
import { GooeyFilter } from './ui/gooey-filter';

export default function AnnouncementsView() {
  const screenSize = useScreenSize();
  const [activeTab, setActiveTab] = React.useState<'All' | 'General' | 'Events' | 'Recruitment'>('All');
  const [expandedNoticeId, setExpandedNoticeId] = React.useState<string | null>('a1'); // Expands the urgent one by default
  const [loadingOlder, setLoadingOlder] = React.useState(false);
  const [hasLoadedOlder, setHasLoadedOlder] = React.useState(false);
  
  const [allNotices, setAllNotices] = React.useState<Announcement[]>([]);

  // Real-time Firestore synchronization & Auto Seed if empty
  React.useEffect(() => {
    const unsub = onSnapshot(collection(db, 'announcements'), async (snapshot) => {
      if (snapshot.empty) {
        // Automatically seed table
        try {
          for (const n of announcements) {
            await setDoc(doc(db, 'announcements', n.id), n);
          }
        } catch (err) {
          console.error("Auto seeding announcements failed: ", err);
        }
      } else {
        const loaded: Announcement[] = [];
        snapshot.forEach((doc) => {
          loaded.push({ id: doc.id, ...doc.data() } as Announcement);
        });
        setAllNotices(loaded);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'announcements');
    });

    return () => unsub();
  }, []);

  // Filter notices
  const filteredNotices = allNotices.filter(not => {
    if (activeTab === 'All') return true;
    return not.category === activeTab;
  });

  const toggleExpand = (id: string) => {
    if (expandedNoticeId === id) {
      setExpandedNoticeId(null);
    } else {
      setExpandedNoticeId(id);
    }
  };

  const handleLoadOlder = async () => {
    setLoadingOlder(true);
    const olderNotices: Announcement[] = [
      {
        id: `notice-older-1`,
        category: 'General',
        tag: 'Library Schedule',
        title: 'CSE Seminar Library Extended Access Hours',
        description: 'In preparation for semester final assessments, the Department of CSE seminar library will remain open until 8:00 PM on weekdays, beginning next Monday. Proper ID card verification is mandatory for library log ledger entry.',
        date: 'Oct 10, 2024',
        actionLabel: 'Check Slot Availability'
      },
      {
        id: `notice-older-2`,
        category: 'Recruitment',
        tag: 'Sub-Comittee',
        title: 'Class Representative (CR) Council Nominations',
        description: 'The club is welcoming submissions for the CR Council, representing student requirements from freshman through junior cohorts. Contact the general secretary for direct guidelines.',
        date: 'Oct 05, 2024',
        actionLabel: 'Register Nomination'
      }
    ];

    try {
      for (const n of olderNotices) {
        await setDoc(doc(db, 'announcements', n.id), n);
      }
      setHasLoadedOlder(true);
    } catch (err) {
      console.error("Failed to write older notices to Firestore: ", err);
    } finally {
      setLoadingOlder(false);
    }
  };

  return (
    <div className="font-sans bg-transparent py-12 sm:py-16 text-slate-800 dark:text-slate-200 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* HEADER AREA */}
        <div className="max-w-3xl space-y-4">
          <p className="text-emerald-600 dark:text-emerald-450 font-mono text-xs uppercase font-bold tracking-widest">
            NOTICES &amp; ALERTS
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-display leading-tight text-slate-900 dark:text-white tracking-tight">
            Club Announcements
          </h1>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
            Stay updated with the latest news, upcoming opportunities, and critical notices from the Department of Computer Science and Engineering.
          </p>
        </div>

        {/* TABS SELECTOR with Gooey fluid merges */}
        <div className="relative w-full sm:w-[540px] h-11 bg-slate-101 bg-slate-100 dark:bg-slate-900/60 rounded-xl p-1 border border-slate-200/65 dark:border-slate-800/80 shadow-inner flex items-center select-none">
          <GooeyFilter
            id="announcements-gooey-filter"
            strength={screenSize.lessThan("md") ? 5 : 10}
          />

          {/* Background gooey slider dynamic pills */}
          <div
            className="absolute inset-1 pointer-events-none"
            style={{ filter: "url(#announcements-gooey-filter)" }}
          >
            <div className="flex h-full w-full">
              {(['All', 'General', 'Events', 'Recruitment'] as const).map((tab) => (
                <div key={tab} className="relative flex-1 h-full">
                  {activeTab === tab && (
                    <motion.div
                      layoutId="active-announcements-tab"
                      className="absolute inset-0 bg-emerald-500 dark:bg-emerald-600 rounded-lg"
                      transition={{
                        type: "spring",
                        bounce: 0.05,
                        duration: 0.4,
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Foreground interactable text labels */}
          <div className="relative flex w-full h-full z-10">
            {(['All', 'General', 'Events', 'Recruitment'] as const).map((tab) => {
              const isSelected = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="flex-1 h-full flex items-center justify-center rounded-lg text-xs font-bold uppercase tracking-wider transition-colors duration-300 cursor-pointer"
                >
                  <span
                    className={`transition-colors duration-300 ${
                      isSelected 
                        ? "text-white" 
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                    }`}
                  >
                    {tab === 'All' ? 'All Notices' : tab}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* NOTICES LIST CONTAINER */}
        <div className="space-y-6">
          
          {filteredNotices.map((notice) => {
            const isUrgent = notice.isUrgent;
            const isExpanded = expandedNoticeId === notice.id;
            
            return (
              <div 
                key={notice.id}
                className={`border rounded-2xl overflow-hidden transition-all duration-300 shadow-sm ${
                  isUrgent 
                    ? 'border-rose-200 dark:border-rose-900/50 bg-rose-50/20 dark:bg-rose-950/10 shadow-rose-200/10' 
                    : isExpanded 
                    ? 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900' 
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-250 dark:hover:border-slate-700'
                }`}
              >
                {/* Notice Row Summary */}
                <div 
                  onClick={() => toggleExpand(notice.id)}
                  className="p-5 sm:p-6 flex items-start justify-between gap-6 cursor-pointer select-none"
                >
                  <div className="space-y-2 flex-1">
                    
                    {/* Banner list rows labels */}
                    <div className="flex items-center space-x-3 flex-wrap gap-y-2">
                      {isUrgent ? (
                        <span className="bg-rose-105 bg-rose-100 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-900/40 text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md flex items-center space-x-1">
                          <AlertCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                          <span>! Urgent</span>
                        </span>
                      ) : (
                        <span className="bg-slate-101 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-slate-705 dark:border-slate-700/55 text-[10px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md">
                          {notice.category}
                        </span>
                      )}
                      
                      <div className="flex items-center space-x-1 text-xs text-slate-400 dark:text-slate-550 dark:text-slate-500 font-mono font-medium">
                        <Calendar className="w-3.5 h-3.5 text-slate-450 dark:text-slate-500" />
                        <span>Posted {notice.date}</span>
                      </div>
                    </div>

                    {/* Header line */}
                    <h3 className={`text-base sm:text-lg font-bold font-display tracking-tight leading-snug transition-colors ${
                      isUrgent ? 'text-slate-950 dark:text-rose-200 group-hover:text-rose-950 dark:group-hover:text-rose-100' : 'text-slate-900 dark:text-white'
                    }`}>
                      {notice.title}
                    </h3>

                  </div>

                  {/* Right hand Chevron action buttons */}
                  <div className="flex items-center space-x-2 pt-1 flex-shrink-0">
                    <button
                      className={`text-xs font-semibold font-mono uppercase tracking-widest hidden sm:inline-block border-b pb-0.5 transition-colors ${
                        isUrgent
                          ? 'text-rose-800 dark:text-rose-400 border-rose-800 dark:border-rose-400 hover:text-rose-950 dark:hover:text-rose-200 hover:border-rose-950 dark:hover:border-rose-200' 
                          : 'text-slate-500 dark:text-slate-400 border-transparent hover:text-emerald-700 dark:hover:text-emerald-400'
                      }`}
                    >
                      {notice.actionLabel || 'Details'}
                    </button>
                    <div className={`p-1.5 rounded-full border bg-slate-50 dark:bg-slate-800 text-slate-450 dark:text-slate-400 ${
                      isUrgent ? 'border-rose-100 dark:border-rose-900 text-rose-600 dark:text-rose-400' : 'border-slate-100 dark:border-slate-700'
                    }`}>
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>

                </div>

                {/* Expanded content details with smooth heights */}
                {isExpanded && (
                  <div className="px-5 sm:px-6 pb-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 animate-slide-down">
                    <div className="pt-5 space-y-4 max-w-4xl">
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                        {notice.description}
                      </p>

                      {/* Interactive mock buttons */}
                      <div className="pt-2 flex items-center space-x-3">
                        <button 
                          onClick={() => alert(`Redirecting to portal for: ${notice.title}`)}
                          className={`px-4 py-2 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all active:scale-95 shadow-sm cursor-pointer ${
                            isUrgent 
                              ? 'bg-rose-650 hover:bg-rose-700 dark:bg-rose-700 dark:hover:bg-rose-800 text-white' 
                              : 'bg-black hover:bg-emerald-950 dark:bg-emerald-600 dark:hover:bg-emerald-705 text-white'
                          }`}
                        >
                          {notice.actionLabel || 'Interact Action'}
                        </button>
                        <span className="text-[10px] font-mono text-slate-450 dark:text-slate-550 dark:text-slate-500">
                          Ref: CSE-NOTICE-{notice.id.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            );
          })}

          {/* Empty Notices handler */}
          {filteredNotices.length === 0 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center text-slate-450 dark:text-slate-500">
              <Megaphone className="w-12 h-12 stroke-1 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">No active notices published under this category filter.</p>
              <button 
                onClick={() => setActiveTab('All')}
                className="mt-3 text-xs font-bold text-emerald-800 dark:text-emerald-400 underline uppercase tracking-wider hover:text-emerald-950 dark:hover:text-emerald-300 cursor-pointer"
              >
                All categories
              </button>
            </div>
          )}

          {/* LOAD OLDER BUTTON */}
          {filteredNotices.length > 0 && !hasLoadedOlder && (
            <div className="pt-4 flex justify-center">
              <button
                disabled={loadingOlder}
                onClick={handleLoadOlder}
                className="inline-flex items-center space-x-2 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-205 dark:border-slate-700 text-slate-750 dark:text-slate-200 font-mono font-bold text-xs uppercase px-5 py-3 rounded-xl hover:shadow shadow-sm active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                {loadingOlder ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-emerald-700 dark:text-emerald-400" />
                    <span>Querying Archives...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                    <span>Load Older Notices</span>
                  </>
                )}
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
