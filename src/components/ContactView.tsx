import React from 'react';
import { Send, Mail, MapPin, Linkedin, Github, Facebook, CheckCircle2, Sparkles, Loader2 } from 'lucide-react';
import { AdvancedMap } from './ui/interactive-map';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

interface ContactViewProps {
  chapter: 'GSTU' | 'BSMRSTU';
}

export default function ContactView({ chapter }: ContactViewProps) {
  const isGstu = chapter === 'GSTU';
  const emailAddr = isGstu ? 'cseclub@gstu.edu.bd' : 'cseclub@bsmrstu.edu.bd';
  const locationText = isGstu ? 'CSE Department, GSTU, Gopalganj' : 'CSE Department, BSMRSTU, Gopalganj';

  const mapCenter: [number, number] = [23.0195, 89.7944];
  const mapMarkers = [
    {
      id: 'gstu-cse-dept',
      position: [23.0195, 89.7944] as [number, number],
      color: 'emerald',
      size: 'large' as const,
      popup: {
        title: isGstu ? 'GSTU CSE Department' : 'BSMRSTU CSE Department',
        content: `Central Lab Hub, ${isGstu ? 'GSTU' : 'BSMRSTU'}. Join us in Lab 402 for workshops!`,
        image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=600&auto=format&fit=crop&q=60'
      }
    }
  ];

  const mapCircles = [
    {
      id: 'gstu-campus-circle',
      center: [23.0195, 89.7944] as [number, number],
      radius: 200,
      style: { color: '#10b981', fillOpacity: 0.1, weight: 1.5 },
      popup: 'University Activity Sector'
    }
  ];
  
  const [formState, setFormState] = React.useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [messageSent, setMessageSent] = React.useState(false);
  const [sending, setSending] = React.useState(false);
  const [errorStatus, setErrorStatus] = React.useState<string | null>(null);
  const [newsletterEmail, setNewsletterEmail] = React.useState('');
  const [newsletterSubbed, setNewsletterSubbed] = React.useState(false);

  const handleMessageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorStatus(null);
    if (formState.name && formState.email && formState.message) {
      setSending(true);
      const uuid = `inq-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      try {
        await setDoc(doc(db, 'inquiries', uuid), {
          id: uuid,
          name: formState.name,
          email: formState.email,
          subject: formState.subject || 'General Inquiry',
          message: formState.message,
          chapter: chapter,
          createdAt: new Date().toISOString(),
          isRead: false
        });
        setMessageSent(true);
        setFormState({ name: '', email: '', subject: '', message: '' });
        setTimeout(() => setMessageSent(false), 5000);
      } catch (err: any) {
        console.error("Failed to save user message query:", err);
        setErrorStatus(err?.message || "Failed to submit message. Please try again.");
        handleFirestoreError(err, OperationType.CREATE, `inquiries/${uuid}`);
      } finally {
        setSending(false);
      }
    }
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) {
      setNewsletterSubbed(true);
      setNewsletterEmail('');
      setTimeout(() => setNewsletterSubbed(false), 5000);
    }
  };

  return (
    <div className="font-sans bg-transparent py-12 sm:py-16 text-slate-800 dark:text-slate-200 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* HEADER AREA */}
        <div className="max-w-3xl space-y-4">
          <p className="text-emerald-600 dark:text-emerald-400 font-mono text-xs uppercase font-bold tracking-widest">
            CONTACT CENTER
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-display leading-tight text-slate-900 dark:text-white tracking-tight">
            Let's Connect
          </h1>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
            Have a question about our events or want to collaborate on a tech project? Reach out to the {isGstu ? 'GSTU Dev Club' : 'BSMRSTU CSE Club'} community. We're always open to new ideas and connections.
          </p>
        </div>

        {/* CORE DUAL LAYOUT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: Sending a Message Form */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200/85 dark:border-slate-850 rounded-2xl p-6 sm:p-8 hover:shadow-md transition-shadow">
            
            {messageSent ? (
              <div className="py-12 text-center space-y-4 animate-fade-in">
                <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/30 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white">Message Dispatched!</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                    Thank you for reaching out. A club executive will analyze the inquiry details and get in touch shortly.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleMessageSubmit} className="space-y-5">
                <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <span className="w-3 h-3 rounded-full bg-emerald-505 bg-emerald-500"></span>
                  <h3 className="font-bold font-display text-base text-slate-950 dark:text-white">Send a Message</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-655 text-slate-600 dark:text-slate-400 uppercase font-mono pb-1">Your Name</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. John Doe"
                      value={formState.name}
                      onChange={(e) => setFormState({...formState, name: e.target.value})}
                      className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 focus:outline-none focus:border-emerald-500 font-medium text-slate-805 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-655 text-slate-600 dark:text-slate-400 uppercase font-mono pb-1">Your Email</label>
                    <input 
                      type="email" 
                      required
                      placeholder="e.g. john@example.com"
                      value={formState.email}
                      onChange={(e) => setFormState({...formState, email: e.target.value})}
                      className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 focus:outline-none focus:border-emerald-500 font-medium text-slate-805 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-655 text-slate-600 dark:text-slate-400 uppercase font-mono pb-1">Subject</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Inquiry about Club Membership"
                    value={formState.subject}
                    onChange={(e) => setFormState({...formState, subject: e.target.value})}
                    className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 focus:outline-none focus:border-emerald-505 focus:border-emerald-500 font-medium text-slate-805 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-655 text-slate-600 dark:text-slate-400 uppercase font-mono pb-1">Message Description</label>
                  <textarea 
                    required
                    placeholder="Tell us more about your request or collaboration proposal..."
                    rows={4}
                    value={formState.message}
                    onChange={(e) => setFormState({...formState, message: e.target.value})}
                    className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 focus:outline-none focus:border-emerald-505 focus:border-emerald-500 font-medium text-slate-805 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                  ></textarea>
                </div>

                {errorStatus && (
                  <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-red-650 dark:text-red-400 rounded-lg text-xs font-mono font-semibold">
                    Error: {errorStatus}
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-black dark:bg-emerald-600 hover:bg-emerald-955 dark:hover:bg-emerald-700 text-white font-mono font-bold text-xs uppercase px-6 py-3.5 rounded-lg hover:shadow transition-all active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sending ? (
                      <>
                        <span>Sending...</span>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      </>
                    ) : (
                      <>
                        <span>Send Message</span>
                        <Send className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

          </div>

          {/* RIGHT: Contact Credentials & Campus Map Mockup */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Contact Info Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/85 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
              <h4 className="font-bold font-display text-sm tracking-uppercase border-b border-slate-100 dark:border-slate-800 pb-2 text-slate-900 dark:text-white">
                Contact Information
              </h4>

              <div className="space-y-4 text-xs font-semibold text-slate-750 dark:text-slate-300">
                <div className="flex items-center space-x-3.5">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Official Email</span>
                    <a href={`mailto:${emailAddr}`} className="hover:text-emerald-700 dark:hover:text-emerald-400 font-mono text-xs text-slate-700 dark:text-slate-300">{emailAddr}</a>
                  </div>
                </div>

                <div className="flex items-center space-x-3.5">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Location Hub</span>
                    <span className="text-slate-808 text-slate-800 dark:text-slate-350 dark:text-slate-300">{locationText}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Real Interactive Leaflet Map Block */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/85 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm aspect-[4/3] relative group flex flex-col justify-between z-0">
              
              {/* Map header overlay */}
              <div className="absolute top-3 right-3 z-[1000] bg-slate-950/80 backdrop-blur-sm px-3 py-1 rounded-lg border border-white/10 flex items-center space-x-1.5 text-white shadow-md">
                <Sparkles className="w-3 h-3 text-emerald-400 animate-pulse" />
                <span className="text-[9px] font-mono font-semibold tracking-wider uppercase">{isGstu ? 'GSTU Activity Map' : 'BSMRSTU Activity Map'}</span>
              </div>

              {/* Interactive map container */}
              <div className="absolute inset-0 w-full h-full">
                <AdvancedMap
                  center={mapCenter}
                  zoom={15}
                  markers={mapMarkers}
                  circles={mapCircles}
                  enableClustering={true}
                  enableSearch={true}
                  enableControls={true}
                />
              </div>

            </div>

          </div>

        </div>

        {/* NEWSLETTER SUBSCRIBE FOOTER BANNER */}
        <div className="bg-black text-white rounded-2xl p-6 sm:p-10 relative overflow-hidden shadow-lg border border-slate-900">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/40 to-transparent"></div>
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-2">
              <h3 className="text-xl sm:text-2xl font-bold font-display tracking-tight leading-tight">Stay in the loop</h3>
              <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed max-w-xl">
                Subscribe to our monthly newsletter to get notified about upcoming technical workshops, coding bootcamps, and exciting campus development events.
              </p>
            </div>

            <div className="lg:col-span-5">
              {newsletterSubbed ? (
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex items-center space-x-3 text-emerald-300 font-medium">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                  <p className="text-xs font-semibold leading-none">Subscription active! Welcome to the loop.</p>
                </div>
              ) : (
                <form onSubmit={handleNewsletterSubmit} className="flex gap-2.5">
                  <input 
                    type="email" 
                    required
                    placeholder="Enter university email..."
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    className="flex-1 px-4 py-3 bg-zinc-900 dark:bg-slate-800 border border-zinc-800 dark:border-slate-705 rounded-lg text-xs font-semibold text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 placeholder-zinc-500"
                  />
                  <button 
                    type="submit" 
                    className="bg-white hover:bg-slate-100 text-slate-900 text-xs font-mono font-bold uppercase tracking-wider px-5 py-3 rounded-lg transition-all active:scale-95 cursor-pointer"
                  >
                    Subscribe
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
