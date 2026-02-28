const db = require('../db');

// Add open_for_collaboration column if it doesn't exist
try {
  db.exec('ALTER TABLE projects ADD COLUMN open_for_collaboration INTEGER DEFAULT 0');
  console.log('Added open_for_collaboration to projects table');
} catch(e) {
  if (e.message.includes('duplicate column')) {
    console.log('Column already exists');
  } else {
    console.error(e.message);
  }
}

// Add contributions table
db.exec(`CREATE TABLE IF NOT EXISTS contributions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  skill TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`);
console.log('Contributions table ready');
