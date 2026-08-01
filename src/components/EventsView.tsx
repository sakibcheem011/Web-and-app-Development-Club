import React from 'react';
import { Calendar, MapPin, Search, ChevronRight, X, Sparkles, CheckCircle2 } from 'lucide-react';
import { clubEvents, images } from '../data';
import { ClubEvent } from '../types';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, doc, setDoc, onSnapshot } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { useScreenSize } from '../hooks/use-screen-size';
import { GooeyFilter } from './ui/gooey-filter';

export default function EventsView() {
  const screenSize = useScreenSize();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [activeTab, setActiveTab] = React.useState<'Upcoming' | 'Past'>('Upcoming');
  const [categoryFilter, setCategoryFilter] = React.useState('All');
  
  // Real-time Firestore synchronization & Auto Seed if empty
  const [events, setEvents] = React.useState<ClubEvent[]>([]);

  React.useEffect(() => {
    const unsub = onSnapshot(collection(db, 'events'), async (snapshot) => {
      if (snapshot.empty) {
        setEvents([]);
      } else {
        const loaded: ClubEvent[] = [];
        snapshot.forEach((doc) => {
          loaded.push({ id: doc.id, ...doc.data() } as ClubEvent);
        });
        setEvents(loaded);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'events');
    });

    return () => unsub();
  }, []);

  // Interactive RSVP modal state
  const [selectedEvent, setSelectedEvent] = React.useState<ClubEvent | null>(null);
  const [rsvpStep, setRsvpStep] = React.useState<'form' | 'success'>('form');
  const [rsvpForm, setRsvpForm] = React.useState({
    fullName: '',
    studentId: '',
    email: '',
  });


  // Filter logic
  const filteredEvents = events.filter(event => {
    // Search query match
    const matchesSearch = 
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      event.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Category match
    const matchesCategory = categoryFilter === 'All' || event.category === categoryFilter;
    
    // Status (Upcoming vs Past) match
    const isPastEvent = (() => {
      const eDate = new Date(event.date);
      if (!isNaN(eDate.getTime())) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        eDate.setHours(0, 0, 0, 0);
        return eDate < today;
      }
      return ['e4', 'e5', 'e6'].includes(event.id);
    })();
    const matchesStatus = activeTab === 'Upcoming' ? !isPastEvent : isPastEvent;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleRsvpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rsvpForm.fullName && rsvpForm.email) {
      const rsvpId = `rsvp-${Date.now()}`;
      try {
        await setDoc(doc(db, 'rsvps', rsvpId), {
          id: rsvpId,
          eventId: selectedEvent?.id || 'general',
          eventTitle: selectedEvent?.title || 'General Event',
          fullName: rsvpForm.fullName,
          studentId: rsvpForm.studentId || 'N/A',
          email: rsvpForm.email,
          createdAt: new Date().toISOString()
        });
        setRsvpStep('success');
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `rsvps/${rsvpId}`);
      }
    }
  };

  const openRsvpModal = (event: ClubEvent) => {
    setSelectedEvent(event);
    setRsvpStep('form');
    setRsvpForm({ fullName: '', studentId: '', email: '' });
  };

  const closeRsvpModal = () => {
    setSelectedEvent(null);
  };

  // Get key featured events to display explicitly
  const featuredEvent = events.find(e => e.isFeatured) || events[0] || null;
  const sidebarEvents = events.filter(e => e.id !== featuredEvent?.id).slice(0, 2);

  return (
    <div className="font-sans bg-transparent py-12 sm:py-16 text-slate-800 dark:text-slate-200 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* HEADER BLOCK */}
        <div className="max-w-3xl space-y-4">
          <p className="text-emerald-600 dark:text-emerald-450 font-mono text-xs uppercase font-bold tracking-widest">
            EVENT HORIZON
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-display leading-tight text-slate-900 dark:text-white tracking-tight">
            Nexus of Innovation
          </h1>
          <p className="text-sm sm:text-base text-slate-500 font-medium leading-relaxed">
            Discover upcoming workshops, hackathons, and seminars designed to push the boundaries of your technical expertise. Connect with peers and industry leaders.
          </p>
        </div>

        {/* SEARCH AND FILTERS BAR */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 p-4 rounded-xl shadow-sm">
          
          {/* Search bar input icon */}
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
            <input 
              type="text" 
              placeholder="Search events..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-medium"
            />
          </div>

          {/* Right toggle elements */}
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
            
            {/* Tab switchers with Gooey fluid merges */}
            <div className="relative w-full sm:w-[260px] h-10 bg-slate-100 dark:bg-slate-900/60 rounded-xl p-1 border border-slate-200/60 dark:border-slate-800/85 shadow-inner flex items-center">
              <GooeyFilter
                id="events-gooey-filter"
                strength={screenSize.lessThan("md") ? 5 : 10}
              />

              {/* Gooey filter layer - Background dynamic pills */}
              <div
                className="absolute inset-1 pointer-events-none"
                style={{ filter: "url(#events-gooey-filter)" }}
              >
                <div className="flex h-full w-full">
                  {[
                    { value: 'Upcoming' as const, label: 'Upcoming' },
                    { value: 'Past' as const, label: 'Past Events' }
                  ].map((tab) => (
                    <div key={tab.value} className="relative flex-1 h-full">
                      {activeTab === tab.value && (
                        <motion.div
                          layoutId="active-event-tab"
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

              {/* Foreground interactive text buttons */}
              <div className="relative flex w-full h-full z-10">
                {[
                  { value: 'Upcoming' as const, label: 'Upcoming' },
                  { value: 'Past' as const, label: 'Past Events' }
                ].map((tab) => {
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
                            ? "text-white animate-fade-in" 
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

            {/* Category Dropdowns */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 dark:border-slate-700/80 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-750 dark:text-slate-300 font-semibold cursor-pointer focus:outline-none focus:border-emerald-500 shadow-sm"
            >
              <option value="All">All Categories</option>
              <option value="Workshop">Workshops</option>
              <option value="Contest">Contests</option>
              <option value="Seminar">Seminars</option>
            </select>

          </div>

        </div>

        {/* CORE EVENTS SPLIT (Only shown when viewing Upcoming tab with no active search overrides) */}
        {activeTab === 'Upcoming' && !searchTerm && categoryFilter === 'All' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT COLUMN: Featured workshop card */}
            {featuredEvent && (
              <div className="lg:col-span-8 bg-white border border-slate-200/85 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between group">
                <div className="relative aspect-[16/10] bg-emerald-950 overflow-hidden">
                  <span className="absolute top-4 left-4 z-10 bg-emerald-500 text-white text-[10px] font-bold font-mono tracking-wider uppercase px-2.5 py-1 rounded-md shadow">
                    {featuredEvent.tag}
                  </span>
                  <img 
                    src={featuredEvent.image} 
                    referrerPolicy="no-referrer"
                    alt={featuredEvent.title}
                    className="w-full h-full object-cover opacity-85 group-hover:scale-[1.02] transition-transform duration-500" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                </div>

                <div className="p-6 sm:p-8 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-4 text-xs font-mono text-slate-450 font-semibold items-center">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{featuredEvent.date} • {featuredEvent.time}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{featuredEvent.location}</span>
                      </span>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-bold font-display text-slate-900 group-hover:text-emerald-700 transition-colors">
                      {featuredEvent.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-normal">
                      {featuredEvent.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex justify-start">
                    <button
                      onClick={() => openRsvpModal(featuredEvent)}
                      className="inline-flex items-center space-x-1.5 text-xs text-white bg-black hover:bg-emerald-800 px-5 py-2.5 rounded-lg font-mono font-bold uppercase tracking-wider hover:shadow transition-all cursor-pointer"
                    >
                      <span>View Details</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* RIGHT COLUMN: Sidebar cards */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              {sidebarEvents.map((event) => {
                const isContest = event.category === 'Contest';
                return (
                  <div 
                    key={event.id}
                    className="bg-white border border-slate-200/85 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:border-slate-350 transition-all"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono tracking-wider font-bold uppercase bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200/40">
                          {event.category}
                        </span>
                        <span className="text-[10px] font-mono font-semibold text-slate-400">
                          {isContest ? 'Tomorrow' : 'Interactive Seminar'}
                        </span>
                      </div>

                      <h4 className="text-base sm:text-lg font-bold font-display text-slate-900">
                        {event.title}
                      </h4>

                      <p className="text-xs text-slate-500 leading-relaxed">
                        {event.description}
                      </p>

                      <div className="flex items-center space-x-1 text-xs font-mono text-slate-450 font-semibold pt-1">
                        <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{event.time}</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 mt-4">
                      <button
                        onClick={() => openRsvpModal(event)}
                        className={`w-full text-center py-2.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all active:scale-95 cursor-pointer ${
                          isContest 
                            ? 'bg-black hover:bg-emerald-950 text-white' 
                            : 'bg-white border border-slate-200 hover:border-slate-300 text-slate-800'
                        }`}
                      >
                        {isContest ? 'Register Now' : 'Join Room'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* SEARCH AND GRID OF ITEMS */}
        <div className="space-y-6">
          {filteredEvents.length > 0 && (
            <div className="border-b border-slate-200 pb-3">
              <h3 className="text-lg font-bold font-display text-slate-900">
                {activeTab === 'Upcoming' && (searchTerm || categoryFilter !== 'All') ? 'Matching Events' : 'All Events & Workshops'}
              </h3>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredEvents.map((event) => {
              const isDefaultThumb = !event.image;
              return (
                <div 
                  key={event.id}
                  className="bg-white border border-slate-200/85 rounded-2xl overflow-hidden hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div className="relative aspect-video bg-emerald-950 overflow-hidden">
                    <span className="absolute top-3 left-3 z-10 bg-slate-100 border border-slate-200/50 text-slate-800 text-[10px] font-bold font-mono uppercase px-2 py-0.5 rounded shadow-sm">
                      {event.category}
                    </span>
                    <img 
                      src={isDefaultThumb ? images.web_dev_featured : event.image} 
                      referrerPolicy="no-referrer"
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-emerald-700 transition-colors">
                        {event.title}
                      </h4>
                      <p className="text-xs text-slate-500 leading-relaxed font-normal line-clamp-3">
                        {event.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-mono font-semibold text-slate-400">
                      <span>{event.date}</span>
                      <button
                        onClick={() => openRsvpModal(event)}
                        className="text-emerald-700 hover:text-emerald-800 flex items-center space-x-0.5 group-hover:translate-x-1 transition-transform cursor-pointer"
                      >
                        <span>Details</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredEvents.length === 0 && (
              <div className="col-span-full bg-white border border-dashed border-slate-200 rounded-2xl p-12 text-center text-slate-450">
                <Calendar className="w-12 h-12 stroke-1 text-slate-300 mx-auto mb-4" />
                <p className="text-sm font-semibold text-slate-500">No events match the active search filters.</p>
                <button 
                  onClick={() => { setSearchTerm(''); setCategoryFilter('All'); }}
                  className="mt-3 text-xs font-bold text-emerald-800 underline uppercase tracking-wider hover:text-emerald-950 cursor-pointer"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* INTERACTIVE RSVP DIALOG MODAL */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          
          {/* Backdrop screen */}
          <div onClick={closeRsvpModal} className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm transition-opacity"></div>
          
          {/* Modal Container */}
          <div className="relative bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-slate-100 z-10 animate-scale-up">
            
            {/* Header Area */}
            <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                  RSVP Registration Portal
                </span>
              </div>
              <button 
                onClick={closeRsvpModal}
                className="p-1 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors focus:outline-none"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              
              {rsvpStep === 'form' ? (
                <form onSubmit={handleRsvpSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-800">
                      {selectedEvent.category}
                    </span>
                    <h3 className="text-base sm:text-lg font-bold font-display text-slate-900 pt-1">
                      {selectedEvent.title}
                    </h3>
                    <p className="text-xs text-slate-450 leading-relaxed font-normal">
                      Verify your university credential profile to lock in your seat reservations dynamically.
                    </p>
                  </div>

                  <div className="space-y-3.5 pt-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 uppercase font-mono pb-1">Full Name</label>
                      <input 
                        type="text" 
                        required
                        placeholder="e.g. Alan Turing"
                        value={rsvpForm.fullName}
                        onChange={(e) => setRsvpForm({...rsvpForm, fullName: e.target.value})}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-emerald-500 text-slate-800 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 uppercase font-mono pb-1">University Email</label>
                      <input 
                        type="email" 
                        required
                        placeholder="turing@gstu.edu.bd"
                        value={rsvpForm.email}
                        onChange={(e) => setRsvpForm({...rsvpForm, email: e.target.value})}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-emerald-500 text-slate-800 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 uppercase font-mono pb-1">Student ID/Roll</label>
                      <input 
                        type="text" 
                        placeholder="e.g., CSE-220101"
                        value={rsvpForm.studentId}
                        onChange={(e) => setRsvpForm({...rsvpForm, studentId: e.target.value})}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-emerald-500 text-slate-800 font-medium"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full text-center bg-black hover:bg-emerald-850 text-white py-2.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider font-display transition-all shadow active:scale-95 pt-3"
                  >
                    Confirm RSVP Reservation
                  </button>
                </form>
              ) : (
                <div className="py-6 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-base sm:text-lg font-bold font-display text-slate-900">
                      RSVP Locked Access Successful!
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto font-normal">
                      Congratulations, <strong className="text-emerald-800">{rsvpForm.fullName}</strong>. A digital ticket and room calendar details has been transmitted to <strong className="text-slate-800">{rsvpForm.email}</strong>.
                    </p>
                  </div>
                  <button
                    onClick={closeRsvpModal}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-mono uppercase tracking-wider px-5 py-2 rounded-lg transition-all"
                  >
                    Close Window
                  </button>
                </div>
              )}

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
