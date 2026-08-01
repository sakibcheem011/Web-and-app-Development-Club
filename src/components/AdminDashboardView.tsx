import React from 'react';
import { 
  ShieldAlert, 
  Users, 
  Megaphone, 
  Calendar as CalendarIcon, 
  Briefcase, 
  Plus, 
  Trash2, 
  TrendingUp, 
  Sparkles, 
  CheckCircle2, 
  Award, 
  AlertTriangle, 
  X, 
  ArrowRight,
  Shield,
  UserPlus,
  Mail,
  Eye,
  EyeOff,
  Inbox,
  Trophy,
  Camera,
  Image as ImageIcon
} from 'lucide-react';
import { clubEvents, announcements, initialProjects, images, initialAchievements } from '../data';
import { ClubEvent, Announcement, Project, ClubMember, Achievement } from '../types';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';

const getTodayDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function AdminDashboardView() {
  const [activeTab, setActiveTab] = React.useState<'overview' | 'members' | 'announcements' | 'events' | 'projects' | 'inquiries' | 'achievements'>('overview');
  const [showAdminProfile, setShowAdminProfile] = React.useState(false);

  const [members, setMembers] = React.useState<ClubMember[]>([]);
  const [notices, setNotices] = React.useState<Announcement[]>([]);
  const [events, setEvents] = React.useState<ClubEvent[]>([]);
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [rsvpsList, setRsvpsList] = React.useState<any[]>([]);
  const [inquiries, setInquiries] = React.useState<any[]>([]);
  const [achievements, setAchievements] = React.useState<Achievement[]>([]);

  // Form states
  const [newAchForm, setNewAchForm] = React.useState({
    title: '',
    description: '',
    category: 'Achievement' as 'Achievement' | 'Photo Moment',
    date: getTodayDateString(),
    image: ''
  });

  // Firestore Real-time Subscriptions & Initial Auto-Seeding
  React.useEffect(() => {
    // 1. Members
    const unsubMembers = onSnapshot(collection(db, 'student_profiles'), async (snap) => {
      if (snap.empty) {
        setMembers([]);
      } else {
        const list: ClubMember[] = [];
        snap.forEach((doc) => {
          const data = doc.data();
          list.push({
            id: doc.id,
            ...data,
            firstName: data.firstName || data.fullName?.split(' ')[0] || 'Member',
            lastName: data.lastName || data.fullName?.split(' ').slice(1).join(' ') || '',
            role: data.role || data.designation || 'General Member',
            picture: data.picture || data.profilePhoto || '',
            activeCohort: data.activeCohort || data.cohort || '22-23',
            registeredAt: data.registeredAt || data.createdAt?.split('T')[0] || '2026-06-14'
          } as any);
        });
        setMembers(list);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'student_profiles');
    });

    // 2. Announcements / Notices
    const unsubNotices = onSnapshot(collection(db, 'announcements'), async (snap) => {
      if (snap.empty) {
        setNotices([]);
      } else {
        const list: Announcement[] = [];
        snap.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as Announcement);
        });
        setNotices(list);
      }
    });

    // 3. Events
    const unsubEvents = onSnapshot(collection(db, 'events'), async (snap) => {
      if (snap.empty) {
        setEvents([]);
      } else {
        const list: ClubEvent[] = [];
        snap.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as ClubEvent);
        });
        setEvents(list);
      }
    });

    // 4. Projects
    const unsubProjects = onSnapshot(collection(db, 'projects'), async (snap) => {
      if (snap.empty) {
        setProjects([]);
      } else {
        const list: Project[] = [];
        snap.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as Project);
        });
        setProjects(list);
      }
    });

    // 5. RSVPs logging records
    const unsubRsvps = onSnapshot(collection(db, 'rsvps'), (snap) => {
      const list: any[] = [];
      snap.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      setRsvpsList(list);
    });

    // 6. Contact Inquiries
    const unsubInquiries = onSnapshot(collection(db, 'inquiries'), async (snap) => {
      if (snap.empty) {
        setInquiries([]);
      } else {
        const list: any[] = [];
        snap.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        setInquiries(list);
      }
    });

    // 7. Achievements
    const unsubAchievements = onSnapshot(collection(db, 'achievements'), (snap) => {
      if (snap.empty) {
        setAchievements([]);
      } else {
        const list: Achievement[] = [];
        snap.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as Achievement);
        });
        list.sort((a, b) => {
          const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return timeB - timeA;
        });
        setAchievements(list);
      }
    });

    return () => {
      unsubMembers();
      unsubNotices();
      unsubEvents();
      unsubProjects();
      unsubRsvps();
      unsubInquiries();
      unsubAchievements();
    };
  }, []);

  // Form states
  const [memberSubTab, setMemberSubTab] = React.useState<'registry' | 'committee'>('registry');

  const handleAssignCommittee = async (chapter: 'GSTU' | 'BSMRSTU', role: string, selectedEmail: string) => {
    if (!selectedEmail) {
      setToast({ type: 'error', message: 'Please select a member to assign!' });
      return;
    }
    
    // Find previously assigned members with that exact role from all users
    const previousOfficeHolders = members.filter(m => {
      const roleMatch = (m.role || '').toLowerCase() === role.toLowerCase();
      return roleMatch && m.email !== selectedEmail;
    });

    const newOfficer = members.find(m => m.email === selectedEmail);
    if (!newOfficer) return;

    try {
      // 1. Demote previous holders to 'General Member'
      for (const holder of previousOfficeHolders) {
        const hId = holder.id || holder.email.replace(/\./g, '_');
        const { id, ...holderData } = holder;
        await setDoc(doc(db, 'student_profiles', hId), {
          ...holderData,
          role: 'General Member',
          designation: 'General Member'
        }, { merge: true });
      }

      // 2. Promote the new selection
      const oId = newOfficer.id || newOfficer.email.replace(/\./g, '_');
      const { id, ...officerData } = newOfficer;
      
      let updatedPicture = officerData.picture || '';

      await setDoc(doc(db, 'student_profiles', oId), {
        ...officerData,
        role: role,
        designation: role,
        picture: updatedPicture || null,
        profilePhoto: updatedPicture || null
      }, { merge: true });

      setToast({ type: 'success', message: `${newOfficer.firstName} assigned as ${role} for ${chapter}!` });
      setTimeout(() => setToast(null), 3000);

    } catch (err) {
      setToast({ type: 'error', message: `Failed to assign office: ${err instanceof Error ? err.message : String(err)}` });
      setTimeout(() => setToast(null), 5000);
    }
  };

  const [inquiryStatusTab, setInquiryStatusTab] = React.useState<'all' | 'unread' | 'read'>('all');
  const [inquiryChapterFilter, setInquiryChapterFilter] = React.useState<'ALL' | 'GSTU' | 'BSMRSTU'>('ALL');

  const filteredInquiries = inquiries.filter(inq => {
    if (inquiryStatusTab === 'unread' && inq.isRead) return false;
    if (inquiryStatusTab === 'read' && !inq.isRead) return false;
    if (inquiryChapterFilter !== 'ALL' && inq.chapter !== inquiryChapterFilter) return false;
    return true;
  });

  const [memberSearchQuery, setMemberSearchQuery] = React.useState('');
  const [memberRoleFilter, setMemberRoleFilter] = React.useState('ALL');
  const [memberCohortFilter, setMemberCohortFilter] = React.useState('ALL');

  const filteredMembers = members.filter(m => {
    // Exclude administrators from the Student Profiles Registry
    const allowedAdmins = ['cheemsakib@gmail.com', 'shakib@gstu.edu.bd', 'admin@gstu.edu.bd'];
    if (allowedAdmins.includes(m.email.toLowerCase())) {
      return false;
    }

    const q = memberSearchQuery.toLowerCase().trim();
    if (q) {
      const name = `${m.firstName} ${m.lastName || ''}`.toLowerCase();
      const email = m.email.toLowerCase();
      if (!name.includes(q) && !email.includes(q)) return false;
    }
    if (memberRoleFilter !== 'ALL') {
      const role = (m.role || 'General Member').toLowerCase();
      if (role !== memberRoleFilter.toLowerCase()) return false;
    }
    if (memberCohortFilter !== 'ALL') {
      const cohort = (m.activeCohort || m.cohort || 'Fall 2024').toLowerCase();
      if (cohort !== memberCohortFilter.toLowerCase()) return false;
    }
    return true;
  });

  const [newMemberForm, setNewMemberForm] = React.useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'General Member',
    cohort: '22-23',
    picture: ''
  });

  const [newExecutiveForm, setNewExecutiveForm] = React.useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'Executive Committee',
    cohort: '22-23',
    picture: ''
  });

  const [toast, setToast] = React.useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Dynamic notification state for special executive selection
  const [executiveAlert, setExecutiveAlert] = React.useState<{ show: boolean; msg: string; memberName: string } | null>(null);

  const [newNoticeForm, setNewNoticeForm] = React.useState({
    title: '',
    description: '',
    category: 'General' as Announcement['category'],
    tag: 'Notice',
    isUrgent: false
  });

  const [newEventForm, setNewEventForm] = React.useState({
    title: '',
    description: '',
    category: 'Workshop' as ClubEvent['category'],
    tag: 'Hands-on',
    date: getTodayDateString(),
    time: '11:00 AM',
    location: 'Lab 402, CSE Dept.',
    isFeatured: false
  });

  const [newProjectForm, setNewProjectForm] = React.useState({
    title: '',
    description: '',
    tagsString: 'React, Tailwind',
    githubUrl: 'https://github.com/gstu-dev/',
    liveUrl: '#',
    version: 'v1.0.0',
    isFeatured: false
  });

  // Custom delete modal confirmation state
  const [deleteTarget, setDeleteTarget] = React.useState<{
    type: 'member' | 'announcement' | 'event' | 'project' | 'inquiry';
    id: string;
    label: string;
  } | null>(null);

  // Selected Member for detailed Document Inspection and Edit
  const [selectedMember, setSelectedMember] = React.useState<any | null>(null);
  const [isEditingInspector, setIsEditingInspector] = React.useState(false);
  const [inspectorEditForm, setInspectorEditForm] = React.useState({
    firstName: '',
    lastName: '',
    role: '',
    activeCohort: '',
    password: ''
  });
  const [showInspectorPassword, setShowInspectorPassword] = React.useState(false);

  const handleUpdateInspectorProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return;
    
    const docId = selectedMember.id || selectedMember.email.replace(/\./g, '_');
    const { id, ...originalData } = selectedMember;
    
    const updatedData = {
      ...originalData,
      firstName: inspectorEditForm.firstName.trim(),
      lastName: inspectorEditForm.lastName.trim(),
      role: inspectorEditForm.role,
      activeCohort: inspectorEditForm.activeCohort.trim(),
      uid: originalData.uid || docId,
      fullName: `${inspectorEditForm.firstName.trim()} ${inspectorEditForm.lastName.trim()}`.trim(),
      profilePhoto: originalData.profilePhoto || originalData.picture || '',
      designation: inspectorEditForm.role,
      cohort: inspectorEditForm.activeCohort.trim(),
      createdAt: originalData.createdAt || new Date().toISOString()
    } as any;

    if (inspectorEditForm.password) {
      updatedData.password = inspectorEditForm.password.trim();
    }
    
    try {
      await setDoc(doc(db, 'student_profiles', docId), updatedData);
      setSelectedMember({ id: docId, ...updatedData });
      setIsEditingInspector(false);
      setToast({ type: 'success', message: 'Student profile updated successfully in Firestore!' });
      setTimeout(() => setToast(null), 3000);
    } catch (err: any) {
      setToast({ type: 'error', message: `Update failed: ${err instanceof Error ? err.message : String(err)}` });
      setTimeout(() => setToast(null), 4000);
      handleFirestoreError(err, OperationType.WRITE, `student_profiles/${docId}`);
    }
  };

  const handleExportMembers = () => {
    try {
      const dataStr = JSON.stringify(members, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `dev_club_members_database_export_${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      setToast({ type: 'success', message: 'User profiles database exported successfully!' });
      setTimeout(() => setToast(null), 3050);
    } catch (err: any) {
      setToast({ type: 'error', message: `Export failed: ${err instanceof Error ? err.message : String(err)}` });
      setTimeout(() => setToast(null), 3050);
    }
  };

  const handleExportInquiries = () => {
    try {
      const dataStr = JSON.stringify(inquiries, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `dev_club_contact_inquiries_database_export_${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      setToast({ type: 'success', message: 'Inbound Inquiries database exported successfully!' });
      setTimeout(() => setToast(null), 3050);
    } catch (err: any) {
      setToast({ type: 'error', message: `Export failed: ${err instanceof Error ? err.message : String(err)}` });
      setTimeout(() => setToast(null), 3050);
    }
  };

  // Helper functions
  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberForm.firstName || !newMemberForm.email) return;
    const email = newMemberForm.email.trim();
    const safeId = email.replace(/\./g, '_');
    
    const added: any = {
      uid: safeId,
      fullName: `${newMemberForm.firstName.trim()} ${newMemberForm.lastName.trim() || 'Student'}`.trim(),
      firstName: newMemberForm.firstName.trim(),
      lastName: newMemberForm.lastName.trim() || 'Student',
      email: email,
      isRegistered: true,
      registeredAt: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      activeCohort: newMemberForm.cohort.trim(),
      cohort: newMemberForm.cohort.trim(),
      role: 'General Member',
      designation: 'General Member',
      profilePhoto: newMemberForm.picture?.trim() || '',
      picture: newMemberForm.picture?.trim() || ''
    };

    try {
      await setDoc(doc(db, 'student_profiles', safeId), added);
      setNewMemberForm({ firstName: '', lastName: '', email: '', role: 'General Member', cohort: '22-23', picture: '' });
      setToast({ type: 'success', message: 'Student registered in registry successfully!' });
      setTimeout(() => setToast(null), 4000);
    } catch (err) {
      setToast({ type: 'error', message: `Member registration failed: ${err instanceof Error ? err.message : String(err)}` });
      setTimeout(() => setToast(null), 5000);
      handleFirestoreError(err, OperationType.WRITE, `student_profiles/${safeId}`);
    }
  };

  const handleAddExecutive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExecutiveForm.firstName || !newExecutiveForm.email) return;
    const email = newExecutiveForm.email.trim();
    const safeId = email.replace(/\./g, '_');
    
    const added: any = {
      uid: safeId,
      fullName: `${newExecutiveForm.firstName.trim()} ${newExecutiveForm.lastName.trim() || 'Student'}`.trim(),
      firstName: newExecutiveForm.firstName.trim(),
      lastName: newExecutiveForm.lastName.trim() || 'Student',
      email: email,
      isRegistered: true,
      registeredAt: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      activeCohort: newExecutiveForm.cohort.trim(),
      cohort: newExecutiveForm.cohort.trim(),
      role: newExecutiveForm.role,
      designation: newExecutiveForm.role,
      profilePhoto: newExecutiveForm.picture?.trim() || '',
      picture: newExecutiveForm.picture?.trim() || ''
    };

    try {
      await setDoc(doc(db, 'student_profiles', safeId), added);
      setNewExecutiveForm({ firstName: '', lastName: '', email: '', role: 'Executive Committee', cohort: '22-23', picture: '' });
      setToast({ type: 'success', message: `Executive member registered successfully!` });
      setTimeout(() => setToast(null), 4000);
    } catch (err) {
      setToast({ type: 'error', message: `Executive registration failed: ${err instanceof Error ? err.message : String(err)}` });
      setTimeout(() => setToast(null), 5000);
      handleFirestoreError(err, OperationType.WRITE, `student_profiles/${safeId}`);
    }
  };

  const handleDeleteMember = async (email: string) => {
    const member = members.find(m => m.email === email);
    const displayName = member ? `${member.firstName} ${member.lastName || ''}` : email;
    setDeleteTarget({
      type: 'member',
      id: email,
      label: `Student Member: ${displayName} (${email})`
    });
  };

  // Change member designation
  const handleRoleChange = async (email: string, newRole: string) => {
    const existing = members.find(m => m.email === email);
    if (!existing) return;
    const docId = existing.id || email.replace(/\./g, '_');

    const { id, ...dataToSave } = existing;
    try {
      await setDoc(doc(db, 'student_profiles', docId), {
        ...dataToSave,
        role: newRole,
        designation: newRole
      }, { merge: true });

      setExecutiveAlert({
        show: true,
        memberName: `${existing.firstName} ${existing.lastName || ''}`,
        msg: `Designation set to ${newRole} successfully!`
      });
      setTimeout(() => setExecutiveAlert(null), 4500);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `student_profiles/${docId}`);
    }
  };

  // Upload picture for a member (using FileReader - base64 encoding database injection)
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, email: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10000000) {
      setToast({ type: 'error', message: 'Image size is too large. Please select a file under 10MB.' });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      const existing = members.find(m => m.email === email);
      if (!existing) return;
      const docId = existing.id || email.replace(/\./g, '_');

      const { id, ...dataToSave } = existing;
      try {
        await setDoc(doc(db, 'student_profiles', docId), {
          ...dataToSave,
          picture: base64String,
          profilePhoto: base64String
        }, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `student_profiles/${docId}`);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoticeForm.title) return;
    const docId = `notice-${Date.now()}`;
    const added: Announcement = {
      id: docId,
      category: newNoticeForm.category,
      tag: newNoticeForm.tag,
      title: newNoticeForm.title,
      description: newNoticeForm.description,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      isUrgent: newNoticeForm.isUrgent,
      actionLabel: 'Details'
    };

    try {
      await setDoc(doc(db, 'announcements', docId), added);
      setNewNoticeForm({ title: '', description: '', category: 'General', tag: 'Notice', isUrgent: false });
      setToast({ type: 'success', message: 'Notice broadcasted successfully!' });
      setTimeout(() => setToast(null), 4000);
    } catch (err) {
      setToast({ type: 'error', message: `Notice broadcast failed: ${err instanceof Error ? err.message : String(err)}` });
      setTimeout(() => setToast(null), 5000);
      handleFirestoreError(err, OperationType.WRITE, `announcements/${docId}`);
    }
  };

  const handleDeleteNotice = async (id: string) => {
    const noticeObj = notices.find(n => n.id === id);
    const titleText = noticeObj ? noticeObj.title : id;
    setDeleteTarget({
      type: 'announcement',
      id,
      label: `Announcement: "${titleText.slice(0, 45)}${titleText.length > 45 ? '...' : ''}"`
    });
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventForm.title) return;
    const docId = `event-${Date.now()}`;
    
    // Format YYYY-MM-DD input date to user-friendly "MMM DD, YYYY"
    const formattedDate = (() => {
      if (!newEventForm.date) return '';
      const parts = newEventForm.date.split('-');
      if (parts.length === 3) {
        const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        if (!isNaN(d.getTime())) {
          return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        }
      }
      return newEventForm.date;
    })();

    const added: ClubEvent = {
      id: docId,
      category: newEventForm.category,
      tag: newEventForm.tag,
      title: newEventForm.title,
      description: newEventForm.description,
      date: formattedDate,
      time: newEventForm.time,
      location: newEventForm.location,
      image: images.event_genai,
      isFeatured: newEventForm.isFeatured
    };

    try {
      await setDoc(doc(db, 'events', docId), added);
      setNewEventForm({
        title: '',
        description: '',
        category: 'Workshop',
        tag: 'Hands-on',
        date: getTodayDateString(),
        time: '11:00 AM',
        location: 'Lab 402, CSE Dept.',
        isFeatured: false
      });
      setToast({ type: 'success', message: 'Club event published successfully!' });
      setTimeout(() => setToast(null), 4000);
    } catch (err) {
      setToast({ type: 'error', message: `Event publishing failed: ${err instanceof Error ? err.message : String(err)}` });
      setTimeout(() => setToast(null), 5000);
      handleFirestoreError(err, OperationType.WRITE, `events/${docId}`);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    const eventObj = events.find(e => e.id === id);
    const titleText = eventObj ? eventObj.title : id;
    setDeleteTarget({
      type: 'event',
      id,
      label: `Institutional Event: "${titleText.slice(0, 45)}${titleText.length > 45 ? '...' : ''}"`
    });
  };

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectForm.title) return;
    const docId = `project-${Date.now()}`;
    const added: Project = {
      id: docId,
      title: newProjectForm.title,
      description: newProjectForm.description,
      tags: newProjectForm.tagsString.split(',').map(s => s.trim()).filter(Boolean),
      githubUrl: newProjectForm.githubUrl,
      liveUrl: newProjectForm.liveUrl,
      version: newProjectForm.version,
      image: images.project_cms,
      isFeatured: newProjectForm.isFeatured
    };

    try {
      await setDoc(doc(db, 'projects', docId), added);
      setNewProjectForm({
        title: '',
        description: '',
        tagsString: 'React, Tailwind',
        githubUrl: 'https://github.com/gstu-dev/',
        liveUrl: '#',
        version: 'v1.0.0',
        isFeatured: false
      });
      setToast({ type: 'success', message: 'Project spotlighted successfully!' });
      setTimeout(() => setToast(null), 4000);
    } catch (err) {
      setToast({ type: 'error', message: `Project spotlight failed: ${err instanceof Error ? err.message : String(err)}` });
      setTimeout(() => setToast(null), 5000);
      handleFirestoreError(err, OperationType.WRITE, `projects/${docId}`);
    }
  };

  const handleDeleteProject = async (id: string) => {
    const projObj = projects.find(p => p.id === id);
    const titleText = projObj ? projObj.title : id;
    setDeleteTarget({
      type: 'project',
      id,
      label: `Spotlight Project: "${titleText.slice(0, 45)}${titleText.length > 45 ? '...' : ''}"`
    });
  };

  const confirmAndExecuteDelete = async () => {
    if (!deleteTarget) return;
    const { type, id } = deleteTarget;
    setDeleteTarget(null);

    if (type === 'member') {
      const existing = members.find(m => m.email === id || m.id === id);
      const docId = existing?.id || id.replace(/\./g, '_');
      try {
        await deleteDoc(doc(db, 'student_profiles', docId));
        setToast({ type: 'success', message: 'Student profile deleted from registry.' });
        setTimeout(() => setToast(null), 4000);
      } catch (err) {
        setToast({ type: 'error', message: `Delete failed: ${err instanceof Error ? err.message : String(err)}` });
        setTimeout(() => setToast(null), 5000);
        handleFirestoreError(err, OperationType.DELETE, `student_profiles/${docId}`);
      }
    } else if (type === 'announcement') {
      try {
        await deleteDoc(doc(db, 'announcements', id));
        setToast({ type: 'success', message: 'Notice removed successfully.' });
        setTimeout(() => setToast(null), 4000);
      } catch (err) {
        setToast({ type: 'error', message: `Delete failed: ${err instanceof Error ? err.message : String(err)}` });
        setTimeout(() => setToast(null), 5000);
        handleFirestoreError(err, OperationType.DELETE, `announcements/${id}`);
      }
    } else if (type === 'event') {
      try {
        await deleteDoc(doc(db, 'events', id));
        setToast({ type: 'success', message: 'Event listing deleted.' });
        setTimeout(() => setToast(null), 4000);
      } catch (err) {
        setToast({ type: 'error', message: `Delete failed: ${err instanceof Error ? err.message : String(err)}` });
        setTimeout(() => setToast(null), 5000);
        handleFirestoreError(err, OperationType.DELETE, `events/${id}`);
      }
    } else if (type === 'project') {
      try {
        await deleteDoc(doc(db, 'projects', id));
        setToast({ type: 'success', message: 'Project deleted successfully.' });
        setTimeout(() => setToast(null), 4000);
      } catch (err) {
        setToast({ type: 'error', message: `Delete failed: ${err instanceof Error ? err.message : String(err)}` });
        setTimeout(() => setToast(null), 5000);
        handleFirestoreError(err, OperationType.DELETE, `projects/${id}`);
      }
    } else if (type === 'inquiry') {
      try {
        await deleteDoc(doc(db, 'inquiries', id));
        setToast({ type: 'success', message: 'Inquiry message deleted completely from the system.' });
        setTimeout(() => setToast(null), 4000);
      } catch (err) {
        setToast({ type: 'error', message: `Delete failed: ${err instanceof Error ? err.message : String(err)}` });
        setTimeout(() => setToast(null), 5000);
        handleFirestoreError(err, OperationType.DELETE, `inquiries/${id}`);
      }
    } else if (type === 'achievement') {
      try {
        await deleteDoc(doc(db, 'achievements', id));
        setToast({ type: 'success', message: 'Achievement/Moment removed successfully.' });
        setTimeout(() => setToast(null), 4000);
      } catch (err) {
        setToast({ type: 'error', message: `Delete failed: ${err instanceof Error ? err.message : String(err)}` });
        setTimeout(() => setToast(null), 5000);
        handleFirestoreError(err, OperationType.DELETE, `achievements/${id}`);
      }
    }
  };

  const handleDeleteInquiry = (id: string) => {
    const inq = inquiries.find(q => q.id === id);
    const sub = inq ? inq.subject : id;
    setDeleteTarget({
      type: 'inquiry',
      id,
      label: `Contact Inquiry: "${sub.slice(0, 45)}${sub.length > 45 ? '...' : ''}"`
    });
  };

  const handleToggleReadInquiry = async (id: string, currentRead: boolean) => {
    try {
      await setDoc(doc(db, 'inquiries', id), { isRead: !currentRead }, { merge: true });
      setToast({ type: 'success', message: currentRead ? 'Marked inquiry as unread.' : 'Marked inquiry as read.' });
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      setToast({ type: 'error', message: `Update failed: ${err instanceof Error ? err.message : String(err)}` });
      setTimeout(() => setToast(null), 4005);
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10000000) {
        setToast({ type: 'error', message: 'Image size is too large. Please select a file under 10MB.' });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewAchForm(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddAchievement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAchForm.title.trim() || !newAchForm.description.trim() || !newAchForm.date) {
      setToast({ type: 'error', message: 'Please provide Title, Description, and Date!' });
      return;
    }

    const docId = `ach-${Date.now()}`;
    const formattedDate = (() => {
      const parts = newAchForm.date.split('-');
      if (parts.length === 3) {
        const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        if (!isNaN(d.getTime())) {
          return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        }
      }
      return newAchForm.date;
    })();

    const payload: Achievement = {
      id: docId,
      title: newAchForm.title.trim(),
      description: newAchForm.description.trim(),
      category: newAchForm.category,
      date: formattedDate,
      image: newAchForm.image || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=600',
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'achievements', docId), payload);
      setToast({ type: 'success', message: 'Successfully published achievement item!' });
      setNewAchForm({
        title: '',
        description: '',
        category: 'Achievement',
        date: getTodayDateString(),
        image: ''
      });
      const fileInput = document.getElementById('achFile') as HTMLInputElement | null;
      if (fileInput) fileInput.value = '';
    } catch (err) {
      setToast({ type: 'error', message: `Failed to save achievement: ${err instanceof Error ? err.message : String(err)}` });
      handleFirestoreError(err, OperationType.WRITE, `achievements/${docId}`);
    }
  };

  const handleDeleteAchievement = (id: string) => {
    const ach = achievements.find(a => a.id === id);
    const sub = ach ? ach.title : id;
    setDeleteTarget({
      type: 'achievement',
      id,
      label: `Achievement/Moment: "${sub.slice(0, 45)}${sub.length > 45 ? '...' : ''}"`
    });
  };

  return (
    <div className="font-sans bg-transparent min-h-screen py-8 sm:py-12 text-slate-800 dark:text-slate-200 transition-colors duration-300">
      {/* Toast Alert Notifications */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-lg border flex items-center space-x-3 text-xs font-semibold animate-fade-in ${
          toast.type === 'success' 
            ? 'bg-emerald-50 dark:bg-slate-900 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-350 shadow-emerald-100/50 dark:shadow-none' 
            : 'bg-rose-50 dark:bg-slate-900 border-rose-300 dark:border-rose-900 text-rose-900 dark:text-rose-350 shadow-rose-100/50 dark:shadow-none'
        }`}>
          <div className={`w-2 h-2 rounded-full ${toast.type === 'success' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
          <div className="max-w-xs">{toast.message}</div>
          <button onClick={() => setToast(null)} className="hover:opacity-75 pl-2">
            <X className="w-3.5 h-3.5 text-slate-400 hover:text-slate-200" />
          </button>
        </div>
      )}

      {/* Admin Profile Modal */}
      {showAdminProfile && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl w-full max-w-sm overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col relative">
            <button 
                onClick={() => setShowAdminProfile(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1 rounded-lg bg-slate-100 dark:bg-slate-800"
              >
                <X className="w-4 h-4" />
            </button>
            <div className="p-6 space-y-5 text-sm text-slate-600 dark:text-slate-300 mt-2">
                <div className="flex flex-col items-center justify-center space-y-3 pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 border-2 border-emerald-500 shadow-inner">
                    <Shield className="w-10 h-10" />
                  </div>
                  <div className="text-center">
                    <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">Admin Details</h3>
                    <span className="inline-block mt-1 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Super Administrator</span>
                  </div>
                </div>
                
                <div className="space-y-3 pt-2 text-xs">
                  <div className="flex flex-col space-y-1">
                    <strong className="text-[10px] uppercase font-mono text-slate-400 dark:text-slate-500">Name</strong>
                    <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">MD Shakib Hossen</span>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <strong className="text-[10px] uppercase font-mono text-slate-400 dark:text-slate-500">Email Address</strong>
                    <span className="font-bold font-mono text-slate-800 dark:text-slate-100">cheemsakib@gmail.com</span>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <strong className="text-[10px] uppercase font-mono text-slate-400 dark:text-slate-500">Official Title</strong>
                    <span className="font-bold text-slate-800 dark:text-slate-100">System Admin</span>
                  </div>
                </div>
            </div>
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40">
              <button onClick={() => setShowAdminProfile(false)} className="w-full py-2.5 bg-slate-900 dark:bg-slate-800 text-white dark:text-white rounded-xl text-xs font-bold hover:bg-slate-800 dark:hover:bg-slate-700 transition cursor-pointer shadow-sm">
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Reactive Confirmation Delete Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-slide-up transform transition-all">
            <div className="flex items-center space-x-3 text-red-600 dark:text-red-400">
              <div className="p-2 bg-red-50 dark:bg-slate-950 rounded-lg">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold font-display text-slate-900 dark:text-white">Confirm Permanent Removal</h3>
            </div>
            
            <div className="space-y-2 text-xs">
              <p className="text-slate-550 dark:text-slate-400 leading-relaxed font-medium">Are you sure you want to delete this resource? Access links and database relationships will be permanently removed. This action cannot be undone.</p>
              <div className="bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 p-3 rounded-lg font-mono font-bold text-[11px] text-slate-800 dark:text-slate-200 break-all">
                {deleteTarget.label}
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 text-xs font-mono font-bold uppercase tracking-wider">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 border border-slate-205 dark:border-slate-700 rounded-lg text-slate-705 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-955 dark:hover:text-white transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmAndExecuteDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all active:scale-95 cursor-pointer shadow-md"
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Firestore Document Inspector Modal */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in text-slate-850 dark:text-slate-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-slide-up transform transition-all relative">
            
            {/* Close trigger */}
            <button 
              onClick={() => { setSelectedMember(null); setIsEditingInspector(false); }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-605 dark:hover:text-slate-200 cursor-pointer p-1"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Title / Header badge */}
            <div className="flex items-center space-x-3 text-emerald-600 dark:text-emerald-450 pb-3 border-b border-slate-100 dark:border-slate-805">
              <div className="p-2 bg-emerald-50 dark:bg-emerald-950/50 rounded-lg">
                <Users className="w-6 h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-bold font-display text-slate-905 dark:text-white">Firestore Account Inspector</h3>
                <p className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest truncate">Doc Ref: members/{selectedMember.id || selectedMember.email.replace(/\./g, '_')}</p>
              </div>
            </div>

            {isEditingInspector ? (
              /* EDITOR VIEW */
              <form onSubmit={handleUpdateInspectorProfile} className="space-y-4 text-xs text-slate-800 dark:text-slate-100">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 font-mono pb-1">First Name</label>
                    <input 
                      type="text" 
                      required
                      value={inspectorEditForm.firstName}
                      onChange={(e) => setInspectorEditForm({ ...inspectorEditForm, firstName: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:border-emerald-500 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 font-mono pb-1">Last Name</label>
                    <input 
                      type="text" 
                      value={inspectorEditForm.lastName}
                      onChange={(e) => setInspectorEditForm({ ...inspectorEditForm, lastName: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:border-emerald-500 font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 font-mono pb-1">Academic Session</label>
                    <select
                      required
                      value={inspectorEditForm.activeCohort}
                      onChange={(e) => setInspectorEditForm({ ...inspectorEditForm, activeCohort: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:border-emerald-500 font-semibold cursor-pointer"
                    >
                      <option value="21-22">21-22</option>
                      <option value="22-23">22-23</option>
                      <option value="23-24">23-24</option>
                      <option value="24-25">24-25</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 font-mono pb-1">Account Password</label>
                  <input 
                    type="text" 
                    placeholder="Account passphrase"
                    value={inspectorEditForm.password}
                    onChange={(e) => setInspectorEditForm({ ...inspectorEditForm, password: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:border-emerald-500 font-mono font-bold"
                  />
                </div>

                <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100 dark:border-slate-800 text-[10px] font-mono font-bold uppercase tracking-wider">
                  <button
                    type="button"
                    onClick={() => setIsEditingInspector(false)}
                    className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-505 dark:text-slate-400 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all cursor-pointer shadow-md"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              /* INSPECT READ VIEW */
              <div className="space-y-4 text-slate-800 dark:text-slate-200">
                {/* Visual Bio Box */}
                <div className="flex items-center space-x-4 p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-150 dark:border-slate-850">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-slate-200 dark:border-slate-800 bg-slate-105 dark:bg-slate-800 shrink-0 relative flex items-center justify-center shadow-sm">
                    {selectedMember.picture ? (
                      <img src={selectedMember.picture} referrerPolicy="no-referrer" alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-extrabold flex items-center justify-center text-xl">
                        {selectedMember.firstName[0]}{selectedMember.lastName ? selectedMember.lastName[0] : ''}
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                      <span className="font-extrabold text-slate-909 dark:text-white text-base leading-none">
                        {selectedMember.firstName} {selectedMember.lastName}
                      </span>
                      <span className="bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-400 font-mono font-bold text-[9px] px-1.5 py-0.5 rounded border border-emerald-255 dark:border-emerald-900 uppercase">
                        {selectedMember.role || 'General Member'}
                      </span>
                    </div>
                    <p className="text-xs font-mono font-semibold text-slate-400 dark:text-slate-500 truncate">{selectedMember.email}</p>
                    <p className="text-[10px] text-slate-450 dark:text-slate-400 font-semibold font-mono">Date Joined: {selectedMember.registeredAt || 'Prior Session'}</p>
                  </div>
                </div>

                {/* Ledger Block */}
                <div className="p-3 bg-slate-50 dark:bg-slate-950/20 border border-slate-150 dark:border-slate-850 rounded-xl space-y-1 text-xs font-semibold font-display">
                  <span className="block text-[9px] uppercase font-bold text-slate-400 dark:text-slate-500 font-mono tracking-wider">Academic Session</span>
                  <span className="text-slate-800 dark:text-slate-200 text-xs font-mono font-extrabold">
                    {selectedMember.activeCohort || 'Not Assigned'}
                  </span>
                </div>

                {/* Plaintext Passphrase Trace */}
                <div className="p-3 bg-slate-50 dark:bg-slate-950/20 border border-slate-150 dark:border-slate-850 rounded-xl flex items-center justify-between text-xs font-semibold">
                  <div className="space-y-1">
                    <span className="block text-[9px] uppercase font-bold text-slate-400 dark:text-slate-500 font-mono tracking-wider">Credentials Trace</span>
                    <span className="font-mono text-slate-850 dark:text-slate-200 block tracking-wide">
                      {selectedMember.password ? (
                        showInspectorPassword ? (
                          <span className="bg-amber-100/50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-300 font-bold px-2 py-0.5 rounded-md font-mono border border-amber-205 dark:border-amber-900/50">
                            {selectedMember.password}
                          </span>
                        ) : (
                          <span>••••••••••••</span>
                        )
                      ) : (
                        <span className="text-slate-400 dark:text-slate-550 font-medium italic">Managed via Secure OAuth Single Sign-on</span>
                      )}
                    </span>
                  </div>

                  {selectedMember.password && (
                    <button 
                      type="button"
                      onClick={() => setShowInspectorPassword(!showInspectorPassword)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center cursor-pointer"
                      title={showInspectorPassword ? "Hide password" : "Reveal password"}
                    >
                      {showInspectorPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>

                {/* Operations Toolbar */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 text-[10px] font-mono font-bold uppercase tracking-wider gap-2">
                  <button
                    onClick={() => {
                      const dataStr = JSON.stringify(selectedMember, null, 2);
                      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
                      const exportName = `member_profile_${selectedMember.email.replace(/\./g, '_')}_export.json`;
                      const linkEl = document.createElement('a');
                      linkEl.setAttribute('href', dataUri);
                      linkEl.setAttribute('download', exportName);
                      linkEl.click();
                    }}
                    className="px-3 py-1.5 border border-slate-200 dark:border-slate-705 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-750 transition-colors cursor-pointer text-center"
                  >
                    Export Member JSON
                  </button>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setInspectorEditForm({
                          firstName: selectedMember.firstName,
                          lastName: selectedMember.lastName || '',
                          role: selectedMember.role || 'General Member',
                          activeCohort: selectedMember.activeCohort || '22-23',
                          password: selectedMember.password || ''
                        });
                        setIsEditingInspector(true);
                      }}
                      className="px-4 py-1.5 bg-black dark:bg-slate-800 text-white rounded-xl hover:opacity-90 active:scale-95 transition-all cursor-pointer font-extrabold"
                    >
                      Edit Account
                    </button>
                    <button
                      onClick={() => {
                        const memberEmail = selectedMember.email;
                        setSelectedMember(null);
                        handleDeleteMember(memberEmail);
                      }}
                      className="px-3 py-1.5 border border-red-200 text-red-650 dark:border-red-950/45 dark:text-red-400 bg-red-50/10 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-705 transition-colors cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* HEADER AREA */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="space-y-1 text-center md:text-left">
            <div className="inline-flex items-center space-x-1.5 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-205 dark:border-rose-900 px-3 py-1 rounded-full text-[10px] font-bold font-mono tracking-wider uppercase mb-1">
              <Shield className="w-3 h-3 text-rose-600 dark:text-rose-450" />
              <span>Administrative Authorization Granted</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 dark:text-white tracking-tight">
              Platform Admin Center
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Oversee the club database, orchestrate workshop calendars, review projects, and post urgent syllabus alerts.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowAdminProfile(true)}
              className="px-4 py-2 bg-emerald-100 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-bold shadow-sm hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition cursor-pointer flex items-center space-x-2"
            >
              <Shield className="w-4 h-4" />
              <span>Admin Details</span>
            </button>
          </div>

          {/* Quick tab pills */}
          <div className="flex flex-wrap gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
            {[
              { id: 'overview', label: 'Overview', icon: TrendingUp },
              { id: 'members', label: 'Members', icon: Users },
              { id: 'announcements', label: 'Notices', icon: Megaphone },
              { id: 'events', label: 'Events', icon: CalendarIcon },
              { id: 'projects', label: 'Projects', icon: Briefcase },
              { id: 'achievements', label: 'Achievements', icon: Trophy },
              { id: 'inquiries', label: 'Inquiries', icon: Mail, badge: inquiries.filter(q => !q.isRead).length },
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer relative ${
                    activeTab === tab.id 
                      ? 'bg-black dark:bg-slate-800 text-white shadow' 
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && tab.badge > 0 ? (
                    <span className="flex items-center justify-center h-4 bg-red-500 text-[9px] text-white px-1 font-mono rounded-full leading-none font-extrabold min-w-[16px]">
                      {tab.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        {/* Executive Committee Designation Auto-Update Feedback Alert Banner */}
        {executiveAlert && (
          <div className="bg-amber-50 dark:bg-amber-950/30 border-l-4 border-amber-500 p-4 rounded-xl shadow-sm flex items-start space-x-3 text-amber-900 dark:text-amber-300 animate-fade-in relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 text-amber-500/10 font-bold font-display text-7xl select-none pointer-events-none">EC</div>
            <Sparkles className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs font-bold font-mono uppercase tracking-wider text-amber-700 dark:text-amber-400">Dynamic Executive Upgrade Applied</p>
              <p className="text-xs font-semibold">
                Member <span className="font-bold text-slate-900 dark:text-white">{executiveAlert.memberName}</span> is now upgraded. {executiveAlert.msg}
              </p>
            </div>
          </div>
        )}

        {/* 1. OVERVIEW SCREEN */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fade-in">
            
            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              <div className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 p-6 rounded-2xl shadow-sm flex items-center justify-between">
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase font-mono tracking-wider block">Total Members</span>
                  <span className="text-3xl font-extrabold font-mono text-slate-900 dark:text-white">{members.length}</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <Users className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 p-6 rounded-2xl shadow-sm flex items-center justify-between">
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase font-mono tracking-wider block">Published Notices</span>
                  <span className="text-3xl font-extrabold font-mono text-slate-900 dark:text-white">{notices.length}</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Megaphone className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 p-6 rounded-2xl shadow-sm flex items-center justify-between">
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase font-mono tracking-wider block">Total Events</span>
                  <span className="text-3xl font-extrabold font-mono text-slate-900 dark:text-white">{events.length}</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-100 dark:border-cyan-900 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                  <CalendarIcon className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 p-6 rounded-2xl shadow-sm flex items-center justify-between">
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase font-mono tracking-wider block">Featured Projects</span>
                  <span className="text-3xl font-extrabold font-mono text-slate-900 dark:text-white">
                    {projects.filter(p => p.isFeatured).length} <span className="text-xs font-normal text-slate-400 dark:text-slate-500">/ {projects.length}</span>
                  </span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900 flex items-center justify-center text-amber-500 dark:text-amber-400">
                  <Briefcase className="w-5 h-5" />
                </div>
              </div>

            </div>

            {/* Quick Actions & Recent Queue */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Recent Member Ledger */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="font-bold font-display text-sm text-slate-900 dark:text-white">Recent Student Profiles</h3>
                  <button onClick={() => setActiveTab('members')} className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center space-x-1">
                    <span>Manage All</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                 <div className="space-y-3">
                  {members.slice(0, 3).map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-xl text-xs font-semibold">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 dark:border-slate-850 shrink-0 shadow-sm bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                          {item.picture ? (
                            <img src={item.picture} className="w-full h-full object-cover" alt="" />
                          ) : (
                            <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-450">{item.firstName[0]}</span>
                          )}
                        </div>
                        <div className="space-y-0.5">
                          <p className="font-bold text-slate-900 dark:text-white">{item.firstName} {item.lastName}</p>
                          <p className="text-[10px] font-mono text-slate-400 dark:text-slate-505 font-medium">{item.email}</p>
                        </div>
                      </div>
                      <div className="text-right space-y-1 shrink-0">
                        <span className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 text-[9px] px-2 py-0.5 rounded-full font-bold uppercase">{item.role}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* RSVP Registrations & Live Database Feed */}
              <div className="bg-slate-905 bg-slate-900 text-slate-300 rounded-2xl p-6 shadow-md space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="inline-flex items-center space-x-1.5 bg-white/10 text-white border border-white/10 px-3 py-1 rounded-full text-[9px] font-mono font-bold">
                    <Sparkles className="w-2.5 h-2.5 text-cyan-400" />
                    <span>Real-time RSVP Logs ({rsvpsList.length})</span>
                  </div>
                </div>

                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {rsvpsList.length === 0 ? (
                    <div className="text-center py-8 text-xs text-slate-550 font-mono">
                      No student RSVPs registered yet.
                    </div>
                  ) : (
                    rsvpsList.map((rsvp, idx) => (
                      <div key={idx} className="p-3 bg-white/5 border border-white/15 rounded-xl text-[11px] space-y-1">
                        <div className="flex items-center justify-between font-bold text-white">
                          <span>{rsvp.fullName}</span>
                          <span className="text-[9px] text-cyan-455 font-mono font-normal text-cyan-400">{rsvp.studentId}</span>
                        </div>
                        <p className="text-[10px] text-slate-350 font-medium truncate">Event: {rsvp.eventTitle}</p>
                        <p className="text-[9px] text-slate-450 font-mono">{rsvp.email}</p>
                      </div>
                    ))
                  )}
                </div>

                <div className="pt-4 border-t border-white/5 flex items-center justify-between text-[9px] font-mono text-slate-500">
                  <span>Database: Cloud Firestore</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-505 bg-emerald-500 rounded-full animate-pulse"></span>
                    LIVE SYNC ACTIVE
                  </span>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* 2. MEMBERS DATABASE MODULE */}
        {activeTab === 'members' && (
          <div className="space-y-8 animate-fade-in">
            
            {/* Sub-menu selector tab row */}
            <div className="flex border-b border-slate-200 dark:border-slate-800">
              <button 
                onClick={() => setMemberSubTab('registry')}
                className={`flex items-center space-x-2 py-3 px-6 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                  memberSubTab === 'registry' 
                    ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 font-extrabold' 
                    : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Student Profiles Registry</span>
              </button>
              <button 
                onClick={() => setMemberSubTab('committee')}
                className={`flex items-center space-x-2 py-3 px-6 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                  memberSubTab === 'committee' 
                    ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 font-extrabold' 
                    : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>Executive Committee Assignments</span>
              </button>
            </div>

            {memberSubTab === 'registry' ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Member form */}
              <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <UserPlus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="font-bold font-display text-sm text-slate-900 dark:text-white">Add New Member</h3>
                </div>

                <form onSubmit={handleAddMember} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 font-mono pb-1">First Name</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Alan"
                      value={newMemberForm.firstName}
                      onChange={(e) => setNewMemberForm({ ...newMemberForm, firstName: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-205 dark:border-slate-700 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-medium"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 font-mono pb-1">Last Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Turing"
                      value={newMemberForm.lastName}
                      onChange={(e) => setNewMemberForm({ ...newMemberForm, lastName: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-205 dark:border-slate-700 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 font-mono pb-1">University Email</label>
                    <input 
                      type="email" 
                      required
                      placeholder="alan.turing@gstu.edu.bd"
                      value={newMemberForm.email}
                      onChange={(e) => setNewMemberForm({ ...newMemberForm, email: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-205 dark:border-slate-700 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 font-mono pb-1">Academic Session</label>
                    <select
                      required
                      value={newMemberForm.cohort}
                      onChange={(e) => setNewMemberForm({ ...newMemberForm, cohort: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-205 dark:border-slate-700 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500 font-semibold cursor-pointer"
                    >
                      <option value="21-22">21-22</option>
                      <option value="22-23">22-23</option>
                      <option value="23-24">23-24</option>
                      <option value="24-25">24-25</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 font-mono pb-1">Profile Photo (Optional)</label>
                    <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-800 border border-slate-205 dark:border-slate-700 rounded-lg p-2">
                      {newMemberForm.picture ? (
                        <img 
                          src={newMemberForm.picture} 
                          className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700" 
                          alt="Pre-selection avatar"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[9px] font-semibold text-slate-500 dark:text-slate-400">
                          None
                        </div>
                      )}
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const r = new FileReader();
                            r.onloadend = () => setNewMemberForm(prev => ({ ...prev, picture: r.result as string }));
                            r.readAsDataURL(file);
                          }
                        }}
                        className="text-[9px] text-slate-500 dark:text-slate-400 file:mr-2 file:py-0.5 file:px-1.5 file:rounded file:border-0 file:text-[9px] file:font-mono file:font-bold file:bg-slate-200 dark:file:bg-slate-700 dark:file:text-slate-200 file:cursor-pointer"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full text-center bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all shadow-sm block active:scale-95 text-center mt-4"
                  >
                    Add to registry
                  </button>
                </form>
              </div>

              {/* Members table */}
              <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 flex-wrap gap-2">
                  <div className="space-y-0.5">
                    <h3 className="font-bold font-display text-sm text-slate-900 dark:text-white">Student Profiles Registry</h3>
                    <p className="text-[10px] text-slate-500 font-medium font-sans">Query and manage all user documents stored in Firestore</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={handleExportMembers}
                      className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-450 border border-slate-200 dark:border-slate-705 bg-slate-50 dark:bg-slate-850 px-2.5 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Download full JSON Database Backup"
                    >
                      Export Database
                    </button>
                    <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-100 dark:bg-emerald-950/50 px-2 py-0.5 rounded uppercase">
                      {filteredMembers.length === members.length ? `${members.length} Total` : `${filteredMembers.length} / ${members.length} Matched`}
                    </span>
                  </div>
                </div>

                {/* Database Search & Filter Toolbar */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 bg-slate-50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-150/85 dark:border-slate-850">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search name or email..."
                      value={memberSearchQuery}
                      onChange={(e) => setMemberSearchQuery(e.target.value)}
                      className="w-full pl-3 pr-8 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-805 dark:text-gray-150 placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-medium"
                    />
                    {memberSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setMemberSearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-605 dark:hover:text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  <div>
                    <select
                      value={memberRoleFilter}
                      onChange={(e) => setMemberRoleFilter(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-805 dark:text-gray-150 focus:outline-none focus:border-emerald-500 font-semibold"
                    >
                      <option value="ALL">All Designations</option>
                      <option value="Chief Faculty Advisor & Head of Dept.">Faculty Advisors</option>
                      <option value="President">Presidents</option>
                      <option value="Vice President">Vice Presidents</option>
                      <option value="General Secretary">General Secretaries</option>
                      <option value="Secretary">Secretaries</option>
                      <option value="Executive Committee">Executive Committee</option>
                      <option value="General Member">General Members</option>
                    </select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <select
                      value={memberCohortFilter}
                      onChange={(e) => setMemberCohortFilter(e.target.value)}
                      className="flex-1 px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-805 dark:text-gray-150 focus:outline-none focus:border-emerald-500 font-semibold"
                    >
                      <option value="ALL">All Academic Sessions</option>
                      <option value="25-26">Session 25-26</option>
                      <option value="24-25">Session 24-25</option>
                      <option value="23-24">Session 23-24</option>
                      <option value="22-23">Session 22-23</option>
                      <option value="21-22">Session 21-22</option>
                      <option value="20-21">Session 20-21</option>
                      <option value="19-20">Session 19-20</option>
                      <option value="18-19">Session 18-19</option>
                      <option value="17-18">Session 17-18</option>
                      <option value="16-17">Session 16-17</option>
                      <option value="15-16">Session 15-16</option>
                      <option value="14-15">Session 14-15</option>
                      <option value="13-14">Session 13-14</option>
                      <option value="12-13">Session 12-13</option>
                      <option value="11-12">Session 11-12</option>
                      <option value="10-11">Session 10-11</option>
                      <option value="GSTU Faculty">GSTU Faculty</option>
                      <option value="BSMRSTU Faculty">BSMRSTU Faculty</option>
                    </select>
                    
                    {(memberSearchQuery || memberRoleFilter !== 'ALL' || memberCohortFilter !== 'ALL') && (
                      <button
                        type="button"
                        onClick={() => {
                          setMemberSearchQuery('');
                          setMemberRoleFilter('ALL');
                          setMemberCohortFilter('ALL');
                        }}
                        className="py-1 px-2 text-[10px] uppercase font-mono font-bold text-slate-500 hover:text-emerald-700 dark:text-slate-400 dark:hover:text-emerald-400 hover:underline shrink-0"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs whitespace-nowrap min-w-[700px]">
                    <thead>
                      <tr className="border-b border-slate-150 dark:border-slate-800 text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 font-mono bg-slate-50 dark:bg-slate-950/50">
                        <th className="py-2.5 px-3">Student Member</th>
                        <th className="py-2.5 px-3">Designation</th>
                        <th className="py-2.5 px-3">Academic Session</th>
                        <th className="py-2.5 px-3">Join Date</th>
                        <th className="py-2.5 px-3 text-right">Database Ops</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {filteredMembers.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-slate-400 dark:text-slate-550 font-medium">
                            No student profiles match your search criteria.
                          </td>
                        </tr>
                      ) : (
                        filteredMembers.map((item) => (
                          <tr key={item.email} className="hover:bg-slate-50/70 dark:hover:bg-slate-950/30 transition-colors">
                            <td className="py-3 px-3 col-span-2">
                              <div className="flex items-center space-x-3">
                                {/* Avatar block with drag/click photo upload trigger */}
                                <div className="relative group shrink-0">
                                  <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-205 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 relative flex items-center justify-center shadow-sm font-sans">
                                    {item.picture ? (
                                      <img 
                                        src={item.picture} 
                                        referrerPolicy="no-referrer"
                                        className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300" 
                                        alt={`${item.firstName} profile avatar`}
                                      />
                                    ) : (
                                      <div className="w-full h-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-bold text-xs tracking-tight uppercase">
                                        {item.firstName?.[0] || 'S'}{(item.lastName && item.lastName !== 'Student') ? item.lastName[0] : ''}
                                      </div>
                                    )}
                                    
                                    {/* Upload Action Overlay on Hover */}
                                    <label 
                                      htmlFor={`upload-${item.email}`}
                                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-[8px] font-mono font-bold text-white cursor-pointer select-none"
                                    >
                                      <span>UPLOAD</span>
                                      <span>PIC</span>
                                    </label>
                                  </div>
                                  <input 
                                    type="file" 
                                    id={`upload-${item.email}`}
                                    accept="image/*"
                                    onChange={(e) => handlePhotoUpload(e, item.email)}
                                    className="hidden"
                                  />
                                </div>

                                <div className="space-y-0.5">
                                  <div className="font-bold text-slate-900 dark:text-white leading-tight font-display">{item.firstName} {item.lastName && item.lastName !== 'Student' ? item.lastName : ''}</div>
                                  <div className="text-[10px] text-slate-450 dark:text-slate-500 font-mono font-medium flex items-center space-x-2">
                                    <span>{item.email}</span>
                                    <span className="text-slate-300 dark:text-slate-700">•</span>
                                    <label 
                                      htmlFor={`upload-${item.email}`}
                                      className="text-emerald-700 dark:text-emerald-400 hover:text-emerald-950 dark:hover:text-emerald-300 hover:underline cursor-pointer font-bold font-sans text-[9px]"
                                    >
                                      Upload Photo
                                    </label>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-3">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider font-mono bg-slate-100 dark:bg-slate-805 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-705">
                                {item.role || 'General Member'}
                              </span>
                            </td>
                            <td className="py-3 px-3 font-mono font-semibold text-slate-500 dark:text-slate-400">
                              {item.activeCohort || item.cohort || 'Fall 2024'}
                            </td>
                            <td className="py-3 px-3 font-mono text-slate-550 dark:text-slate-450">
                              {item.registeredAt || '2026-06-14'}
                            </td>
                            <td className="py-3 px-3 text-right">
                              <div className="flex items-center justify-end space-x-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedMember(item);
                                    setIsEditingInspector(false);
                                    setShowInspectorPassword(false);
                                  }}
                                  className="text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300 p-1.5 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded transition-colors cursor-pointer"
                                  title="Inspect Account Document"
                                >
                                  <Eye className="w-3.5 h-3.5 inline" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteMember(item.email)}
                                  className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 dark:hover:bg-red-950/30 rounded transition-colors cursor-pointer"
                                  title="Delete Student Profile"
                                >
                                  <Trash2 className="w-3.5 h-3.5 inline" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            ) : (
              /* EXECUTIVE COMMITTEE ASSIGNMENT PANEL */
              <div className="space-y-8 animate-fade-in">
                <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 p-5 rounded-2xl flex items-center space-x-4">
                  <div className="p-3 bg-emerald-500 text-white rounded-xl">
                    <Award className="w-6 h-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">Executive Committee Assignor Workspace</h3>
                    <p className="text-xs text-slate-550 dark:text-slate-400 mt-1 leading-relaxed">
                      Choose which student profiles from the registry hold each key leadership office. Your selections will instantly and dynamically update the dynamic listings inside the public <strong>About</strong> section chapters.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* Add executive form */}
                  <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                    <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                      <UserPlus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <h3 className="font-bold font-display text-sm text-slate-900 dark:text-white">Add Executive Member</h3>
                    </div>

                    <form onSubmit={handleAddExecutive} className="space-y-3 text-xs">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 font-mono pb-1">First Name</label>
                        <input 
                          type="text" 
                          required
                          placeholder="e.g. Alan"
                          value={newExecutiveForm.firstName}
                          onChange={(e) => setNewExecutiveForm({ ...newExecutiveForm, firstName: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-205 dark:border-slate-700 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500 font-medium"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 font-mono pb-1">Last Name</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Turing"
                          value={newExecutiveForm.lastName}
                          onChange={(e) => setNewExecutiveForm({ ...newExecutiveForm, lastName: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-205 dark:border-slate-700 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500 font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 font-mono pb-1">University Email</label>
                        <input 
                          type="email" 
                          required
                          placeholder="alan.turing@gstu.edu.bd"
                          value={newExecutiveForm.email}
                          onChange={(e) => setNewExecutiveForm({ ...newExecutiveForm, email: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-205 dark:border-slate-700 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500 font-semibold"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 font-mono pb-1">Designation / Role</label>
                        <select
                          value={newExecutiveForm.role}
                          onChange={(e) => setNewExecutiveForm({ ...newExecutiveForm, role: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-205 dark:border-slate-700 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500 font-bold"
                        >
                          <option value="Executive Committee">Executive Committee</option>
                          <option value="President">President</option>
                          <option value="Vice President">Vice President</option>
                          <option value="Secretary">Secretary</option>
                          <option value="General Secretary">General Secretary</option>
                          <option value="Chief Faculty Advisor & Head of Dept.">Chief Faculty Advisor & Head of Dept.</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 font-mono pb-1">Academic Session</label>
                        <select
                          required
                          value={newExecutiveForm.cohort}
                          onChange={(e) => setNewExecutiveForm({ ...newExecutiveForm, cohort: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-205 dark:border-slate-700 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500 font-semibold cursor-pointer"
                        >
                          <option value="21-22">21-22</option>
                          <option value="22-23">22-23</option>
                          <option value="23-24">23-24</option>
                          <option value="24-25">24-25</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 font-mono pb-1">Profile Photo (Optional)</label>
                        <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-800 border border-slate-205 dark:border-slate-700 rounded-lg p-2">
                          {newExecutiveForm.picture ? (
                            <img 
                              src={newExecutiveForm.picture} 
                              className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700" 
                              alt="Avatar"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[9px] font-semibold text-slate-500 dark:text-slate-400">
                              None
                            </div>
                          )}
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const r = new FileReader();
                                r.onloadend = () => setNewExecutiveForm(prev => ({ ...prev, picture: r.result as string }));
                                r.readAsDataURL(file);
                              }
                            }}
                            className="text-[9px] text-slate-500 dark:text-slate-400 file:mr-2 file:py-0.5 file:px-1.5 file:rounded file:border-0 file:text-[9px] file:font-mono file:font-bold file:bg-slate-200 dark:file:bg-slate-700 dark:file:text-slate-200 file:cursor-pointer"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full text-center bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all shadow-sm block active:scale-95 text-center mt-4 cursor-pointer"
                      >
                        Create Executive
                      </button>
                    </form>
                  </div>

                  {/* List of custom executives */}
                  <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                      <div className="space-y-0.5">
                        <h3 className="font-bold font-display text-sm text-slate-900 dark:text-white">Current Executive Committee</h3>
                        <p className="text-[10px] text-slate-500 font-medium font-sans">Manage current executive members</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {members.filter(m => m.role && m.role !== 'General Member' && !['cheemsakib@gmail.com', 'shakib@gstu.edu.bd', 'admin@gstu.edu.bd'].includes(m.email.toLowerCase())).map((exec) => (
                        <div key={exec.email} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800/80 rounded-xl">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-850 shrink-0">
                              {exec.picture && !exec.picture.startsWith('https://images.unsplash.com') ? (
                                <img src={exec.picture} referrerPolicy="no-referrer" alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-emerald-500 text-white font-bold flex items-center justify-center text-xs">
                                  {exec.firstName[0]}
                                </div>
                              )}
                            </div>
                            <div className="space-y-0.5 min-w-0">
                              <div className="font-bold text-slate-800 dark:text-white text-xs truncate">
                                {exec.firstName} {exec.lastName}
                              </div>
                              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold truncate">
                                {exec.role}
                              </div>
                            </div>
                          </div>
                          
                          <button
                            onClick={async () => {
                              if (window.confirm('Demote this member to General Member?')) {
                                try {
                                  const execId = exec.id || exec.email.replace(/\./g, '_');
                                  await setDoc(doc(db, 'student_profiles', execId), {
                                    ...exec,
                                    role: 'General Member',
                                    designation: 'General Member'
                                  }, { merge: true });
                                  setToast({ type: 'success', message: 'Member demoted successfully' });
                                  setTimeout(() => setToast(null), 3000);
                                } catch (err) {
                                  setToast({ type: 'error', message: 'Failed to demote member' });
                                }
                              }
                            }}
                            className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg cursor-pointer"
                            title="Demote to General Member"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {/* 3. ANNOUNCEMENTS DATABASE MODULE */}
        {activeTab === 'announcements' && (
          <div className="space-y-8 animate-fade-in">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Add notice form */}
              <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <Megaphone className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <h3 className="font-bold font-display text-sm text-slate-900 dark:text-white">Broadcast Notice</h3>
                </div>

                <form onSubmit={handleAddNotice} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 font-mono pb-1">Notice Category</label>
                    <select
                      value={newNoticeForm.category}
                      onChange={(e) => setNewNoticeForm({ ...newNoticeForm, category: e.target.value as any })}
                      className="w-full px-3 py-2 border border-slate-205 dark:border-slate-700 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500 font-bold"
                    >
                      <option className="bg-white dark:bg-slate-800">General</option>
                      <option className="bg-white dark:bg-slate-800">Events</option>
                      <option className="bg-white dark:bg-slate-800">Recruitment</option>
                      <option className="bg-white dark:bg-slate-800">Academic</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 font-mono pb-1">Notice Banner Tag</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Urgent, Session Update"
                      value={newNoticeForm.tag}
                      onChange={(e) => setNewNoticeForm({ ...newNoticeForm, tag: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-205 dark:border-slate-700 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 font-mono pb-1">Primary Title / Summary</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Clear informative headline"
                      value={newNoticeForm.title}
                      onChange={(e) => setNewNoticeForm({ ...newNoticeForm, title: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-205 dark:border-slate-700 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 font-mono pb-1">Detailed Description Body</label>
                    <textarea 
                      required
                      rows={3}
                      placeholder="Full announcement description including critical deadlines or reference documentation..."
                      value={newNoticeForm.description}
                      onChange={(e) => setNewNoticeForm({ ...newNoticeForm, description: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-205 dark:border-slate-700 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-medium"
                    ></textarea>
                  </div>

                  <div className="flex items-center space-x-2 py-1.5">
                    <input 
                      type="checkbox" 
                      id="isUrgent"
                      checked={newNoticeForm.isUrgent}
                      onChange={(e) => setNewNoticeForm({ ...newNoticeForm, isUrgent: e.target.checked })}
                      className="rounded accent-rose-600 h-4 w-4 cursor-pointer"
                    />
                    <label htmlFor="isUrgent" className="text-xs text-rose-800 dark:text-rose-450 font-bold font-mono uppercase cursor-pointer">
                      Mark as ! Urgent Priority
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="w-full text-center bg-blue-650 hover:bg-slate-950 dark:hover:bg-slate-800 text-white bg-black py-2.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all shadow-sm block active:scale-95 mt-4"
                  >
                    Post Announcement
                  </button>
                </form>
              </div>

              {/* Announcements list */}
              <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="font-bold font-display text-sm text-slate-900 dark:text-white">Active Board Notices</h3>
                </div>

                <div className="space-y-4">
                  {notices.map((notice) => (
                    <div 
                      key={notice.id} 
                      className={`p-4 border rounded-xl flex items-start justify-between gap-4 ${
                        notice.isUrgent 
                          ? 'border-rose-205 dark:border-rose-900 bg-rose-50/10 dark:bg-rose-950/20' 
                          : 'border-slate-150 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40'
                      }`}
                    >
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center space-x-2">
                          {notice.isUrgent ? (
                            <span className="bg-rose-100 dark:bg-rose-950 text-rose-850 dark:text-rose-350 text-[9px] font-mono font-bold px-2 py-0.5 rounded">
                              ! URGENT
                            </span>
                          ) : (
                            <span className="bg-slate-250 text-slate-800 dark:text-slate-350 bg-slate-100 dark:bg-slate-800 text-[9px] font-mono font-bold px-2 py-0.5 rounded">
                              {notice.category}
                            </span>
                          )}
                          <span className="text-[10px] text-slate-400 dark:text-slate-505 font-mono font-medium">{notice.date}</span>
                        </div>
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white leading-snug">{notice.title}</h4>
                        <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed font-normal">{notice.description}</p>
                      </div>

                      <button
                        onClick={() => handleDeleteNotice(notice.id)}
                        className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 dark:hover:bg-red-950/30 rounded"
                        title="Delete Notice"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* 4. EVENTS DATABASE MODULE */}
        {activeTab === 'events' && (
          <div className="space-y-8 animate-fade-in">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Add event form */}
              <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <CalendarIcon className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  <h3 className="font-bold font-display text-sm text-slate-900 dark:text-white">Schedule Event</h3>
                </div>

                <form onSubmit={handleAddEvent} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 font-mono pb-1">Category Type</label>
                    <select
                      value={newEventForm.category}
                      onChange={(e) => setNewEventForm({ ...newEventForm, category: e.target.value as any })}
                      className="w-full px-3 py-2 border border-slate-205 dark:border-slate-700 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500 font-bold"
                    >
                      <option className="bg-white dark:bg-slate-800">Workshop</option>
                      <option className="bg-white dark:bg-slate-800">Contest</option>
                      <option className="bg-white dark:bg-slate-800">Seminar</option>
                      <option className="bg-white dark:bg-slate-800">Session</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 font-mono pb-1">Badge Tag</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Featured, Cyber Security"
                      value={newEventForm.tag}
                      onChange={(e) => setNewEventForm({ ...newEventForm, tag: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-205 dark:border-slate-700 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 font-mono pb-1">Event Title</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Awesome title"
                      value={newEventForm.title}
                      onChange={(e) => setNewEventForm({ ...newEventForm, title: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-205 dark:border-slate-700 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 font-mono pb-1">Schedule date</label>
                    <input 
                      type="date" 
                      required
                      value={newEventForm.date}
                      onChange={(e) => setNewEventForm({ ...newEventForm, date: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-205 dark:border-slate-700 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500 font-semibold cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 font-mono pb-1">Time Slots</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 10:00 AM"
                      value={newEventForm.time}
                      onChange={(e) => setNewEventForm({ ...newEventForm, time: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-205 dark:border-slate-700 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 font-mono pb-1">Physical Location / Room</label>
                    <input 
                      type="text" 
                      required
                      value={newEventForm.location}
                      onChange={(e) => setNewEventForm({ ...newEventForm, location: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-205 dark:border-slate-700 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 font-mono pb-1">Detailed Description Summary</label>
                    <textarea 
                      required
                      rows={3}
                      placeholder="Brief session agenda summary..."
                      value={newEventForm.description}
                      onChange={(e) => setNewEventForm({ ...newEventForm, description: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-205 dark:border-slate-700 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-medium"
                    ></textarea>
                  </div>

                  <div className="flex items-center space-x-2 py-1.5">
                    <input 
                      type="checkbox" 
                      id="isFeaturedEvent"
                      checked={newEventForm.isFeatured}
                      onChange={(e) => setNewEventForm({ ...newEventForm, isFeatured: e.target.checked })}
                      className="rounded accent-emerald-600 h-4 w-4 cursor-pointer"
                    />
                    <label htmlFor="isFeaturedEvent" className="text-xs text-emerald-800 dark:text-emerald-450 font-bold font-mono uppercase cursor-pointer">
                      Highlight as Featured event
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="w-full text-center bg-cyan-650 hover:bg-slate-950 dark:hover:bg-slate-800 text-white bg-black py-2.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all shadow-sm block active:scale-95 mt-4"
                  >
                    Lock calendar listing
                  </button>
                </form>
              </div>

              {/* Events lists */}
              <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="font-bold font-display text-sm text-slate-900 dark:text-white">Scheduled Institutional Events</h3>
                </div>

                <div className="space-y-4">
                  {events.map((ev) => (
                    <div key={ev.id} className="p-4 border border-slate-200 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-955/40 rounded-xl flex items-start justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[9px] font-mono font-bold px-2 py-0.5 rounded">
                            {ev.category}
                          </span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-505 font-mono font-semibold">{ev.date} @ {ev.time || 'All Day'}</span>
                        </div>
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white leading-snug">
                          {ev.title} {ev.isFeatured && <span className="text-amber-500 text-xs">★</span>}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">{ev.description}</p>
                        <p className="text-[10px] font-mono text-slate-400 dark:text-slate-505">Location: {ev.location}</p>
                      </div>

                      <button
                        onClick={() => handleDeleteEvent(ev.id)}
                        className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 dark:hover:bg-red-950/30 rounded"
                        title="Delete Event"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* 5. PROJECTS SPOTLIGHTS MODULE */}
        {activeTab === 'projects' && (
          <div className="space-y-8 animate-fade-in">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Add Project form */}
              <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <Briefcase className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="font-bold font-display text-sm text-slate-900 dark:text-white">Feature Project Spotlight</h3>
                </div>

                <form onSubmit={handleAddProject} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 font-mono pb-1">Project Title</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Club Automation"
                      value={newProjectForm.title}
                      onChange={(e) => setNewProjectForm({ ...newProjectForm, title: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-205 dark:border-slate-700 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 font-mono pb-1">Tech Stack tags (comma separated)</label>
                    <input 
                      type="text" 
                      required
                      placeholder="React, Firebase, Tailwind"
                      value={newProjectForm.tagsString}
                      onChange={(e) => setNewProjectForm({ ...newProjectForm, tagsString: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-205 dark:border-slate-700 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 font-mono pb-1">GitHub repository URL</label>
                    <input 
                      type="url" 
                      required
                      value={newProjectForm.githubUrl}
                      onChange={(e) => setNewProjectForm({ ...newProjectForm, githubUrl: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-205 dark:border-slate-700 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 font-mono pb-1">Production Version Code</label>
                    <input 
                      type="text" 
                      placeholder="v1.0.0"
                      value={newProjectForm.version}
                      onChange={(e) => setNewProjectForm({ ...newProjectForm, version: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-205 dark:border-slate-700 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 font-mono pb-1">Short Description Body</label>
                    <textarea 
                      required
                      rows={3}
                      placeholder="Describe what unique problem this project solves..."
                      value={newProjectForm.description}
                      onChange={(e) => setNewProjectForm({ ...newProjectForm, description: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-205 dark:border-slate-700 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-medium"
                    ></textarea>
                  </div>

                  <div className="flex items-center space-x-2 py-1.5">
                    <input 
                      type="checkbox" 
                      id="isFeaturedProj"
                      checked={newProjectForm.isFeatured}
                      onChange={(e) => setNewProjectForm({ ...newProjectForm, isFeatured: e.target.checked })}
                      className="rounded accent-emerald-600 h-4 w-4 cursor-pointer"
                    />
                    <label htmlFor="isFeaturedProj" className="text-xs text-emerald-800 dark:text-emerald-450 font-bold font-mono uppercase cursor-pointer">
                      Flag as Featured spotlight
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="w-full text-center bg-slate-900 border border-transparent dark:bg-slate-850 dark:border-slate-700 hover:bg-emerald-950 dark:hover:bg-slate-800 text-white py-2.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all shadow-sm block active:scale-95 mt-4"
                  >
                    Commit spotlight upload
                  </button>
                </form>
              </div>

              {/* Projects lists */}
              <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="font-bold font-display text-sm text-slate-900 dark:text-white">Current Spotlight Showcases</h3>
                </div>

                <div className="space-y-4">
                  {projects.map((proj) => (
                    <div key={proj.id} className="p-4 border border-slate-200 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-955/40 rounded-xl flex items-start justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap gap-1">
                          {proj.tags.map((tg, i) => (
                            <span key={i} className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-650 dark:text-slate-300 text-[8px] font-mono font-bold uppercase px-1.5 rounded">
                              {tg}
                            </span>
                          ))}
                        </div>
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white leading-snug">
                          {proj.title} {proj.isFeatured && <span className="text-amber-500 px-1 text-xs">★ Featured</span>}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-normal leading-relaxed line-clamp-2">{proj.description}</p>
                        <p className="text-[10px] font-mono text-emerald-700 dark:text-emerald-450 font-bold">{proj.githubUrl}</p>
                      </div>

                      <button
                        onClick={() => handleDeleteProject(proj.id)}
                        className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 dark:hover:bg-red-950/30 rounded"
                        title="Delete showcase spotlight"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* 6. USER CONTACT INQUIRIES MODULE */}
        {activeTab === 'inquiries' && (
          <div className="space-y-8 animate-fade-in text-slate-800 dark:text-slate-200">
            
            {/* Header info cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex items-center space-x-4">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl text-emerald-600 dark:text-emerald-400">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 font-mono">Total Messages</p>
                  <p className="text-xl font-black text-slate-900 dark:text-white">{inquiries.length}</p>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex items-center space-x-4">
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 rounded-xl text-rose-500 dark:text-rose-400">
                  <Inbox className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 font-mono">Unread Inquiries</p>
                  <p className="text-xl font-black text-rose-500 dark:text-rose-400">{inquiries.filter(q => !q.isRead).length}</p>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex items-center space-x-4">
                <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl text-indigo-600 dark:text-indigo-400">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 font-mono">Read / Handled</p>
                  <p className="text-xl font-black text-indigo-600 dark:text-indigo-400">{inquiries.filter(q => q.isRead).length}</p>
                </div>
              </div>
            </div>

            {/* Inquiries list with advanced filters */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 space-y-6">
              
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="font-bold font-display text-base text-slate-900 dark:text-white">Inbound Contact Inquiries</h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500">Review communications sent from the public website contact deck.</p>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Read Filter */}
                  <div className="flex bg-slate-100 dark:bg-slate-950 p-0.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs">
                    {(['all', 'unread', 'read'] as const).map(statusFilter => (
                      <button
                        key={statusFilter}
                        onClick={() => setInquiryStatusTab(statusFilter)}
                        className={`px-2.5 py-1 rounded-md font-bold capitalize transition-all cursor-pointer text-[10px] font-mono ${
                          inquiryStatusTab === statusFilter
                            ? 'bg-white dark:bg-slate-800 text-slate-950 dark:text-white shadow'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
                        }`}
                      >
                        {statusFilter}
                      </button>
                    ))}
                  </div>

                   {/* Chapter Filter */}
                  <select
                    value={inquiryChapterFilter}
                    onChange={(e) => setInquiryChapterFilter(e.target.value as any)}
                    className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-705 rounded-lg text-xs font-mono font-bold px-2 py-1.5 focus:outline-none focus:border-emerald-500 text-slate-800 dark:text-white"
                  >
                    <option value="ALL">All Chapters</option>
                    <option value="GSTU">GSTU Campus</option>
                    <option value="BSMRSTU">BSMRSTU Campus</option>
                  </select>

                  <button
                    type="button"
                    onClick={handleExportInquiries}
                    className="text-xs font-mono font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                    title="Export Contact Inquiries to JSON file"
                  >
                    Export Inquiries
                  </button>
                </div>
              </div>

              {/* Inquiry Cards list */}
              {filteredInquiries.length === 0 ? (
                <div className="py-16 text-center space-y-3">
                  <div className="w-12 h-12 bg-slate-50 dark:bg-slate-950 rounded-full flex items-center justify-center text-slate-400 mx-auto border border-dashed border-slate-200 dark:border-slate-800">
                    <Inbox className="w-5 h-5 animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-800 dark:text-white">No inquiries found</h4>
                    <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm mx-auto">There are no contact messages that match the chosen filters at this moment.</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {filteredInquiries.map((inq) => (
                    <div 
                      key={inq.id} 
                      className={`p-5 rounded-2xl border transition-all ${
                        inq.isRead 
                          ? 'bg-slate-50/40 dark:bg-slate-955/20 border-slate-200 dark:border-slate-800' 
                          : 'bg-emerald-50/10 dark:bg-emerald-950/10 border-emerald-250 dark:border-emerald-800 shadow-sm shadow-emerald-50/20'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        {/* Meta information */}
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-xs font-extrabold text-slate-900 dark:text-white">{inq.name}</span>
                            <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-505">&lt;{inq.email}&gt;</span>
                            
                            {/* Chapter identification badge */}
                            <span className={`text-[8px] font-mono font-extrabold uppercase px-1.5 py-0.5 rounded ${
                              inq.chapter === 'GSTU' 
                                ? 'bg-sky-50 dark:bg-sky-950 text-sky-850 dark:text-sky-350 border border-sky-200 dark:border-sky-900' 
                                : 'bg-indigo-50 dark:bg-indigo-950 text-indigo-850 dark:text-indigo-350 border border-indigo-200 dark:border-indigo-900'
                            }`}>
                              {inq.chapter}
                            </span>

                            {/* Status label */}
                            {inq.isRead ? (
                              <span className="text-[8px] font-mono font-bold uppercase px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded border border-slate-150 dark:border-slate-700">
                                Seen
                              </span>
                            ) : (
                              <span className="text-[8px] font-mono font-bold uppercase px-1.5 py-0.5 bg-emerald-500 text-white rounded animate-pulse">
                                Unread
                              </span>
                            )}
                          </div>
                          
                          <p className="text-[10px] font-mono text-slate-400 dark:text-slate-505">
                            Submitted on: {new Date(inq.createdAt).toLocaleString()}
                          </p>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center space-x-1.5">
                          <button
                            onClick={() => handleToggleReadInquiry(inq.id, inq.isRead)}
                            className={`p-1.5 rounded text-xs font-mono font-bold uppercase transition-all flex items-center space-x-1 cursor-pointer border ${
                              inq.isRead 
                                ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-705 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white' 
                                : 'bg-emerald-100 dark:bg-emerald-900 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-200 dark:hover:bg-emerald-800 text-emerald-800 dark:text-emerald-200 hover:text-emerald-950 dark:hover:text-emerald-100'
                            }`}
                            title={inq.isRead ? "Mark as Unread" : "Mark as Read"}
                          >
                            {inq.isRead ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            <span className="text-[9px] font-mono uppercase px-1">
                              {inq.isRead ? 'Mark Unseen' : 'Mark Read'}
                            </span>
                          </button>
                          
                          <button
                            onClick={() => handleDeleteInquiry(inq.id)}
                            className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 p-1.5 hover:bg-rose-100 dark:hover:bg-rose-900 rounded text-rose-600 dark:text-rose-400 hover:text-rose-850 dark:hover:text-red-300 transition-all cursor-pointer"
                            title="Delete inquiry"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Content block */}
                      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                        <p className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span className="text-emerald-600 dark:text-emerald-450 font-mono uppercase tracking-wider text-[10px]">Subject:</span> 
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{inq.subject}</span>
                        </p>
                        <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80 p-3.5 rounded-xl font-normal text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line shadow-inner max-w-none">
                          {inq.message}
                        </div>
                        
                        {/* Quick action reply proxy linking */}
                        <div className="pt-2 text-right">
                          <a 
                            href={`mailto:${inq.email}?subject=RE: ${encodeURIComponent(inq.subject)}`}
                            className="inline-flex items-center space-x-1 font-mono font-bold uppercase text-[9px] text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 hover:underline"
                          >
                            <span>Respond to sender</span>
                            <ArrowRight className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>

          </div>
        )}

        {/* 7. CLUB ACHIEVEMENTS AND PHOTO MOMENTS MODULE */}
        {activeTab === 'achievements' && (
          <div className="space-y-8 animate-fade-in text-slate-800 dark:text-slate-200">
            
            {/* Quick Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex items-center space-x-4">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl text-emerald-600 dark:text-emerald-450">
                  <Trophy className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 font-mono">Achievements</p>
                  <p className="text-xl font-black text-slate-900 dark:text-white">
                    {achievements.filter(a => a.category === 'Achievement').length}
                  </p>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex items-center space-x-4">
                <div className="p-3 bg-cyan-50 dark:bg-cyan-950/40 rounded-xl text-cyan-500 dark:text-cyan-400">
                  <Camera className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 font-mono">Photo Moments</p>
                  <p className="text-xl font-black text-slate-900 dark:text-white">
                    {achievements.filter(a => a.category === 'Photo Moment').length}
                  </p>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex items-center space-x-4">
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-350">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-505 font-mono">Total Gallery Entries</p>
                  <p className="text-xl font-black text-slate-900 dark:text-white">{achievements.length}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Add New Entry Form - Left */}
              <form 
                onSubmit={handleAddAchievement}
                className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 space-y-5"
              >
                <div>
                  <h3 className="font-bold font-display text-base text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-emerald-600" />
                    Add Achievement / Moment
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-slate-505">Log club achievements and photos to display in the main website menu.</p>
                </div>

                {/* Category的选择 */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 font-mono block">Category</label>
                  <div className="grid grid-cols-2 gap-3">
                    {(['Achievement', 'Photo Moment'] as const).map(cat => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setNewAchForm(p => ({ ...p, category: cat }))}
                        className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                          newAchForm.category === cat
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-850 dark:text-emerald-400'
                            : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                        }`}
                      >
                        {cat === 'Achievement' ? <Trophy className="w-3.5 h-3.5" /> : <Camera className="w-3.5 h-3.5" />}
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date Picker Input */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 font-mono block">Event Occurrence Date</label>
                  <input 
                    type="date"
                    required
                    value={newAchForm.date}
                    onChange={(e) => setNewAchForm(p => ({ ...p, date: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg text-xs font-semibold focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-slate-950 border-slate-250 dark:border-slate-800"
                  />
                </div>

                {/* Title Input */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 font-mono block">Title Heading</label>
                  <input 
                    type="text"
                    required
                    maxLength={150}
                    placeholder="e.g. Champions of CSE Hackfest"
                    value={newAchForm.title}
                    onChange={(e) => setNewAchForm(p => ({ ...p, title: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg text-xs font-semibold focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-slate-950 border-slate-250 dark:border-slate-800"
                  />
                </div>

                {/* Description Input */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 font-mono block">Description narrative</label>
                  <textarea 
                    rows={4}
                    required
                    maxLength={1000}
                    placeholder="Describe the highlight of this moment with supporting details..."
                    value={newAchForm.description}
                    onChange={(e) => setNewAchForm(p => ({ ...p, description: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg text-xs font-semibold focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-slate-950 border-slate-250 dark:border-slate-800 resize-none"
                  />
                </div>

                {/* Image Upload Block */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 font-mono block">Featured photo</label>
                  <div className="border border-dashed border-slate-250 dark:border-slate-800 rounded-xl p-4 text-center space-y-3 bg-slate-50/50 dark:bg-slate-950/20">
                    {newAchForm.image ? (
                      <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-slate-200">
                        <img 
                          src={newAchForm.image} 
                          alt="preview" 
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer"
                        />
                        <button
                          type="button"
                          onClick={() => setNewAchForm(p => ({ ...p, image: '' }))}
                          className="absolute top-2 right-2 p-1.5 bg-black/80 text-white rounded-full hover:bg-black transition-all cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="py-4 space-y-2">
                        <ImageIcon className="w-8 h-8 text-slate-400 mx-auto" />
                        <div className="text-xs text-slate-500">
                          <label className="relative cursor-pointer bg-white rounded-md font-bold text-emerald-600 hover:text-emerald-500 focus-within:outline-none">
                            <span>Upload a photo file</span>
                            <input 
                              id="achFile" 
                              name="achFile" 
                              type="file" 
                              accept="image/*"
                              onChange={handleImageFileChange}
                              className="sr-only" 
                            />
                          </label>
                          <p className="text-[10px] text-slate-400 mt-1">PNG, JPG, JPEG up to 1.5MB</p>
                        </div>
                      </div>
                    )}
                    
                    {/* fallback URL input alternatively */}
                    <div className="flex items-center gap-1.5 bg-white dark:bg-slate-955 p-1 px-2 border rounded-lg border-slate-200 dark:border-slate-800">
                      <span className="text-[9px] font-mono font-bold text-slate-400 uppercase">OR URL:</span>
                      <input 
                        type="url"
                        placeholder="Paste image Unsplash url"
                        value={newAchForm.image && !newAchForm.image.startsWith('data:') ? newAchForm.image : ''}
                        onChange={(e) => setNewAchForm(p => ({ ...p, image: e.target.value }))}
                        className="flex-1 bg-transparent border-none text-[10px] focus:outline-none text-slate-700"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-lg text-xs font-bold transition-all shadow active:scale-[0.98] cursor-pointer"
                >
                  Publish Gallery Entry
                </button>
              </form>

              {/* Gallery Inventory List - Right */}
              <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 space-y-6">
                <div>
                  <h3 className="font-bold font-display text-base text-slate-900 dark:text-white">Active Gallery Listings</h3>
                  <p className="text-xs text-slate-400 dark:text-slate-550">Review, sort, and delete registered achievements and moments.</p>
                </div>

                {/* List scroll container */}
                {achievements.length === 0 ? (
                  <div className="py-20 text-center border-2 border-dashed rounded-xl border-slate-100 max-w-sm mx-auto">
                    <Trophy className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-400">No achievements added yet</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[640px] overflow-y-auto pr-2 space-y-4">
                    {achievements.map((ach) => {
                      const isAch = ach.category === 'Achievement';
                      return (
                        <div 
                          key={ach.id} 
                          className="pt-4 first:pt-0 flex items-start justify-between gap-4 group"
                        >
                          <div className="flex items-start space-x-3.5">
                            {/* Preview photo */}
                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex-shrink-0">
                              <img 
                                src={ach.image || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=600'} 
                                alt={ach.title} 
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            </div>

                            {/* Details meta */}
                            <div className="space-y-1">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className={`text-[8px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                                  isAch 
                                    ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200' 
                                    : 'bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-400 border border-cyan-200'
                                }`}>
                                  {ach.category}
                                </span>
                                <span className="text-[10px] font-mono text-slate-450">{ach.date}</span>
                              </div>
                              <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                                {ach.title}
                              </h4>
                              <p className="text-[11px] text-slate-400 dark:text-slate-500 line-clamp-2 leading-relaxed">
                                {ach.description}
                              </p>
                            </div>
                          </div>

                          {/* Delete Trigger Icon */}
                          <button
                            type="button"
                            onClick={() => handleDeleteAchievement(ach.id)}
                            className="bg-rose-50 hover:bg-rose-100 text-rose-600 p-2 rounded-lg border border-rose-200 flex-shrink-0 transition-colors cursor-pointer"
                            title="Delete milestone entry"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
