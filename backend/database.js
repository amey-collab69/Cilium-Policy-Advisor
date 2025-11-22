import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database path from environment or default
const DB_PATH = process.env.DATABASE_PATH || path.join(__dirname, '../database/cpa.db');

// Create database connection
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('❌ Database connection error:', err.message);
    process.exit(1);
  }
  console.log('✅ Connected to SQLite database at:', DB_PATH);
});

// Promisify database methods for async/await
export const dbRun = promisify(db.run.bind(db));
export const dbGet = promisify(db.get.bind(db));
export const dbAll = promisify(db.all.bind(db));

/**
 * Initialize database tables if they don't exist
 */
export async function initDatabase() {
  try {
    // Create flows table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS flows (
        flow_id TEXT PRIMARY KEY,
        timestamp DATETIME NOT NULL,
        source_namespace TEXT NOT NULL,
        source_pod TEXT,
        source_labels TEXT,
        destination_namespace TEXT NOT NULL,
        destination_pod TEXT,
        destination_labels TEXT,
        destination_port INTEGER,
        protocol TEXT,
        http_method TEXT,
        http_path TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for flows table
    await dbRun('CREATE INDEX IF NOT EXISTS idx_flows_timestamp ON flows(timestamp)');
    await dbRun('CREATE INDEX IF NOT EXISTS idx_flows_source_ns ON flows(source_namespace)');
    await dbRun('CREATE INDEX IF NOT EXISTS idx_flows_dest_ns ON flows(destination_namespace)');

    // Create policies table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS policies (
        policy_id TEXT PRIMARY KEY,
        policy_name TEXT NOT NULL UNIQUE,
        namespace TEXT NOT NULL,
        yaml_content TEXT NOT NULL,
        status TEXT DEFAULT 'draft',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for policies table
    await dbRun('CREATE INDEX IF NOT EXISTS idx_policies_namespace ON policies(namespace)');
    await dbRun('CREATE INDEX IF NOT EXISTS idx_policies_status ON policies(status)');

    // Create versions table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS versions (
        version_id TEXT PRIMARY KEY,
        policy_id TEXT NOT NULL,
        version_number INTEGER NOT NULL,
        yaml_content TEXT NOT NULL,
        change_summary TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (policy_id) REFERENCES policies(policy_id) ON DELETE CASCADE,
        UNIQUE(policy_id, version_number)
      )
    `);

    // Create index for versions table
    await dbRun('CREATE INDEX IF NOT EXISTS idx_versions_policy_id ON versions(policy_id)');

    console.log('✅ Database tables initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization error:', error.message);
    throw error;
  }
}

export default db;
