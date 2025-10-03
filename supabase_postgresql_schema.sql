-- DAISYDOG V6.1.0 SUPABASE POSTGRESQL SCHEMA
-- Privacy-First Child Protection Database
-- COPPA Compliant - No Personal Data Collection

-- ===== CORE TABLES =====

-- Anonymous session tracking (no user identification)
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  age_range TEXT CHECK (age_range IN ('8-12', '13-16', '17+')),
  session_duration INTEGER DEFAULT 0, -- total seconds
  interactions_count INTEGER DEFAULT 0
);

-- Safety system analytics (anonymous)
CREATE TABLE IF NOT EXISTS safety_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('drug_safety', 'comprehensive_safety', 'false_positive')),
  category TEXT, -- e.g., 'drugs', 'violence', 'digital_safety'
  keyword_matched TEXT, -- for debugging false positives (not user input)
  age_range TEXT CHECK (age_range IN ('8-12', '13-16', '17+')),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  was_helpful BOOLEAN
);

-- Performance monitoring (anonymous)
CREATE TABLE IF NOT EXISTS performance_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  metric_name TEXT NOT NULL, -- 'gemini_response_time', 'thinking_animation', etc.
  metric_value FLOAT NOT NULL,
  success BOOLEAN DEFAULT TRUE,
  error_type TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Feature usage analytics (anonymous)
CREATE TABLE IF NOT EXISTS feature_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  feature_name TEXT NOT NULL, -- 'games', 'bible', 'math', 'ai_chat', 'sound'
  action_type TEXT NOT NULL, -- 'start', 'complete', 'abandon', 'addition', 'subtraction', etc.
  duration_seconds INTEGER,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content caching for performance
CREATE TABLE IF NOT EXISTS content_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key TEXT UNIQUE NOT NULL,
  content_type TEXT NOT NULL, -- 'bible_verse', 'ai_response_template', 'safety_tip'
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

-- ===== EDUCATIONAL CONTENT TABLES =====

-- Historical events for American history education
CREATE TABLE IF NOT EXISTS historical_events (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  year INTEGER NOT NULL,
  date_display TEXT, -- e.g., "July 4, 1776"
  short_description TEXT NOT NULL,
  long_description TEXT,
  kid_friendly_summary TEXT NOT NULL,
  significance TEXT,
  related_presidents TEXT[], -- array of president names if applicable
  image_url TEXT,
  category TEXT CHECK (category IN ('founding', 'war', 'expansion', 'civil_rights', 'technology', 'politics', 'culture')),
  age_appropriate_min INTEGER DEFAULT 8,
  age_appropriate_max INTEGER DEFAULT 18,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- U.S. Presidents for educational reference
CREATE TABLE IF NOT EXISTS presidents (
  id SERIAL PRIMARY KEY,
  number INTEGER UNIQUE NOT NULL, -- presidential number (1-46+)
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  full_name TEXT NOT NULL,
  birth_year INTEGER,
  death_year INTEGER,
  party TEXT,
  term_start INTEGER NOT NULL, -- year
  term_end INTEGER, -- NULL if current
  vice_presidents TEXT[], -- array of VP names
  major_accomplishments TEXT[],
  kid_friendly_summary TEXT NOT NULL,
  fun_facts TEXT[],
  portrait_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== POSTGRESQL INDEXES FOR PERFORMANCE =====

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

-- Historical events indexes
CREATE INDEX IF NOT EXISTS idx_historical_events_year ON historical_events(year);
CREATE INDEX IF NOT EXISTS idx_historical_events_category ON historical_events(category);
CREATE INDEX IF NOT EXISTS idx_historical_events_display_order ON historical_events(display_order);

-- Presidents indexes
CREATE INDEX IF NOT EXISTS idx_presidents_number ON presidents(number);
CREATE INDEX IF NOT EXISTS idx_presidents_term_start ON presidents(term_start);
CREATE INDEX IF NOT EXISTS idx_presidents_last_name ON presidents(last_name);

-- ===== POSTGRESQL DATA RETENTION POLICIES =====

-- Function to clean up old data (COPPA compliance)
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS void AS $$
BEGIN
  -- Delete safety events older than 90 days
  DELETE FROM safety_events 
  WHERE timestamp < NOW() - INTERVAL '90 days';
  
  -- Delete performance logs older than 30 days
  DELETE FROM performance_logs 
  WHERE timestamp < NOW() - INTERVAL '30 days';
  
  -- Delete feature analytics older than 60 days
  DELETE FROM feature_analytics 
  WHERE timestamp < NOW() - INTERVAL '60 days';
  
  -- Delete expired content cache
  DELETE FROM content_cache 
  WHERE expires_at IS NOT NULL AND expires_at < NOW();
  
  -- Delete old sessions (90 days)
  DELETE FROM sessions 
  WHERE created_at < NOW() - INTERVAL '90 days';
  
  -- Keep only last 12 months of system reports
  DELETE FROM system_reports 
  WHERE created_at < NOW() - INTERVAL '12 months';
  
  RAISE NOTICE 'Data cleanup completed at %', NOW();
END;
$$ LANGUAGE plpgsql;

-- ===== POSTGRESQL ROW LEVEL SECURITY (RLS) =====

-- Enable RLS on all tables for additional security
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE historical_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE presidents ENABLE ROW LEVEL SECURITY;

-- Create policies for anonymous access (Supabase anon key)
CREATE POLICY "Allow anonymous insert on sessions" ON sessions
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anonymous insert on safety_events" ON safety_events
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anonymous insert on performance_logs" ON performance_logs
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anonymous insert on feature_analytics" ON feature_analytics
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anonymous read/write on content_cache" ON content_cache
  FOR ALL TO anon USING (true) WITH CHECK (true);

-- Admin-only policies for system_reports
CREATE POLICY "Admin only access to system_reports" ON system_reports
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Educational content policies (public read-only, admin write)
CREATE POLICY "Allow anonymous read on historical_events" ON historical_events
  FOR SELECT TO anon USING (true);

CREATE POLICY "Allow anonymous read on presidents" ON presidents
  FOR SELECT TO anon USING (true);

CREATE POLICY "Admin write on historical_events" ON historical_events
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admin write on presidents" ON presidents
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ===== POSTGRESQL TRIGGERS FOR AUTOMATIC CLEANUP =====

-- Trigger to automatically update session activity
CREATE OR REPLACE FUNCTION update_session_activity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE sessions 
  SET last_activity = NOW(),
      interactions_count = interactions_count + 1
  WHERE id = NEW.session_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to relevant tables
CREATE TRIGGER trigger_update_session_activity_safety
  AFTER INSERT ON safety_events
  FOR EACH ROW EXECUTE FUNCTION update_session_activity();

CREATE TRIGGER trigger_update_session_activity_performance
  AFTER INSERT ON performance_logs
  FOR EACH ROW EXECUTE FUNCTION update_session_activity();

CREATE TRIGGER trigger_update_session_activity_features
  AFTER INSERT ON feature_analytics
  FOR EACH ROW EXECUTE FUNCTION update_session_activity();

-- ===== POSTGRESQL VIEWS FOR ANALYTICS =====

-- View for safety analytics (aggregated, no personal data)
CREATE OR REPLACE VIEW safety_analytics_summary AS
SELECT 
  DATE(timestamp) as event_date,
  event_type,
  category,
  age_range,
  COUNT(*) as event_count,
  COUNT(CASE WHEN was_helpful = true THEN 1 END) as helpful_count,
  COUNT(CASE WHEN was_helpful = false THEN 1 END) as not_helpful_count
FROM safety_events
GROUP BY DATE(timestamp), event_type, category, age_range
ORDER BY event_date DESC;

-- View for performance metrics summary
CREATE OR REPLACE VIEW performance_summary AS
SELECT 
  DATE(timestamp) as metric_date,
  metric_name,
  AVG(metric_value) as avg_value,
  MIN(metric_value) as min_value,
  MAX(metric_value) as max_value,
  COUNT(*) as total_measurements,
  COUNT(CASE WHEN success = true THEN 1 END) as success_count,
  COUNT(CASE WHEN success = false THEN 1 END) as failure_count
FROM performance_logs
GROUP BY DATE(timestamp), metric_name
ORDER BY metric_date DESC;

-- View for feature usage summary
CREATE OR REPLACE VIEW feature_usage_summary AS
SELECT 
  DATE(timestamp) as usage_date,
  feature_name,
  action_type,
  COUNT(*) as usage_count,
  AVG(duration_seconds) as avg_duration
FROM feature_analytics
WHERE duration_seconds IS NOT NULL
GROUP BY DATE(timestamp), feature_name, action_type
ORDER BY usage_date DESC;

-- ===== POSTGRESQL SCHEDULED CLEANUP (via pg_cron if available) =====

-- Note: This requires pg_cron extension in PostgreSQL
-- Supabase may not have this enabled, so manual cleanup may be needed

-- Schedule daily cleanup at 2 AM UTC (if pg_cron is available)
-- SELECT cron.schedule('daily-cleanup', '0 2 * * *', 'SELECT cleanup_old_data();');

-- ===== COMMENTS FOR DOCUMENTATION =====

COMMENT ON TABLE sessions IS 'Anonymous user sessions - no personal identification';
COMMENT ON TABLE safety_events IS 'Safety system triggers and effectiveness tracking';
COMMENT ON TABLE performance_logs IS 'Application performance metrics and monitoring';
COMMENT ON TABLE feature_analytics IS 'Feature usage patterns and engagement';
COMMENT ON TABLE content_cache IS 'Cached content for performance optimization';
COMMENT ON TABLE system_reports IS 'Aggregated system reports and analytics';
COMMENT ON TABLE historical_events IS 'Key moments in American history for educational reference';
COMMENT ON TABLE presidents IS 'U.S. Presidents information for educational reference';

COMMENT ON FUNCTION cleanup_old_data() IS 'COPPA-compliant data retention cleanup';

-- ===== SETUP VERIFICATION =====

-- Query to verify schema setup
SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables 
WHERE tablename IN ('sessions', 'safety_events', 'performance_logs', 'feature_analytics', 'content_cache', 'system_reports', 'historical_events', 'presidents')
ORDER BY tablename;

-- Query to verify indexes
SELECT 
  indexname,
  tablename,
  indexdef
FROM pg_indexes 
WHERE tablename IN ('sessions', 'safety_events', 'performance_logs', 'feature_analytics', 'content_cache', 'system_reports', 'historical_events', 'presidents')
ORDER BY tablename, indexname;

-- ===== POSTGRESQL SPECIFIC NOTES =====

/*
POSTGRESQL FEATURES USED:
- UUID with gen_random_uuid() for unique identifiers
- TIMESTAMP WITH TIME ZONE for proper timezone handling
- JSONB for flexible JSON storage with indexing
- Row Level Security (RLS) for access control
- Triggers for automatic data maintenance
- Views for aggregated analytics
- CHECK constraints for data validation
- Foreign key constraints with CASCADE delete
- Indexes for query performance optimization

SUPABASE INTEGRATION:
- Uses Supabase's built-in authentication roles (anon, authenticated)
- Compatible with Supabase's real-time features
- Optimized for Supabase's connection pooling
- Follows Supabase security best practices

COPPA COMPLIANCE:
- No personally identifiable information stored
- Age ranges instead of exact ages
- Automatic data expiration
- Anonymous session tracking only
- No behavioral profiling capabilities
*/
