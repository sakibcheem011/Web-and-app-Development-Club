import React, { useState, useEffect } from 'react';
import { Mail, Link2, ArrowRight } from 'lucide-react';
import { bsmrstuChapter, gstuChapter, images } from '../data';
import { TestimonialSlider } from './ui/testimonial-slider-1';
import { TestimonialCarousel } from './ui/profile-card-testimonial-carousel';
import { db } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { TextEffect } from './ui/text-effect';

interface AboutViewProps {
  chapter: 'GSTU' | 'BSMRSTU';
}

export default function AboutView({ chapter }: AboutViewProps) {
  const isGstu = chapter === 'GSTU';
  const activeChapter = isGstu ? gstuChapter : bsmrstuChapter;
  const [firestoreMembers, setFirestoreMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'student_profiles'), (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      setFirestoreMembers(list);
      setLoading(false);
    }, (error) => {
      console.warn("Failed to subscribe members in AboutView:", error);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Dynamically load from firestore when we render active chapter committee, with no static or hard fallbacks
  const getCommitteeMembers = () => {
    const rolesToFind = ['President', 'Vice President', 'Secretary', 'General Secretary'];
    // No chapter email domain limitations - any registered user is candidates
    const activeFirestoreMembers = firestoreMembers;

    return rolesToFind.map(roleName => {
      // 1. Try Firestore First
      const found = activeFirestoreMembers.find(m => {
        const mr = (m.designation || m.role || '').toLowerCase();
        if (roleName === 'President') {
          return mr === 'president' || mr === 'club president';
        }
        return mr === roleName.toLowerCase();
      });

      if (found) {
        return {
          name: found.fullName || `${found.firstName} ${found.lastName}`.trim() || 'Club Member',
          role: found.designation || found.role || roleName,
          image: (() => {
            const pic = found.profilePhoto || found.picture || '';
            // Treat the default Unsplash mock URL seeds as empty so it matches no custom photo set
            return pic.startsWith('https://images.unsplash.com') ? '' : pic;
          })(),
          tags: roleName === 'President'
            ? ['Cloud', 'Architecture', 'AI/ML']
            : roleName === 'Secretary' 
            ? ['Filing', 'Coordination'] 
            : roleName === 'Vice President'
            ? ['AI/ML', 'React']
            : roleName === 'General Secretary'
            ? ['DevOps', 'Go']
            : ['Full Stack', 'Cloud'],
          isUnassigned: false
        };
      }

      // If not found, return empty placeholder state as requested without dummy mock members
      return {
        name: `No ${roleName} Assigned`,
        role: roleName,
        image: '',
        tags: ['Vacant'],
        isUnassigned: true
      };
    });
  };

  const committeeList = getCommitteeMembers();

  const committeeReviews = committeeList.map((member, index) => {
    let quote = "Fostering competitive programming and software development excellence among the students.";
    
    if (member.isUnassigned) {
      quote = `No candidate has been assigned to the office of ${member.role} yet. Any registered member can be chosen between all users in the administrator panel.`;
    } else {
      const lowerRole = member.role.toLowerCase();
      if (lowerRole === 'president' || lowerRole === 'club president') {
        quote = "Directing long-term strategic vision, managing institutional relationships, and driving the club's development roadmap.";
      } else if (lowerRole === 'vice president') {
        quote = "Supporting executive affairs, overseeing program execution, and mentoring sub-committees for seamless internal coordination.";
      } else if (lowerRole === 'general secretary') {
        quote = "Coordinating high-level logistics, orchestrating annual events, and managing communication pipelines across all internal departments.";
      } else if (lowerRole === 'secretary') {
        quote = "Handling administrative documentation, scheduling core meetings, and maintaining crucial organizational records.";
      } else if (lowerRole.includes("president")) {
        quote = "Leading executive operations, representing the organization, and empowering student engineers.";
      } else if (lowerRole.includes("secretary")) {
        quote = "Driving structural administration, documenting actions, and coordinating club resources.";
      } else if (lowerRole.includes("lead") || lowerRole.includes("research")) {
        quote = "Focusing on advanced algorithms research, deep learning architectures, and scalable project stacks.";
      }
    }
    
    return {
      id: index,
      name: member.name,
      affiliation: member.role,
      quote: quote,
      imageSrc: member.image,
      thumbnailSrc: member.image
    };
  });

  // Find if a dynamic advisor is assigned in the members registry
  const dynamicAdvisor = firestoreMembers.find(m => {
    const r = (m.role || '').toLowerCase();
    return r === 'chief faculty advisor & head of dept.' || r === 'chief faculty advisor';
  });

  const mentorTestimonials = [
    {
      name: (dynamicAdvisor && (dynamicAdvisor.fullName || `${dynamicAdvisor.firstName} ${dynamicAdvisor.lastName}`.trim()))
        ? (dynamicAdvisor.fullName || `${dynamicAdvisor.firstName} ${dynamicAdvisor.lastName}`.trim())
        : '',
      title: 'Chief Faculty Advisor & Head of Dept.',
      description: "To the future pioneers of our department: Technology is not merely about writing code—it is the art of solving real-world challenges. We do not just prepare you to adapt to the future; we empower you to design it. Let limitless curiosity be your compass, and embrace every challenge as a step toward mastery.",
      imageUrl: (dynamicAdvisor && dynamicAdvisor.picture && !dynamicAdvisor.picture.startsWith('https://images.unsplash.com') && !dynamicAdvisor.picture.includes('mentor_exact') && !dynamicAdvisor.picture.includes('1560250097-0b93528c311a')) ? dynamicAdvisor.picture : '',
    }
  ];

  return (
    <div className="font-sans bg-transparent py-12 sm:py-16 text-slate-800 dark:text-slate-200 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 sm:space-y-24">
        
        {/* SECTION 1: HEADER IDENTITY INTRO */}
        <div className="max-w-3xl space-y-4">
          <p className="text-emerald-600 dark:text-emerald-450 font-mono text-xs uppercase font-bold tracking-widest">
            OUR IDENTITY
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-display leading-tight text-slate-900 dark:text-white tracking-tight">
            Nurturing Innovation in the Heart of Technology
          </h1>
          <TextEffect
            per="word"
            preset="fade"
            delay={0.1}
            className="text-sm sm:text-base text-slate-500 dark:text-slate-400 font-medium leading-relaxed block"
          >
            {activeChapter.aboutQuote}
          </TextEffect>
        </div>

        {/* SECTION 2: OUR JOURNEY & DOUBLE PICTURE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text / Info */}
          <div className="lg:col-span-7 space-y-8">
            <h2 className="text-2xl font-bold font-display tracking-tight text-slate-950 dark:text-white">
              Our Journey
            </h2>
            
            <div className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm leading-relaxed space-y-4 font-normal">
              {activeChapter.journeyText.split('\n\n').map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>

            {/* Minor metric list highlights */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 grid grid-cols-3 gap-4">
              <div>
                <p className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white">{activeChapter.stats.members}</p>
                <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Active Members</p>
              </div>
              <div>
                <p className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white">{activeChapter.stats.projects}</p>
                <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Projects Completed</p>
              </div>
              <div>
                <p className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white">{activeChapter.stats.events}</p>
                <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Annual Events</p>
              </div>
            </div>
          </div>

          {/* Right Image Block Double Grid */}
          <div className="lg:col-span-5 grid grid-cols-12 gap-4">
            <div className="col-span-6 rounded-2xl overflow-hidden aspect-[4/5] shadow-md border border-slate-200 dark:border-slate-850">
              <img 
                src={images.web_dev_featured} 
                referrerPolicy="no-referrer"
                alt="Tech room coding session"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" 
              />
            </div>
            <div className="col-span-6 rounded-2xl overflow-hidden aspect-[4/5] shadow-md border border-slate-200 dark:border-slate-850 self-end">
              <img 
                src={images.auditorium} 
                referrerPolicy="no-referrer"
                alt="Auditorium team session"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" 
              />
            </div>
          </div>

        </div>

        {/* SECTION 3: MENTOR / FACULTY ADVISOR */}
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold font-display text-slate-950 dark:text-white">Guided by Excellence</h2>
            <p className="text-slate-400 dark:text-slate-500 text-xs font-mono uppercase tracking-wider">
              Our mentors from the CSE faculty department
            </p>
          </div>

          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-3">
              <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs font-mono text-slate-400 font-semibold uppercase">Loading faculty record...</p>
            </div>
          ) : (
            <TestimonialCarousel testimonials={mentorTestimonials} />
          )}
        </div>

        {/* SECTION 4: EXECUTIVE COMMITTEE SLIDESHOW */}
        <div className="space-y-8">
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold font-display tracking-tight text-slate-950 dark:text-white">
                Executive Committee
              </h2>
              <p className="text-slate-400 dark:text-slate-500 text-xs">The minds leading the current session.</p>
            </div>
          </div>

          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center space-y-3">
              <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs font-mono text-slate-400 font-semibold uppercase">Loading executive committee...</p>
            </div>
          ) : (
            <TestimonialSlider reviews={committeeReviews} />
          )}

        </div>

      </div>
    </div>
  );
}
