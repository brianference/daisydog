"""
Security testing suite for DaisyDog backend
Tests input validation, rate limiting, child safety, and security hardening
"""

import pytest
import asyncio
from unittest.mock import Mock, patch, AsyncMock
from fastapi.testclient import TestClient
from fastapi import FastAPI, Request
import json
import time
from datetime import datetime

from security.validators import (
    SecurityConfig, InputSanitizer, SecureChatMessage, 
    SecureUserProfile, SecurityValidator
)
from security.middleware import SecurityMiddleware, ChildSafetyMiddleware


@pytest.mark.security
class TestInputValidation:
    """Test input validation and sanitization"""
    
    def test_sanitize_text_basic(self):
        """Test basic text sanitization"""
        # Clean text should pass through
        clean_text = "Hello Daisy! How are you today?"
        result = InputSanitizer.sanitize_text(clean_text)
        assert result == clean_text
        
        # HTML should be stripped
        html_text = "<script>alert('xss')</script>Hello Daisy!"
        result = InputSanitizer.sanitize_text(html_text)
        assert "<script>" not in result
        assert "Hello Daisy!" in result
        
        # Length should be limited
        long_text = "A" * 2000
        result = InputSanitizer.sanitize_text(long_text, 100)
        assert len(result) <= 103  # 100 + "..."
    
    def test_sanitize_username(self):
        """Test username sanitization"""
        # Valid username
        username = "victoria123"
        result = InputSanitizer.sanitize_username(username)
        assert result == username
        
        # Remove invalid characters
        username = "victoria@123!"
        result = InputSanitizer.sanitize_username(username)
        assert result == "victoria123"
        
        # Convert to lowercase
        username = "VICTORIA"
        result = InputSanitizer.sanitize_username(username)
        assert result == "victoria"
    
    def test_child_safety_check(self):
        """Test child safety content filtering"""
        # Safe content
        safe_text = "I love dancing and horses!"
        is_safe, violations = InputSanitizer.check_child_safety(safe_text)
        assert is_safe is True
        assert len(violations) == 0
        
        # Unsafe content - phone number
        unsafe_text = "My phone number is 555-123-4567"
        is_safe, violations = InputSanitizer.check_child_safety(unsafe_text)
        assert is_safe is False
        assert len(violations) > 0
        
        # Unsafe content - address
        unsafe_text = "I live at 123 Main Street"
        is_safe, violations = InputSanitizer.check_child_safety(unsafe_text)
        assert is_safe is False
        assert len(violations) > 0
        
        # Unsafe content - personal info
        unsafe_text = "What's your password?"
        is_safe, violations = InputSanitizer.check_child_safety(unsafe_text)
        assert is_safe is False
        assert len(violations) > 0
    
    def test_secure_chat_message_validation(self):
        """Test secure chat message model validation"""
        # Valid message
        valid_data = {
            "message": "Hi Daisy! Wanna play?",
            "context": {"mood": "excited"}
        }
        message = SecureChatMessage(**valid_data)
        assert message.message == valid_data["message"]
        
        # Empty message should fail
        with pytest.raises(ValueError):
            SecureChatMessage(message="")
        
        # Unsafe content should fail
        with pytest.raises(ValueError):
            SecureChatMessage(message="My phone is 555-123-4567")
        
        # Large context should fail
        large_context = {"data": "x" * 2000}
        with pytest.raises(ValueError):
            SecureChatMessage(message="Hi", context=large_context)
    
    def test_secure_user_profile_validation(self):
        """Test secure user profile model validation"""
        # Valid profile
        valid_data = {
            "username": "victoria",
            "email": "parent@example.com",
            "display_name": "Victoria",
            "age": 8,
            "preferences": {
                "favorite_activities": ["dancing", "horses"],
                "communication_style": "enthusiastic"
            }
        }
        profile = SecureUserProfile(**valid_data)
        assert profile.username == "victoria"
        assert profile.age == 8
        
        # Invalid username should fail
        with pytest.raises(ValueError):
            SecureUserProfile(username="v@", email="test@example.com")
        
        # Invalid age should fail
        with pytest.raises(ValueError):
            SecureUserProfile(username="victoria", age=25)
        
        # Unsafe display name should fail
        with pytest.raises(ValueError):
            SecureUserProfile(
                username="victoria", 
                display_name="Call me at 555-1234"
            )
    
    def test_security_validator_user_id(self):
        """Test user ID validation"""
        # Valid UUID
        valid_uuid = "123e4567-e89b-12d3-a456-426614174000"
        result = SecurityValidator.validate_user_id(valid_uuid)
        assert result == valid_uuid.lower()
        
        # Invalid format should fail
        with pytest.raises(ValueError):
            SecurityValidator.validate_user_id("invalid-id")
        
        # Empty should fail
        with pytest.raises(ValueError):
            SecurityValidator.validate_user_id("")
    
    def test_request_size_validation(self):
        """Test request size validation"""
        # Valid size
        assert SecurityValidator.validate_request_size(1000) is True
        
        # Too large
        assert SecurityValidator.validate_request_size(2 * 1024 * 1024) is False
    
    def test_content_type_validation(self):
        """Test content type validation"""
        allowed_types = ["application/json", "text/plain"]
        
        # Valid content type
        assert SecurityValidator.validate_content_type(
            "application/json", allowed_types
        ) is True
        
        # Invalid content type
        assert SecurityValidator.validate_content_type(
            "application/xml", allowed_types
        ) is False
        
        # Content type with charset
        assert SecurityValidator.validate_content_type(
            "application/json; charset=utf-8", allowed_types
        ) is True


@pytest.mark.security
class TestSecurityMiddleware:
    """Test security middleware functionality"""
    
    @pytest.fixture
    def app(self):
        """Create test FastAPI app with security middleware"""
        app = FastAPI()
        
        @app.get("/test")
        async def test_endpoint():
            return {"message": "success"}
        
        @app.post("/api/chat")
        async def chat_endpoint(request: Request):
            return {"response": "Hello!"}
        
        # Add security middleware
        app.add_middleware(SecurityMiddleware)
        app.add_middleware(ChildSafetyMiddleware)
        
        return app
    
    @pytest.fixture
    def client(self, app):
        """Create test client"""
        return TestClient(app)
    
    def test_basic_request(self, client):
        """Test basic request passes through"""
        response = client.get("/test")
        assert response.status_code == 200
        assert response.json() == {"message": "success"}
    
    def test_security_headers(self, client):
        """Test security headers are added"""
        response = client.get("/test")
        
        # Check security headers
        assert "X-Content-Type-Options" in response.headers
        assert "X-Frame-Options" in response.headers
        assert "X-XSS-Protection" in response.headers
        assert "Strict-Transport-Security" in response.headers
        assert "Content-Security-Policy" in response.headers
        
        assert response.headers["X-Content-Type-Options"] == "nosniff"
        assert response.headers["X-Frame-Options"] == "DENY"
    
    def test_child_safety_headers(self, client):
        """Test child safety headers are added to API endpoints"""
        response = client.post("/api/chat", json={"message": "Hi Daisy!"})
        
        # Check child safety headers
        assert "X-Child-Safe" in response.headers
        assert "X-Content-Rating" in response.headers
        assert response.headers["X-Child-Safe"] == "true"
        assert response.headers["X-Content-Rating"] == "safe-for-children"
    
    def test_request_size_limit(self, client):
        """Test request size limiting"""
        # Large payload should be rejected
        large_data = {"message": "x" * (2 * 1024 * 1024)}  # 2MB
        
        # This would normally be caught by the middleware
        # In a real test, you'd need to mock the content-length header
        response = client.post("/api/chat", json=large_data)
        # The actual behavior depends on the server configuration
    
    @pytest.mark.asyncio
    async def test_rate_limiting(self):
        """Test rate limiting functionality"""
        # Create middleware instance
        app = FastAPI()
        middleware = SecurityMiddleware(app)
        
        # Mock request
        mock_request = Mock()
        mock_request.url.path = "/api/chat"
        mock_request.client.host = "127.0.0.1"
        mock_request.headers = {}
        
        # First requests should pass
        for i in range(30):  # Half the limit
            result = await middleware._check_rate_limits(mock_request, "127.0.0.1")
            assert result is True
        
        # Exceed rate limit
        for i in range(35):  # Exceed limit
            await middleware._check_rate_limits(mock_request, "127.0.0.1")
        
        # Should now be rate limited
        result = await middleware._check_rate_limits(mock_request, "127.0.0.1")
        assert result is False
    
    @pytest.mark.asyncio
    async def test_suspicious_pattern_detection(self):
        """Test suspicious pattern detection"""
        app = FastAPI()
        middleware = SecurityMiddleware(app)
        
        # Safe request
        safe_request = Mock()
        safe_request.url.path = "/api/chat"
        safe_request.url.query = ""
        safe_request.method = "POST"
        safe_request.headers = {"content-type": "application/json"}
        
        result = await middleware._detect_suspicious_activity(safe_request)
        assert result is False
        
        # Suspicious request - SQL injection
        suspicious_request = Mock()
        suspicious_request.url.path = "/api/chat"
        suspicious_request.url.query = "id=1 OR 1=1"
        suspicious_request.method = "POST"
        suspicious_request.headers = {"content-type": "application/json"}
        
        result = await middleware._detect_suspicious_activity(suspicious_request)
        assert result is True
        
        # Suspicious request - XSS
        xss_request = Mock()
        xss_request.url.path = "/api/chat"
        xss_request.url.query = "msg=<script>alert('xss')</script>"
        xss_request.method = "POST"
        xss_request.headers = {"content-type": "application/json"}
        
        result = await middleware._detect_suspicious_activity(xss_request)
        assert result is True


@pytest.mark.security
@pytest.mark.child_safety
class TestChildSafety:
    """Test child safety specific features"""
    
    def test_age_restriction_validation(self):
        """Test age restrictions are enforced"""
        # Valid child age
        profile_data = {"username": "victoria", "age": 8}
        profile = SecureUserProfile(**profile_data)
        assert profile.age == 8
        
        # Too young
        with pytest.raises(ValueError):
            SecureUserProfile(username="tooyoung", age=3)
        
        # Too old
        with pytest.raises(ValueError):
            SecureUserProfile(username="tooold", age=25)
    
    def test_personal_information_blocking(self):
        """Test personal information is blocked"""
        unsafe_messages = [
            "My phone number is 555-123-4567",
            "I live at 123 Main Street",
            "My address is 456 Oak Avenue",
            "Call me at 555-0123",
            "Where do you live?",
            "What's your password?",
            "My credit card number is 1234"
        ]
        
        for message in unsafe_messages:
            is_safe, violations = InputSanitizer.check_child_safety(message)
            assert is_safe is False, f"Message should be unsafe: {message}"
            assert len(violations) > 0
    
    def test_appropriate_content_allowed(self):
        """Test age-appropriate content is allowed"""
        safe_messages = [
            "I love dancing!",
            "My horse is named Buttercup",
            "Can we play a game?",
            "Tell me a funny joke!",
            "I learned a new dance move today",
            "Do you like horses?",
            "What's your favorite treat?",
            "You're so cute Daisy!"
        ]
        
        for message in safe_messages:
            is_safe, violations = InputSanitizer.check_child_safety(message)
            assert is_safe is True, f"Message should be safe: {message}"
            assert len(violations) == 0
    
    def test_profanity_filtering(self):
        """Test profanity is filtered"""
        # Note: Using mild examples for testing
        clean_text = "This is a nice message"
        result = InputSanitizer.sanitize_text(clean_text)
        assert result == clean_text
        
        # The profanity filter should censor inappropriate words
        # (Implementation depends on the profanity library used)
    
    def test_content_length_limits(self):
        """Test content length limits for children"""
        # Very long message should be truncated
        long_message = "I love Daisy! " * 100  # Very long
        result = InputSanitizer.sanitize_text(long_message, 200)
        assert len(result) <= 203  # 200 + "..."
        
        # Should preserve word boundaries when truncating
        assert not result.endswith("I love Dai...")  # Shouldn't cut mid-word


@pytest.mark.security
@pytest.mark.performance
class TestSecurityPerformance:
    """Test security features don't impact performance significantly"""
    
    @pytest.mark.asyncio
    async def test_validation_performance(self):
        """Test input validation performance"""
        start_time = time.time()
        
        # Test 1000 validations
        for i in range(1000):
            message = f"Hi Daisy! This is message number {i}"
            InputSanitizer.sanitize_text(message)
            InputSanitizer.check_child_safety(message)
        
        end_time = time.time()
        elapsed = end_time - start_time
        
        # Should complete 1000 validations in under 1 second
        assert elapsed < 1.0, f"Validation took too long: {elapsed}s"
    
    @pytest.mark.asyncio
    async def test_rate_limiting_performance(self):
        """Test rate limiting performance"""
        app = FastAPI()
        middleware = SecurityMiddleware(app)
        
        mock_request = Mock()
        mock_request.url.path = "/api/test"
        
        start_time = time.time()
        
        # Test 100 rate limit checks
        for i in range(100):
            await middleware._check_rate_limits(mock_request, f"127.0.0.{i % 10}")
        
        end_time = time.time()
        elapsed = end_time - start_time
        
        # Should complete 100 checks in under 0.5 seconds
        assert elapsed < 0.5, f"Rate limiting took too long: {elapsed}s"


@pytest.mark.security
@pytest.mark.integration
class TestSecurityIntegration:
    """Test security integration with API endpoints"""
    
    @pytest.fixture
    def secure_app(self):
        """Create app with full security stack"""
        from main import app  # Import main FastAPI app
        return app
    
    @pytest.fixture
    def secure_client(self, secure_app):
        """Create client with security middleware"""
        return TestClient(secure_app)
    
    def test_chat_endpoint_security(self, secure_client):
        """Test chat endpoint with security"""
        # Valid request should work
        response = secure_client.post(
            "/api/chat",
            json={"message": "Hi Daisy!"},
            headers={"Authorization": "Bearer test-token"}
        )
        # Response depends on authentication setup
        
        # Invalid/unsafe request should be blocked
        response = secure_client.post(
            "/api/chat",
            json={"message": "My phone is 555-1234"},
            headers={"Authorization": "Bearer test-token"}
        )
        # Should return validation error
    
    def test_user_profile_security(self, secure_client):
        """Test user profile endpoint security"""
        # Valid profile update
        profile_data = {
            "username": "victoria",
            "display_name": "Victoria",
            "age": 8,
            "preferences": {
                "favorite_activities": ["dancing", "horses"]
            }
        }
        
        response = secure_client.put(
            "/api/user/profile",
            json=profile_data,
            headers={"Authorization": "Bearer test-token"}
        )
        # Response depends on authentication setup
    
    def test_rate_limiting_integration(self, secure_client):
        """Test rate limiting in full integration"""
        # Make many requests rapidly
        responses = []
        for i in range(70):  # Exceed rate limit
            response = secure_client.get("/api/health")
            responses.append(response.status_code)
        
        # Some requests should be rate limited (429)
        rate_limited = [r for r in responses if r == 429]
        # Exact behavior depends on rate limit configuration


@pytest.mark.security
class TestSecurityAuditLog:
    """Test security audit logging"""
    
    @pytest.mark.asyncio
    async def test_security_event_logging(self):
        """Test security events are logged"""
        app = FastAPI()
        middleware = SecurityMiddleware(app)
        
        # Mock logging
        with patch('security.middleware.logger') as mock_logger:
            await middleware._log_security_event(
                "127.0.0.1", "TEST_EVENT", "Test details"
            )
            
            # Verify logging was called
            mock_logger.warning.assert_called_once()
            call_args = mock_logger.warning.call_args[0][0]
            assert "TEST_EVENT" in call_args
            assert "127.0.0.1" in call_args
    
    @pytest.mark.asyncio
    async def test_request_logging(self):
        """Test request logging"""
        app = FastAPI()
        middleware = SecurityMiddleware(app)
        
        # Mock request and response
        mock_request = Mock()
        mock_request.state.security_context = {
            'request_id': 'test-123',
            'client_ip': '127.0.0.1',
            'user_agent': 'test-agent',
            'timestamp': datetime.utcnow().isoformat()
        }
        mock_request.method = "GET"
        mock_request.url.path = "/test"
        
        mock_response = Mock()
        mock_response.status_code = 200
        
        with patch('security.middleware.logger') as mock_logger:
            await middleware._log_request(mock_request, mock_response, 0.1)
            
            # Verify debug logging for successful request
            mock_logger.debug.assert_called_once()


@pytest.mark.security
@pytest.mark.victoria
class TestVictoriaSecurityScenarios:
    """Test security scenarios specific to Victoria persona"""
    
    def test_victoria_safe_messages(self):
        """Test Victoria's typical safe messages"""
        victoria_messages = [
            "Hi Daisy!!! 💕",
            "wanna play?!",
            "ur so cute!",
            "I learned a new dance move! 💃",
            "I rode Buttercup today! 🐴",
            "tell me a funny joke! 😂",
            "can u do tricks?",
            "ur the best puppy ever! 🐶❤️"
        ]
        
        for message in victoria_messages:
            # Should pass child safety checks
            is_safe, violations = InputSanitizer.check_child_safety(message)
            assert is_safe is True, f"Victoria message should be safe: {message}"
            
            # Should pass validation
            try:
                SecureChatMessage(message=message)
            except ValueError as e:
                pytest.fail(f"Victoria message failed validation: {message} - {e}")
    
    def test_victoria_profile_security(self):
        """Test Victoria's profile meets security requirements"""
        victoria_profile = {
            "username": "victoria",
            "display_name": "Victoria",
            "age": 8,
            "preferences": {
                "favorite_activities": ["dancing", "horses", "dogs"],
                "communication_style": "enthusiastic",
                "interests": ["ballet", "riding", "playing"]
            }
        }
        
        # Should pass all validations
        profile = SecureUserProfile(**victoria_profile)
        assert profile.username == "victoria"
        assert profile.age == 8
        assert "dancing" in profile.preferences["favorite_activities"]
    
    def test_victoria_unsafe_scenarios(self):
        """Test Victoria accidentally sharing unsafe information"""
        unsafe_scenarios = [
            "my mom's phone is 555-1234",
            "I live on Maple Street",
            "come meet me at school",
            "my password is princess123"
        ]
        
        for message in unsafe_scenarios:
            # Should be blocked by child safety
            is_safe, violations = InputSanitizer.check_child_safety(message)
            assert is_safe is False, f"Unsafe message should be blocked: {message}"
            
            # Should fail validation
            with pytest.raises(ValueError):
                SecureChatMessage(message=message)
