import firebaseConfig from '../firebase-applet-config.json';
import { initializeApp as realInitializeApp } from '@firebase/app';
import { getAuth as realGetAuth, signInWithPopup as realSignInWithPopup, GoogleAuthProvider as RealGoogleAuthProvider } from '@firebase/auth';

// Initialize Firebase with dynamic sandbox project attributes or fallback
console.log("[Firebase Init] Initializing platform mock services...");

export const app = {};

// Allow dynamic configuration from environment variables (e.g. for custom domain deployments on Render)
const resolvedConfig = {
  apiKey: (import.meta.env.VITE_FIREBASE_API_KEY as string) || firebaseConfig.apiKey,
  authDomain: (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string) || firebaseConfig.authDomain,
  projectId: (import.meta.env.VITE_FIREBASE_PROJECT_ID as string) || firebaseConfig.projectId,
  storageBucket: (import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string) || firebaseConfig.storageBucket,
  messagingSenderId: (import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string) || firebaseConfig.messagingSenderId,
  appId: (import.meta.env.VITE_FIREBASE_APP_ID as string) || firebaseConfig.appId,
  measurementId: (import.meta.env.VITE_FIREBASE_MEASUREMENT_ID as string) || (firebaseConfig as any).measurementId || ""
};

const realApp = realInitializeApp(resolvedConfig);
const realFirebaseAuth = realGetAuth(realApp);

// Enum and Error structures matching the original
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  console.error(`Mock Firestore Error [${operationType}] at [${path}]:`, error);
  throw error;
}

// ----------------------------------------------------
// Mock firebase/app exports
// ----------------------------------------------------
export function initializeApp() {
  return app;
}

// ----------------------------------------------------
// Mock firebase/auth exports
// ----------------------------------------------------
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  isAnonymous: boolean;
  tenantId: string | null;
  providerData: any[];
}

export const auth = {
  currentUser: null as User | null
};

export function getAuth() {
  return auth;
}

let authListener: ((user: any) => void) | null = null;

export function onAuthStateChanged(authInstance: any, callback: (user: any) => void) {
  authListener = callback;
  const stored = localStorage.getItem('local_user');
  if (stored) {
    try {
      const user = JSON.parse(stored);
      auth.currentUser = user;
      callback(user);
    } catch (e) {
      callback(null);
    }
  } else {
    // Check if we have a legacy sandbox user
    const sandboxStored = localStorage.getItem('local_sandbox_user');
    if (sandboxStored) {
      try {
        const sUser = JSON.parse(sandboxStored);
        auth.currentUser = sUser;
        callback(sUser);
      } catch (e) {
        callback(null);
      }
    } else {
      callback(null);
    }
  }
  return () => {
    // unsubscribe
  };
}

export async function signOut(authInstance: any) {
  localStorage.removeItem('local_user');
  localStorage.removeItem('local_sandbox_user');
  auth.currentUser = null;
  if (authListener) authListener(null);
  try {
    await fetch('/api/auth/logout', { method: 'POST' });
  } catch (e) {
    console.warn("Logout request failed:", e);
  }
}

export async function signInWithEmailAndPassword(authInstance: any, email: string, pass: string) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: pass })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Login failed');
  }
  const data = await res.json();
  localStorage.setItem('local_user', JSON.stringify(data.user));
  auth.currentUser = data.user;
  if (authListener) authListener(data.user);
  return { user: data.user };
}

export async function createUserWithEmailAndPassword(authInstance: any, email: string, pass: string) {
  const res = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: pass })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Signup failed');
  }
  const data = await res.json();
  localStorage.setItem('local_user', JSON.stringify(data.user));
  auth.currentUser = data.user;
  if (authListener) authListener(data.user);
  return { user: data.user };
}

export async function signInWithPopup(authInstance: any, provider: any) {
  try {
    const realProvider = new RealGoogleAuthProvider();
    const result = await realSignInWithPopup(realFirebaseAuth, realProvider);
    const firebaseUser = result.user;
    
    const user = {
      uid: firebaseUser.uid,
      email: firebaseUser.email ? firebaseUser.email.toLowerCase() : '',
      displayName: firebaseUser.displayName || 'Google User',
      photoURL: firebaseUser.photoURL || '',
      isGoogle: true
    };
    
    // Log the user into our PostgreSQL/local DB backend
    await fetch('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user.email, uid: user.uid, displayName: user.displayName })
    });
    
    localStorage.setItem('local_user', JSON.stringify(user));
    auth.currentUser = user as any;
    if (authListener) authListener(user);
    return { user };
  } catch (error: any) {
    console.error("Real Google Sign-In failed:", error);
    throw error;
  }
}

export async function signInWithRedirect(authInstance: any, provider: any) {
  return signInWithPopup(authInstance, provider);
}

export async function getRedirectResult(authInstance: any) {
  return null;
}

export const GoogleAuthProvider = RealGoogleAuthProvider;

// ----------------------------------------------------
// Mock firebase/firestore exports
// ----------------------------------------------------
export const db = {};

export function getFirestore() {
  return db;
}

export function doc(dbInstance: any, collectionName: string, id: string) {
  return { type: 'doc', collection: collectionName, id };
}

export function collection(dbInstance: any, collectionName: string) {
  return { type: 'collection', collection: collectionName };
}

export function query(target: any, ...args: any[]) {
  return target;
}

export function where(field: string, op: string, value: any) {
  return { field, op, value };
}

export async function getDoc(docRef: any) {
  try {
    const res = await fetch(`/api/db/${docRef.collection}/${docRef.id}`);
    if (res.status === 404) {
      return {
        exists: () => false,
        data: () => null,
        id: docRef.id
      };
    }
    const data = await res.json();
    return {
      exists: () => true,
      data: () => data,
      id: docRef.id
    };
  } catch (err) {
    console.error(`getDoc error for ${docRef.collection}/${docRef.id}:`, err);
    throw err;
  }
}

export async function getDocs(target: any) {
  try {
    const res = await fetch(`/api/db/${target.collection}`);
    const data = await res.json();
    const docs = data.map((item: any) => ({
      exists: () => true,
      data: () => item,
      id: item.id
    }));
    return {
      empty: docs.length === 0,
      forEach: (cb: any) => docs.forEach(cb),
      docs
    };
  } catch (err) {
    console.error(`getDocs error for ${target.collection}:`, err);
    throw err;
  }
}

export async function setDoc(docRef: any, data: any, options?: any) {
  try {
    const res = await fetch(`/api/db/${docRef.collection}/${docRef.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data, merge: options?.merge })
    });
    if (!res.ok) throw new Error(`setDoc failed`);
    return {};
  } catch (err) {
    console.error(`setDoc error for ${docRef.collection}/${docRef.id}:`, err);
    throw err;
  }
}

export async function addDoc(colRef: any, data: any) {
  try {
    const res = await fetch(`/api/db/${colRef.collection}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data })
    });
    if (!res.ok) throw new Error(`addDoc failed`);
    const result = await res.json();
    return { id: result.id };
  } catch (err) {
    console.error(`addDoc error for ${colRef.collection}:`, err);
    throw err;
  }
}

export async function deleteDoc(docRef: any) {
  try {
    const res = await fetch(`/api/db/${docRef.collection}/${docRef.id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error(`deleteDoc failed`);
    return {};
  } catch (err) {
    console.error(`deleteDoc error for ${docRef.collection}/${docRef.id}:`, err);
    throw err;
  }
}

export function onSnapshot(target: any, callback: any, errorCallback?: any) {
  let active = true;
  let intervalId: any = null;

  async function fetchUpdate() {
    if (!active) return;
    try {
      if (target.type === 'collection') {
        const res = await fetch(`/api/db/${target.collection}`);
        if (!res.ok) throw new Error(`Fetch collection failed`);
        const data = await res.json();
        const docs = data.map((item: any) => ({
          exists: () => true,
          data: () => item,
          id: item.id
        }));
        callback({
          empty: docs.length === 0,
          forEach: (cb: any) => docs.forEach(cb),
          docs
        });
      } else {
        const res = await fetch(`/api/db/${target.collection}/${target.id}`);
        if (res.status === 404) {
          callback({
            exists: () => false,
            data: () => null,
            id: target.id
          });
        } else {
          if (!res.ok) throw new Error(`Fetch doc failed`);
          const data = await res.json();
          callback({
            exists: () => true,
            data: () => data,
            id: target.id
          });
        }
      }
    } catch (err) {
      if (errorCallback) errorCallback(err);
      else console.error(`onSnapshot error for ${target.collection || target.id}:`, err);
    }
  }

  fetchUpdate();
  intervalId = setInterval(fetchUpdate, 5000);

  return () => {
    active = false;
    if (intervalId) clearInterval(intervalId);
  };
}
