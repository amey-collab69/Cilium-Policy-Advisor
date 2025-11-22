-- Sample Flow Data for Testing
-- Run this after the database is initialized

INSERT INTO flows (
  flow_id, timestamp, source_namespace, source_pod, source_labels,
  destination_namespace, destination_pod, destination_labels,
  destination_port, protocol, http_method, http_path
) VALUES
(
  '550e8400-e29b-41d4-a716-446655440001',
  '2025-11-19 10:30:00',
  'default',
  'frontend-abc123',
  '{"app":"frontend","version":"v1"}',
  'default',
  'backend-xyz789',
  '{"app":"backend","version":"v1"}',
  8080,
  'TCP',
  'GET',
  '/api/users'
),
(
  '550e8400-e29b-41d4-a716-446655440002',
  '2025-11-19 10:31:00',
  'default',
  'frontend-abc123',
  '{"app":"frontend","version":"v1"}',
  'default',
  'backend-xyz789',
  '{"app":"backend","version":"v1"}',
  8080,
  'TCP',
  'POST',
  '/api/users'
),
(
  '550e8400-e29b-41d4-a716-446655440003',
  '2025-11-19 10:32:00',
  'default',
  'backend-xyz789',
  '{"app":"backend","version":"v1"}',
  'default',
  'database-def456',
  '{"app":"database","tier":"data"}',
  5432,
  'TCP',
  NULL,
  NULL
),
(
  '550e8400-e29b-41d4-a716-446655440004',
  '2025-11-19 10:33:00',
  'default',
  'frontend-abc123',
  '{"app":"frontend","version":"v1"}',
  'default',
  'backend-xyz789',
  '{"app":"backend","version":"v1"}',
  8080,
  'TCP',
  'GET',
  '/api/products'
),
(
  '550e8400-e29b-41d4-a716-446655440005',
  '2025-11-19 10:34:00',
  'monitoring',
  'prometheus-server',
  '{"app":"prometheus","component":"server"}',
  'default',
  'backend-xyz789',
  '{"app":"backend","version":"v1"}',
  9090,
  'TCP',
  'GET',
  '/metrics'
);
