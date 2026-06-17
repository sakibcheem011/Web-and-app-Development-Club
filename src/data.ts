import { Mentor, CommitteeMember, ClubEvent, Announcement, Project, Achievement } from './types';
import mentorImage from './assets/images/mentor_exact_1781253440122.jpg';

// Unsplash high-quality image URLs that represent the concepts beautifully
export const images = {
  web_dev_featured: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=1000',
  lecture_hall: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=1000',
  auditorium: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=1000',
  team_coding_1: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=600',
  coding_laptop_light: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&q=80&w=600',
  gstu_logo: 'https://i.ibb.co/68vMdfR/gstu-club-logo.png', // Fallback styled canvas logo generated dynamically in code
  
  // Faculty mentors
  baowaly: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400',
  akram_hossain: mentorImage,

  // Students - GSTU
  nahid: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=400',
  jisan: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400',
  shouvo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
  shakib: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',

  // Students - BSMRSTU
  farhan: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=400',
  anika: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
  tamim: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400',
  rafiqul: 'https://images.unsplash.com/photo-1513956589380-bad6acb9b9d4?auto=format&fit=crop&q=80&w=400',

  // Projects thumbnails
  project_cms: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=600',
  project_iot: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=600',
  project_exam: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&q=80&w=600',
  project_log: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=600',
  project_portfolio: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&q=80&w=600',

  // Events thumbnails
  event_genai: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=600',
  event_pentesting: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=600',
  event_arduino: 'https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&q=80&w=600',
  event_resume: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=600'
};

// GSTU Chapter Data
export const gstuChapter = {
  clubName: 'Web and App Development Club GSTU',
  shortName: 'GSTU Dev Club',
  universityName: 'Gopalganj Science and Technology University',
  aboutQuote: 'We are a community of creators, problem solvers, and innovators within the Computer Science and Engineering department at GSTU.',
  journeyText: 'The Web & App Development Club of Gopalganj Science and Technology University is a student-led community dedicated to learning, innovation, and collaboration in web and mobile application development. The club provides opportunities for students to enhance their technical skills through workshops, projects, hackathons, and knowledge-sharing sessions while fostering a culture of creativity and continuous learning.\n\nOver the years, we have hosted national-level hackathons, organized technical workshops with industry veterans, and fostered an environment where research and development thrive. Today, we stand as a beacon of technical excellence and collaborative growth.',
  stats: {
    members: '100+',
    projects: '50+',
    events: '8+'
  },
  mentor: {
    name: 'Dr. Md. MRINAL KANTI BAOWALY',
    role: 'Chief Faculty Advisor & Head of Dept.',
    quote: '"The Web and App Development Club serves as the vital link between classroom learning and the ever-evolving tech industry. We are committed to providing our students with the resources and platforms they need to lead the next generation of digital transformation."',
    email: 'baowaly@gstu.edu.bd',
    websiteLink: '#',
    image: images.baowaly
  } as Mentor,
  committee: [
    {
      name: 'Tahmid Rahman',
      role: 'Club President',
      tags: ['Svelte', 'Node.js', 'System Architecture'],
      image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400'
    },
    {
      name: 'Nahid Hasan',
      role: 'President',
      tags: ['Python', 'CyberSec'],
      image: images.nahid
    },
    {
      name: 'SH Jisan',
      role: 'Vice President',
      tags: ['AI/ML', 'React'],
      image: images.jisan
    },
    {
      name: 'Mrinmoy Ahmed Shouvo',
      role: 'General Secretary',
      tags: ['DevOps', 'Go'],
      image: images.shouvo
    },
    {
      name: 'MD Shakib Hossen',
      role: 'General Secretary',
      tags: ['Database', 'Java'],
      image: images.shakib
    }
  ] as CommitteeMember[]
};

// BSMRSTU Chapter Data
export const bsmrstuChapter = {
  clubName: 'CSE Club BSMRSTU',
  shortName: 'BSMRSTU CSE Club',
  universityName: 'Bangabandhu Sheikh Mujibur Rahman Science and Technology University',
  aboutQuote: 'We are a community of creators, problem solvers, and innovators within the Computer Science and Engineering department at BSMRSTU.',
  journeyText: 'Founded in 2018, the CSE Club of BSMRSTU began as a small group of passionate students looking to bridge the gap between academic theory and industry practice. What started in a single lab room has evolved into the department\'s most active student organization.\n\nOver the years, we have hosted national-level hackathons, organized technical workshops with industry veterans, and fostered an environment where research and development thrive. Today, we stand as a beacon of technical excellence and collaborative growth.',
  stats: {
    members: '500+',
    projects: '50+',
    events: '20+'
  },
  mentor: {
    name: 'Dr. Md. Akram Hossain',
    role: 'Chief Faculty Advisor & Head of Dept.',
    quote: '"The CSE Club serves as the vital link between classroom learning and the ever-evolving tech industry. We are committed to providing our students with the resources and platforms they need to lead the next generation of digital transformation."',
    email: 'akram@bsmrstu.edu.bd',
    websiteLink: '#',
    image: images.akram_hossain
  } as Mentor,
  committee: [
    {
      name: 'Tahmid Rahman',
      role: 'Club President',
      tags: ['Svelte', 'Node.js', 'System Architecture'],
      image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400'
    },
    {
      name: 'Farhan Ishrak',
      role: 'President',
      tags: ['Python', 'CyberSec'],
      image: images.farhan
    },
    {
      name: 'Anika Rahman',
      role: 'Vice President',
      tags: ['AI/ML', 'React'],
      image: images.anika
    },
    {
      name: 'Tamim Ahmed',
      role: 'General Secretary',
      tags: ['DevOps', 'Go'],
      image: images.tamim
    },
    {
      name: 'Rafiqul Islam',
      role: 'Treasurer',
      tags: ['Database', 'Java'],
      image: images.rafiqul
    }
  ] as CommitteeMember[]
};

// Events Data
export const clubEvents: ClubEvent[] = [
  {
    id: 'e1',
    category: 'Workshop',
    tag: 'Featured Workshop',
    title: 'The Future of Generative AI in Web Development',
    description: 'Join us for an intensive workshop exploring how LLMs and generative agents are reshaping the modern development workflow. From automated testing to UI scaffolding.',
    date: 'Sept 24, 2024',
    time: '10:00 AM',
    location: 'Lab 402, CSE Dept.',
    image: images.event_genai,
    isFeatured: true,
    registerLink: '#'
  },
  {
    id: 'e2',
    category: 'Contest',
    tag: 'Contest',
    title: 'Bi-Weekly Coding Sprint',
    description: 'Competitive programming challenge focusing on data structures and algorithms. Put your speed and debugging skills to the ultimate test.',
    date: 'Tomorrow',
    time: '6:00 PM',
    location: 'Competitive Programming Lab',
    image: '',
    registerLink: '#'
  },
  {
    id: 'e3',
    category: 'Seminar',
    tag: 'Seminar',
    title: 'Alumni Tech Talk',
    description: 'Navigating the transition from academia to high-growth tech startups. Learn from successful graduates sharing their insights.',
    date: 'Scheduled',
    time: 'Online (Discord)',
    location: 'Discord Server',
    image: '',
    registerLink: '#'
  },
  {
    id: 'e4',
    category: 'Workshop',
    tag: 'Security Workshop',
    title: 'Intro to Pentesting',
    description: 'Hands-on session on network security and vulnerability scanning basics. Learn defensive security mechanics and standard tools.',
    date: 'Oct 12, 2024',
    time: '2:30 PM',
    location: 'Lab 305, CSE Dept.',
    image: images.event_pentesting
  },
  {
    id: 'e5',
    category: 'Workshop',
    tag: 'Hardware Workshop',
    title: 'Arduino & IoT Basics',
    description: 'Learn to build connected devices and smart sensors from scratch. Connect physical sensors to dashboard charts step-by-step.',
    date: 'Oct 18, 2024',
    time: '11:00 AM',
    location: 'IoT Lab, Room 102',
    image: images.event_arduino
  },
  {
    id: 'e6',
    category: 'Seminar',
    tag: 'Career Seminar',
    title: 'Resume Building for Devs',
    description: 'Optimize your GitHub, portfolio, and tech resume to catch recruiter\'s attention. Get live feedback on your existing projects.',
    date: 'Oct 25, 2024',
    time: '4:00 PM',
    location: 'Seminar Room, GSTU',
    image: images.event_resume
  }
];

// Announcements Data
export const announcements: Announcement[] = [
  {
    id: 'a1',
    category: 'General',
    tag: 'Urgent',
    title: 'All final year students are required to register their thesis/project titles by the end of this week. Failure to do so will result in deferred evaluation.',
    description: 'Critical action requested by Head of Department. Submission portal closes Sunday night at 11:59 PM. Group details must include supervisor signature.',
    date: 'Oct 24, 2024',
    isUrgent: true,
    actionLabel: 'Read Full Details'
  },
  {
    id: 'a2',
    category: 'Events',
    tag: 'Events',
    title: 'Inter-University Hackathon 2024',
    description: 'Join us for the biggest coding challenge of the year. Registrations are now open for teams of three. Compete with universities nationwide!',
    date: 'Oct 20, 2024',
    actionLabel: 'Details'
  },
  {
    id: 'a3',
    category: 'Recruitment',
    tag: 'Recruitment',
    title: 'Technical Lead Openings',
    description: 'The Web and App Development Club is looking for passionate individuals to lead our web development and AI wings. Apply before interviews start.',
    date: 'Oct 18, 2024',
    actionLabel: 'Apply Now'
  },
  {
    id: 'a4',
    category: 'General',
    tag: 'Archived',
    title: 'Lab 301 Maintenance Schedule',
    description: 'The computer lab 301 will be closed for hardware upgrades and network maintenance this weekend.',
    date: 'Oct 15, 2024',
    isArchived: true,
    actionLabel: 'View Schedule'
  }
];

// Projects Data
export const initialProjects: Project[] = [
  {
    id: 'p1',
    title: 'Club Management System',
    description: 'A central dashboard for Web and App Development Club activities including member tracking, event registration, and automated newsletter distribution.',
    tags: ['React', 'Firebase'],
    githubUrl: 'https://github.com/gstu-dev/club-manager',
    liveUrl: '#',
    version: 'v2.4.0',
    image: images.project_cms,
    isFeatured: true
  },
  {
    id: 'p2',
    title: 'Smart Campus Environment',
    description: 'Real-time environmental monitoring across the university campus using low-power IoT sensors and a unified data analytics platform.',
    tags: ['Python', 'IoT', 'Arduino'],
    githubUrl: 'https://github.com/gstu-dev/smart-campus',
    liveUrl: '#',
    version: 'v1.1.2',
    image: images.project_iot
  },
  {
    id: 'p3',
    title: 'Automated Exam Proctor',
    description: 'An AI-powered proctoring solution using computer vision to monitor online examinations and detect academic dishonesty in real-time.',
    tags: ['Tensorflow', 'FastAPI'],
    githubUrl: 'https://github.com/gstu-dev/exam-proctor',
    liveUrl: '#',
    version: 'Beta v0.9',
    image: images.project_exam
  },
  {
    id: 'p4',
    title: 'High-Throughput Log Aggregator',
    description: 'A distributed system designed to collect, process, and store millions of log entries per second with minimal latency and high availability.',
    tags: ['Go', 'Docker', 'Redis'],
    githubUrl: 'https://github.com/gstu-dev/log-aggregator',
    liveUrl: '#',
    version: 'v1.5.0',
    image: images.project_log
  },
  {
    id: 'p5',
    title: 'Student Merit Portfolio',
    description: 'A dynamic portfolio builder specifically designed for Web and App Development Club students to showcase their academic results, skills, and project experience to recruiters.',
    tags: ['Next.js', 'Tailwind'],
    githubUrl: 'https://github.com/gstu-dev/portfolio-builder',
    liveUrl: '#',
    version: 'v3.0.0',
    image: images.project_portfolio
  }
];

export const initialAchievements: Achievement[] = [
  {
    id: 'ach-1',
    title: 'Champions of National Hackfest 2024',
    description: 'Our students won the outstanding 1st prize in the National Hackfest in Smart Agriculture category, presenting an innovative cloud-based soil-sensing IoT deployment to automate cropping queries.',
    category: 'Achievement',
    date: 'Feb 15, 2024',
    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=600',
    createdAt: '2024-02-15T12:00:00Z'
  },
  {
    id: 'ach-2',
    title: 'Autumn Club Photo Shoot & Dynamic Hangout',
    description: 'Members of the committee and representatives across all academic cohorts gathered at the lake for the annual group picture, laughter, and high-spirited interactive bonding.',
    category: 'Photo Moment',
    date: 'Mar 10, 2024',
    image: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=600',
    createdAt: '2024-03-10T12:00:00Z'
  },
  {
    id: 'ach-3',
    title: 'Best Student Researcher Award Presentation',
    description: 'Executive committee lead Tahmid Rahman was presented the Presidential Merit Award for outstanding experimental research papers published on machine learning and high-efficiency routing architectures.',
    category: 'Achievement',
    date: 'Apr 28, 2024',
    image: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&q=80&w=600',
    createdAt: '2024-04-28T12:00:00Z'
  },
  {
    id: 'ach-4',
    title: 'Vanguard Seminar Packed Auditorium',
    description: 'A completely crowded hall moment captured during our recent workshop on High-Concurrency Microservices and Server-Side Javascript pipelines, attended by over 120 developers.',
    category: 'Photo Moment',
    date: 'Jun 02, 2024',
    image: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=600',
    createdAt: '2024-06-02T12:00:00Z'
  }
];
