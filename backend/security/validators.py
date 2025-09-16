"""
Security validators and sanitizers for DaisyDog API
Implements comprehensive input validation and sanitization
"""

import re
import html
import bleach
from typing import Any, Dict, List, Optional, Union
from pydantic import BaseModel, validator, Field
from datetime import datetime
import unicodedata
from better_profanity import profanity


class SecurityConfig:
    """Security configuration constants"""
    
    # Input length limits
    MAX_MESSAGE_LENGTH = 1000
    MAX_USERNAME_LENGTH = 50
    MAX_EMAIL_LENGTH = 254
    MAX_NAME_LENGTH = 100
    
    # Rate limiting
    MAX_REQUESTS_PER_MINUTE = 60
    MAX_REQUESTS_PER_HOUR = 1000
    MAX_REQUESTS_PER_DAY = 10000
    
    # Content filtering
    ALLOWED_HTML_TAGS = []  # No HTML allowed in user input
    ALLOWED_ATTRIBUTES = {}
    
    # Regex patterns
    EMAIL_PATTERN = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
    USERNAME_PATTERN = re.compile(r'^[a-zA-Z0-9_-]{3,50}$')
    UUID_PATTERN = re.compile(r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$')
    
    # Child safety patterns
    UNSAFE_PATTERNS = [
        r'\b(?:phone|address|location|where.*live|meet.*person)\b',
        r'\b(?:password|secret|private)\b',
        r'\b(?:credit.*card|bank|money|pay)\b',
    ]


class InputSanitizer:
    """Input sanitization utilities"""
    
    @staticmethod
    def sanitize_text(text: str, max_length: int = SecurityConfig.MAX_MESSAGE_LENGTH) -> str:
        """Sanitize text input for child safety and security"""
        if not text:
            return ""
        
        # Normalize unicode
        text = unicodedata.normalize('NFKC', text)
        
        # Remove HTML tags and entities
        text = bleach.clean(text, tags=SecurityConfig.ALLOWED_HTML_TAGS, 
                           attributes=SecurityConfig.ALLOWED_ATTRIBUTES, strip=True)
        text = html.unescape(text)
        
        # Remove control characters except newlines and tabs
        text = ''.join(char for char in text if unicodedata.category(char)[0] != 'C' or char in '\n\t')
        
        # Limit length
        if len(text) > max_length:
            text = text[:max_length].rsplit(' ', 1)[0] + '...'
        
        # Filter profanity for child safety
        text = profanity.censor(text)
        
        return text.strip()
    
    @staticmethod
    def sanitize_username(username: str) -> str:
        """Sanitize username input"""
        if not username:
            return ""
        
        # Remove non-alphanumeric characters except underscore and hyphen
        username = re.sub(r'[^a-zA-Z0-9_-]', '', username)
        
        # Limit length
        username = username[:SecurityConfig.MAX_USERNAME_LENGTH]
        
        return username.lower()
    
    @staticmethod
    def sanitize_email(email: str) -> str:
        """Sanitize email input"""
        if not email:
            return ""
        
        # Basic sanitization
        email = email.strip().lower()
        
        # Remove dangerous characters
        email = re.sub(r'[<>"\'\\\x00-\x1f\x7f-\x9f]', '', email)
        
        return email[:SecurityConfig.MAX_EMAIL_LENGTH]
    
    @staticmethod
    def check_child_safety(text: str) -> tuple[bool, List[str]]:
        """Check if text is safe for children"""
        violations = []
        
        text_lower = text.lower()
        
        # Check for unsafe patterns
        for pattern in SecurityConfig.UNSAFE_PATTERNS:
            if re.search(pattern, text_lower, re.IGNORECASE):
                violations.append(f"Contains potentially unsafe content: {pattern}")
        
        # Check for profanity
        if profanity.contains_profanity(text):
            violations.append("Contains inappropriate language")
        
        # Check for personal information patterns
        if re.search(r'\b\d{3}-\d{3}-\d{4}\b', text):  # Phone number
            violations.append("Contains phone number")
        
        if re.search(r'\b\d{1,5}\s+\w+\s+(?:street|st|avenue|ave|road|rd|drive|dr)\b', text, re.IGNORECASE):
            violations.append("Contains address information")
        
        return len(violations) == 0, violations


class SecureBaseModel(BaseModel):
    """Base model with security validations"""
    
    class Config:
        # Prevent extra fields
        extra = "forbid"
        # Validate assignment
        validate_assignment = True
        # Use enum values
        use_enum_values = True


class SecureChatMessage(SecureBaseModel):
    """Secure chat message model"""
    
    message: str = Field(..., min_length=1, max_length=SecurityConfig.MAX_MESSAGE_LENGTH)
    context: Optional[Dict[str, Any]] = Field(default_factory=dict)
    timestamp: Optional[datetime] = Field(default_factory=datetime.utcnow)
    
    @validator('message')
    def validate_message(cls, v):
        if not v or not v.strip():
            raise ValueError("Message cannot be empty")
        
        # Sanitize input
        sanitized = InputSanitizer.sanitize_text(v)
        
        # Check child safety
        is_safe, violations = InputSanitizer.check_child_safety(sanitized)
        if not is_safe:
            raise ValueError(f"Message contains unsafe content: {', '.join(violations)}")
        
        return sanitized
    
    @validator('context')
    def validate_context(cls, v):
        if not v:
            return {}
        
        # Limit context size
        if len(str(v)) > 1000:
            raise ValueError("Context too large")
        
        # Sanitize context values
        sanitized_context = {}
        for key, value in v.items():
            if isinstance(value, str):
                sanitized_context[key] = InputSanitizer.sanitize_text(value, 200)
            elif isinstance(value, (int, float, bool)):
                sanitized_context[key] = value
            # Skip other types for security
        
        return sanitized_context


class SecureUserProfile(SecureBaseModel):
    """Secure user profile model"""
    
    username: str = Field(..., min_length=3, max_length=SecurityConfig.MAX_USERNAME_LENGTH)
    email: Optional[str] = Field(None, max_length=SecurityConfig.MAX_EMAIL_LENGTH)
    display_name: Optional[str] = Field(None, max_length=SecurityConfig.MAX_NAME_LENGTH)
    age: Optional[int] = Field(None, ge=5, le=18)  # Child safety: 5-18 years old
    preferences: Optional[Dict[str, Any]] = Field(default_factory=dict)
    
    @validator('username')
    def validate_username(cls, v):
        sanitized = InputSanitizer.sanitize_username(v)
        
        if not SecurityConfig.USERNAME_PATTERN.match(sanitized):
            raise ValueError("Username must contain only letters, numbers, underscore, and hyphen")
        
        if len(sanitized) < 3:
            raise ValueError("Username must be at least 3 characters long")
        
        return sanitized
    
    @validator('email')
    def validate_email(cls, v):
        if not v:
            return None
        
        sanitized = InputSanitizer.sanitize_email(v)
        
        if not SecurityConfig.EMAIL_PATTERN.match(sanitized):
            raise ValueError("Invalid email format")
        
        return sanitized
    
    @validator('display_name')
    def validate_display_name(cls, v):
        if not v:
            return None
        
        sanitized = InputSanitizer.sanitize_text(v, SecurityConfig.MAX_NAME_LENGTH)
        
        # Check child safety
        is_safe, violations = InputSanitizer.check_child_safety(sanitized)
        if not is_safe:
            raise ValueError(f"Display name contains unsafe content: {', '.join(violations)}")
        
        return sanitized
    
    @validator('age')
    def validate_age(cls, v):
        if v is not None and (v < 5 or v > 18):
            raise ValueError("Age must be between 5 and 18 for child safety")
        return v
    
    @validator('preferences')
    def validate_preferences(cls, v):
        if not v:
            return {}
        
        # Limit preferences size
        if len(str(v)) > 2000:
            raise ValueError("Preferences too large")
        
        # Sanitize preference values
        sanitized_prefs = {}
        allowed_keys = {
            'favorite_activities', 'communication_style', 'interests',
            'preferred_games', 'difficulty_level', 'notifications'
        }
        
        for key, value in v.items():
            if key not in allowed_keys:
                continue  # Skip unknown keys
            
            if isinstance(value, str):
                sanitized_prefs[key] = InputSanitizer.sanitize_text(value, 100)
            elif isinstance(value, list):
                sanitized_list = []
                for item in value[:10]:  # Limit list size
                    if isinstance(item, str):
                        sanitized_list.append(InputSanitizer.sanitize_text(item, 50))
                sanitized_prefs[key] = sanitized_list
            elif isinstance(value, (int, float, bool)):
                sanitized_prefs[key] = value
        
        return sanitized_prefs


class SecureGameAction(SecureBaseModel):
    """Secure game action model"""
    
    action: str = Field(..., min_length=1, max_length=50)
    parameters: Optional[Dict[str, Any]] = Field(default_factory=dict)
    
    @validator('action')
    def validate_action(cls, v):
        # Only allow specific game actions
        allowed_actions = {
            'throw', 'catch', 'flip_card', 'guess_location', 'make_guess', 
            'pull', 'start', 'stop', 'pause', 'resume'
        }
        
        sanitized = InputSanitizer.sanitize_text(v, 50).lower().replace(' ', '_')
        
        if sanitized not in allowed_actions:
            raise ValueError(f"Invalid game action: {sanitized}")
        
        return sanitized
    
    @validator('parameters')
    def validate_parameters(cls, v):
        if not v:
            return {}
        
        # Sanitize and validate parameters
        sanitized_params = {}
        for key, value in v.items():
            if isinstance(value, str):
                sanitized_params[key] = InputSanitizer.sanitize_text(value, 100)
            elif isinstance(value, (int, float)):
                # Limit numeric values
                if -1000 <= value <= 1000:
                    sanitized_params[key] = value
            elif isinstance(value, bool):
                sanitized_params[key] = value
        
        return sanitized_params


class SecurityValidator:
    """Main security validation class"""
    
    @staticmethod
    def validate_user_id(user_id: str) -> str:
        """Validate user ID format"""
        if not user_id:
            raise ValueError("User ID is required")
        
        # Remove whitespace
        user_id = user_id.strip()
        
        # Check UUID format
        if not SecurityConfig.UUID_PATTERN.match(user_id.lower()):
            raise ValueError("Invalid user ID format")
        
        return user_id.lower()
    
    @staticmethod
    def validate_session_id(session_id: str) -> str:
        """Validate session ID format"""
        if not session_id:
            raise ValueError("Session ID is required")
        
        # Remove whitespace
        session_id = session_id.strip()
        
        # Check format (UUID or alphanumeric)
        if not (SecurityConfig.UUID_PATTERN.match(session_id.lower()) or 
                re.match(r'^[a-zA-Z0-9_-]{10,50}$', session_id)):
            raise ValueError("Invalid session ID format")
        
        return session_id
    
    @staticmethod
    def validate_request_size(content_length: int, max_size: int = 1024 * 1024) -> bool:
        """Validate request content size"""
        return content_length <= max_size
    
    @staticmethod
    def validate_content_type(content_type: str, allowed_types: List[str]) -> bool:
        """Validate request content type"""
        if not content_type:
            return False
        
        content_type = content_type.lower().split(';')[0].strip()
        return content_type in [t.lower() for t in allowed_types]
    
    @staticmethod
    def check_rate_limit_headers(headers: Dict[str, str]) -> Dict[str, Any]:
        """Extract rate limiting information from headers"""
        return {
            'user_agent': headers.get('user-agent', '')[:200],
            'x_forwarded_for': headers.get('x-forwarded-for', '')[:100],
            'x_real_ip': headers.get('x-real-ip', '')[:45],
            'origin': headers.get('origin', '')[:200]
        }


# Initialize profanity filter
profanity.load_censor_words()

# Export main classes
__all__ = [
    'SecurityConfig',
    'InputSanitizer', 
    'SecureBaseModel',
    'SecureChatMessage',
    'SecureUserProfile', 
    'SecureGameAction',
    'SecurityValidator'
]
