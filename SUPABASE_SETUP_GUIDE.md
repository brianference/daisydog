# DAISYDOG SUPABASE POSTGRESQL SETUP GUIDE
**Complete Database Integration for V6.1.0**

---

## 🎯 **OVERVIEW**

This guide walks through setting up the PostgreSQL database on Supabase for DaisyDog's privacy-first analytics system.

**Key Features:**
- ✅ **COPPA Compliant**: No personal data collection
- ✅ **Anonymous Analytics**: Session-based tracking only
- ✅ **PostgreSQL Optimized**: Full use of PostgreSQL features
- ✅ **Automatic Cleanup**: Built-in data retention policies
- ✅ **Performance Focused**: Optimized indexes and queries

---

## 📋 **PREREQUISITES**

### **Required:**
- Supabase account (free tier works)
- DaisyDog project with environment variables configured
- PostgreSQL knowledge (basic)

### **Environment Variables:**
```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## 🚀 **STEP-BY-STEP SETUP**

### **Step 1: Create Supabase Project**
1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Create new organization (if needed)
4. Create new project:
   - **Name**: `daisydog-analytics`
   - **Database Password**: Generate strong password
   - **Region**: Choose closest to your users
5. Wait for project initialization (2-3 minutes)

### **Step 2: Configure Environment Variables**
1. In Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   ```bash
   # Add to your .env.local file
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

### **Step 3: Execute PostgreSQL Schema**
1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy the entire contents of `supabase_postgresql_schema.sql`
4. Paste into the SQL editor
5. Click **Run** to execute the schema
6. Verify all tables were created successfully

### **Step 4: Verify Database Setup**
Run this verification query in the SQL Editor:
```sql
-- Verify all tables exist
SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables 
WHERE tablename IN ('sessions', 'safety_events', 'performance_logs', 'feature_analytics', 'content_cache', 'system_reports')
ORDER BY tablename;
```

Expected result: 6 tables listed

### **Step 5: Test Database Connection**
1. Start your DaisyDog development server
2. Open browser console (F12)
3. Run: `window.SupabaseService.debugStatus()`
4. Verify connection shows as successful

---

## 🔧 **DATABASE SCHEMA DETAILS**

### **Core Tables:**

#### **`sessions`** - Anonymous User Sessions
```sql
- id: UUID (primary key)
- age_range: '8-12' | '13-16' | '17+' (no exact ages)
- created_at: timestamp
- last_activity: timestamp  
- interactions_count: integer
```

#### **`safety_events`** - Safety System Analytics
```sql
- session_id: UUID (foreign key)
- event_type: 'drug_safety' | 'comprehensive_safety' | 'false_positive'
- category: string (e.g., 'drugs', 'violence')
- keyword_matched: string (for debugging)
- age_range: string
- was_helpful: boolean
```

#### **`performance_logs`** - System Performance
```sql
- session_id: UUID (foreign key)
- metric_name: string (e.g., 'gemini_response_time')
- metric_value: float (seconds)
- success: boolean
- error_type: string
```

#### **`feature_analytics`** - Feature Usage
```sql
- session_id: UUID (foreign key)
- feature_name: string (e.g., 'math', 'games', 'bible')
- action_type: string (e.g., 'addition', 'start', 'complete')
- duration_seconds: integer
```

#### **`content_cache`** - Performance Optimization
```sql
- cache_key: string (unique)
- content_type: string
- content_data: JSONB
- expires_at: timestamp
- access_count: integer
```

#### **`system_reports`** - Aggregated Analytics
```sql
- report_date: date
- report_type: 'daily' | 'weekly' | 'monthly'
- metrics: JSONB
```

---

## 🛡️ **PRIVACY & SECURITY FEATURES**

### **Row Level Security (RLS)**
- All tables have RLS enabled
- Anonymous users can only insert data
- No personal data can be stored
- Automatic data cleanup policies

### **Data Retention**
- **Safety Events**: 90 days maximum
- **Performance Logs**: 30 days maximum
- **Feature Analytics**: 60 days maximum
- **Sessions**: 90 days maximum
- **System Reports**: 12 months maximum

### **COPPA Compliance**
- ✅ No personally identifiable information
- ✅ Age ranges only (not exact ages)
- ✅ Anonymous session tracking
- ✅ No behavioral profiling
- ✅ Automatic data expiration

---

## 📊 **ANALYTICS VIEWS**

### **Safety Analytics Summary**
```sql
SELECT * FROM safety_analytics_summary
WHERE event_date >= CURRENT_DATE - INTERVAL '7 days';
```

### **Performance Summary**
```sql
SELECT * FROM performance_summary
WHERE metric_date >= CURRENT_DATE - INTERVAL '7 days'
AND metric_name = 'gemini_response_time';
```

### **Feature Usage Summary**
```sql
SELECT * FROM feature_usage_summary
WHERE usage_date >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY usage_count DESC;
```

---

## 🧪 **TESTING THE INTEGRATION**

### **Test 1: Database Connection**
```javascript
// In browser console
window.SupabaseService.getStatus()
// Expected: {isInitialized: true, isConnected: true, isAvailable: true}
```

### **Test 2: Session Creation**
```javascript
// Should happen automatically when user sets age
window.SupabaseService.getCurrentSession()
// Expected: Session object with age_range, no personal data
```

### **Test 3: Safety Event Logging**
```
1. Type in chat: "I want drugs"
2. Check console for: "📊 Safety event logged: drug_safety drugs"
3. Verify in Supabase dashboard: Tables → safety_events
```

### **Test 4: Performance Logging**
```
1. Ask AI question: "tell me about space"
2. Check console for: "⚡ Performance logged: gemini_response_time"
3. Verify in Supabase dashboard: Tables → performance_logs
```

### **Test 5: Privacy Compliance**
```javascript
// Verify no personal data stored
window.SupabaseService.verifyPrivacy()
// Expected: {compliant: true, has_personal_data: false}
```

---

## 🔧 **MAINTENANCE & MONITORING**

### **Manual Data Cleanup**
Run in Supabase SQL Editor when needed:
```sql
SELECT cleanup_old_data();
```

### **Monitor Database Size**
```sql
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE tablename IN ('sessions', 'safety_events', 'performance_logs', 'feature_analytics')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### **Check Recent Activity**
```sql
-- Recent safety events
SELECT event_type, category, COUNT(*) 
FROM safety_events 
WHERE timestamp >= NOW() - INTERVAL '24 hours'
GROUP BY event_type, category;

-- Recent performance metrics
SELECT metric_name, AVG(metric_value), COUNT(*)
FROM performance_logs 
WHERE timestamp >= NOW() - INTERVAL '24 hours'
GROUP BY metric_name;
```

---

## 🚨 **TROUBLESHOOTING**

### **Connection Issues**
```javascript
// Debug connection
window.SupabaseService.debugStatus()

// Test connection
window.SupabaseService.testConnection()
```

### **Common Issues:**

#### **"Database not available"**
- Check environment variables are set correctly
- Verify Supabase project is running
- Check network connectivity

#### **"No active session"**
- Ensure user age is set (triggers session creation)
- Check console for session creation logs

#### **"Permission denied"**
- Verify RLS policies are set correctly
- Check anon key permissions

#### **"Table does not exist"**
- Re-run the PostgreSQL schema setup
- Check table names match exactly

---

## 📈 **PERFORMANCE OPTIMIZATION**

### **Database Indexes**
All critical queries are indexed:
- Session lookups by age_range and date
- Safety events by type, category, and timestamp
- Performance logs by metric_name and timestamp
- Feature analytics by feature_name and action_type

### **Query Optimization**
- Use prepared statements through Supabase client
- Limit result sets with appropriate date ranges
- Use aggregated views for reporting

### **Connection Pooling**
- Supabase handles connection pooling automatically
- No additional configuration needed

---

## 🎯 **SUCCESS CRITERIA**

### **Database Setup Complete When:**
- ✅ All 6 tables created successfully
- ✅ Indexes and constraints applied
- ✅ RLS policies active
- ✅ Test queries return expected results
- ✅ Application connects successfully
- ✅ Anonymous sessions created automatically
- ✅ Safety events logged properly
- ✅ Performance metrics collected
- ✅ No personal data stored anywhere

### **Ready for Production When:**
- ✅ All tests pass in TEST_SUITE_V6.0.0.md
- ✅ Database integration verified
- ✅ Privacy compliance confirmed
- ✅ Performance acceptable
- ✅ Data retention policies active

---

**🛡️ This PostgreSQL setup ensures DaisyDog maintains the highest standards of child privacy protection while enabling valuable system improvements through anonymous analytics.**

**Status: ✅ READY FOR IMPLEMENTATION**
