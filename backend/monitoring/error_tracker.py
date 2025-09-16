"""
Error tracking and alerting system for DaisyDog
Implements error collection, analysis, and notification system
"""

import asyncio
import json
import traceback
import sys
from typing import Dict, Any, Optional, List, Callable
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
from enum import Enum
import hashlib
import smtplib
from email.mime.text import MimeText
from email.mime.multipart import MimeMultipart
import requests
import redis
from collections import defaultdict, deque
import threading
import time
import os

from .logger import get_logger, LogLevel, EventType


class ErrorSeverity(Enum):
    """Error severity levels"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class AlertChannel(Enum):
    """Alert notification channels"""
    EMAIL = "email"
    SLACK = "slack"
    WEBHOOK = "webhook"
    SMS = "sms"
    CONSOLE = "console"


@dataclass
class ErrorInfo:
    """Structured error information"""
    error_id: str
    timestamp: str
    severity: str
    error_type: str
    message: str
    traceback: str
    user_id: Optional[str] = None
    session_id: Optional[str] = None
    request_id: Optional[str] = None
    endpoint: Optional[str] = None
    user_agent: Optional[str] = None
    client_ip: Optional[str] = None
    context: Optional[Dict[str, Any]] = None
    tags: Optional[List[str]] = None
    count: int = 1
    first_seen: Optional[str] = None
    last_seen: Optional[str] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {k: v for k, v in asdict(self).items() if v is not None}


@dataclass
class AlertRule:
    """Alert rule configuration"""
    name: str
    condition: str  # e.g., "error_count > 10", "severity == critical"
    channels: List[AlertChannel]
    cooldown_minutes: int = 30
    enabled: bool = True
    filters: Optional[Dict[str, Any]] = None


class ErrorTracker:
    """Main error tracking and alerting system"""
    
    def __init__(
        self,
        redis_client: Optional[redis.Redis] = None,
        alert_config: Optional[Dict[str, Any]] = None
    ):
        self.redis_client = redis_client
        self.logger = get_logger()
        
        # Error storage
        self.errors = {}  # error_id -> ErrorInfo
        self.error_counts = defaultdict(int)
        self.recent_errors = deque(maxlen=1000)
        self.error_lock = threading.Lock()
        
        # Alert configuration
        self.alert_config = alert_config or {}
        self.alert_rules = []
        self.alert_cooldowns = {}  # rule_name -> last_alert_time
        
        # Load default alert rules
        self._setup_default_alert_rules()
        
        # Background tasks
        self._start_background_tasks()
    
    def _setup_default_alert_rules(self):
        """Set up default alert rules"""
        default_rules = [
            AlertRule(
                name="critical_errors",
                condition="severity == 'critical'",
                channels=[AlertChannel.EMAIL, AlertChannel.SLACK],
                cooldown_minutes=5
            ),
            AlertRule(
                name="high_error_rate",
                condition="error_count_per_minute > 50",
                channels=[AlertChannel.SLACK],
                cooldown_minutes=15
            ),
            AlertRule(
                name="child_safety_errors",
                condition="'child_safety' in tags",
                channels=[AlertChannel.EMAIL, AlertChannel.SLACK],
                cooldown_minutes=10
            ),
            AlertRule(
                name="database_errors",
                condition="error_type == 'DatabaseError'",
                channels=[AlertChannel.SLACK],
                cooldown_minutes=20
            ),
            AlertRule(
                name="authentication_errors",
                condition="error_type == 'AuthenticationError'",
                channels=[AlertChannel.SLACK],
                cooldown_minutes=30
            )
        ]
        
        self.alert_rules.extend(default_rules)
    
    def _start_background_tasks(self):
        """Start background monitoring tasks"""
        # Error analysis and alerting
        self.analysis_thread = threading.Thread(
            target=self._analyze_errors, daemon=True
        )
        self.analysis_thread.start()
        
        # Cleanup old errors
        self.cleanup_thread = threading.Thread(
            target=self._cleanup_old_errors, daemon=True
        )
        self.cleanup_thread.start()
    
    def track_error(
        self,
        error: Exception,
        severity: ErrorSeverity = ErrorSeverity.MEDIUM,
        user_id: Optional[str] = None,
        session_id: Optional[str] = None,
        request_id: Optional[str] = None,
        endpoint: Optional[str] = None,
        context: Optional[Dict[str, Any]] = None,
        tags: Optional[List[str]] = None
    ) -> str:
        """Track an error and return error ID"""
        
        # Generate error signature for deduplication
        error_signature = self._generate_error_signature(error, endpoint)
        
        # Get or create error info
        with self.error_lock:
            if error_signature in self.errors:
                error_info = self.errors[error_signature]
                error_info.count += 1
                error_info.last_seen = datetime.utcnow().isoformat()
                
                # Update context if provided
                if context:
                    if error_info.context:
                        error_info.context.update(context)
                    else:
                        error_info.context = context
            else:
                error_info = ErrorInfo(
                    error_id=error_signature,
                    timestamp=datetime.utcnow().isoformat(),
                    severity=severity.value,
                    error_type=type(error).__name__,
                    message=str(error),
                    traceback=traceback.format_exc(),
                    user_id=user_id,
                    session_id=session_id,
                    request_id=request_id,
                    endpoint=endpoint,
                    context=context,
                    tags=tags or [],
                    first_seen=datetime.utcnow().isoformat(),
                    last_seen=datetime.utcnow().isoformat()
                )
                self.errors[error_signature] = error_info
            
            # Add to recent errors
            self.recent_errors.append(error_info)
            
            # Update counts
            self.error_counts[error_info.error_type] += 1
        
        # Log the error
        self.logger.error(
            f"Error tracked: {error_info.message}",
            event_type=EventType.ERROR_EVENT,
            user_id=user_id,
            session_id=session_id,
            request_id=request_id,
            endpoint=endpoint,
            context={
                'error_id': error_signature,
                'error_type': error_info.error_type,
                'severity': severity.value,
                'count': error_info.count,
                **(context or {})
            },
            error_details={
                'message': str(error),
                'traceback': traceback.format_exc()
            }
        )
        
        # Store in Redis
        if self.redis_client:
            try:
                self.redis_client.hset(
                    "daisydog:errors",
                    error_signature,
                    json.dumps(error_info.to_dict())
                )
                self.redis_client.expire("daisydog:errors", 86400 * 7)  # 7 days
                
                # Store recent errors list
                self.redis_client.lpush(
                    "daisydog:recent_errors",
                    json.dumps(error_info.to_dict())
                )
                self.redis_client.ltrim("daisydog:recent_errors", 0, 999)
                self.redis_client.expire("daisydog:recent_errors", 86400)
                
            except Exception as e:
                self.logger.error(f"Failed to store error in Redis: {str(e)}")
        
        # Trigger immediate alert check for critical errors
        if severity == ErrorSeverity.CRITICAL:
            self._check_alert_rules(error_info)
        
        return error_signature
    
    def _generate_error_signature(self, error: Exception, endpoint: Optional[str] = None) -> str:
        """Generate unique signature for error deduplication"""
        # Create signature from error type, message, and location
        signature_parts = [
            type(error).__name__,
            str(error),
            endpoint or "unknown"
        ]
        
        # Add traceback location (first few frames)
        tb = traceback.extract_tb(error.__traceback__)
        if tb:
            # Use first 3 frames for signature
            for frame in tb[:3]:
                signature_parts.append(f"{frame.filename}:{frame.lineno}")
        
        signature_string = "|".join(signature_parts)
        return hashlib.md5(signature_string.encode()).hexdigest()[:16]
    
    def _analyze_errors(self):
        """Background task to analyze errors and trigger alerts"""
        while True:
            try:
                time.sleep(60)  # Check every minute
                
                # Calculate error rates
                now = datetime.utcnow()
                one_minute_ago = now - timedelta(minutes=1)
                
                recent_error_count = sum(
                    1 for error in self.recent_errors
                    if datetime.fromisoformat(error.timestamp) > one_minute_ago
                )
                
                # Check alert rules
                for rule in self.alert_rules:
                    if not rule.enabled:
                        continue
                    
                    # Check cooldown
                    if rule.name in self.alert_cooldowns:
                        last_alert = self.alert_cooldowns[rule.name]
                        if now - last_alert < timedelta(minutes=rule.cooldown_minutes):
                            continue
                    
                    # Evaluate rule condition
                    if self._evaluate_alert_condition(rule, recent_error_count):
                        self._send_alert(rule, {
                            'error_count_per_minute': recent_error_count,
                            'total_errors': len(self.errors),
                            'error_types': dict(self.error_counts)
                        })
                        self.alert_cooldowns[rule.name] = now
                
            except Exception as e:
                self.logger.error(f"Error in error analysis: {str(e)}")
                time.sleep(60)
    
    def _evaluate_alert_condition(self, rule: AlertRule, error_count_per_minute: int) -> bool:
        """Evaluate if alert rule condition is met"""
        try:
            # Create evaluation context
            context = {
                'error_count_per_minute': error_count_per_minute,
                'total_errors': len(self.errors),
                'error_counts': dict(self.error_counts)
            }
            
            # Check for specific error conditions
            if "severity ==" in rule.condition:
                severity = rule.condition.split("== '")[1].split("'")[0]
                return any(
                    error.severity == severity
                    for error in self.recent_errors
                    if datetime.fromisoformat(error.timestamp) > datetime.utcnow() - timedelta(minutes=5)
                )
            
            elif "error_count_per_minute >" in rule.condition:
                threshold = int(rule.condition.split("> ")[1])
                return error_count_per_minute > threshold
            
            elif "error_type ==" in rule.condition:
                error_type = rule.condition.split("== '")[1].split("'")[0]
                return any(
                    error.error_type == error_type
                    for error in self.recent_errors
                    if datetime.fromisoformat(error.timestamp) > datetime.utcnow() - timedelta(minutes=5)
                )
            
            elif "in tags" in rule.condition:
                tag = rule.condition.split("'")[1]
                return any(
                    tag in (error.tags or [])
                    for error in self.recent_errors
                    if datetime.fromisoformat(error.timestamp) > datetime.utcnow() - timedelta(minutes=5)
                )
            
            # Fallback to eval (be careful with this in production)
            return eval(rule.condition, {"__builtins__": {}}, context)
            
        except Exception as e:
            self.logger.error(f"Error evaluating alert condition '{rule.condition}': {str(e)}")
            return False
    
    def _check_alert_rules(self, error_info: ErrorInfo):
        """Check alert rules for a specific error"""
        for rule in self.alert_rules:
            if not rule.enabled:
                continue
            
            # Check if rule applies to this error
            if self._rule_matches_error(rule, error_info):
                self._send_alert(rule, error_info.to_dict())
    
    def _rule_matches_error(self, rule: AlertRule, error_info: ErrorInfo) -> bool:
        """Check if alert rule matches specific error"""
        if "severity ==" in rule.condition:
            severity = rule.condition.split("== '")[1].split("'")[0]
            return error_info.severity == severity
        
        elif "error_type ==" in rule.condition:
            error_type = rule.condition.split("== '")[1].split("'")[0]
            return error_info.error_type == error_type
        
        elif "in tags" in rule.condition:
            tag = rule.condition.split("'")[1]
            return tag in (error_info.tags or [])
        
        return False
    
    def _send_alert(self, rule: AlertRule, context: Dict[str, Any]):
        """Send alert through configured channels"""
        alert_data = {
            'rule': rule.name,
            'timestamp': datetime.utcnow().isoformat(),
            'context': context
        }
        
        for channel in rule.channels:
            try:
                if channel == AlertChannel.EMAIL:
                    self._send_email_alert(rule, alert_data)
                elif channel == AlertChannel.SLACK:
                    self._send_slack_alert(rule, alert_data)
                elif channel == AlertChannel.WEBHOOK:
                    self._send_webhook_alert(rule, alert_data)
                elif channel == AlertChannel.CONSOLE:
                    self._send_console_alert(rule, alert_data)
                
            except Exception as e:
                self.logger.error(f"Failed to send alert via {channel.value}: {str(e)}")
    
    def _send_email_alert(self, rule: AlertRule, alert_data: Dict[str, Any]):
        """Send email alert"""
        email_config = self.alert_config.get('email', {})
        if not email_config:
            return
        
        smtp_server = email_config.get('smtp_server')
        smtp_port = email_config.get('smtp_port', 587)
        username = email_config.get('username')
        password = email_config.get('password')
        to_emails = email_config.get('to_emails', [])
        
        if not all([smtp_server, username, password, to_emails]):
            return
        
        # Create message
        msg = MimeMultipart()
        msg['From'] = username
        msg['To'] = ', '.join(to_emails)
        msg['Subject'] = f"DaisyDog Alert: {rule.name}"
        
        # Create email body
        body = f"""
        Alert Rule: {rule.name}
        Timestamp: {alert_data['timestamp']}
        
        Context:
        {json.dumps(alert_data['context'], indent=2)}
        """
        
        msg.attach(MimeText(body, 'plain'))
        
        # Send email
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()
            server.login(username, password)
            server.send_message(msg)
    
    def _send_slack_alert(self, rule: AlertRule, alert_data: Dict[str, Any]):
        """Send Slack alert"""
        slack_config = self.alert_config.get('slack', {})
        webhook_url = slack_config.get('webhook_url')
        
        if not webhook_url:
            return
        
        # Create Slack message
        message = {
            "text": f"🚨 DaisyDog Alert: {rule.name}",
            "attachments": [
                {
                    "color": "danger",
                    "fields": [
                        {
                            "title": "Rule",
                            "value": rule.name,
                            "short": True
                        },
                        {
                            "title": "Timestamp",
                            "value": alert_data['timestamp'],
                            "short": True
                        },
                        {
                            "title": "Context",
                            "value": f"```{json.dumps(alert_data['context'], indent=2)}```",
                            "short": False
                        }
                    ]
                }
            ]
        }
        
        response = requests.post(webhook_url, json=message, timeout=10)
        response.raise_for_status()
    
    def _send_webhook_alert(self, rule: AlertRule, alert_data: Dict[str, Any]):
        """Send webhook alert"""
        webhook_config = self.alert_config.get('webhook', {})
        url = webhook_config.get('url')
        
        if not url:
            return
        
        payload = {
            'alert_rule': rule.name,
            'timestamp': alert_data['timestamp'],
            'context': alert_data['context']
        }
        
        response = requests.post(url, json=payload, timeout=10)
        response.raise_for_status()
    
    def _send_console_alert(self, rule: AlertRule, alert_data: Dict[str, Any]):
        """Send console alert"""
        print(f"\n🚨 ALERT: {rule.name}")
        print(f"Timestamp: {alert_data['timestamp']}")
        print(f"Context: {json.dumps(alert_data['context'], indent=2)}")
        print("-" * 50)
    
    def _cleanup_old_errors(self):
        """Clean up old errors to prevent memory leaks"""
        while True:
            try:
                time.sleep(3600)  # Run every hour
                
                cutoff_time = datetime.utcnow() - timedelta(days=7)
                
                with self.error_lock:
                    # Remove old errors
                    old_error_ids = [
                        error_id for error_id, error_info in self.errors.items()
                        if datetime.fromisoformat(error_info.timestamp) < cutoff_time
                    ]
                    
                    for error_id in old_error_ids:
                        del self.errors[error_id]
                
                self.logger.info(f"Cleaned up {len(old_error_ids)} old errors")
                
            except Exception as e:
                self.logger.error(f"Error in cleanup task: {str(e)}")
                time.sleep(3600)
    
    def get_error_summary(self) -> Dict[str, Any]:
        """Get error summary statistics"""
        with self.error_lock:
            now = datetime.utcnow()
            
            # Calculate time-based statistics
            last_hour = now - timedelta(hours=1)
            last_day = now - timedelta(days=1)
            
            errors_last_hour = [
                error for error in self.recent_errors
                if datetime.fromisoformat(error.timestamp) > last_hour
            ]
            
            errors_last_day = [
                error for error in self.recent_errors
                if datetime.fromisoformat(error.timestamp) > last_day
            ]
            
            return {
                'total_errors': len(self.errors),
                'errors_last_hour': len(errors_last_hour),
                'errors_last_day': len(errors_last_day),
                'error_types': dict(self.error_counts),
                'top_errors': [
                    {
                        'error_id': error.error_id,
                        'message': error.message,
                        'count': error.count,
                        'severity': error.severity,
                        'last_seen': error.last_seen
                    }
                    for error in sorted(
                        self.errors.values(),
                        key=lambda x: x.count,
                        reverse=True
                    )[:10]
                ]
            }
    
    def get_error_details(self, error_id: str) -> Optional[Dict[str, Any]]:
        """Get detailed information about a specific error"""
        with self.error_lock:
            error_info = self.errors.get(error_id)
            return error_info.to_dict() if error_info else None
    
    def add_alert_rule(self, rule: AlertRule):
        """Add a new alert rule"""
        self.alert_rules.append(rule)
    
    def remove_alert_rule(self, rule_name: str):
        """Remove an alert rule"""
        self.alert_rules = [rule for rule in self.alert_rules if rule.name != rule_name]
    
    def update_alert_config(self, config: Dict[str, Any]):
        """Update alert configuration"""
        self.alert_config.update(config)


# Global error tracker instance
error_tracker = None

def get_error_tracker() -> ErrorTracker:
    """Get the global error tracker instance"""
    global error_tracker
    if error_tracker is None:
        # Initialize with Redis if available
        redis_client = None
        try:
            import redis
            redis_client = redis.Redis(
                host=os.getenv('REDIS_HOST', 'localhost'),
                port=int(os.getenv('REDIS_PORT', 6379)),
                db=int(os.getenv('REDIS_DB', 0)),
                decode_responses=True
            )
            redis_client.ping()
        except Exception:
            redis_client = None
        
        # Load alert configuration from environment
        alert_config = {
            'email': {
                'smtp_server': os.getenv('SMTP_SERVER'),
                'smtp_port': int(os.getenv('SMTP_PORT', 587)),
                'username': os.getenv('SMTP_USERNAME'),
                'password': os.getenv('SMTP_PASSWORD'),
                'to_emails': os.getenv('ALERT_EMAILS', '').split(',') if os.getenv('ALERT_EMAILS') else []
            },
            'slack': {
                'webhook_url': os.getenv('SLACK_WEBHOOK_URL')
            },
            'webhook': {
                'url': os.getenv('ALERT_WEBHOOK_URL')
            }
        }
        
        error_tracker = ErrorTracker(
            redis_client=redis_client,
            alert_config=alert_config
        )
    
    return error_tracker


def track_error(
    error: Exception,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    **kwargs
) -> str:
    """Convenience function to track an error"""
    return get_error_tracker().track_error(error, severity, **kwargs)


# Context manager for automatic error tracking
class ErrorContext:
    """Context manager for automatic error tracking"""
    
    def __init__(
        self,
        operation_name: str,
        severity: ErrorSeverity = ErrorSeverity.MEDIUM,
        **kwargs
    ):
        self.operation_name = operation_name
        self.severity = severity
        self.kwargs = kwargs
        self.tracker = get_error_tracker()
    
    def __enter__(self):
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type is not None:
            self.tracker.track_error(
                exc_val,
                self.severity,
                context={'operation': self.operation_name},
                **self.kwargs
            )
        return False  # Don't suppress the exception


# Export main classes and functions
__all__ = [
    'ErrorTracker',
    'ErrorSeverity',
    'AlertChannel',
    'ErrorInfo',
    'AlertRule',
    'ErrorContext',
    'get_error_tracker',
    'track_error'
]
