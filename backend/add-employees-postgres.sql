-- SQL Script to add employees to PostgreSQL on Render
-- Run this in Render PostgreSQL Console or use psql

-- First, make sure permissions column exists
ALTER TABLE users ADD COLUMN IF NOT EXISTS permissions TEXT;

-- Delete old test users if they exist
DELETE FROM users WHERE email IN ('saher', 'amira', 'tasneem', 'shaker', 'Akram');

-- Insert Employee 1: Saher
INSERT INTO users (id, email, name, "passwordHash", role, department, permissions, "isActive", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'saher',
  'Saher',
  '$2b$10$YourHashedPasswordHere',  -- Will be replaced with actual hash
  'employee',
  'Customer Service',
  '["make_calls","receive_calls","listen_own_calls"]',
  true,
  NOW(),
  NOW()
);

-- Insert Employee 2: Amira
INSERT INTO users (id, email, name, "passwordHash", role, department, permissions, "isActive", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'amira',
  'Amira',
  '$2b$10$YourHashedPasswordHere',
  'employee',
  'Customer Service',
  '["make_calls","receive_calls","listen_own_calls"]',
  true,
  NOW(),
  NOW()
);

-- Insert Employee 3: Tasneem
INSERT INTO users (id, email, name, "passwordHash", role, department, permissions, "isActive", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'tasneem',
  'Tasneem',
  '$2b$10$YourHashedPasswordHere',
  'employee',
  'Customer Service',
  '["make_calls","receive_calls","listen_own_calls"]',
  true,
  NOW(),
  NOW()
);

-- Insert Employee 4: Shaker
INSERT INTO users (id, email, name, "passwordHash", role, department, permissions, "isActive", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'shaker',
  'Shaker',
  '$2b$10$YourHashedPasswordHere',
  'employee',
  'Customer Service',
  '["make_calls","receive_calls","listen_own_calls"]',
  true,
  NOW(),
  NOW()
);

-- Insert Admin: Akram
INSERT INTO users (id, email, name, "passwordHash", role, department, permissions, "isActive", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'Akram',
  'Akram Admin',
  '$2b$10$YourHashedPasswordHere',
  'admin',
  'Admin',
  '["make_calls","receive_calls","listen_own_calls","listen_all_calls","manage_users","view_reports"]',
  true,
  NOW(),
  NOW()
);

-- Verify the users were added
SELECT email, name, role, permissions FROM users WHERE email IN ('saher', 'amira', 'tasneem', 'shaker', 'Akram');
