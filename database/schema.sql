-- Cilium Policy Advisor Database Schema
-- SQLite Database

-- Flows Table: Stores captured Hubble flow logs
CREATE TABLE IF NOT EXISTS flows (
  flow_id TEXT PRIMARY KEY,
  timestamp DATETIME NOT NULL,
  source_namespace TEXT NOT NULL,
  source_pod TEXT,
  source_labels TEXT,  -- JSON string
  destination_namespace TEXT NOT NULL,
  destination_pod TEXT,
  destination_labels TEXT,  -- JSON string
  destination_port INTEGER,
  protocol TEXT,
  http_method TEXT,
  http_path TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for flows table
CREATE INDEX IF NOT EXISTS idx_flows_timestamp ON flows(timestamp);
CREATE INDEX IF NOT EXISTS idx_flows_source_ns ON flows(source_namespace);
CREATE INDEX IF NOT EXISTS idx_flows_dest_ns ON flows(destination_namespace);

-- Policies Table: Stores generated CiliumNetworkPolicy configurations
CREATE TABLE IF NOT EXISTS policies (
  policy_id TEXT PRIMARY KEY,
  policy_name TEXT NOT NULL UNIQUE,
  namespace TEXT NOT NULL,
  yaml_content TEXT NOT NULL,
  status TEXT DEFAULT 'draft',  -- draft, active, archived
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for policies table
CREATE INDEX IF NOT EXISTS idx_policies_namespace ON policies(namespace);
CREATE INDEX IF NOT EXISTS idx_policies_status ON policies(status);

-- Versions Table: Stores policy version history
CREATE TABLE IF NOT EXISTS versions (
  version_id TEXT PRIMARY KEY,
  policy_id TEXT NOT NULL,
  version_number INTEGER NOT NULL,
  yaml_content TEXT NOT NULL,
  change_summary TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (policy_id) REFERENCES policies(policy_id) ON DELETE CASCADE,
  UNIQUE(policy_id, version_number)
);

-- Index for versions table
CREATE INDEX IF NOT EXISTS idx_versions_policy_id ON versions(policy_id);
