-- DaisyDog D1 schema. Derived from the queries in netlify/functions/* and shared/schema.ts.
-- Timestamps are ISO-8601 UTC text so they compare correctly with the layer's NOW().
-- Booleans are 0/1; JSON columns are text (parsed by netlify/shared/utils/d1-sql.cjs).

CREATE TABLE IF NOT EXISTS parents (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  stripe_customer_id TEXT UNIQUE,
  subscription_status TEXT NOT NULL DEFAULT 'free',
  subscription_tier TEXT,
  subscription_started_at TEXT,
  subscription_ends_at TEXT,
  email_verified INTEGER NOT NULL DEFAULT 0,
  email_verification_token TEXT,
  password_reset_token TEXT,
  password_reset_expires TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS children (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))),
  parent_id TEXT NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
  nickname TEXT NOT NULL,
  age_range TEXT NOT NULL,
  avatar_color TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX IF NOT EXISTS idx_children_parent ON children(parent_id);

CREATE TABLE IF NOT EXISTS child_link_codes (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))),
  child_id TEXT NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  used_at TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS parent_settings (
  parent_id TEXT PRIMARY KEY REFERENCES parents(id) ON DELETE CASCADE,
  email_reports_enabled INTEGER NOT NULL DEFAULT 1,
  safety_alerts_enabled INTEGER NOT NULL DEFAULT 1,
  content_filter_level TEXT NOT NULL DEFAULT 'moderate',
  daily_time_limit_minutes INTEGER,
  bedtime_start TEXT,
  bedtime_end TEXT,
  allowed_features TEXT NOT NULL DEFAULT '{"games":true,"chat":true,"prayers":true}',
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- sessions.id is text: logActivity inserts ids like "session_<timestamp>".
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))),
  child_id TEXT REFERENCES children(id) ON DELETE SET NULL,
  is_linked_account INTEGER NOT NULL DEFAULT 0,
  age_range TEXT,
  session_duration INTEGER NOT NULL DEFAULT 0,
  interactions_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  last_activity TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX IF NOT EXISTS idx_sessions_child ON sessions(child_id);

-- No foreign key on session_id: logSafetyEvent falls back to the literal 'unknown'.
CREATE TABLE IF NOT EXISTS safety_events (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))),
  session_id TEXT,
  event_type TEXT NOT NULL,
  category TEXT,
  keyword_matched TEXT,
  trigger_text TEXT,
  response_text TEXT,
  age_range TEXT,
  was_helpful INTEGER,
  parent_reviewed INTEGER NOT NULL DEFAULT 0,
  timestamp TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX IF NOT EXISTS idx_safety_events_session ON safety_events(session_id);

CREATE TABLE IF NOT EXISTS feature_analytics (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))),
  session_id TEXT,
  feature_name TEXT NOT NULL,
  action_type TEXT NOT NULL,
  duration_seconds INTEGER,
  timestamp TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX IF NOT EXISTS idx_feature_analytics_session ON feature_analytics(session_id);

CREATE TABLE IF NOT EXISTS catechesis_lessons (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  topic TEXT,
  age_group TEXT,
  liturgical_season TEXT,
  lesson_type TEXT,
  objectives TEXT NOT NULL DEFAULT '[]',
  lesson_content TEXT,
  vocabulary_words TEXT NOT NULL DEFAULT '[]',
  discussion_questions TEXT NOT NULL DEFAULT '[]',
  source_attribution TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS lesson_activities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lesson_id INTEGER NOT NULL REFERENCES catechesis_lessons(id) ON DELETE CASCADE,
  activity_type TEXT,
  activity_name TEXT,
  activity_description TEXT,
  materials_needed TEXT,
  instructions TEXT,
  external_links TEXT NOT NULL DEFAULT '[]'
);
CREATE INDEX IF NOT EXISTS idx_lesson_activities_lesson ON lesson_activities(lesson_id);

CREATE TABLE IF NOT EXISTS liturgical_calendar (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  season TEXT NOT NULL,
  description TEXT,
  color TEXT,
  date_start TEXT NOT NULL,
  date_end TEXT NOT NULL
);

-- ON CONFLICT (child_id, lesson_id) in lessons-api needs this composite key.
CREATE TABLE IF NOT EXISTS lesson_progress (
  child_id TEXT NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  lesson_id INTEGER NOT NULL REFERENCES catechesis_lessons(id) ON DELETE CASCADE,
  started_at TEXT,
  completed_at TEXT,
  time_spent_minutes INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  PRIMARY KEY (child_id, lesson_id)
);
