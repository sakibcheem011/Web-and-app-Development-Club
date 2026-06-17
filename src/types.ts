export interface Mentor {
  name: string;
  role: string;
  quote: string;
  email: string;
  websiteLink: string;
  image: string;
}

export interface CommitteeMember {
  name: string;
  role: string;
  tags: string[];
  image: string;
  isPast?: boolean;
}

export interface ClubEvent {
  id: string;
  category: 'Workshop' | 'Contest' | 'Seminar' | 'Session';
  tag: string;
  title: string;
  description: string;
  date: string;
  time?: string;
  location: string;
  image: string;
  isFeatured?: boolean;
  registerLink?: string;
}

export interface Announcement {
  id: string;
  category: 'General' | 'Events' | 'Recruitment' | 'Academic';
  tag: string;
  title: string;
  description: string;
  date: string;
  isUrgent?: boolean;
  isArchived?: boolean;
  actionLabel?: string;
  actionUrl?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];
  githubUrl: string;
  liveUrl: string;
  version: string;
  image: string;
  isFeatured?: boolean;
}

export interface ClubMember {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  isRegistered: boolean;
  registeredAt?: string;
  activeCohort?: string;
  role?: string;
  picture?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'Achievement' | 'Photo Moment';
  date: string;
  image: string;
  createdAt?: string;
}
