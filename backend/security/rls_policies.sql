-- DaisyDog Row-Level Security (RLS) Policies
-- Implements comprehensive data access control for child safety and privacy

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE daisy_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE jokes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tricks ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;

-- Create security functions
CREATE OR REPLACE FUNCTION auth.user_id() RETURNS uuid AS $$
  SELECT COALESCE(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION auth.role() RETURNS text AS $$
  SELECT COALESCE(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
  )::text
$$ LANGUAGE sql STABLE;

-- Check if user is authenticated
CREATE OR REPLACE FUNCTION is_authenticated() RETURNS boolean AS $$
  SELECT auth.user_id() IS NOT NULL
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Check if user is admin
CREATE OR REPLACE FUNCTION is_admin() RETURNS boolean AS $$
  SELECT auth.role() = 'admin'
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Check if user is moderator or admin
CREATE OR REPLACE FUNCTION is_moderator() RETURNS boolean AS $$
  SELECT auth.role() IN ('admin', 'moderator')
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Check if user owns the record
CREATE OR REPLACE FUNCTION owns_record(record_user_id uuid) RETURNS boolean AS $$
  SELECT auth.user_id() = record_user_id
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Check if user is child (under 13)
CREATE OR REPLACE FUNCTION is_child_user(user_id uuid) RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM users 
    WHERE id = user_id 
    AND age IS NOT NULL 
    AND age < 13
  )
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Check if content is appropriate for children
CREATE OR REPLACE FUNCTION is_child_appropriate(content text) RETURNS boolean AS $$
BEGIN
  -- Basic content filtering (extend as needed)
  IF content IS NULL OR length(content) = 0 THEN
    RETURN true;
  END IF;
  
  -- Check for inappropriate patterns
  IF content ~* '\b(phone|address|location|where.*live|meet.*person)\b' THEN
    RETURN false;
  END IF;
  
  IF content ~* '\b(password|secret|private)\b' THEN
    RETURN false;
  END IF;
  
  IF content ~* '\b(credit.*card|bank|money|pay)\b' THEN
    RETURN false;
  END IF;
  
  -- Check for phone numbers
  IF content ~ '\b\d{3}-\d{3}-\d{4}\b' THEN
    RETURN false;
  END IF;
  
  -- Check for addresses
  IF content ~* '\b\d{1,5}\s+\w+\s+(street|st|avenue|ave|road|rd|drive|dr)\b' THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- USERS TABLE POLICIES
-- Users can only see and modify their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (owns_record(id));

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (owns_record(id))
  WITH CHECK (
    owns_record(id) 
    AND is_child_appropriate(display_name)
    AND (age IS NULL OR (age >= 5 AND age <= 18))
  );

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (
    owns_record(id)
    AND is_child_appropriate(display_name)
    AND (age IS NULL OR (age >= 5 AND age <= 18))
  );

-- Admins can view all users for moderation
CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (is_admin());

-- Moderators can view users for safety monitoring
CREATE POLICY "Moderators can view users" ON users
  FOR SELECT USING (is_moderator());

-- DAISY_STATES TABLE POLICIES
-- Users can only access their own Daisy state
CREATE POLICY "Users can view own Daisy state" ON daisy_states
  FOR SELECT USING (owns_record(user_id));

CREATE POLICY "Users can update own Daisy state" ON daisy_states
  FOR UPDATE USING (owns_record(user_id))
  WITH CHECK (
    owns_record(user_id)
    AND hunger_level >= 0 AND hunger_level <= 10
    AND energy_level >= 0 AND energy_level <= 10
  );

CREATE POLICY "Users can insert own Daisy state" ON daisy_states
  FOR INSERT WITH CHECK (
    owns_record(user_id)
    AND hunger_level >= 0 AND hunger_level <= 10
    AND energy_level >= 0 AND energy_level <= 10
  );

-- System can update Daisy states for background tasks
CREATE POLICY "System can update Daisy states" ON daisy_states
  FOR UPDATE USING (auth.role() = 'service_role');

-- CONVERSATIONS TABLE POLICIES
-- Users can only see their own conversations
CREATE POLICY "Users can view own conversations" ON conversations
  FOR SELECT USING (owns_record(user_id));

CREATE POLICY "Users can insert own conversations" ON conversations
  FOR INSERT WITH CHECK (
    owns_record(user_id)
    AND is_child_appropriate(message)
    AND is_child_appropriate(response)
    AND length(message) <= 1000
    AND length(response) <= 2000
  );

-- Moderators can view conversations for safety monitoring
CREATE POLICY "Moderators can view conversations for safety" ON conversations
  FOR SELECT USING (is_moderator());

-- Admins can delete inappropriate conversations
CREATE POLICY "Admins can delete conversations" ON conversations
  FOR DELETE USING (is_admin());

-- USER_STATS TABLE POLICIES
-- Users can view their own stats
CREATE POLICY "Users can view own stats" ON user_stats
  FOR SELECT USING (owns_record(user_id));

CREATE POLICY "Users can update own stats" ON user_stats
  FOR UPDATE USING (owns_record(user_id))
  WITH CHECK (
    owns_record(user_id)
    AND total_messages >= 0
    AND total_games_played >= 0
    AND total_time_spent >= 0
  );

CREATE POLICY "Users can insert own stats" ON user_stats
  FOR INSERT WITH CHECK (
    owns_record(user_id)
    AND total_messages >= 0
    AND total_games_played >= 0
    AND total_time_spent >= 0
  );

-- System can update stats for background tasks
CREATE POLICY "System can update user stats" ON user_stats
  FOR UPDATE USING (auth.role() = 'service_role');

-- GAME_SESSIONS TABLE POLICIES
-- Users can only access their own game sessions
CREATE POLICY "Users can view own game sessions" ON game_sessions
  FOR SELECT USING (owns_record(user_id));

CREATE POLICY "Users can insert own game sessions" ON game_sessions
  FOR INSERT WITH CHECK (
    owns_record(user_id)
    AND score >= 0
  );

CREATE POLICY "Users can update own game sessions" ON game_sessions
  FOR UPDATE USING (owns_record(user_id))
  WITH CHECK (
    owns_record(user_id)
    AND score >= 0
  );

-- ACHIEVEMENTS TABLE POLICIES
-- Users can view their own achievements
CREATE POLICY "Users can view own achievements" ON achievements
  FOR SELECT USING (owns_record(user_id));

CREATE POLICY "System can award achievements" ON achievements
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- FEEDBACK TABLE POLICIES
-- Users can submit their own feedback
CREATE POLICY "Users can insert own feedback" ON feedback
  FOR INSERT WITH CHECK (
    owns_record(user_id)
    AND is_child_appropriate(feedback_text)
    AND length(feedback_text) <= 1000
  );

-- Moderators can view feedback for improvement
CREATE POLICY "Moderators can view feedback" ON feedback
  FOR SELECT USING (is_moderator());

-- JOKES TABLE POLICIES
-- All authenticated users can view jokes (read-only)
CREATE POLICY "Authenticated users can view jokes" ON jokes
  FOR SELECT USING (is_authenticated());

-- Only admins can modify jokes
CREATE POLICY "Admins can manage jokes" ON jokes
  FOR ALL USING (is_admin());

-- TRICKS TABLE POLICIES
-- All authenticated users can view tricks (read-only)
CREATE POLICY "Authenticated users can view tricks" ON tricks
  FOR SELECT USING (is_authenticated());

-- Only admins can modify tricks
CREATE POLICY "Admins can manage tricks" ON tricks
  FOR ALL USING (is_admin());

-- GAMES TABLE POLICIES
-- All authenticated users can view games (read-only)
CREATE POLICY "Authenticated users can view games" ON games
  FOR SELECT USING (is_authenticated());

-- Only admins can modify games
CREATE POLICY "Admins can manage games" ON games
  FOR ALL USING (is_admin());

-- ADDITIONAL SECURITY MEASURES

-- Create audit log table for security monitoring
CREATE TABLE IF NOT EXISTS security_audit_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES users(id),
  action text NOT NULL,
  table_name text NOT NULL,
  record_id uuid,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs" ON security_audit_log
  FOR SELECT USING (is_admin());

-- System can insert audit logs
CREATE POLICY "System can insert audit logs" ON security_audit_log
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Create function to log security events
CREATE OR REPLACE FUNCTION log_security_event(
  p_user_id uuid,
  p_action text,
  p_table_name text,
  p_record_id uuid DEFAULT NULL,
  p_old_values jsonb DEFAULT NULL,
  p_new_values jsonb DEFAULT NULL
) RETURNS void AS $$
BEGIN
  INSERT INTO security_audit_log (
    user_id, action, table_name, record_id, 
    old_values, new_values, ip_address, user_agent
  ) VALUES (
    p_user_id, p_action, p_table_name, p_record_id,
    p_old_values, p_new_values,
    inet_client_addr(), 
    current_setting('request.headers', true)::jsonb->>'user-agent'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for audit logging
CREATE OR REPLACE FUNCTION audit_trigger_function() RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM log_security_event(
      COALESCE(NEW.user_id, auth.user_id()),
      'INSERT',
      TG_TABLE_NAME,
      NEW.id,
      NULL,
      to_jsonb(NEW)
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM log_security_event(
      COALESCE(NEW.user_id, OLD.user_id, auth.user_id()),
      'UPDATE',
      TG_TABLE_NAME,
      NEW.id,
      to_jsonb(OLD),
      to_jsonb(NEW)
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM log_security_event(
      COALESCE(OLD.user_id, auth.user_id()),
      'DELETE',
      TG_TABLE_NAME,
      OLD.id,
      to_jsonb(OLD),
      NULL
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add audit triggers to sensitive tables
CREATE TRIGGER audit_users_trigger
  AFTER INSERT OR UPDATE OR DELETE ON users
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_conversations_trigger
  AFTER INSERT OR UPDATE OR DELETE ON conversations
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_feedback_trigger
  AFTER INSERT OR UPDATE OR DELETE ON feedback
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Create content moderation function
CREATE OR REPLACE FUNCTION moderate_content(content text) RETURNS boolean AS $$
BEGIN
  -- Log content for review if potentially inappropriate
  IF NOT is_child_appropriate(content) THEN
    PERFORM log_security_event(
      auth.user_id(),
      'CONTENT_FLAGGED',
      'content_moderation',
      NULL,
      NULL,
      jsonb_build_object('content', content, 'reason', 'inappropriate_content')
    );
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create rate limiting table
CREATE TABLE IF NOT EXISTS rate_limits (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES users(id),
  ip_address inet,
  endpoint text NOT NULL,
  request_count integer DEFAULT 1,
  window_start timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on rate limits
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- Only system can manage rate limits
CREATE POLICY "System can manage rate limits" ON rate_limits
  FOR ALL USING (auth.role() = 'service_role');

-- Create rate limiting function
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_user_id uuid,
  p_ip_address inet,
  p_endpoint text,
  p_max_requests integer DEFAULT 60,
  p_window_minutes integer DEFAULT 1
) RETURNS boolean AS $$
DECLARE
  current_count integer;
  window_start timestamp with time zone;
BEGIN
  window_start := now() - (p_window_minutes || ' minutes')::interval;
  
  -- Clean old entries
  DELETE FROM rate_limits 
  WHERE window_start < window_start;
  
  -- Get current count
  SELECT COALESCE(SUM(request_count), 0) INTO current_count
  FROM rate_limits
  WHERE (user_id = p_user_id OR ip_address = p_ip_address)
    AND endpoint = p_endpoint
    AND window_start >= window_start;
  
  -- Check if limit exceeded
  IF current_count >= p_max_requests THEN
    -- Log rate limit violation
    PERFORM log_security_event(
      p_user_id,
      'RATE_LIMIT_EXCEEDED',
      'rate_limits',
      NULL,
      NULL,
      jsonb_build_object(
        'endpoint', p_endpoint,
        'current_count', current_count,
        'max_requests', p_max_requests,
        'ip_address', p_ip_address
      )
    );
    RETURN false;
  END IF;
  
  -- Update or insert rate limit record
  INSERT INTO rate_limits (user_id, ip_address, endpoint, request_count, window_start)
  VALUES (p_user_id, p_ip_address, p_endpoint, 1, now())
  ON CONFLICT (user_id, ip_address, endpoint) 
  DO UPDATE SET 
    request_count = rate_limits.request_count + 1,
    updated_at = now();
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;

-- Grant table permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON users TO authenticated;
GRANT SELECT, INSERT, UPDATE ON daisy_states TO authenticated;
GRANT SELECT, INSERT ON conversations TO authenticated;
GRANT SELECT, INSERT, UPDATE ON user_stats TO authenticated;
GRANT SELECT, INSERT, UPDATE ON game_sessions TO authenticated;
GRANT SELECT ON achievements TO authenticated;
GRANT INSERT ON feedback TO authenticated;
GRANT SELECT ON jokes, tricks, games TO authenticated;

-- Grant additional permissions to service role
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at);
CREATE INDEX IF NOT EXISTS idx_game_sessions_user_id ON game_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_user_id ON security_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_created_at ON security_audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_rate_limits_user_id ON rate_limits(user_id);
CREATE INDEX IF NOT EXISTS idx_rate_limits_ip_address ON rate_limits(ip_address);
CREATE INDEX IF NOT EXISTS idx_rate_limits_window_start ON rate_limits(window_start);

-- Comments for documentation
COMMENT ON FUNCTION is_child_appropriate(text) IS 'Validates content for child safety compliance';
COMMENT ON FUNCTION check_rate_limit(uuid, inet, text, integer, integer) IS 'Implements rate limiting for API endpoints';
COMMENT ON FUNCTION log_security_event(uuid, text, text, uuid, jsonb, jsonb) IS 'Logs security events for audit trail';
COMMENT ON TABLE security_audit_log IS 'Audit trail for security monitoring and compliance';
COMMENT ON TABLE rate_limits IS 'Rate limiting data for API protection';
