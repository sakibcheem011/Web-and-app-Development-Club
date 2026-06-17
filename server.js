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
app.use(express.json());

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
    
    // Create generic document table
    await client.query(`
      CREATE TABLE IF NOT EXISTS documents (
        collection TEXT NOT NULL,
        id TEXT NOT NULL,
        data JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (collection, id)
      );
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_documents_collection ON documents(collection);
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
      "SELECT data FROM documents WHERE collection = 'user_credentials' AND id = $1",
      [cleanEmail]
    );
    
    if (checkUser.rows.length > 0) {
      return res.status(400).json({ error: "Email is already registered" });
    }
    
    const uid = 'usr_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    const passwordHash = await bcrypt.hash(password, 10);
    const credData = { uid, email: cleanEmail, passwordHash };
    
    await pool.query(
      "INSERT INTO documents (collection, id, data) VALUES ('user_credentials', $1, $2)",
      [cleanEmail, credData]
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
      "SELECT data FROM documents WHERE collection = 'user_credentials' AND id = $1",
      [cleanEmail]
    );
    
    if (credQuery.rows.length === 0) {
      return res.status(400).json({ error: "Invalid credentials. Please verify your email and password." });
    }
    
    const cred = credQuery.rows[0].data;
    const match = await bcrypt.compare(password, cred.passwordHash);
    
    if (!match) {
      return res.status(400).json({ error: "Invalid credentials. Please verify your email and password." });
    }
    
    // Fetch user profile if it exists
    const profileQuery = await pool.query(
      "SELECT data FROM documents WHERE collection = 'student_profiles' AND id = $1",
      [cred.uid]
    );
    
    const displayName = profileQuery.rows.length > 0 ? profileQuery.rows[0].data.fullName : cleanEmail.split('@')[0];
    
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
    const credData = { uid, email: cleanEmail, isGoogle: true };
    await pool.query(
      `INSERT INTO documents (collection, id, data) 
       VALUES ('user_credentials', $1, $2)
       ON CONFLICT (collection, id) DO NOTHING`,
      [cleanEmail, credData]
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

// Generic Document Store REST API
app.get('/api/db/:collection', async (req, res) => {
  try {
    if (isFallbackDb) {
      const docs = readFallbackDb();
      const filtered = docs.filter(d => d.collection === req.params.collection);
      return res.json(filtered.map(row => row.data));
    }
    
    // PostgreSQL path
    const dbRes = await pool.query(
      "SELECT data FROM documents WHERE collection = $1 ORDER BY id ASC",
      [req.params.collection]
    );
    res.json(dbRes.rows.map(row => row.data));
  } catch (err) {
    console.error(`Error listing collection ${req.params.collection}:`, err);
    res.status(500).json({ error: "Failed to list collection data" });
  }
});

app.get('/api/db/:collection/:id', async (req, res) => {
  try {
    if (isFallbackDb) {
      const docs = readFallbackDb();
      const found = docs.find(d => d.collection === req.params.collection && d.id === req.params.id);
      if (!found) {
        return res.status(404).json({ error: "Document not found" });
      }
      return res.json(found.data);
    }
    
    // PostgreSQL path
    const dbRes = await pool.query(
      "SELECT data FROM documents WHERE collection = $1 AND id = $2",
      [req.params.collection, req.params.id]
    );
    if (dbRes.rows.length === 0) {
      return res.status(404).json({ error: "Document not found" });
    }
    res.json(dbRes.rows[0].data);
  } catch (err) {
    console.error(`Error getting doc ${req.params.collection}/${req.params.id}:`, err);
    res.status(500).json({ error: "Failed to read document data" });
  }
});

app.post('/api/db/:collection/:id', async (req, res) => {
  try {
    const { data, merge } = req.body;
    let finalData = data;
    
    if (isFallbackDb) {
      const docs = readFallbackDb();
      const idx = docs.findIndex(d => d.collection === req.params.collection && d.id === req.params.id);
      
      if (idx !== -1) {
        if (merge) {
          finalData = { ...docs[idx].data, ...data };
        }
        docs[idx] = { collection: req.params.collection, id: req.params.id, data: finalData };
      } else {
        docs.push({ collection: req.params.collection, id: req.params.id, data: finalData });
      }
      writeFallbackDb(docs);
      return res.json({ success: true });
    }
    
    // PostgreSQL path
    if (merge) {
      const checkRes = await pool.query(
        "SELECT data FROM documents WHERE collection = $1 AND id = $2",
        [req.params.collection, req.params.id]
      );
      if (checkRes.rows.length > 0) {
        finalData = { ...checkRes.rows[0].data, ...data };
      }
    }
    
    await pool.query(
      `INSERT INTO documents (collection, id, data, updated_at) 
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP) 
       ON CONFLICT (collection, id) 
       DO UPDATE SET data = EXCLUDED.data, updated_at = CURRENT_TIMESTAMP`,
      [req.params.collection, req.params.id, finalData]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(`Error saving doc ${req.params.collection}/${req.params.id}:`, err);
    res.status(500).json({ error: "Failed to save document" });
  }
});

app.post('/api/db/:collection', async (req, res) => {
  try {
    const { data } = req.body;
    const id = data.id || `${req.params.collection}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const finalData = { ...data, id };
    
    if (isFallbackDb) {
      const docs = readFallbackDb();
      docs.push({ collection: req.params.collection, id, data: finalData });
      writeFallbackDb(docs);
      return res.json({ success: true, id });
    }
    
    // PostgreSQL path
    await pool.query(
      `INSERT INTO documents (collection, id, data) 
       VALUES ($1, $2, $3)`,
      [req.params.collection, id, finalData]
    );
    res.json({ success: true, id });
  } catch (err) {
    console.error(`Error adding doc to ${req.params.collection}:`, err);
    res.status(500).json({ error: "Failed to add document" });
  }
});

app.delete('/api/db/:collection/:id', async (req, res) => {
  try {
    if (isFallbackDb) {
      let docs = readFallbackDb();
      docs = docs.filter(d => !(d.collection === req.params.collection && d.id === req.params.id));
      writeFallbackDb(docs);
      return res.json({ success: true });
    }
    
    // PostgreSQL path
    await pool.query(
      "DELETE FROM documents WHERE collection = $1 AND id = $2",
      [req.params.collection, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(`Error deleting doc ${req.params.collection}/${req.params.id}:`, err);
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
