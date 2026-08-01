import React from 'react';
import { Github, ExternalLink, Search, PlusCircle, Sparkles, UploadCloud, CheckCircle2 } from 'lucide-react';
import { initialProjects, images } from '../data';
import { Project } from '../types';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, doc, setDoc, onSnapshot, getDocs } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { useScreenSize } from '../hooks/use-screen-size';
import { GooeyFilter } from './ui/gooey-filter';

export default function ProjectsView() {
  const screenSize = useScreenSize();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [activeCategory, setActiveCategory] = React.useState('All');
  
  const [projects, setProjects] = React.useState<Project[]>([]);

  // Real-time Firestore synchronization & Auto Seed if empty
  React.useEffect(() => {
    const unsub = onSnapshot(collection(db, 'projects'), async (snapshot) => {
      if (snapshot.empty) {
        setProjects([]);
      } else {
        const loaded: Project[] = [];
        snapshot.forEach((doc) => {
          loaded.push({ id: doc.id, ...doc.data() } as Project);
        });
        setProjects(loaded);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'projects');
    });

    return () => unsub();
  }, []);

  // Submit form state
  const [formData, setFormData] = React.useState({
    title: '',
    description: '',
    githubUrl: '',
    liveUrl: '#',
    tagsString: '',
    version: 'v1.0.0',
    category: 'Web Dev'
  });
  
  const [submitSuccess, setSubmitSuccess] = React.useState(false);
  const [uploadedImage, setUploadedImage] = React.useState<string>(images.project_cms);

  React.useEffect(() => {
    if (projects.length > 0) {
      localStorage.setItem('gstu_club_projects', JSON.stringify(projects));
    }
  }, [projects]);


  // Filters logic
  const filteredProjects = projects.filter(proj => {
    const matchesSearch = 
      proj.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proj.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proj.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));

    let matchesCategory = true;
    if (activeCategory === 'Web Dev') {
      matchesCategory = proj.tags.some(t => ['React', 'Firebase', 'Next.js', 'Tailwind', 'Next', 'Vue', 'HTML', 'Javascript'].includes(t));
    } else if (activeCategory === 'AI / ML') {
      matchesCategory = proj.tags.some(t => ['Tensorflow', 'FastAPI', 'Python', 'ML', 'PyTorch', 'AI'].includes(t));
    } else if (activeCategory === 'IoT') {
      matchesCategory = proj.tags.some(t => ['IoT', 'Arduino', 'Raspberry', 'Sensor'].includes(t));
    }

    return matchesSearch && matchesCategory;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.githubUrl) return;

    // Parse string tags like "React, Tailwind" to list
    const tags = formData.tagsString
      ? formData.tagsString.split(',').map(t => t.trim()).filter(Boolean)
      : [formData.category];

    const docId = `custom-${Date.now()}`;
    const newProj: Project = {
      id: docId,
      title: formData.title,
      description: formData.description,
      tags: tags,
      githubUrl: formData.githubUrl,
      liveUrl: formData.liveUrl,
      version: formData.version,
      image: uploadedImage
    };

    try {
      await setDoc(doc(db, 'projects', docId), newProj);
      setSubmitSuccess(true);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `projects/${docId}`);
    }
    
    // Reset fields
    setFormData({
      title: '',
      description: '',
      githubUrl: '',
      liveUrl: '#',
      tagsString: '',
      version: 'v1.0.0',
      category: 'Web Dev'
    });

    setTimeout(() => {
      setSubmitSuccess(false);
    }, 4000);
  };

  // Mock quick thumbnail generation to make submission colorful
  const selectRandomThumb = () => {
    const defaultThumbs = [images.project_cms, images.project_exam, images.project_iot, images.project_log, images.project_portfolio];
    const randomIndex = Math.floor(Math.random() * defaultThumbs.length);
    setUploadedImage(defaultThumbs[randomIndex]);
  };

  return (
    <div className="font-sans bg-transparent py-12 sm:py-16 text-slate-800 dark:text-slate-200 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* HEADER HERO AREA */}
        <div className="max-w-4xl space-y-5">
          <p className="text-emerald-600 dark:text-emerald-450 font-mono text-xs uppercase font-bold tracking-widest">
            INNOVATION IN ACTION
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-display leading-tight text-slate-900 dark:text-white tracking-tight">
            Innovation in Action
          </h1>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-3xl">
            Explore the technical brilliance of our club members. From open-source contributions to cutting-edge research prototypes, this is where academic theory meets industry reality.
          </p>

          {/* Quick Metrics Labels (Capsules) from screenshot */}
          <div className="flex flex-wrap gap-3 pt-2">
            <span className="inline-flex items-center space-x-1.5 bg-emerald-50 dark:bg-emerald-950/45 text-emerald-800 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/60 rounded-full px-3 py-1 text-xs font-mono font-medium shadow-sm">
              <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span>50+ Active Projects</span>
            </span>
            <span className="inline-flex items-center space-x-1.5 bg-cyan-50 dark:bg-cyan-950/45 text-cyan-800 dark:text-cyan-300 border border-cyan-100 dark:border-cyan-900/60 rounded-full px-3 py-1 text-xs font-mono font-medium shadow-sm">
              <PlusCircle className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
              <span>120+ Contributors</span>
            </span>
          </div>
        </div>

        {/* SEARCH AND TABS BAR */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm">
          
          {/* Input text */}
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
            <input 
              type="text" 
              placeholder="Search projects by name or stack..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 font-semibold"
            />
          </div>

          {/* Tag Pills with Gooey filter effect */}
          <div className="relative w-full sm:w-[380px] h-10 bg-slate-150/80 dark:bg-slate-900 rounded-xl p-1 border border-slate-200 dark:border-slate-800/80 flex items-center select-none overflow-visible">
            <GooeyFilter
              id="projects-gooey-filter"
              strength={screenSize.lessThan("md") ? 5 : 10}
            />

            {/* Background gooey slider dynamic pills */}
            <div
              className="absolute inset-1 pointer-events-none"
              style={{ filter: "url(#projects-gooey-filter)" }}
            >
              <div className="flex h-full w-full">
                {['All', 'Web Dev', 'AI / ML', 'IoT'].map((cat) => (
                  <div key={cat} className="relative flex-1 h-full">
                    {activeCategory === cat && (
                      <motion.div
                        layoutId="active-project-category-tab"
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

            {/* Foreground elements */}
            <div className="relative flex w-full h-full z-10">
              {['All', 'Web Dev', 'AI / ML', 'IoT'].map((cat) => {
                const isSelected = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className="flex-1 h-full flex items-center justify-center rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors duration-300 cursor-pointer"
                  >
                    <span
                      className={`transition-colors duration-300 ${
                        isSelected 
                          ? "text-white" 
                          : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                      }`}
                    >
                      {cat}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* PROJECTS GRID DISPLAY */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Loop over static and newly added elements */}
          {filteredProjects.map((proj) => (
            <div 
              key={proj.id}
              className="bg-white border border-slate-200/85 rounded-2xl overflow-hidden hover:shadow-md hover:border-slate-350 transition-all flex flex-col justify-between group"
            >
              <div className="relative aspect-video bg-emerald-950 overflow-hidden">
                {proj.isFeatured && (
                  <span className="absolute top-3 left-3 z-10 bg-amber-400 text-slate-950 text-[10px] font-bold font-mono uppercase px-2 py-0.5 rounded shadow">
                    Featured
                  </span>
                )}
                <img 
                  src={proj.image || images.project_cms} 
                  referrerPolicy="no-referrer"
                  alt={proj.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
              </div>

              {/* Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                
                <div className="space-y-3">
                  {/* Badges */}
                  <div className="flex flex-wrap gap-1.5">
                    {proj.tags.map((tag, i) => (
                      <span 
                        key={i} 
                        className="bg-cyan-50/50 text-[9px] text-cyan-800 font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-cyan-100"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <h3 className="font-bold text-sm sm:text-base leading-snug text-slate-950 group-hover:text-emerald-700 transition-colors">
                    {proj.title}
                  </h3>

                  <p className="text-xs text-slate-500 leading-relaxed font-normal line-clamp-3">
                    {proj.description}
                  </p>
                </div>

                {/* Footer and dynamic links */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-mono font-semibold">
                  <div className="flex items-center space-x-3 text-slate-600">
                    <a 
                      href={proj.githubUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center space-x-1 hover:text-emerald-700 transition-colors cursor-pointer"
                    >
                      <Github className="w-3.5 h-3.5" />
                      <span>GitHub</span>
                    </a>
                    <a 
                      href={proj.liveUrl} 
                      className="flex items-center space-x-1 hover:text-emerald-700 transition-colors cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Live Demo</span>
                    </a>
                  </div>
                  <span className="text-zinc-400 text-[10px]">{proj.version}</span>
                </div>

              </div>
            </div>
          ))}

          {/* CTA CARD 6 CALLOUT (Always displayed unless active category filters it out) */}
          {(activeCategory === 'All' || activeCategory === 'Web Dev') && (
            <div className="bg-slate-950 text-white rounded-2xl p-6 shadow-md flex flex-col justify-between items-center text-center relative border border-slate-900 group overflow-hidden">
              {/* Abs orbit lines decoration */}
              <div className="absolute inset-x-0 bottom-0 top-1/2 bg-gradient-to-t from-emerald-500/10 to-transparent"></div>
              
              <div className="my-auto space-y-4 relative z-10 py-4">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-green-400 mx-auto group-hover:scale-110 transition-transform">
                  <PlusCircle className="w-6 h-6 animate-pulse" />
                </div>
                
                <h3 className="font-bold font-display text-base sm:text-lg">Ready to showcase your work?</h3>
                <p className="text-zinc-400 text-xs leading-relaxed max-w-xs mx-auto">
                  We're always looking for new and exciting projects from our club members. Share your innovation with the community today.
                </p>
              </div>

              <a 
                href="#submit-spotlight"
                className="w-full text-center bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider relative z-10 shadow transition-all cursor-pointer"
              >
                Submit Project
              </a>
            </div>
          )}

        </div>

        {/* SUBMISSION FORM PORTLET SECTION */}
        <section id="submit-spotlight" className="pt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left panel */}
          <div className="lg:col-span-5 bg-gradient-to-br from-emerald-950 to-zinc-950 text-white p-6 sm:p-8 rounded-2xl flex flex-col justify-between shadow-md relative overflow-hidden">
            <div className="space-y-6 relative z-10">

              <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed font-normal">
                Whether it's a weekend side project or a final-year thesis research piece, we provide the platform to gain visibility, find collaborators, and receive technical feedback from peers and faculty.
              </p>

              <div className="space-y-4 pt-4 border-t border-white/5">
                <div className="flex gap-3">
                  <span className="text-teal-400 text-sm font-bold font-mono">✔</span>
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-semibold">Quality Code Standards</h4>
                    <p className="text-zinc-500 text-[11px]">Projects are reviewed by the dev team for coding best practices.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="text-teal-400 text-sm font-bold font-mono">✔</span>
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-semibold">Community Mentorship</h4>
                    <p className="text-zinc-500 text-[11px]">Get constructive feedback and technical guidance from senior members.</p>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                const element = document.getElementById('project-form-main');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-cyan-400 hover:bg-cyan-500 text-slate-900 text-xs font-mono font-bold uppercase tracking-wider py-3.5 rounded-lg transition-all w-full text-center mt-6 block relative z-10"
            >
              Submit Your Code
            </button>
          </div>

          {/* Right Panel Submission Form Card */}
          <div id="project-form-main" className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 hover:shadow-md transition-shadow">
            
            {submitSuccess ? (
              <div className="h-full flex flex-col items-center justify-center py-12 text-center space-y-4">
                <CheckCircle2 className="w-16 h-16 text-emerald-500 animate-bounce" />
                <div className="space-y-1">
                  <h3 className="text-lg font-bold font-display text-slate-900">Project Submitted Successfully!</h3>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
                    Thank you! Your project module was securely loaded and has been dynamically appended into the Project Grid in the active session.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                  <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                  <h3 className="font-bold font-display text-base text-slate-900">Submission Form: Project Spotlight Program</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 uppercase font-mono pb-1">Project Title</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Club Management System"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-emerald-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 uppercase font-mono pb-1">Primary Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-emerald-500 font-bold"
                    >
                      <option>Web Dev</option>
                      <option>AI / ML</option>
                      <option>IoT</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 uppercase font-mono pb-1">Brief Description</label>
                  <textarea 
                    required
                    placeholder="Brief description of the technology..."
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-emerald-500 font-medium"
                  ></textarea>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 uppercase font-mono pb-1">GitHub URL</label>
                    <input 
                      type="url" 
                      required
                      placeholder="https://github.com/..."
                      value={formData.githubUrl}
                      onChange={(e) => setFormData({...formData, githubUrl: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-emerald-500 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 uppercase font-mono pb-1">Release Version</label>
                    <input 
                      type="text" 
                      placeholder="v1.0.0"
                      value={formData.version}
                      onChange={(e) => setFormData({...formData, version: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-emerald-500 font-mono text-xs font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 uppercase font-mono pb-1">Tech Stack tags (Comma separated)</label>
                  <input 
                    type="text" 
                    placeholder="React, Firebase, Tailwind"
                    value={formData.tagsString}
                    onChange={(e) => setFormData({...formData, tagsString: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-emerald-500 font-medium"
                  />
                </div>

                {/* Dashed drop box thumbnail select */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 uppercase font-mono pb-1">Project Thumbnail</label>
                  <div 
                    onClick={selectRandomThumb}
                    className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all bg-slate-50 hover:bg-emerald-50/25"
                  >
                    <UploadCloud className="w-8 h-8 text-slate-400" />
                    <p className="text-xs font-semibold text-slate-500">Drop project thumbnail</p>
                    <p className="text-[10px] text-zinc-400 font-mono">Click to randomize image mockups</p>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-slate-950 hover:bg-emerald-950 text-white font-mono font-bold uppercase tracking-wider py-2.5 rounded-lg text-xs leading-none transition-all active:scale-95 flex items-center justify-center space-x-2 shadow cursor-pointer pt-3"
                  >
                    <span>Submit Spotlight Profile</span>
                  </button>
                </div>
              </form>
            )}

          </div>

        </section>

      </div>
    </div>
  );
}
