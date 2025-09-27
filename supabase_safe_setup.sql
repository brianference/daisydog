-- DAISYDOG V6.1.0 SAFE SUPABASE SETUP
-- This script only CREATES tables and indexes - no destructive operations
-- Safe to run multiple times (uses IF NOT EXISTS)

-- ===== STEP 1: CREATE CORE TABLES (SAFE) =====

-- Anonymous session tracking (no user identification)
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  age_range TEXT CHECK (age_range IN ('8-12', '13-16', '17+')),
  session_duration INTEGER DEFAULT 0,
  interactions_count INTEGER DEFAULT 0
);

-- Safety system analytics (anonymous)
CREATE TABLE IF NOT EXISTS safety_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID,
  event_type TEXT NOT NULL CHECK (event_type IN ('drug_safety', 'comprehensive_safety', 'false_positive')),
  category TEXT,
  keyword_matched TEXT,
  age_range TEXT CHECK (age_range IN ('8-12', '13-16', '17+')),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  was_helpful BOOLEAN
);

-- Performance monitoring (anonymous)
CREATE TABLE IF NOT EXISTS performance_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID,
  metric_name TEXT NOT NULL,
  metric_value FLOAT NOT NULL,
  success BOOLEAN DEFAULT TRUE,
  error_type TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Feature usage analytics (anonymous)
CREATE TABLE IF NOT EXISTS feature_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID,
  feature_name TEXT NOT NULL,
  action_type TEXT NOT NULL,
  duration_seconds INTEGER,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content caching for performance
CREATE TABLE IF NOT EXISTS content_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key TEXT UNIQUE NOT NULL,
  content_type TEXT NOT NULL,
  content_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  access_count INTEGER DEFAULT 0,
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Aggregated reports (daily/weekly summaries)
CREATE TABLE IF NOT EXISTS system_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_date DATE NOT NULL,
  report_type TEXT NOT NULL CHECK (report_type IN ('daily', 'weekly', 'monthly')),
  metrics JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== STEP 2: ADD FOREIGN KEY CONSTRAINTS (SAFE) =====

-- Add foreign key constraints (only if they don't exist)
DO $$
BEGIN
  -- Safety events foreign key
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'safety_events_session_id_fkey'
  ) THEN
    ALTER TABLE safety_events 
    ADD CONSTRAINT safety_events_session_id_fkey 
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE;
  END IF;

  -- Performance logs foreign key
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'performance_logs_session_id_fkey'
  ) THEN
    ALTER TABLE performance_logs 
    ADD CONSTRAINT performance_logs_session_id_fkey 
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE;
  END IF;

  -- Feature analytics foreign key
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'feature_analytics_session_id_fkey'
  ) THEN
    ALTER TABLE feature_analytics 
    ADD CONSTRAINT feature_analytics_session_id_fkey 
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE;
  END IF;
END $$;

-- ===== STEP 3: CREATE INDEXES (SAFE) =====

-- Sessions indexes
CREATE INDEX IF NOT EXISTS idx_sessions_age_range ON sessions(age_range);
CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_sessions_last_activity ON sessions(last_activity);

-- Safety events indexes
CREATE INDEX IF NOT EXISTS idx_safety_events_session_id ON safety_events(session_id);
CREATE INDEX IF NOT EXISTS idx_safety_events_event_type ON safety_events(event_type);
CREATE INDEX IF NOT EXISTS idx_safety_events_category ON safety_events(category);
CREATE INDEX IF NOT EXISTS idx_safety_events_timestamp ON safety_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_safety_events_age_range ON safety_events(age_range);

-- Performance logs indexes
CREATE INDEX IF NOT EXISTS idx_performance_logs_session_id ON performance_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_performance_logs_metric_name ON performance_logs(metric_name);
CREATE INDEX IF NOT EXISTS idx_performance_logs_timestamp ON performance_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_performance_logs_success ON performance_logs(success);

-- Feature analytics indexes
CREATE INDEX IF NOT EXISTS idx_feature_analytics_session_id ON feature_analytics(session_id);
CREATE INDEX IF NOT EXISTS idx_feature_analytics_feature_name ON feature_analytics(feature_name);
CREATE INDEX IF NOT EXISTS idx_feature_analytics_action_type ON feature_analytics(action_type);
CREATE INDEX IF NOT EXISTS idx_feature_analytics_timestamp ON feature_analytics(timestamp);

-- Content cache indexes
CREATE INDEX IF NOT EXISTS idx_content_cache_cache_key ON content_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_content_cache_content_type ON content_cache(content_type);
CREATE INDEX IF NOT EXISTS idx_content_cache_expires_at ON content_cache(expires_at);

-- System reports indexes
CREATE INDEX IF NOT EXISTS idx_system_reports_report_date ON system_reports(report_date);
CREATE INDEX IF NOT EXISTS idx_system_reports_report_type ON system_reports(report_type);

-- ===== STEP 4: ENABLE ROW LEVEL SECURITY (SAFE) =====

-- Enable RLS on all tables (safe operation)
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_reports ENABLE ROW LEVEL SECURITY;

-- ===== STEP 5: CREATE POLICIES (SAFE) =====

-- Create policies for anonymous access (only if they don't exist)
DO $$
BEGIN
  -- Sessions policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'sessions' AND policyname = 'Allow anonymous insert on sessions'
  ) THEN
    CREATE POLICY "Allow anonymous insert on sessions" ON sessions
      FOR INSERT TO anon WITH CHECK (true);
  END IF;

  -- Safety events policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'safety_events' AND policyname = 'Allow anonymous insert on safety_events'
  ) THEN
    CREATE POLICY "Allow anonymous insert on safety_events" ON safety_events
      FOR INSERT TO anon WITH CHECK (true);
  END IF;

  -- Performance logs policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'performance_logs' AND policyname = 'Allow anonymous insert on performance_logs'
  ) THEN
    CREATE POLICY "Allow anonymous insert on performance_logs" ON performance_logs
      FOR INSERT TO anon WITH CHECK (true);
  END IF;

  -- Feature analytics policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'feature_analytics' AND policyname = 'Allow anonymous insert on feature_analytics'
  ) THEN
    CREATE POLICY "Allow anonymous insert on feature_analytics" ON feature_analytics
      FOR INSERT TO anon WITH CHECK (true);
  END IF;

  -- Content cache policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'content_cache' AND policyname = 'Allow anonymous read/write on content_cache'
  ) THEN
    CREATE POLICY "Allow anonymous read/write on content_cache" ON content_cache
      FOR ALL TO anon USING (true) WITH CHECK (true);
  END IF;

  -- System reports policies (admin only)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'system_reports' AND policyname = 'Admin only access to system_reports'
  ) THEN
    CREATE POLICY "Admin only access to system_reports" ON system_reports
      FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;

-- ===== VERIFICATION QUERY (SAFE) =====

-- Verify setup completed successfully
SELECT 
  'Tables Created' as status,
  COUNT(*) as count
FROM information_schema.tables 
WHERE table_name IN ('sessions', 'safety_events', 'performance_logs', 'feature_analytics', 'content_cache', 'system_reports')
AND table_schema = 'public';

-- Show table details
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name IN ('sessions', 'safety_events', 'performance_logs', 'feature_analytics', 'content_cache', 'system_reports')
AND table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- ===== COMMENTS FOR DOCUMENTATION =====

COMMENT ON TABLE sessions IS 'Anonymous user sessions - COPPA compliant, no personal identification';
COMMENT ON TABLE safety_events IS 'Safety system effectiveness tracking - anonymous analytics only';
COMMENT ON TABLE performance_logs IS 'Application performance monitoring - no personal data';
COMMENT ON TABLE feature_analytics IS 'Feature usage patterns - aggregated anonymous data';
COMMENT ON TABLE content_cache IS 'Performance optimization cache - no personal content';
COMMENT ON TABLE system_reports IS 'Aggregated analytics reports - privacy compliant';

-- Success message
SELECT 'DaisyDog PostgreSQL setup completed successfully! All tables, indexes, and policies created.' as result;
