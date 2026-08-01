import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.error("ERROR: DATABASE_URL not found in environment. Please check your .env file.");
  process.exit(1);
}

console.log("Connecting to Supabase PostgreSQL Database...");
const pool = new Pool({
  connectionString: dbUrl,
  ssl: {
    rejectUnauthorized: false
  }
});

// Data arrays converted from src/data.ts
const announcements = [
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

const projects = [
  {
    id: 'p1',
    title: 'Club Management System',
    description: 'A central dashboard for Web and App Development Club activities including member tracking, event registration, and automated newsletter distribution.',
    tags: ['React', 'Firebase'],
    githubUrl: 'https://github.com/gstu-dev/club-manager',
    liveUrl: '#',
    version: 'v2.4.0',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=600',
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
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'p3',
    title: 'Automated Exam Proctor',
    description: 'An AI-powered proctoring solution using computer vision to monitor online examinations and detect academic dishonesty in real-time.',
    tags: ['Tensorflow', 'FastAPI'],
    githubUrl: 'https://github.com/gstu-dev/exam-proctor',
    liveUrl: '#',
    version: 'Beta v0.9',
    image: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'p4',
    title: 'High-Throughput Log Aggregator',
    description: 'A distributed system designed to collect, process, and store millions of log entries per second with minimal latency and high availability.',
    tags: ['Go', 'Docker', 'Redis'],
    githubUrl: 'https://github.com/gstu-dev/log-aggregator',
    liveUrl: '#',
    version: 'v1.5.0',
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'p5',
    title: 'Student Merit Portfolio',
    description: 'A dynamic portfolio builder specifically designed for Web and App Development Club students to showcase their academic results, skills, and project experience to recruiters.',
    tags: ['Next.js', 'Tailwind'],
    githubUrl: 'https://github.com/gstu-dev/portfolio-builder',
    liveUrl: '#',
    version: 'v3.0.0',
    image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&q=80&w=600'
  }
];

const events = [
  {
    id: 'e1',
    category: 'Workshop',
    tag: 'Featured Workshop',
    title: 'The Future of Generative AI in Web Development',
    description: 'Join us for an intensive workshop exploring how LLMs and generative agents are reshaping the modern development workflow. From automated testing to UI scaffolding.',
    date: 'Sept 24, 2024',
    time: '10:00 AM',
    location: 'Lab 402, CSE Dept.',
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=600',
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
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=600'
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
    image: 'https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&q=80&w=600'
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
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=600'
  }
];

const achievements = [
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

const studentProfiles = [
  // GSTU Mentors & Committee
  {
    uid: 'mentor_gstu',
    fullName: 'Dr. Md. MRINAL KANTI BAOWALY',
    firstName: 'Dr. Md. MRINAL KANTI',
    lastName: 'BAOWALY',
    role: 'Chief Faculty Advisor & Head of Dept.',
    designation: 'Chief Faculty Advisor & Head of Dept.',
    picture: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400',
    email: 'baowaly@gstu.edu.bd',
    isRegistered: true,
    cohort: 'N/A',
    activeCohort: 'N/A',
    registeredAt: '2024-01-01'
  },
  {
    uid: 'committee_tahmid',
    fullName: 'Tahmid Rahman',
    firstName: 'Tahmid',
    lastName: 'Rahman',
    designation: 'Club President',
    role: 'Club President',
    picture: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400',
    isRegistered: true,
    cohort: '21-22',
    activeCohort: '21-22',
    registeredAt: '2024-01-01'
  },
  {
    uid: 'committee_nahid',
    fullName: 'Nahid Hasan',
    firstName: 'Nahid',
    lastName: 'Hasan',
    designation: 'President',
    role: 'President',
    picture: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=400',
    isRegistered: true,
    cohort: '21-22',
    activeCohort: '21-22',
    registeredAt: '2024-01-01'
  },
  {
    uid: 'committee_jisan',
    fullName: 'SH Jisan',
    firstName: 'SH',
    lastName: 'Jisan',
    designation: 'Vice President',
    role: 'Vice President',
    picture: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400',
    isRegistered: true,
    cohort: '21-22',
    activeCohort: '21-22',
    registeredAt: '2024-01-01'
  },
  {
    uid: 'committee_shouvo',
    fullName: 'Mrinmoy Ahmed Shouvo',
    firstName: 'Mrinmoy',
    lastName: 'Shouvo',
    designation: 'General Secretary',
    role: 'General Secretary',
    picture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
    isRegistered: true,
    cohort: '21-22',
    activeCohort: '21-22',
    registeredAt: '2024-01-01'
  },
  {
    uid: 'committee_shakib',
    fullName: 'MD Shakib Hossen',
    firstName: 'MD Shakib',
    lastName: 'Hossen',
    designation: 'General Secretary',
    role: 'General Secretary',
    picture: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
    isRegistered: true,
    cohort: '21-22',
    activeCohort: '21-22',
    registeredAt: '2024-01-01',
    email: 'shakib@gstu.edu.bd'
  },
  // BSMRSTU Mentor
  {
    uid: 'mentor_bsmrstu',
    fullName: 'Dr. Md. Akram Hossain',
    firstName: 'Dr. Md. Akram',
    lastName: 'Hossain',
    role: 'Chief Faculty Advisor & Head of Dept.',
    designation: 'Chief Faculty Advisor & Head of Dept.',
    picture: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400',
    email: 'akram@bsmrstu.edu.bd',
    isRegistered: true,
    cohort: 'N/A',
    activeCohort: 'N/A',
    registeredAt: '2024-01-01'
  }
];

async function seed() {
  let client;
  try {
    client = await pool.connect();
    console.log("PostgreSQL Connected. Re-initializing schema for explicit tables...");
    
    // Drop old generic table
    await client.query(`DROP TABLE IF EXISTS documents CASCADE;`);
    
    // Create new explicit tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_credentials (
        uid TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT,
        is_google BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS student_profiles (
        uid TEXT PRIMARY KEY,
        full_name TEXT,
        first_name TEXT,
        last_name TEXT,
        email TEXT,
        profile_photo TEXT,
        picture TEXT,
        designation TEXT,
        role TEXT,
        is_registered BOOLEAN DEFAULT FALSE,
        cohort TEXT,
        active_cohort TEXT,
        registered_at TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS announcements (
        id TEXT PRIMARY KEY,
        category TEXT,
        tag TEXT,
        title TEXT,
        description TEXT,
        date TEXT,
        is_urgent BOOLEAN DEFAULT FALSE,
        is_archived BOOLEAN DEFAULT FALSE,
        action_label TEXT,
        action_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        title TEXT,
        description TEXT,
        tags JSONB DEFAULT '[]'::jsonb,
        github_url TEXT,
        live_url TEXT,
        version TEXT,
        image TEXT,
        is_featured BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS events (
        id TEXT PRIMARY KEY,
        category TEXT,
        tag TEXT,
        title TEXT,
        description TEXT,
        date TEXT,
        time TEXT,
        location TEXT,
        image TEXT,
        is_featured BOOLEAN DEFAULT FALSE,
        register_link TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS achievements (
        id TEXT PRIMARY KEY,
        category TEXT,
        title TEXT,
        description TEXT,
        date TEXT,
        image TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log("Tables created successfully. Database seeding has been disabled to prevent overriding admin changes.");
    return;
    console.log(`Seeding ${announcements.length} records into 'announcements'...`);
    for (const item of announcements) {
      await client.query(
        `INSERT INTO announcements (id, category, tag, title, description, date, is_urgent, is_archived, action_label, action_url) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (id) DO NOTHING`,
        [item.id, item.category, item.tag, item.title, item.description, item.date, item.isUrgent || false, item.isArchived || false, item.actionLabel, item.actionUrl]
      );
    }

    // Seed Projects
    console.log(`Seeding ${projects.length} records into 'projects'...`);
    for (const item of projects) {
      await client.query(
        `INSERT INTO projects (id, title, description, tags, github_url, live_url, version, image, is_featured) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (id) DO NOTHING`,
        [item.id, item.title, item.description, JSON.stringify(item.tags || []), item.githubUrl, item.liveUrl, item.version, item.image, item.isFeatured || false]
      );
    }

    // Seed Events
    console.log(`Seeding ${events.length} records into 'events'...`);
    for (const item of events) {
      await client.query(
        `INSERT INTO events (id, category, tag, title, description, date, time, location, image, is_featured, register_link) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         ON CONFLICT (id) DO NOTHING`,
        [item.id, item.category, item.tag, item.title, item.description, item.date, item.time, item.location, item.image, item.isFeatured || false, item.registerLink]
      );
    }

    // Seed Achievements
    console.log(`Seeding ${achievements.length} records into 'achievements'...`);
    for (const item of achievements) {
      await client.query(
        `INSERT INTO achievements (id, category, title, description, date, image) 
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO NOTHING`,
        [item.id, item.category, item.title, item.description, item.date, item.image]
      );
    }

    // Seed Student Profiles
    console.log(`Seeding ${studentProfiles.length} records into 'student_profiles'...`);
    for (const item of studentProfiles) {
      await client.query(
        `INSERT INTO student_profiles (uid, full_name, first_name, last_name, email, profile_photo, picture, designation, role, is_registered, cohort, active_cohort, registered_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         ON CONFLICT (uid) DO NOTHING`,
        [item.uid, item.fullName, item.firstName, item.lastName, item.email, item.profilePhoto, item.picture, item.designation, item.role, item.isRegistered || false, item.cohort, item.activeCohort, item.registeredAt]
      );
    }
    
    console.log("\nDATABASE SEEDING COMPLETED SUCCESSFULLY!");
  } catch (err) {
    console.error("Seeding failed:", err);
  } finally {
    if (client) client.release();
    await pool.end();
  }
}

seed();
