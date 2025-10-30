const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json',
};

// Helper function to verify parent authentication for dashboard queries
function verifyParentAuth(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  const jwt = require('jsonwebtoken');
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Only accept parent tokens, not child tokens
    if (decoded.type !== 'parent') {
      console.error('Invalid token type for parent endpoint:', decoded.type);
      return null;
    }
    return decoded; // Contains parentId, email, type
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

// Helper function to verify child session ownership
async function verifyChildOwnership(childId, parentId) {
  const result = await sql`
    SELECT id FROM children
    WHERE id = ${childId} AND parent_id = ${parentId}
    LIMIT 1
  `;
  
  return result.length > 0;
}

// Helper function to verify child session token
function verifyChildAuth(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  const jwt = require('jsonwebtoken');
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.type !== 'child') {
      return null;
    }
    return decoded; // Contains childId, parentId, type
  } catch (error) {
    console.error('Child JWT verification failed:', error);
    return null;
  }
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const path = event.path.replace('/.netlify/functions/lessons-api', '');
  const action = event.queryStringParameters?.action;

  try {
    if (event.httpMethod === 'GET') {
      if (path.startsWith('/lessons/')) {
        const lessonId = path.replace('/lessons/', '');
        return await getLessonById(parseInt(lessonId));
      } else if (path === '/lessons' || action === 'get-lessons') {
        return await getLessons(event.queryStringParameters || {});
      } else if (action === 'get-current-season') {
        return await getCurrentLiturgicalSeason();
      } else if (action === 'get-topics') {
        return await getTopics();
      }
    } else if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      
      // For get-progress from parent dashboard, require parent auth
      if (action === 'get-progress') {
        const parent = verifyParentAuth(event.headers.authorization);
        
        if (!parent) {
          return {
            statusCode: 401,
            headers,
            body: JSON.stringify({ error: 'Unauthorized - Parent authentication required' }),
          };
        }

        // Verify parent owns the child
        if (body.childId) {
          const ownsChild = await verifyChildOwnership(body.childId, parent.parentId);
          if (!ownsChild) {
            return {
              statusCode: 403,
              headers,
              body: JSON.stringify({ error: 'Forbidden - You do not have permission to access this child\'s data' }),
            };
          }
        }

        return await getProgress(body);
      }
      
      // For start/complete lesson from child, verify child session token
      if (['start-lesson', 'complete-lesson'].includes(action)) {
        const childAuth = verifyChildAuth(event.headers.authorization);
        
        if (!childAuth) {
          return {
            statusCode: 401,
            headers,
            body: JSON.stringify({ error: 'Unauthorized - Valid child session token required' }),
          };
        }

        // Ensure the childId in the request matches the authenticated session
        if (body.childId && body.childId !== childAuth.childId) {
          return {
            statusCode: 403,
            headers,
            body: JSON.stringify({ error: 'Forbidden - Child ID mismatch' }),
          };
        }

        // Use the authenticated childId from the token (not from request body)
        body.childId = childAuth.childId;
      }
      
      if (action === 'start-lesson') {
        return await startLesson(body);
      } else if (action === 'complete-lesson') {
        return await completeLesson(body);
      }
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Not found' }),
    };
  } catch (error) {
    console.error('Lessons API error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }
};

async function getLessons(params) {
  const { topic, age, season, type, limit = 50 } = params;
  
  // Execute query with proper WHERE filtering using tagged templates
  let lessons;
  
  // Handle all filter combinations with tagged templates
  const topicPattern = topic ? `%${topic}%` : null;
  const agePattern = age ? `%${age}%` : null;
  
  if (!topic && !age && !season && !type) {
    // No filters
    lessons = await sql`
      SELECT l.id, l.title, l.topic, l.age_group, l.liturgical_season, 
             l.lesson_type, l.objectives, l.vocabulary_words, l.created_at
      FROM catechesis_lessons l
      ORDER BY l.created_at DESC
      LIMIT ${parseInt(limit)}
    `;
  } else if (topic && !age && !season && !type) {
    lessons = await sql`
      SELECT l.id, l.title, l.topic, l.age_group, l.liturgical_season, 
             l.lesson_type, l.objectives, l.vocabulary_words, l.created_at
      FROM catechesis_lessons l
      WHERE l.topic ILIKE ${topicPattern}
      ORDER BY l.created_at DESC LIMIT ${parseInt(limit)}
    `;
  } else if (!topic && age && !season && !type) {
    lessons = await sql`
      SELECT l.id, l.title, l.topic, l.age_group, l.liturgical_season, 
             l.lesson_type, l.objectives, l.vocabulary_words, l.created_at
      FROM catechesis_lessons l
      WHERE l.age_group ILIKE ${agePattern}
      ORDER BY l.created_at DESC LIMIT ${parseInt(limit)}
    `;
  } else if (!topic && !age && season && !type) {
    lessons = await sql`
      SELECT l.id, l.title, l.topic, l.age_group, l.liturgical_season, 
             l.lesson_type, l.objectives, l.vocabulary_words, l.created_at
      FROM catechesis_lessons l
      WHERE l.liturgical_season = ${season}
      ORDER BY l.created_at DESC LIMIT ${parseInt(limit)}
    `;
  } else if (!topic && !age && !season && type) {
    lessons = await sql`
      SELECT l.id, l.title, l.topic, l.age_group, l.liturgical_season, 
             l.lesson_type, l.objectives, l.vocabulary_words, l.created_at
      FROM catechesis_lessons l
      WHERE l.lesson_type = ${type}
      ORDER BY l.created_at DESC LIMIT ${parseInt(limit)}
    `;
  } else {
    // Multiple filters - build WHERE clause
    lessons = await sql`
      SELECT l.id, l.title, l.topic, l.age_group, l.liturgical_season, 
             l.lesson_type, l.objectives, l.vocabulary_words, l.created_at
      FROM catechesis_lessons l
      WHERE (${!topic} OR l.topic ILIKE ${topicPattern})
        AND (${!age} OR l.age_group ILIKE ${agePattern})
        AND (${!season} OR l.liturgical_season = ${season})
        AND (${!type} OR l.lesson_type = ${type})
      ORDER BY l.created_at DESC LIMIT ${parseInt(limit)}
    `;
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ lessons }),
  };
}

async function getLessonById(lessonId) {
  const lesson = await sql`
    SELECT 
      l.*,
      COALESCE(
        json_agg(
          json_build_object(
            'id', a.id,
            'type', a.activity_type,
            'name', a.activity_name,
            'description', a.activity_description,
            'materials', a.materials_needed,
            'instructions', a.instructions,
            'links', a.external_links
          )
        ) FILTER (WHERE a.id IS NOT NULL),
        '[]'
      ) as activities
    FROM catechesis_lessons l
    LEFT JOIN lesson_activities a ON a.lesson_id = l.id
    WHERE l.id = ${lessonId}
    GROUP BY l.id
  `;

  if (lesson.length === 0) {
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Lesson not found' }),
    };
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ lesson: lesson[0] }),
  };
}

async function getCurrentLiturgicalSeason() {
  const today = new Date().toISOString().split('T')[0];
  
  const season = await sql`
    SELECT season, description, color
    FROM liturgical_calendar
    WHERE date_start <= ${today} AND date_end >= ${today}
    LIMIT 1
  `;

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ season: season[0] || null }),
  };
}

async function getTopics() {
  const topics = await sql`
    SELECT DISTINCT lesson_type, COUNT(*) as count
    FROM catechesis_lessons
    GROUP BY lesson_type
    ORDER BY count DESC
  `;

  const ageGroups = await sql`
    SELECT DISTINCT age_group, COUNT(*) as count
    FROM catechesis_lessons
    GROUP BY age_group
    ORDER BY count DESC
  `;

  const seasons = await sql`
    SELECT DISTINCT liturgical_season, COUNT(*) as count
    FROM catechesis_lessons
    WHERE liturgical_season IS NOT NULL
    GROUP BY liturgical_season
    ORDER BY count DESC
  `;

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ 
      types: topics,
      ageGroups: ageGroups,
      seasons: seasons
    }),
  };
}

async function startLesson(data) {
  const { childId, lessonId } = data;

  if (!childId || !lessonId) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'childId and lessonId are required' }),
    };
  }

  try {
    await sql`
      INSERT INTO lesson_progress (child_id, lesson_id, started_at)
      VALUES (${childId}, ${lessonId}, NOW())
      ON CONFLICT (child_id, lesson_id) 
      DO UPDATE SET started_at = NOW()
    `;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true }),
    };
  } catch (error) {
    console.error('Error starting lesson:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }
}

async function completeLesson(data) {
  const { childId, lessonId, timeSpentMinutes, notes } = data;

  if (!childId || !lessonId) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'childId and lessonId are required' }),
    };
  }

  try {
    await sql`
      UPDATE lesson_progress
      SET 
        completed_at = NOW(),
        time_spent_minutes = ${timeSpentMinutes || 0},
        notes = ${notes || null}
      WHERE child_id = ${childId} AND lesson_id = ${lessonId}
    `;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true }),
    };
  } catch (error) {
    console.error('Error completing lesson:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }
}

async function getProgress(data) {
  const { childId } = data;

  if (!childId) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'childId is required' }),
    };
  }

  try {
    const progress = await sql`
      SELECT 
        lp.*,
        l.title,
        l.topic,
        l.lesson_type,
        l.liturgical_season
      FROM lesson_progress lp
      JOIN catechesis_lessons l ON l.id = lp.lesson_id
      WHERE lp.child_id = ${childId}
      ORDER BY lp.started_at DESC
    `;

    const stats = await sql`
      SELECT 
        COUNT(*) as total_lessons,
        COUNT(CASE WHEN completed_at IS NOT NULL THEN 1 END) as completed_lessons,
        SUM(time_spent_minutes) as total_minutes
      FROM lesson_progress
      WHERE child_id = ${childId}
    `;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        progress,
        stats: stats[0]
      }),
    };
  } catch (error) {
    console.error('Error getting progress:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }
}
