# Netlify Contact Form Email Setup

## 🚨 CRITICAL: Email Notifications Configuration Required

The contact form is now properly configured to use **Netlify Forms**, but you need to set up email notifications in the Netlify Dashboard to receive emails at `brianference@protonmail.com`.

## 📧 Step-by-Step Setup (2 Minutes)

### 1. **Login to Netlify Dashboard**
   - Go to: https://app.netlify.com
   - Select your **DaisyDog** site

### 2. **Navigate to Form Notifications**
   Path: **Site settings → Notifications → Emails and webhooks → Form submission notifications**

   Or direct link: `https://app.netlify.com/sites/YOUR_SITE_NAME/settings/forms#form-notifications`

### 3. **Add Email Notification**
   - Click **"Add notification"**
   - Select notification type: **"Email notification"**
   - Choose: **"Form submission"**
   - Select form: **"contact"** (or "All forms")
   - Enter email: **`brianference@protonmail.com`**
   - Click **"Save"**

### 4. **Verify Configuration**
   - Go to `/contact` page
   - Submit a test form
   - Check `brianference@protonmail.com` inbox (and spam folder)
   - Email will come from: `formresponses@netlify.com`

---

## ✅ What's Already Configured

1. **Hidden form in `index.html`** ✓
   - Netlify automatically detects forms with `data-netlify="true"`
   - Form name: `contact`
   - All fields are properly mapped

2. **Contact form submission** ✓
   - React component submits to Netlify Forms
   - Uses `POST /` with `form-name=contact`
   - Data properly encoded as `application/x-www-form-urlencoded`

3. **Form fields** ✓
   - Name
   - Email (sets Reply-To header)
   - Subject
   - Category
   - Message
   - Parent/Guardian checkbox

---

## 📊 Expected Email Format

**From:** `formresponses@netlify.com`  
**To:** `brianference@protonmail.com`  
**Subject:** `New submission from contact`  
**Reply-To:** (User's email from form)

**Email Body:**
```
Name: [user's name]
Email: [user's email]
Subject: [subject line]
Category: [general/technical/safety/etc]
Message: [user's message]
Parent/Guardian: Yes/No
```

---

## 🔧 Troubleshooting

### Not receiving emails?

1. **Check spam folder** - Netlify emails may be filtered
2. **Verify notification is active**
   - Go to: Site Settings → Notifications
   - Ensure "Email notification" status is "Active"
3. **Test with Gmail first** 
   - If `brianference@protonmail.com` doesn't work initially
   - Try a Gmail address to confirm Netlify Forms is working
   - Then switch back to ProtonMail
4. **Check Netlify Forms submissions**
   - Go to: Site → Forms → contact
   - Verify submissions are appearing
   - If yes, issue is with email delivery
   - If no, check form configuration

### ProtonMail-Specific Issues

ProtonMail has strict spam filters:
- **Add `formresponses@netlify.com` to contacts** to whitelist
- **Check spam/junk folder** for first email
- **Mark as "Not Spam"** if found in spam
- Future emails should arrive in inbox

### Alternative: Webhook Notification

If emails don't work, set up a webhook instead:
1. Use Zapier/Make.com
2. Create Netlify Forms → Email trigger
3. Route to any email service

---

## 🎯 Production Checklist

✅ Netlify Forms enabled (hidden form in index.html)  
✅ Contact form properly submits to Netlify  
✅ All form fields mapped correctly  
⏳ **ACTION REQUIRED:** Set up email notification in Netlify Dashboard  
⏳ **ACTION REQUIRED:** Test with real submission  
⏳ **ACTION REQUIRED:** Verify email received at brianference@protonmail.com  

---

## 🔗 Resources

- [Netlify Forms Documentation](https://docs.netlify.com/manage/forms/setup/)
- [Form Notifications Guide](https://docs.netlify.com/manage/forms/notifications/)
- [Netlify Dashboard](https://app.netlify.com)

---

**⚠️ IMPORTANT:** The form will NOT send emails until you complete the Netlify Dashboard configuration above!
