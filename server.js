import express from 'express';
import cors from 'cors';
import pg from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Set up PostgreSQL Pool
const { Pool } = pg;
const dbUrl = process.env.DATABASE_URL;

console.log("[Server DB] Connecting to database...");
const pool = new Pool({
  connectionString: dbUrl,
  ssl: {
    rejectUnauthorized: false
  }
});

let isFallbackDb = false;
const JSON_DB_FILE = path.join(__dirname, 'local_db.json');

// Read/Write helper functions for file fallback
function readFallbackDb() {
  if (!fs.existsSync(JSON_DB_FILE)) {
    return [];
  }
  try {
    return JSON.parse(fs.readFileSync(JSON_DB_FILE, 'utf8'));
  } catch (e) {
    return [];
  }
}

function writeFallbackDb(data) {
  fs.writeFileSync(JSON_DB_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// Test connection and initialize tables
async function initDb() {
  let client;
  try {
    client = await pool.connect();
    console.log("[Server DB] PostgreSQL connected successfully!");
    
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

      CREATE TABLE IF NOT EXISTS admins (
        uid TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        last_login TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS inquiries (
        id TEXT PRIMARY KEY,
        name TEXT,
        email TEXT,
        subject TEXT,
        message TEXT,
        chapter TEXT,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TEXT
      );

      CREATE TABLE IF NOT EXISTS rsvps (
        id TEXT PRIMARY KEY,
        event_id TEXT,
        event_title TEXT,
        full_name TEXT,
        student_id TEXT,
        email TEXT,
        created_at TEXT
      );
    `);
    
    console.log("[Server DB] PostgreSQL database schema checked and initialized.");
  } catch (err) {
    console.warn(`\n[Server DB] WARNING: PostgreSQL connection failed (${err.message}).`);
    console.warn("[Server DB] Falling back to local file-based database store (local_db.json).\n");
    isFallbackDb = true;
  } finally {
    if (client) client.release();
  }
}

initDb();

// Column mapping: camelCase (frontend) <-> snake_case (SQL)
// Each table defines its columns, primary key, and camel<->snake mappings
const TABLE_SCHEMAS = {
  user_credentials: {
    pk: 'uid',
    columns: {
      uid: 'uid', email: 'email', passwordHash: 'password_hash',
      password_hash: 'password_hash', isGoogle: 'is_google', is_google: 'is_google'
    },
    snakeToCamel: {
      uid: 'uid', email: 'email', password_hash: 'passwordHash',
      is_google: 'isGoogle', created_at: 'createdAt'
    }
  },
  student_profiles: {
    pk: 'uid',
    columns: {
      uid: 'uid', fullName: 'full_name', full_name: 'full_name',
      firstName: 'first_name', first_name: 'first_name',
      lastName: 'last_name', last_name: 'last_name',
      email: 'email', profilePhoto: 'profile_photo', profile_photo: 'profile_photo',
      picture: 'picture', designation: 'designation', role: 'role',
      isRegistered: 'is_registered', is_registered: 'is_registered',
      cohort: 'cohort', activeCohort: 'active_cohort', active_cohort: 'active_cohort',
      registeredAt: 'registered_at', registered_at: 'registered_at',
      createdAt: 'created_at', created_at: 'created_at'
    },
    snakeToCamel: {
      uid: 'uid', full_name: 'fullName', first_name: 'firstName',
      last_name: 'lastName', email: 'email', profile_photo: 'profilePhoto',
      picture: 'picture', designation: 'designation', role: 'role',
      is_registered: 'isRegistered', cohort: 'cohort', active_cohort: 'activeCohort',
      registered_at: 'registeredAt', created_at: 'createdAt'
    }
  },
  announcements: {
    pk: 'id',
    columns: {
      id: 'id', category: 'category', tag: 'tag', title: 'title',
      description: 'description', date: 'date',
      isUrgent: 'is_urgent', is_urgent: 'is_urgent',
      isArchived: 'is_archived', is_archived: 'is_archived',
      actionLabel: 'action_label', action_label: 'action_label',
      actionUrl: 'action_url', action_url: 'action_url'
    },
    snakeToCamel: {
      id: 'id', category: 'category', tag: 'tag', title: 'title',
      description: 'description', date: 'date', is_urgent: 'isUrgent',
      is_archived: 'isArchived', action_label: 'actionLabel',
      action_url: 'actionUrl', created_at: 'createdAt'
    }
  },
  projects: {
    pk: 'id',
    columns: {
      id: 'id', title: 'title', description: 'description', tags: 'tags',
      githubUrl: 'github_url', github_url: 'github_url',
      liveUrl: 'live_url', live_url: 'live_url',
      version: 'version', image: 'image',
      isFeatured: 'is_featured', is_featured: 'is_featured'
    },
    snakeToCamel: {
      id: 'id', title: 'title', description: 'description', tags: 'tags',
      github_url: 'githubUrl', live_url: 'liveUrl', version: 'version',
      image: 'image', is_featured: 'isFeatured', created_at: 'createdAt'
    }
  },
  events: {
    pk: 'id',
    columns: {
      id: 'id', category: 'category', tag: 'tag', title: 'title',
      description: 'description', date: 'date', time: 'time',
      location: 'location', image: 'image',
      isFeatured: 'is_featured', is_featured: 'is_featured',
      registerLink: 'register_link', register_link: 'register_link'
    },
    snakeToCamel: {
      id: 'id', category: 'category', tag: 'tag', title: 'title',
      description: 'description', date: 'date', time: 'time',
      location: 'location', image: 'image', is_featured: 'isFeatured',
      register_link: 'registerLink', created_at: 'createdAt'
    }
  },
  achievements: {
    pk: 'id',
    columns: {
      id: 'id', category: 'category', title: 'title',
      description: 'description', date: 'date', image: 'image',
      createdAt: 'created_at', created_at: 'created_at'
    },
    snakeToCamel: {
      id: 'id', category: 'category', title: 'title',
      description: 'description', date: 'date', image: 'image',
      created_at: 'createdAt'
    }
  },
  admins: {
    pk: 'uid',
    columns: {
      uid: 'uid', email: 'email', lastLogin: 'last_login', last_login: 'last_login'
    },
    snakeToCamel: {
      uid: 'uid', email: 'email', last_login: 'lastLogin'
    }
  },
  inquiries: {
    pk: 'id',
    columns: {
      id: 'id', name: 'name', email: 'email', subject: 'subject',
      message: 'message', chapter: 'chapter', isRead: 'is_read', is_read: 'is_read',
      createdAt: 'created_at', created_at: 'created_at'
    },
    snakeToCamel: {
      id: 'id', name: 'name', email: 'email', subject: 'subject',
      message: 'message', chapter: 'chapter', is_read: 'isRead',
      created_at: 'createdAt'
    }
  },
  rsvps: {
    pk: 'id',
    columns: {
      id: 'id', eventId: 'event_id', event_id: 'event_id',
      eventTitle: 'event_title', event_title: 'event_title',
      fullName: 'full_name', full_name: 'full_name',
      studentId: 'student_id', student_id: 'student_id',
      email: 'email', createdAt: 'created_at', created_at: 'created_at'
    },
    snakeToCamel: {
      id: 'id', event_id: 'eventId', event_title: 'eventTitle',
      full_name: 'fullName', student_id: 'studentId',
      email: 'email', created_at: 'createdAt'
    }
  }
};

// Helper: Convert a SQL row (snake_case) to camelCase JSON for the frontend
function rowToCamel(tableName, row) {
  const schema = TABLE_SCHEMAS[tableName];
  if (!schema) return row;
  const result = {};
  for (const [snakeKey, value] of Object.entries(row)) {
    const camelKey = schema.snakeToCamel[snakeKey] || snakeKey;
    result[camelKey] = value;
  }
  return result;
}

// Helper: Convert camelCase frontend data to snake_case columns + values for SQL
function camelToSnakeInsert(tableName, data) {
  const schema = TABLE_SCHEMAS[tableName];
  if (!schema) return null;
  const cols = [];
  const vals = [];
  const placeholders = [];
  let idx = 1;
  for (const [key, value] of Object.entries(data)) {
    const snakeCol = schema.columns[key];
    if (snakeCol && !cols.includes(snakeCol)) {
      cols.push(snakeCol);
      // Stringify arrays/objects for JSONB columns like 'tags'
      if (Array.isArray(value) || (typeof value === 'object' && value !== null && !(value instanceof Date))) {
        vals.push(JSON.stringify(value));
      } else {
        vals.push(value);
      }
      placeholders.push(`$${idx++}`);
    }
  }
  return { cols, vals, placeholders };
}

// Custom authentication endpoints
app.post('/api/auth/signup', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }
  
  const cleanEmail = email.trim().toLowerCase();
  
  try {
    if (isFallbackDb) {
      const docs = readFallbackDb();
      const checkUser = docs.some(d => d.collection === 'user_credentials' && d.id === cleanEmail);
      if (checkUser) {
        return res.status(400).json({ error: "Email is already registered" });
      }
      
      const uid = 'usr_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
      const passwordHash = await bcrypt.hash(password, 10);
      const credData = { uid, email: cleanEmail, passwordHash };
      
      docs.push({ collection: 'user_credentials', id: cleanEmail, data: credData });
      writeFallbackDb(docs);
      
      return res.json({ user: { uid, email: cleanEmail } });
    }
    
    // PostgreSQL path
    const checkUser = await pool.query(
      "SELECT uid FROM user_credentials WHERE email = $1",
      [cleanEmail]
    );
    
    if (checkUser.rows.length > 0) {
      return res.status(400).json({ error: "Email is already registered" });
    }
    
    const uid = 'usr_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    const passwordHash = await bcrypt.hash(password, 10);
    
    await pool.query(
      "INSERT INTO user_credentials (uid, email, password_hash, is_google) VALUES ($1, $2, $3, FALSE)",
      [uid, cleanEmail, passwordHash]
    );
    
    res.json({ user: { uid, email: cleanEmail } });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Internal server error during registration" });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }
  
  const cleanEmail = email.trim().toLowerCase();
  
  try {
    if (isFallbackDb) {
      const docs = readFallbackDb();
      const found = docs.find(d => d.collection === 'user_credentials' && d.id === cleanEmail);
      if (!found) {
        return res.status(400).json({ error: "Invalid credentials. Please verify your email and password." });
      }
      
      const match = await bcrypt.compare(password, found.data.passwordHash);
      if (!match) {
        return res.status(400).json({ error: "Invalid credentials. Please verify your email and password." });
      }
      
      const profile = docs.find(d => d.collection === 'student_profiles' && d.id === found.data.uid);
      const displayName = profile ? profile.data.fullName : cleanEmail.split('@')[0];
      
      return res.json({
        user: {
          uid: found.data.uid,
          email: cleanEmail,
          displayName: displayName
        }
      });
    }
    
    // PostgreSQL path
    const credQuery = await pool.query(
      "SELECT uid, password_hash FROM user_credentials WHERE email = $1",
      [cleanEmail]
    );
    
    if (credQuery.rows.length === 0) {
      return res.status(400).json({ error: "Invalid credentials. Please verify your email and password." });
    }
    
    const cred = credQuery.rows[0];
    const match = await bcrypt.compare(password, cred.password_hash);
    
    if (!match) {
      return res.status(400).json({ error: "Invalid credentials. Please verify your email and password." });
    }
    
    // Fetch user profile if it exists
    const profileQuery = await pool.query(
      "SELECT full_name FROM student_profiles WHERE uid = $1",
      [cred.uid]
    );
    
    const displayName = profileQuery.rows.length > 0 ? profileQuery.rows[0].full_name : cleanEmail.split('@')[0];
    
    res.json({
      user: {
        uid: cred.uid,
        email: cleanEmail,
        displayName: displayName
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error during login" });
  }
});

app.post('/api/auth/google', async (req, res) => {
  const { email, uid, displayName } = req.body;
  const cleanEmail = email.trim().toLowerCase();
  
  try {
    if (isFallbackDb) {
      const docs = readFallbackDb();
      const checkUser = docs.some(d => d.collection === 'user_credentials' && d.id === cleanEmail);
      if (!checkUser) {
        const credData = { uid, email: cleanEmail, isGoogle: true };
        docs.push({ collection: 'user_credentials', id: cleanEmail, data: credData });
        writeFallbackDb(docs);
      }
      return res.json({ user: { uid, email: cleanEmail, displayName } });
    }
    
    // PostgreSQL path
    await pool.query(
      `INSERT INTO user_credentials (uid, email, is_google) 
       VALUES ($1, $2, TRUE)
       ON CONFLICT (email) DO NOTHING`,
      [uid, cleanEmail]
    );
    
    res.json({ user: { uid, email: cleanEmail, displayName } });
  } catch (err) {
    console.error("Google login error:", err);
    res.status(500).json({ error: "Internal server error during Google login" });
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.json({ success: true });
});

// Valid table names to prevent SQL injection
const VALID_TABLES = new Set(Object.keys(TABLE_SCHEMAS));

// Generic Document Store REST API — now backed by explicit tables
app.get('/api/db/:collection', async (req, res) => {
  const tableName = req.params.collection;
  try {
    if (isFallbackDb) {
      const docs = readFallbackDb();
      const filtered = docs.filter(d => d.collection === tableName);
      return res.json(filtered.map(row => row.data));
    }

    if (!VALID_TABLES.has(tableName)) {
      return res.status(400).json({ error: `Unknown collection: ${tableName}` });
    }
    
    const dbRes = await pool.query(`SELECT * FROM ${tableName} ORDER BY created_at ASC`);
    res.json(dbRes.rows.map(row => rowToCamel(tableName, row)));
  } catch (err) {
    console.error(`Error listing collection ${tableName}:`, err);
    res.status(500).json({ error: "Failed to list collection data" });
  }
});

app.get('/api/db/:collection/:id', async (req, res) => {
  const tableName = req.params.collection;
  const docId = req.params.id;
  try {
    if (isFallbackDb) {
      const docs = readFallbackDb();
      const found = docs.find(d => d.collection === tableName && d.id === docId);
      if (!found) {
        return res.status(404).json({ error: "Document not found" });
      }
      return res.json(found.data);
    }

    if (!VALID_TABLES.has(tableName)) {
      return res.status(400).json({ error: `Unknown collection: ${tableName}` });
    }

    const schema = TABLE_SCHEMAS[tableName];
    const dbRes = await pool.query(
      `SELECT * FROM ${tableName} WHERE ${schema.pk} = $1`,
      [docId]
    );
    if (dbRes.rows.length === 0) {
      return res.status(404).json({ error: "Document not found" });
    }
    res.json(rowToCamel(tableName, dbRes.rows[0]));
  } catch (err) {
    console.error(`Error getting doc ${tableName}/${docId}:`, err);
    res.status(500).json({ error: "Failed to read document data" });
  }
});

app.post('/api/db/:collection/:id', async (req, res) => {
  const tableName = req.params.collection;
  const docId = req.params.id;
  try {
    const { data, merge } = req.body;
    
    if (isFallbackDb) {
      const docs = readFallbackDb();
      const idx = docs.findIndex(d => d.collection === tableName && d.id === docId);
      let finalData = data;
      if (idx !== -1) {
        if (merge) {
          finalData = { ...docs[idx].data, ...data };
        }
        docs[idx] = { collection: tableName, id: docId, data: finalData };
      } else {
        docs.push({ collection: tableName, id: docId, data: finalData });
      }
      writeFallbackDb(docs);
      return res.json({ success: true });
    }

    if (!VALID_TABLES.has(tableName)) {
      return res.status(400).json({ error: `Unknown collection: ${tableName}` });
    }

    const schema = TABLE_SCHEMAS[tableName];
    
    // Ensure the primary key value is in the data
    const fullData = { ...data, [schema.pk]: docId };
    const parsed = camelToSnakeInsert(tableName, fullData);
    if (!parsed || parsed.cols.length === 0) {
      return res.status(400).json({ error: "No valid columns found in data" });
    }

    // Build UPSERT query
    const updateClauses = parsed.cols
      .filter(c => c !== schema.pk)
      .map(c => `${c} = EXCLUDED.${c}`);
    
    const upsertSQL = `INSERT INTO ${tableName} (${parsed.cols.join(', ')}) 
       VALUES (${parsed.placeholders.join(', ')})
       ON CONFLICT (${schema.pk}) 
       DO UPDATE SET ${updateClauses.length > 0 ? updateClauses.join(', ') : `${schema.pk} = EXCLUDED.${schema.pk}`}`;
    
    await pool.query(upsertSQL, parsed.vals);
    res.json({ success: true });
  } catch (err) {
    console.error(`Error saving doc ${tableName}/${docId}:`, err);
    res.status(500).json({ error: "Failed to save document" });
  }
});

app.post('/api/db/:collection', async (req, res) => {
  const tableName = req.params.collection;
  try {
    const { data } = req.body;
    
    if (isFallbackDb) {
      const id = data.id || `${tableName}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      const finalData = { ...data, id };
      const docs = readFallbackDb();
      docs.push({ collection: tableName, id, data: finalData });
      writeFallbackDb(docs);
      return res.json({ success: true, id });
    }

    if (!VALID_TABLES.has(tableName)) {
      return res.status(400).json({ error: `Unknown collection: ${tableName}` });
    }

    const schema = TABLE_SCHEMAS[tableName];
    const pkValue = data[schema.pk] || data.id || data.uid || `${tableName}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const fullData = { ...data, [schema.pk]: pkValue };
    
    const parsed = camelToSnakeInsert(tableName, fullData);
    if (!parsed || parsed.cols.length === 0) {
      return res.status(400).json({ error: "No valid columns found in data" });
    }

    await pool.query(
      `INSERT INTO ${tableName} (${parsed.cols.join(', ')}) VALUES (${parsed.placeholders.join(', ')})`,
      parsed.vals
    );
    res.json({ success: true, id: pkValue });
  } catch (err) {
    console.error(`Error adding doc to ${tableName}:`, err);
    res.status(500).json({ error: "Failed to add document" });
  }
});

app.delete('/api/db/:collection/:id', async (req, res) => {
  const tableName = req.params.collection;
  const docId = req.params.id;
  try {
    if (isFallbackDb) {
      let docs = readFallbackDb();
      docs = docs.filter(d => !(d.collection === tableName && d.id === docId));
      writeFallbackDb(docs);
      return res.json({ success: true });
    }

    if (!VALID_TABLES.has(tableName)) {
      return res.status(400).json({ error: `Unknown collection: ${tableName}` });
    }

    const schema = TABLE_SCHEMAS[tableName];
    await pool.query(
      `DELETE FROM ${tableName} WHERE ${schema.pk} = $1`,
      [docId]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(`Error deleting doc ${tableName}/${docId}:`, err);
    res.status(500).json({ error: "Failed to delete document" });
  }
});

// Serve frontend build output
app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`[Server] running on port ${PORT}`);
});
