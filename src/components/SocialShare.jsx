import { useState } from 'react';
import { FaFacebook, FaTwitter, FaInstagram, FaWhatsapp, FaEnvelope, FaCopy, FaCheck } from 'react-icons/fa';
import './SocialShare.css';

const SocialShare = ({ 
  url = 'https://daisydog.org', 
  title = '🐕 Finally, a Safe AI Companion That Transforms Kids\' Learning!', 
  description = `As a parent, I'm so relieved to find DaisyDog! 🛡️💙

Daisy Dog is revolutionizing educational fun for children with:
✅ Interactive learning games & character-building activities
✅ Age-appropriate AI conversations with gentle encouragement
✅ "Grow Your Faith Forest" virtue tracking
✅ Multiple safety layers built-in
✅ Parent dashboard for complete oversight
✅ 100% COPPA compliant & safe

My children ask to "play with Daisy" every day! Finally, technology that makes learning FUN while supporting our family values! 🙏✨

Check it out: https://daisydog.org 🐾

#DaisyDog #ParentingWin #SafeTech #KidsEducation #EdTech #SafeAI` 
}) => {
  const [copied, setCopied] = useState(false);

  const shareUrl = encodeURIComponent(url);
  const shareTitle = encodeURIComponent(title);
  const shareText = encodeURIComponent(description);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`,
    instagram: `https://www.instagram.com/`,
    whatsapp: `https://wa.me/?text=${shareTitle}%20${shareUrl}`,
    email: `mailto:?subject=${shareTitle}&body=${shareText}%0A%0A${url}`
  };

  const handleShare = (platform) => {
    if (platform === 'instagram') {
      alert('📱 To share on Instagram:\n\n1. Open Instagram on your mobile device\n2. Create a new post or story\n3. Share: daisydog.org');
      return;
    }
    window.open(shareLinks[platform], '_blank', 'width=600,height=400');
  };

  return (
    <div className="social-share">
      <h3 className="social-share-title">Parents: Tell a Friend about DaisyDog</h3>
      <p className="social-share-subtitle">Help other parents discover Daisy 🐕</p>
      
      <div className="social-share-buttons">
        <button
          onClick={() => handleShare('facebook')}
          className="social-share-btn facebook"
          aria-label="Share on Facebook"
          title="Share on Facebook"
        >
          <FaFacebook />
          <span>Facebook</span>
        </button>

        <button
          onClick={() => handleShare('twitter')}
          className="social-share-btn twitter"
          aria-label="Share on Twitter/X"
          title="Share on Twitter/X"
        >
          <FaTwitter />
          <span>Twitter</span>
        </button>

        <button
          onClick={() => handleShare('instagram')}
          className="social-share-btn instagram"
          aria-label="Share on Instagram"
          title="Share on Instagram"
        >
          <FaInstagram />
          <span>Instagram</span>
        </button>

        <button
          onClick={() => handleShare('whatsapp')}
          className="social-share-btn whatsapp"
          aria-label="Share on WhatsApp"
          title="Share on WhatsApp"
        >
          <FaWhatsapp />
          <span>WhatsApp</span>
        </button>

        <button
          onClick={() => handleShare('email')}
          className="social-share-btn email"
          aria-label="Share via Email"
          title="Share via Email"
        >
          <FaEnvelope />
          <span>Email</span>
        </button>

        <button
          onClick={handleCopyLink}
          className={`social-share-btn copy ${copied ? 'copied' : ''}`}
          aria-label="Copy Link"
          title="Copy Link"
        >
          {copied ? <FaCheck /> : <FaCopy />}
          <span>{copied ? 'Copied!' : 'Copy Link'}</span>
        </button>
      </div>
    </div>
  );
};

export default SocialShare;
