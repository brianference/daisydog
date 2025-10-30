// Netlify Function: Parent Authentication
// Handles signup, login, email verification, password reset

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { neon } = require('@neondatabase/serverless');
const crypto = require('crypto');

const sql = neon(process.env.DATABASE_URL);

// Fail fast if JWT_SECRET is not configured
if (!process.env.JWT_SECRET) {
  throw new Error('CRITICAL: JWT_SECRET environment variable is not set. Cannot issue secure tokens.');
}
const JWT_SECRET = process.env.JWT_SECRET;

// CORS headers
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { action, email, password, token } = JSON.parse(event.body);

    switch (action) {
      case 'signup':
        return await handleSignup(email, password);
      
      case 'login':
        return await handleLogin(email, password);
      
      case 'verify-email':
        return await handleVerifyEmail(token);
      
      case 'request-reset':
        return await handleRequestReset(email);
      
      case 'reset-password':
        return await handleResetPassword(token, password);
      
      case 'verify-token':
        return await handleVerifyToken(token);
      
      default:
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid action' }),
        };
    }
  } catch (error) {
    console.error('Auth error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }
};

async function handleSignup(email, password) {
  // Validate email
  if (!email || !email.includes('@')) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Valid email is required' }),
    };
  }

  // Validate password
  if (!password || password.length < 8) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Password must be at least 8 characters' }),
    };
  }

  // Check if email already exists
  const existing = await sql`
    SELECT id FROM parents WHERE email = ${email}
  `;

  if (existing.length > 0) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Email already registered' }),
    };
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);
  
  // Generate verification token
  const verificationToken = crypto.randomBytes(32).toString('hex');

  // Create parent account (starts as free tier)
  const result = await sql`
    INSERT INTO parents (email, password_hash, email_verification_token, subscription_status)
    VALUES (${email}, ${passwordHash}, ${verificationToken}, 'free')
    RETURNING id, email, subscription_status, created_at
  `;

  const parent = result[0];

  // Create default settings
  await sql`
    INSERT INTO parent_settings (parent_id)
    VALUES (${parent.id})
  `;

  // TODO: Send verification email via Netlify's email service
  // For development, log to console only (never expose in API response)
  console.log('Email verification link:', `${process.env.URL}/verify-email?token=${verificationToken}`);

  // Generate JWT
  const jwtToken = jwt.sign(
    { parentId: parent.id, email: parent.email, type: 'parent' },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return {
    statusCode: 201,
    headers,
    body: JSON.stringify({
      success: true,
      token: jwtToken,
      parent: {
        id: parent.id,
        email: parent.email,
        subscriptionStatus: parent.subscription_status,
        emailVerified: false,
      },
    }),
  };
}

async function handleLogin(email, password) {
  // Get parent account
  const result = await sql`
    SELECT id, email, password_hash, email_verified, subscription_status, subscription_tier
    FROM parents
    WHERE email = ${email}
  `;

  if (result.length === 0) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: 'Invalid email or password' }),
    };
  }

  const parent = result[0];

  // Verify password
  const isValid = await bcrypt.compare(password, parent.password_hash);
  
  if (!isValid) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: 'Invalid email or password' }),
    };
  }

  // Generate JWT
  const token = jwt.sign(
    { parentId: parent.id, email: parent.email, type: 'parent' },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      success: true,
      token,
      parent: {
        id: parent.id,
        email: parent.email,
        emailVerified: parent.email_verified,
        subscriptionStatus: parent.subscription_status,
        subscriptionTier: parent.subscription_tier,
      },
    }),
  };
}

async function handleVerifyEmail(token) {
  const result = await sql`
    UPDATE parents
    SET email_verified = true, email_verification_token = null, updated_at = NOW()
    WHERE email_verification_token = ${token}
    RETURNING id, email
  `;

  if (result.length === 0) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Invalid or expired token' }),
    };
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      success: true,
      message: 'Email verified successfully',
    }),
  };
}

async function handleRequestReset(email) {
  const resetToken = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 3600000); // 1 hour

  await sql`
    UPDATE parents
    SET password_reset_token = ${resetToken}, password_reset_expires = ${expires.toISOString()}, updated_at = NOW()
    WHERE email = ${email}
  `;

  // TODO: Send reset email via Netlify's email service
  // For development, log to console only (never expose in API response)
  console.log('Password reset link:', `${process.env.URL}/reset-password?token=${resetToken}`);

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      success: true,
      message: 'If an account exists with that email, a password reset link has been sent.',
    }),
  };
}

async function handleResetPassword(token, newPassword) {
  if (!newPassword || newPassword.length < 8) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Password must be at least 8 characters' }),
    };
  }

  const result = await sql`
    SELECT id FROM parents
    WHERE password_reset_token = ${token}
    AND password_reset_expires > NOW()
  `;

  if (result.length === 0) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Invalid or expired token' }),
    };
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);

  await sql`
    UPDATE parents
    SET password_hash = ${passwordHash}, password_reset_token = null, password_reset_expires = null, updated_at = NOW()
    WHERE id = ${result[0].id}
  `;

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      success: true,
      message: 'Password reset successfully',
    }),
  };
}

async function handleVerifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Get parent data
    const result = await sql`
      SELECT id, email, email_verified, subscription_status, subscription_tier
      FROM parents
      WHERE id = ${decoded.parentId}
    `;

    if (result.length === 0) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Invalid token' }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        valid: true,
        parent: {
          id: result[0].id,
          email: result[0].email,
          emailVerified: result[0].email_verified,
          subscriptionStatus: result[0].subscription_status,
          subscriptionTier: result[0].subscription_tier,
        },
      }),
    };
  } catch (error) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: 'Invalid or expired token' }),
    };
  }
}
