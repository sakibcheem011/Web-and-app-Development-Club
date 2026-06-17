import React from 'react';
import { Trophy, Camera, Calendar, Sparkles, Filter, Award, Image as ImageIcon } from 'lucide-react';
import { initialAchievements } from '../data';
import { Achievement } from '../types';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, doc, setDoc, onSnapshot } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { useScreenSize } from '../hooks/use-screen-size';
import { GooeyFilter } from './ui/gooey-filter';

export default function AchievementsView() {
  const [activeTab, setActiveTab] = React.useState<'Achievement' | 'Photo Moment'>('Achievement');
  const screenSize = useScreenSize();

  const tabs = [
    { value: 'Achievement' as const, label: 'Achievements' },
    { value: 'Photo Moment' as const, label: 'Photo Moments' },
  ];
  const [items, setItems] = React.useState<Achievement[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [activeIndex, setActiveIndex] = React.useState(0);

  React.useEffect(() => {
    setActiveIndex(0);
  }, [activeTab]);

  // Real-time Firestore synchronization
  React.useEffect(() => {
    const unsub = onSnapshot(collection(db, 'achievements'), (snapshot) => {
      if (snapshot.empty) {
        setItems([]);
      } else {
        const loaded: Achievement[] = [];
        snapshot.forEach((doc) => {
          loaded.push({ id: doc.id, ...doc.data() } as Achievement);
        });
        // Sort by createdAt or date to show latest first
        loaded.sort((a, b) => {
          const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return timeB - timeA;
        });
        setItems(loaded);
      }
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'achievements');
      setLoading(false);
    });

    return () => unsub();
  }, []);

  // Filter items
  const filteredItems = items.filter(item => {
    return item.category === activeTab;
  });

  return (
    <div className="font-sans bg-transparent py-12 sm:py-16 text-slate-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* HEADER AREA */}
        <div className="max-w-3xl space-y-4">
          <p className="text-emerald-600 font-mono text-xs uppercase font-bold tracking-widest flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5" />
            Milestones &amp; Highlights
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-display leading-tight text-slate-900 tracking-tight">
            Achievements &amp; Photo Moments
          </h1>
          <p className="text-sm sm:text-base text-slate-500 font-medium leading-relaxed">
            A chronological gallery of our club's triumphs, prestigious recognitions, and memorable moments captured in our evolutionary journey.
          </p>
        </div>

        {/* TABS SELECTOR with Gooey fluid merges */}
        <div className="flex flex-wrap items-center justify-between gap-6 border-b border-slate-200/60 dark:border-slate-800 pb-6">
          <div className="relative w-full sm:w-[480px] h-11 bg-slate-100 dark:bg-slate-900/60 rounded-xl p-1 border border-slate-200/60 dark:border-slate-800/80 shadow-inner flex items-center">
            
            <GooeyFilter
              id="achievements-gooey-filter"
              strength={screenSize.lessThan("md") ? 5 : 10}
            />

            {/* Gooey filter layer - Background dynamic pills */}
            <div
              className="absolute inset-1 pointer-events-none"
              style={{ filter: "url(#achievements-gooey-filter)" }}
            >
              <div className="flex h-full w-full">
                {tabs.map((tab) => (
                  <div key={tab.value} className="relative flex-1 h-full">
                    {activeTab === tab.value && (
                      <motion.div
                        layoutId="active-achievement-tab"
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

            {/* Foreground interactive text buttons, no gooey blur on text */}
            <div className="relative flex w-full h-full z-10">
              {tabs.map((tab) => {
                const isSelected = activeTab === tab.value;
                return (
                  <button
                    key={tab.value}
                    onClick={() => setActiveTab(tab.value)}
                    className="flex-1 h-full flex items-center justify-center rounded-lg text-xs font-bold uppercase tracking-wider transition-colors duration-300 cursor-pointer"
                  >
                    <span
                      className={`transition-colors duration-300 ${
                        isSelected 
                          ? "text-white" 
                          : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                      }`}
                    >
                      {tab.label}
                    </span>
                  </button>
                );
              })}
            </div>

          </div>

          <div className="text-xs font-mono font-bold text-slate-400 uppercase flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            Showing {filteredItems.length} Gallery entries
          </div>
        </div>


        {/* LOADING STATE */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-mono text-slate-400 font-semibold uppercase">Loading gallery records...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-2xl border border-dashed border-slate-300 p-8">
            <ImageIcon className="w-12 h-12 mx-auto text-slate-300 mb-4 animate-bounce" />
            <h3 className="text-base font-bold text-slate-800 mb-1">No items found</h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">There are no elements cataloged under the "{activeTab}" filter tag yet. Check back soon!</p>
          </div>
        ) : (
          /* PREMIUM ACCORDION GALLERY SELECTOR */
          <div className="flex flex-col md:flex-row w-full h-[720px] md:h-[460px] items-stretch overflow-hidden relative gap-4 select-none">
            {filteredItems.map((item, idx) => {
              const idxAchievement = item.category === 'Achievement';
              const isActive = idx === activeIndex;
              const isMobile = screenSize.lessThan("md");

              return (
                <div 
                  key={item.id}
                  className={`
                    relative flex flex-col justify-end overflow-hidden transition-all duration-700 ease-in-out rounded-2xl border-2 cursor-pointer group
                    ${isActive 
                      ? 'border-emerald-500 shadow-xl shadow-emerald-500/10' 
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }
                  `}
                  id={`achievement-card-${item.id}`}
                  style={{
                    backgroundImage: item.image ? `url('${item.image}')` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundColor: idxAchievement ? '#047857' : '#0891b2',
                    flex: isMobile ? 'none' : (isActive ? '7 1 0%' : '1 1 0%'),
                    height: isMobile ? (isActive ? '340px' : '76px') : '100%',
                    willChange: 'flex, height, border-color, box-shadow'
                  }}
                  onClick={() => setActiveIndex(idx)}
                >
                  {/* Black fluid shadow overlay */}
                  <div 
                    className="absolute inset-0 pointer-events-none transition-all duration-700 ease-in-out bg-gradient-to-t from-black/95 via-black/40 to-transparent"
                    style={{
                      opacity: isActive ? 1 : 0.4
                    }}
                  />

                  {/* Active detailed information */}
                  <div 
                    className="absolute inset-x-0 bottom-0 flex items-center justify-start z-20 pointer-events-none p-5 sm:p-6 gap-4 w-full"
                    style={{
                      opacity: isActive ? 1 : 0,
                      transform: isActive ? 'translateY(0)' : 'translateY(15px)',
                      transition: 'opacity 0.4s ease, transform 0.4s ease'
                    }}
                  >
                    <div className="icon w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-slate-900/90 backdrop-blur-md shadow-lg border border-white/20 flex-shrink-0">
                      {idxAchievement ? (
                        <Trophy className="w-5.5 h-5.5 text-emerald-400" />
                      ) : (
                        <Camera className="w-5.5 h-5.5 text-cyan-400" />
                      )}
                    </div>
                    <div className="info text-white overflow-hidden flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[8px] font-mono font-bold tracking-wider uppercase px-2 py-0.5 rounded-full border ${
                          idxAchievement
                            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                            : 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40'
                        }`}>
                          {item.category}
                        </span>
                        <div className="flex items-center gap-1 text-[9px] font-mono font-bold text-slate-300">
                          <Calendar className="w-3 h-3 text-emerald-400" />
                          <span>{item.date}</span>
                        </div>
                      </div>
                      <h3 className="font-extrabold text-sm sm:text-base md:text-lg tracking-tight leading-snug drop-shadow-md line-clamp-1">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-200 line-clamp-2 mt-0.5 max-w-2xl font-medium drop-shadow-sm leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {/* Inactive quick-peek content */}
                  {!isActive && (
                    <div className="absolute inset-0 flex items-center justify-center bg-transparent z-10">
                      <div className="flex md:flex-col items-center justify-between w-full h-full px-4 md:py-6">
                        <div className="w-9 h-9 flex items-center justify-center rounded-full bg-white/95 dark:bg-slate-900/90 shadow-md border border-slate-200/50 dark:border-slate-800 transition-transform group-hover:scale-110">
                          {idxAchievement ? (
                            <Trophy className="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-400 animate-pulse" />
                          ) : (
                            <Camera className="w-4.5 h-4.5 text-cyan-500 dark:text-cyan-400" />
                          )}
                        </div>
                        {/* Vertical short label for desktop, horizontal for mobile */}
                        <span className="text-[10px] font-bold tracking-wider uppercase text-white drop-shadow-md truncate max-w-[120px] md:[writing-mode:vertical-lr] md:rotate-180 md:mt-2">
                          {item.title}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
