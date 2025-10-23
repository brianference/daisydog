// Netlify Function: Dashboard API
// Fetch parent dashboard data, manage children, settings

const jwt = require('jsonwebtoken');
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const { action } = event.queryStringParameters || {};
    const body = event.body ? JSON.parse(event.body) : {};

    // Actions that don't require authentication (child logging)
    if (action === 'log-activity') {
      return await logActivity(body);
    }
    if (action === 'log-safety-event') {
      return await logSafetyEvent(body);
    }

    // All other actions require JWT authentication
    const authHeader = event.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Unauthorized' }),
      };
    }

    let parentId;
    try {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, JWT_SECRET);
      parentId = decoded.parentId;
    } catch (error) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Invalid token' }),
      };
    }

    switch (action) {
      case 'get-children':
        return await getChildren(parentId);
      
      case 'add-child':
        return await addChild(parentId, body);
      
      case 'update-child':
        return await updateChild(parentId, body);
      
      case 'delete-child':
        return await deleteChild(parentId, body.childId);
      
      case 'generate-link-code':
        return await generateLinkCode(body.childId);
      
      case 'get-activity':
        return await getActivity(parentId, body);
      
      case 'get-safety-events':
        return await getSafetyEvents(parentId, body);
      
      case 'get-learning-progress':
        return await getLearningProgress(parentId, body);
      
      case 'get-settings':
        return await getSettings(parentId);
      
      case 'update-settings':
        return await updateSettings(parentId, body);
      
      default:
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid action' }),
        };
    }
  } catch (error) {
    console.error('Dashboard API error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }
};

async function getChildren(parentId) {
  const children = await sql`
    SELECT id, nickname, age_range, avatar_color, is_active, created_at
    FROM children
    WHERE parent_id = ${parentId}
    ORDER BY created_at DESC
  `;

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ children }),
  };
}

async function addChild(parentId, { nickname, ageRange, avatarColor }) {
  // Check subscription and child limit
  const parent = await sql`
    SELECT subscription_status, stripe_customer_id, created_at FROM parents WHERE id = ${parentId}
  `;

  if (parent.length === 0) {
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Parent not found' }),
    };
  }

  const childCount = await sql`
    SELECT COUNT(*) as count FROM children WHERE parent_id = ${parentId} AND is_active = true
  `;

  // Allow access if:
  // 1. Subscription is active, OR
  // 2. Has a Stripe customer ID (payment processed, webhook pending), OR
  // 3. Account is less than 1 hour old (grace period for webhook)
  const hasStripeCustomer = !!parent[0].stripe_customer_id;
  const accountAge = Date.now() - new Date(parent[0].created_at).getTime();
  const isWithinGracePeriod = accountAge < 60 * 60 * 1000; // 1 hour
  const isPaid = parent[0].subscription_status === 'active' || hasStripeCustomer || isWithinGracePeriod;
  const maxChildren = isPaid ? 3 : 0;

  if (childCount[0].count >= maxChildren) {
    return {
      statusCode: 403,
      headers,
      body: JSON.stringify({ 
        error: isPaid ? 'Maximum 3 children allowed' : 'Upgrade to add children' 
      }),
    };
  }

  const result = await sql`
    INSERT INTO children (parent_id, nickname, age_range, avatar_color)
    VALUES (${parentId}, ${nickname}, ${ageRange}, ${avatarColor})
    RETURNING *
  `;

  return {
    statusCode: 201,
    headers,
    body: JSON.stringify({ child: result[0] }),
  };
}

async function updateChild(parentId, { childId, nickname, ageRange, avatarColor, isActive }) {
  const result = await sql`
    UPDATE children
    SET 
      nickname = COALESCE(${nickname}, nickname),
      age_range = COALESCE(${ageRange}, age_range),
      avatar_color = COALESCE(${avatarColor}, avatar_color),
      is_active = COALESCE(${isActive}, is_active),
      updated_at = NOW()
    WHERE id = ${childId} AND parent_id = ${parentId}
    RETURNING *
  `;

  if (result.length === 0) {
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Child not found' }),
    };
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ child: result[0] }),
  };
}

async function deleteChild(parentId, childId) {
  await sql`
    DELETE FROM children
    WHERE id = ${childId} AND parent_id = ${parentId}
  `;

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ success: true }),
  };
}

async function generateLinkCode(childId) {
  // Generate 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 days

  // Invalidate old codes
  await sql`
    UPDATE child_link_codes
    SET used_at = NOW()
    WHERE child_id = ${childId} AND used_at IS NULL
  `;

  // Create new code
  const result = await sql`
    INSERT INTO child_link_codes (child_id, code, expires_at)
    VALUES (${childId}, ${code}, ${expiresAt.toISOString()})
    RETURNING code, expires_at
  `;

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      code: result[0].code,
      expiresAt: result[0].expires_at,
    }),
  };
}

async function getActivity(parentId, { childId, startDate, endDate }) {
  const sessions = await sql`
    SELECT s.*, c.nickname
    FROM sessions s
    JOIN children c ON c.id = s.child_id
    WHERE c.parent_id = ${parentId}
    ${childId ? sql`AND s.child_id = ${childId}` : sql``}
    ${startDate ? sql`AND s.created_at >= ${startDate}` : sql``}
    ${endDate ? sql`AND s.created_at <= ${endDate}` : sql``}
    ORDER BY s.created_at DESC
    LIMIT 100
  `;

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ sessions }),
  };
}

async function getSafetyEvents(parentId, { childId, startDate, endDate }) {
  const events = await sql`
    SELECT se.*, c.nickname, s.created_at as session_date
    FROM safety_events se
    JOIN sessions s ON s.id = se.session_id
    JOIN children c ON c.id = s.child_id
    WHERE c.parent_id = ${parentId}
    ${childId ? sql`AND s.child_id = ${childId}` : sql``}
    ${startDate ? sql`AND se.timestamp >= ${startDate}` : sql``}
    ${endDate ? sql`AND se.timestamp <= ${endDate}` : sql``}
    ORDER BY se.timestamp DESC
    LIMIT 100
  `;

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ events }),
  };
}

async function getLearningProgress(parentId, { childId, startDate, endDate }) {
  const features = await sql`
    SELECT fa.*, c.nickname
    FROM feature_analytics fa
    JOIN sessions s ON s.id = fa.session_id
    JOIN children c ON c.id = s.child_id
    WHERE c.parent_id = ${parentId}
    ${childId ? sql`AND s.child_id = ${childId}` : sql``}
    ${startDate ? sql`AND fa.timestamp >= ${startDate}` : sql``}
    ${endDate ? sql`AND fa.timestamp <= ${endDate}` : sql``}
    ORDER BY fa.timestamp DESC
    LIMIT 200
  `;

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ features }),
  };
}

async function getSettings(parentId) {
  const result = await sql`
    SELECT * FROM parent_settings WHERE parent_id = ${parentId}
  `;

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ settings: result[0] || {} }),
  };
}

async function updateSettings(parentId, settings) {
  const result = await sql`
    INSERT INTO parent_settings (
      parent_id, email_reports_enabled, safety_alerts_enabled, 
      content_filter_level, daily_time_limit_minutes, bedtime_start, bedtime_end, allowed_features
    )
    VALUES (
      ${parentId}, 
      ${settings.emailReportsEnabled}, 
      ${settings.safetyAlertsEnabled},
      ${settings.contentFilterLevel}, 
      ${settings.dailyTimeLimitMinutes}, 
      ${settings.bedtimeStart}, 
      ${settings.bedtimeEnd},
      ${JSON.stringify(settings.allowedFeatures)}
    )
    ON CONFLICT (parent_id) DO UPDATE SET
      email_reports_enabled = EXCLUDED.email_reports_enabled,
      safety_alerts_enabled = EXCLUDED.safety_alerts_enabled,
      content_filter_level = EXCLUDED.content_filter_level,
      daily_time_limit_minutes = EXCLUDED.daily_time_limit_minutes,
      bedtime_start = EXCLUDED.bedtime_start,
      bedtime_end = EXCLUDED.bedtime_end,
      allowed_features = EXCLUDED.allowed_features,
      updated_at = NOW()
    RETURNING *
  `;

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ settings: result[0] }),
  };
}

async function logActivity(data) {
  const { childId, sessionId, activityType, timestamp, ...extra } = data;
  
  if (!childId) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'childId is required' }),
    };
  }

  try {
    // Insert activity into sessions table
    await sql`
      INSERT INTO sessions (child_id, session_id, activity_type, start_time, metadata)
      VALUES (${childId}, ${sessionId || 'unknown'}, ${activityType}, ${timestamp || 'NOW()'}, ${JSON.stringify(extra)})
      ON CONFLICT (session_id) 
      DO UPDATE SET 
        end_time = NOW(),
        total_minutes = EXTRACT(EPOCH FROM (NOW() - sessions.start_time)) / 60
    `;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true }),
    };
  } catch (error) {
    console.error('Error logging activity:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }
}

async function logSafetyEvent(data) {
  const { childId, sessionId, message, category, aiResponse, timestamp } = data;
  
  if (!childId || !category) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'childId and category are required' }),
    };
  }

  try {
    // Get session_id from sessions table
    const sessionResult = await sql`
      SELECT id FROM sessions 
      WHERE child_id = ${childId} 
      ORDER BY start_time DESC 
      LIMIT 1
    `;

    const dbSessionId = sessionResult.length > 0 ? sessionResult[0].id : null;

    // Insert safety event
    await sql`
      INSERT INTO safety_events (
        session_id, event_type, trigger_text, response_text, severity, timestamp
      )
      VALUES (
        ${dbSessionId}, ${category}, ${message}, ${aiResponse}, 'medium', ${timestamp || 'NOW()'}
      )
    `;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true }),
    };
  } catch (error) {
    console.error('Error logging safety event:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }
}
