/**
 * Contact Form Handler - Netlify Function
 * Sends contact form submissions to brianference@protonmail.com
 */

export async function handler(event) {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const data = JSON.parse(event.body);
    const { name, email, subject, category, message, isParent } = data;

    // Validation
    if (!name || !email || !subject || !message) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid email address' })
      };
    }

    // Format email content
    const emailContent = `
      DaisyDog Contact Form Submission
      ================================
      
      From: ${name}
      Email: ${email}
      Category: ${category || 'general'}
      Parent/Guardian: ${isParent ? 'Yes' : 'No'}
      
      Subject: ${subject}
      
      Message:
      ${message}
      
      ================================
      Sent: ${new Date().toISOString()}
    `;

    console.log('[Contact Form] Submission received:', { name, email, subject, category });
    
    const submissionData = new URLSearchParams({
      'form-name': 'contact',
      'name': name,
      'email': email,
      'subject': subject,
      'category': category,
      'message': message,
      'isParent': isParent ? 'Yes' : 'No',
      'recipient': 'brianference@protonmail.com'
    });

    const response = await fetch('https://daisydog.netlify.app/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: submissionData.toString()
    });

    console.log('[Contact Form] Netlify response:', response.status);

    if (!response.ok) {
      console.error('[Contact Form] Failed with status:', response.status);
      throw new Error('Failed to send email');
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        success: true, 
        message: 'Contact form submitted successfully' 
      })
    };
  } catch (error) {
    console.error('Contact form error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Failed to process contact form',
        details: error.message 
      })
    };
  }
}
