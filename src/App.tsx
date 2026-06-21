import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AuthModals from './components/AuthModals';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut, User, getRedirectResult } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// Page Views
const HomeView = React.lazy(() => import('./components/HomeView'));
const AboutView = React.lazy(() => import('./components/AboutView'));
const EventsView = React.lazy(() => import('./components/EventsView'));
const ProjectsView = React.lazy(() => import('./components/ProjectsView'));
const AchievementsView = React.lazy(() => import('./components/AchievementsView'));
const AnnouncementsView = React.lazy(() => import('./components/AnnouncementsView'));
const ContactView = React.lazy(() => import('./components/ContactView'));
const MemberPortalView = React.lazy(() => import('./components/MemberPortalView'));
const AdminDashboardView = React.lazy(() => import('./components/AdminDashboardView'));
import AnimatedGradient from './components/ui/animated-gradient';
import InstallPromptModal from './components/InstallPromptModal';
import { usePWA } from './hooks/usePWA';

export default function App() {
  const [currentView, setCurrentView] = React.useState<string>('home');
  const [chapter, setChapter] = React.useState<'GSTU' | 'BSMRSTU'>('GSTU');

  const { isInstallable, installApp } = usePWA();
  const [isInstallModalOpen, setIsInstallModalOpen] = React.useState(false);

  // Enforce Light Mode always
  React.useEffect(() => {
    const root = window.document.documentElement;
    const body = window.document.body;
    root.classList.remove('dark');
    body.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  }, []);

  // Authentication states
  const [currentUser, setCurrentUser] = React.useState<any>(null);
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [authModalMode, setAuthModalMode] = React.useState<'user-login' | 'user-signup' | 'admin-login' | null>(null);
  const [userProfile, setUserProfile] = React.useState<any>(null);

  // Monitor Auth lifecycle
  React.useEffect(() => {
    let isUnsubscribed = false;

    // Check for standard sign-in redirects on startup (highly reliable on localhost Chrome/Safari)
    try {
      getRedirectResult(auth)
        .then((result) => {
          if (result && result.user) {
            console.log("[App Auth] Redirect check: successfully received redirected user credentials", result.user);
          }
        })
        .catch((redirectErr) => {
          console.error("[App Auth] Redirect login trace error:", redirectErr);
        });
    } catch (e) {
      console.warn("[App Auth] getRedirectResult failed to initiate:", e);
    }

    // Check for stored sandbox session first
    const checkSandboxSession = async () => {
      const storedSandbox = localStorage.getItem('local_sandbox_user');
      if (storedSandbox) {
        try {
          const sandboxUser = JSON.parse(storedSandbox);
          if (sandboxUser && sandboxUser.uid) {
            console.log("[App Auth Startup] Restored active sandbox session:", sandboxUser);
            if (isUnsubscribed) return true;
            setCurrentUser(sandboxUser);
            
            // Fetch profile
            const cleanEmail = sandboxUser.email?.toLowerCase() || '';
            const allowedAdmins = ['cheemsakib@gmail.com', 'shakib@gstu.edu.bd', 'admin@gstu.edu.bd'];
            const isUserAdmin = allowedAdmins.includes(cleanEmail);
            setIsAdmin(isUserAdmin);

            const docRef = doc(db, 'student_profiles', sandboxUser.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              const data = docSnap.data();
              setUserProfile({
                ...data,
                firstName: data.firstName || data.fullName?.split(' ')[0] || 'User',
                lastName: data.lastName || data.fullName?.split(' ').slice(1).join(' ') || 'Member',
                role: data.role || data.designation || (isUserAdmin ? 'General Secretary' : 'General Member'),
              });
            } else {
              const fName = sandboxUser.displayName?.split(' ')[0] || 'User';
              const lName = sandboxUser.displayName?.split(' ')[1] || 'Member';
              const fullNameValue = sandboxUser.displayName || `${fName} ${lName}`.trim();
              const activeCohortValue = '22-23';
              const createdAtValue = new Date().toISOString();
              const todayDate = createdAtValue.split('T')[0];

              const memberData = {
                uid: sandboxUser.uid,
                fullName: fullNameValue,
                firstName: fName,
                lastName: lName,
                email: cleanEmail,
                profilePhoto: '',
                picture: '',
                designation: isUserAdmin ? 'General Secretary' : 'General Member',
                role: isUserAdmin ? 'General Secretary' : 'General Member',
                isRegistered: true,
                createdAt: createdAtValue,
                registeredAt: todayDate,
                cohort: activeCohortValue,
                activeCohort: activeCohortValue,
              };

              setUserProfile(memberData);

              try {
                console.log("[App Auth Sandbox] Initializing missing sandbox profile in Firestore:", sandboxUser.uid);
                await setDoc(docRef, memberData);
                console.log("[App Auth Sandbox] Successfully saved missing profile in Firestore");
              } catch (saveErr) {
                console.error("[App Auth Sandbox] Failed to save missing profile in Firestore:", saveErr);
              }
            }
            return true;
          }
        } catch (err) {
          console.error("Error restoring sandbox session:", err);
        }
      }
      return false;
    };

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Clear locally stored sandbox session when real Firebase is active
        localStorage.removeItem('local_sandbox_user');

        if (isUnsubscribed) return;
        setCurrentUser(firebaseUser);
        
        // Evaluate Admin privilege
        const cleanEmail = firebaseUser.email?.toLowerCase() || '';
        const allowedAdmins = ['cheemsakib@gmail.com', 'shakib@gstu.edu.bd', 'admin@gstu.edu.bd'];
        const isUserAdmin = allowedAdmins.includes(cleanEmail);
        setIsAdmin(isUserAdmin);

        // Fetch their profile record
        try {
          const docRef = doc(db, 'student_profiles', firebaseUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUserProfile({
              ...data,
              firstName: data.firstName || data.fullName?.split(' ')[0] || 'User',
              lastName: data.lastName || data.fullName?.split(' ').slice(1).join(' ') || 'Member',
              role: data.role || data.designation || (isUserAdmin ? 'General Secretary' : 'General Member'),
            });
          } else {
            const fName = firebaseUser.displayName?.split(' ')[0] || 'User';
            const lName = firebaseUser.displayName?.split(' ')[1] || 'Member';
            const fullNameValue = firebaseUser.displayName || `${fName} ${lName}`.trim();
            const activeCohortValue = '22-23';
            const createdAtValue = new Date().toISOString();
            const todayDate = createdAtValue.split('T')[0];

            const memberData = {
              uid: firebaseUser.uid,
              fullName: fullNameValue,
              firstName: fName,
              lastName: lName,
              email: cleanEmail,
              profilePhoto: firebaseUser.photoURL || '',
              picture: firebaseUser.photoURL || '',
              designation: isUserAdmin ? 'General Secretary' : 'General Member',
              role: isUserAdmin ? 'General Secretary' : 'General Member',
              isRegistered: true,
              createdAt: createdAtValue,
              registeredAt: todayDate,
              cohort: activeCohortValue,
              activeCohort: activeCohortValue,
            };

            setUserProfile(memberData);

            try {
              console.log("[App Auth] Initializing missing student profile in Firestore:", firebaseUser.uid);
              await setDoc(docRef, memberData);
              console.log("[App Auth] Successfully saved missing profile in Firestore");
            } catch (saveErr) {
              console.error("[App Auth] Failed to save missing profile: ", saveErr);
            }
          }
        } catch (e) {
          console.error("Error reading profile: ", e);
        }
      } else {
        // Real user is logged out, check if we have a sandbox user session to restore
        const hadSandbox = await checkSandboxSession();
        if (!hadSandbox) {
          if (isUnsubscribed) return;
          setIsAdmin(false);
          setUserProfile(null);
          setCurrentUser(null);
        }
      }
    });

    // Check sandbox immediately on mount
    checkSandboxSession();

    return () => {
      isUnsubscribed = true;
      unsubscribe();
    };
  }, []);

  const handleChapterToggle = () => {
    // Locked to GSTU per user instruction
    setChapter('GSTU');
  };

  // Intercept views requiring authentication
  const handleViewChange = (view: string) => {
    if (view === 'projects' || view === 'events') {
      if (!currentUser) {
        setAuthModalMode('user-login');
        return;
      }
    }
    if (view === 'admin') {
      if (!currentUser || !isAdmin) {
        // Trigger separate pop-up sign in menu for admin panel
        setAuthModalMode('admin-login');
        return;
      }
    }
    if (view === 'login') {
      setAuthModalMode('user-login');
      return;
    }
    if (view === 'join') {
      setAuthModalMode('user-signup');
      return;
    }
    setCurrentView(view);
  };

  const handleSignOut = async () => {
    localStorage.removeItem('local_sandbox_user');
    await signOut(auth);
    setCurrentUser(null);
    setIsAdmin(false);
    setUserProfile(null);
    setCurrentView('home');
  };

  // Scroll to top on view changes to guarantee a polished user experience
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [currentView]);

  const renderActiveView = () => {
    switch (currentView) {
      case 'home':
        return <HomeView onViewChange={handleViewChange} chapter={chapter} />;
      case 'about':
        return <AboutView chapter={chapter} />;
      case 'events':
        return <EventsView />;
      case 'projects':
        return <ProjectsView />;
      case 'achievements':
        return <AchievementsView />;
      case 'announcements':
        return <AnnouncementsView />;
      case 'contact':
        return <ContactView chapter={chapter} />;
      case 'admin':
        return <AdminDashboardView />;
      case 'login':
      case 'join':
        return <MemberPortalView chapter={chapter} />;
      default:
        return <HomeView onViewChange={handleViewChange} chapter={chapter} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-transparent text-slate-800 transition-colors duration-300 relative selection:bg-emerald-500 selection:text-white">
      <AnimatedGradient 
        config={{
          preset: 'custom',
          color1: '#F8FAFC',
          color2: '#E6F4EA',
          color3: '#F1F5F9',
          speed: 18,
          softness: 85
        }}
        noise={{ opacity: 0.03, scale: 0.8 }}
      />
      
      {/* 1. Global Navigation Bar */}
      <Navbar 
        currentView={currentView} 
        onViewChange={handleViewChange} 
        chapter={chapter}
        onChapterToggle={handleChapterToggle}
        currentUser={currentUser}
        isAdmin={isAdmin}
        onSignOut={handleSignOut}
        userProfile={userProfile}
        onDownloadClick={() => setIsInstallModalOpen(true)}
      />

      {/* 2. Primary Route Switcher with Motion Fade-up Transition */}
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }} // Elegant precise bezier transition
            id={`view-stage-${currentView}`}
            className="w-full"
          >
            <React.Suspense fallback={
              <div className="flex items-center justify-center min-h-[50vh]">
                <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            }>
              {renderActiveView()}
            </React.Suspense>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* 3. Global Responsive footer */}
      <Footer chapter={chapter} onViewChange={handleViewChange} />

      {/* 4. Modular Interactive Auth Modals */}
      <AuthModals 
        isOpen={authModalMode !== null}
        mode={authModalMode}
        onClose={() => setAuthModalMode(null)}
        onModeChange={setAuthModalMode}
        onSuccess={(user, isUserAdmin) => {
          setCurrentUser(user);
          setIsAdmin(isUserAdmin);
          if (isUserAdmin && authModalMode === 'admin-login') {
            setCurrentView('admin');
          } else if (authModalMode === 'user-login' || authModalMode === 'user-signup') {
            // After successful user login, refresh active view
            if (currentView === 'home') {
              setCurrentView('projects');
            }
          }
        }}
      />

      {/* PWA Download Modal */}
      <InstallPromptModal 
        isOpen={isInstallModalOpen} 
        onClose={() => setIsInstallModalOpen(false)} 
        isInstallable={isInstallable} 
        onInstall={installApp} 
      />

    </div>
  );
}

