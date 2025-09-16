"""
Comprehensive logging and monitoring system for DaisyDog
Implements structured logging, metrics collection, and child safety monitoring
"""

import logging
import json
import time
import asyncio
from typing import Dict, Any, Optional, List
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
from enum import Enum
import traceback
import sys
import os
from pathlib import Path
import threading
from collections import defaultdict, deque
import psutil
import redis
from contextlib import contextmanager


class LogLevel(Enum):
    """Log levels for DaisyDog"""
    DEBUG = "DEBUG"
    INFO = "INFO"
    WARNING = "WARNING"
    ERROR = "ERROR"
    CRITICAL = "CRITICAL"
    SECURITY = "SECURITY"
    CHILD_SAFETY = "CHILD_SAFETY"
    PERFORMANCE = "PERFORMANCE"


class EventType(Enum):
    """Event types for monitoring"""
    USER_ACTION = "user_action"
    SYSTEM_EVENT = "system_event"
    SECURITY_EVENT = "security_event"
    CHILD_SAFETY_EVENT = "child_safety_event"
    PERFORMANCE_EVENT = "performance_event"
    ERROR_EVENT = "error_event"
    API_REQUEST = "api_request"
    DATABASE_OPERATION = "database_operation"
    GAME_EVENT = "game_event"
    CHAT_EVENT = "chat_event"


@dataclass
class LogEntry:
    """Structured log entry"""
    timestamp: str
    level: str
    event_type: str
    message: str
    user_id: Optional[str] = None
    session_id: Optional[str] = None
    request_id: Optional[str] = None
    client_ip: Optional[str] = None
    user_agent: Optional[str] = None
    endpoint: Optional[str] = None
    method: Optional[str] = None
    status_code: Optional[int] = None
    processing_time: Optional[float] = None
    error_details: Optional[Dict[str, Any]] = None
    context: Optional[Dict[str, Any]] = None
    tags: Optional[List[str]] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {k: v for k, v in asdict(self).items() if v is not None}


@dataclass
class MetricEntry:
    """Performance metric entry"""
    timestamp: str
    metric_name: str
    value: float
    unit: str
    tags: Optional[Dict[str, str]] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return asdict(self)


class DaisyLogger:
    """Main logging class for DaisyDog"""
    
    def __init__(
        self, 
        log_level: LogLevel = LogLevel.INFO,
        log_file: Optional[str] = None,
        redis_client: Optional[redis.Redis] = None,
        enable_console: bool = True,
        enable_file: bool = True,
        enable_redis: bool = True
    ):
        self.log_level = log_level
        self.redis_client = redis_client
        self.enable_console = enable_console
        self.enable_file = enable_file
        self.enable_redis = enable_redis
        
        # Create logs directory
        self.log_dir = Path("logs")
        self.log_dir.mkdir(exist_ok=True)
        
        # Set up log files
        self.log_file = log_file or str(self.log_dir / "daisydog.log")
        self.security_log_file = str(self.log_dir / "security.log")
        self.child_safety_log_file = str(self.log_dir / "child_safety.log")
        self.performance_log_file = str(self.log_dir / "performance.log")
        self.error_log_file = str(self.log_dir / "errors.log")
        
        # Initialize loggers
        self._setup_loggers()
        
        # Metrics storage
        self.metrics = defaultdict(deque)
        self.metrics_lock = threading.Lock()
        
        # Performance tracking
        self.request_times = deque(maxlen=1000)
        self.error_counts = defaultdict(int)
        self.child_safety_violations = deque(maxlen=100)
        
        # Background tasks
        self._start_background_tasks()
    
    def _setup_loggers(self):
        """Set up Python loggers"""
        # Main logger
        self.logger = logging.getLogger("daisydog")
        self.logger.setLevel(getattr(logging, self.log_level.value))
        
        # Clear existing handlers
        self.logger.handlers.clear()
        
        # Console handler
        if self.enable_console:
            console_handler = logging.StreamHandler(sys.stdout)
            console_formatter = logging.Formatter(
                '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
            )
            console_handler.setFormatter(console_formatter)
            self.logger.addHandler(console_handler)
        
        # File handler
        if self.enable_file:
            file_handler = logging.FileHandler(self.log_file)
            file_formatter = logging.Formatter(
                '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
            )
            file_handler.setFormatter(file_formatter)
            self.logger.addHandler(file_handler)
        
        # Specialized loggers
        self.security_logger = self._create_file_logger("security", self.security_log_file)
        self.child_safety_logger = self._create_file_logger("child_safety", self.child_safety_log_file)
        self.performance_logger = self._create_file_logger("performance", self.performance_log_file)
        self.error_logger = self._create_file_logger("errors", self.error_log_file)
    
    def _create_file_logger(self, name: str, filename: str) -> logging.Logger:
        """Create a specialized file logger"""
        logger = logging.getLogger(f"daisydog.{name}")
        logger.setLevel(logging.INFO)
        
        handler = logging.FileHandler(filename)
        formatter = logging.Formatter(
            '%(asctime)s - %(levelname)s - %(message)s'
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        
        return logger
    
    def _start_background_tasks(self):
        """Start background monitoring tasks"""
        # System metrics collection
        self.metrics_thread = threading.Thread(
            target=self._collect_system_metrics, daemon=True
        )
        self.metrics_thread.start()
        
        # Log rotation
        self.rotation_thread = threading.Thread(
            target=self._rotate_logs, daemon=True
        )
        self.rotation_thread.start()
    
    def log(
        self,
        level: LogLevel,
        event_type: EventType,
        message: str,
        **kwargs
    ):
        """Main logging method"""
        entry = LogEntry(
            timestamp=datetime.utcnow().isoformat(),
            level=level.value,
            event_type=event_type.value,
            message=message,
            **kwargs
        )
        
        # Log to appropriate destinations
        self._write_log_entry(entry)
        
        # Special handling for different event types
        if event_type == EventType.SECURITY_EVENT:
            self._handle_security_event(entry)
        elif event_type == EventType.CHILD_SAFETY_EVENT:
            self._handle_child_safety_event(entry)
        elif event_type == EventType.ERROR_EVENT:
            self._handle_error_event(entry)
        elif event_type == EventType.PERFORMANCE_EVENT:
            self._handle_performance_event(entry)
    
    def _write_log_entry(self, entry: LogEntry):
        """Write log entry to all configured destinations"""
        log_data = entry.to_dict()
        json_log = json.dumps(log_data)
        
        # Python logger
        python_level = getattr(logging, entry.level, logging.INFO)
        self.logger.log(python_level, json_log)
        
        # Redis (for real-time monitoring)
        if self.enable_redis and self.redis_client:
            try:
                # Store recent logs
                self.redis_client.lpush("daisydog:logs", json_log)
                self.redis_client.ltrim("daisydog:logs", 0, 999)  # Keep last 1000
                
                # Store by event type
                self.redis_client.lpush(f"daisydog:logs:{entry.event_type}", json_log)
                self.redis_client.ltrim(f"daisydog:logs:{entry.event_type}", 0, 99)
                
                # Set expiration
                self.redis_client.expire("daisydog:logs", 86400)  # 24 hours
                self.redis_client.expire(f"daisydog:logs:{entry.event_type}", 86400)
                
            except Exception as e:
                self.logger.error(f"Failed to write to Redis: {str(e)}")
    
    def _handle_security_event(self, entry: LogEntry):
        """Handle security events"""
        self.security_logger.warning(json.dumps(entry.to_dict()))
        
        # Alert on critical security events
        if entry.level in [LogLevel.ERROR.value, LogLevel.CRITICAL.value]:
            self._send_alert("Security Alert", entry.message, entry.to_dict())
    
    def _handle_child_safety_event(self, entry: LogEntry):
        """Handle child safety events"""
        self.child_safety_logger.warning(json.dumps(entry.to_dict()))
        
        # Track violations
        self.child_safety_violations.append({
            'timestamp': entry.timestamp,
            'message': entry.message,
            'user_id': entry.user_id,
            'context': entry.context
        })
        
        # Alert on repeated violations
        if entry.user_id:
            recent_violations = [
                v for v in self.child_safety_violations 
                if v['user_id'] == entry.user_id
                and datetime.fromisoformat(v['timestamp']) > datetime.utcnow() - timedelta(hours=1)
            ]
            
            if len(recent_violations) >= 3:
                self._send_alert(
                    "Child Safety Alert", 
                    f"Multiple violations from user {entry.user_id}",
                    {'violations': recent_violations}
                )
    
    def _handle_error_event(self, entry: LogEntry):
        """Handle error events"""
        self.error_logger.error(json.dumps(entry.to_dict()))
        
        # Track error counts
        error_key = entry.context.get('error_type', 'unknown') if entry.context else 'unknown'
        self.error_counts[error_key] += 1
        
        # Alert on critical errors
        if entry.level == LogLevel.CRITICAL.value:
            self._send_alert("Critical Error", entry.message, entry.to_dict())
    
    def _handle_performance_event(self, entry: LogEntry):
        """Handle performance events"""
        self.performance_logger.info(json.dumps(entry.to_dict()))
        
        # Track performance metrics
        if entry.processing_time:
            self.request_times.append(entry.processing_time)
            
            # Alert on slow requests
            if entry.processing_time > 5.0:  # 5 seconds
                self._send_alert(
                    "Performance Alert",
                    f"Slow request: {entry.processing_time:.2f}s",
                    entry.to_dict()
                )
    
    def _send_alert(self, title: str, message: str, context: Dict[str, Any]):
        """Send alert (implement with your alerting system)"""
        alert_data = {
            'timestamp': datetime.utcnow().isoformat(),
            'title': title,
            'message': message,
            'context': context,
            'severity': 'high'
        }
        
        # Log the alert
        self.logger.critical(f"ALERT: {title} - {message}")
        
        # Store in Redis for alert dashboard
        if self.redis_client:
            try:
                self.redis_client.lpush("daisydog:alerts", json.dumps(alert_data))
                self.redis_client.ltrim("daisydog:alerts", 0, 49)  # Keep last 50
                self.redis_client.expire("daisydog:alerts", 86400 * 7)  # 7 days
            except Exception as e:
                self.logger.error(f"Failed to store alert: {str(e)}")
    
    def _collect_system_metrics(self):
        """Collect system performance metrics"""
        while True:
            try:
                timestamp = datetime.utcnow().isoformat()
                
                # CPU usage
                cpu_percent = psutil.cpu_percent(interval=1)
                self.record_metric("system.cpu.usage", cpu_percent, "percent", timestamp)
                
                # Memory usage
                memory = psutil.virtual_memory()
                self.record_metric("system.memory.usage", memory.percent, "percent", timestamp)
                self.record_metric("system.memory.available", memory.available / 1024 / 1024, "MB", timestamp)
                
                # Disk usage
                disk = psutil.disk_usage('/')
                disk_percent = (disk.used / disk.total) * 100
                self.record_metric("system.disk.usage", disk_percent, "percent", timestamp)
                
                # Network I/O
                network = psutil.net_io_counters()
                self.record_metric("system.network.bytes_sent", network.bytes_sent, "bytes", timestamp)
                self.record_metric("system.network.bytes_recv", network.bytes_recv, "bytes", timestamp)
                
                # Application metrics
                if self.request_times:
                    avg_response_time = sum(self.request_times) / len(self.request_times)
                    self.record_metric("app.response_time.avg", avg_response_time, "seconds", timestamp)
                
                # Error rates
                total_errors = sum(self.error_counts.values())
                self.record_metric("app.errors.total", total_errors, "count", timestamp)
                
                time.sleep(60)  # Collect every minute
                
            except Exception as e:
                self.logger.error(f"Error collecting system metrics: {str(e)}")
                time.sleep(60)
    
    def record_metric(self, name: str, value: float, unit: str, timestamp: str = None):
        """Record a performance metric"""
        if timestamp is None:
            timestamp = datetime.utcnow().isoformat()
        
        metric = MetricEntry(
            timestamp=timestamp,
            metric_name=name,
            value=value,
            unit=unit
        )
        
        with self.metrics_lock:
            self.metrics[name].append(metric)
            # Keep only last 1000 metrics per name
            if len(self.metrics[name]) > 1000:
                self.metrics[name].popleft()
        
        # Store in Redis
        if self.redis_client:
            try:
                metric_key = f"daisydog:metrics:{name}"
                self.redis_client.lpush(metric_key, json.dumps(metric.to_dict()))
                self.redis_client.ltrim(metric_key, 0, 999)
                self.redis_client.expire(metric_key, 86400)  # 24 hours
            except Exception as e:
                self.logger.error(f"Failed to store metric: {str(e)}")
    
    def _rotate_logs(self):
        """Rotate log files daily"""
        while True:
            try:
                # Sleep until next day
                now = datetime.now()
                tomorrow = now.replace(hour=0, minute=0, second=0, microsecond=0) + timedelta(days=1)
                sleep_seconds = (tomorrow - now).total_seconds()
                time.sleep(sleep_seconds)
                
                # Rotate logs
                date_suffix = datetime.now().strftime("%Y%m%d")
                
                log_files = [
                    self.log_file,
                    self.security_log_file,
                    self.child_safety_log_file,
                    self.performance_log_file,
                    self.error_log_file
                ]
                
                for log_file in log_files:
                    if os.path.exists(log_file):
                        rotated_name = f"{log_file}.{date_suffix}"
                        os.rename(log_file, rotated_name)
                        
                        # Compress old logs (optional)
                        # You could add gzip compression here
                
                # Recreate loggers with new files
                self._setup_loggers()
                
            except Exception as e:
                self.logger.error(f"Error rotating logs: {str(e)}")
                time.sleep(3600)  # Try again in an hour
    
    def get_metrics_summary(self) -> Dict[str, Any]:
        """Get summary of collected metrics"""
        summary = {}
        
        with self.metrics_lock:
            for name, metrics in self.metrics.items():
                if metrics:
                    values = [m.value for m in metrics]
                    summary[name] = {
                        'count': len(values),
                        'avg': sum(values) / len(values),
                        'min': min(values),
                        'max': max(values),
                        'latest': values[-1],
                        'unit': metrics[-1].unit
                    }
        
        return summary
    
    def get_recent_logs(self, event_type: str = None, limit: int = 100) -> List[Dict[str, Any]]:
        """Get recent log entries"""
        if not self.redis_client:
            return []
        
        try:
            key = f"daisydog:logs:{event_type}" if event_type else "daisydog:logs"
            logs = self.redis_client.lrange(key, 0, limit - 1)
            return [json.loads(log) for log in logs]
        except Exception as e:
            self.logger.error(f"Error retrieving logs: {str(e)}")
            return []
    
    def get_alerts(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Get recent alerts"""
        if not self.redis_client:
            return []
        
        try:
            alerts = self.redis_client.lrange("daisydog:alerts", 0, limit - 1)
            return [json.loads(alert) for alert in alerts]
        except Exception as e:
            self.logger.error(f"Error retrieving alerts: {str(e)}")
            return []
    
    @contextmanager
    def performance_timer(self, operation_name: str, **context):
        """Context manager for timing operations"""
        start_time = time.time()
        try:
            yield
        finally:
            end_time = time.time()
            processing_time = end_time - start_time
            
            self.log(
                LogLevel.PERFORMANCE,
                EventType.PERFORMANCE_EVENT,
                f"Operation '{operation_name}' completed",
                processing_time=processing_time,
                context=context
            )
    
    # Convenience methods for different log levels
    def debug(self, message: str, event_type: EventType = EventType.SYSTEM_EVENT, **kwargs):
        self.log(LogLevel.DEBUG, event_type, message, **kwargs)
    
    def info(self, message: str, event_type: EventType = EventType.SYSTEM_EVENT, **kwargs):
        self.log(LogLevel.INFO, event_type, message, **kwargs)
    
    def warning(self, message: str, event_type: EventType = EventType.SYSTEM_EVENT, **kwargs):
        self.log(LogLevel.WARNING, event_type, message, **kwargs)
    
    def error(self, message: str, event_type: EventType = EventType.ERROR_EVENT, **kwargs):
        self.log(LogLevel.ERROR, event_type, message, **kwargs)
    
    def critical(self, message: str, event_type: EventType = EventType.ERROR_EVENT, **kwargs):
        self.log(LogLevel.CRITICAL, event_type, message, **kwargs)
    
    def security(self, message: str, **kwargs):
        self.log(LogLevel.SECURITY, EventType.SECURITY_EVENT, message, **kwargs)
    
    def child_safety(self, message: str, **kwargs):
        self.log(LogLevel.CHILD_SAFETY, EventType.CHILD_SAFETY_EVENT, message, **kwargs)


# Global logger instance
logger = None

def get_logger() -> DaisyLogger:
    """Get the global logger instance"""
    global logger
    if logger is None:
        # Initialize with default settings
        redis_client = None
        try:
            import redis
            redis_client = redis.Redis(
                host=os.getenv('REDIS_HOST', 'localhost'),
                port=int(os.getenv('REDIS_PORT', 6379)),
                db=int(os.getenv('REDIS_DB', 0)),
                decode_responses=True
            )
            # Test connection
            redis_client.ping()
        except Exception:
            redis_client = None
        
        logger = DaisyLogger(
            log_level=LogLevel(os.getenv('LOG_LEVEL', 'INFO')),
            redis_client=redis_client
        )
    
    return logger


def init_logger(
    log_level: LogLevel = LogLevel.INFO,
    redis_client: Optional[redis.Redis] = None,
    **kwargs
) -> DaisyLogger:
    """Initialize the global logger"""
    global logger
    logger = DaisyLogger(log_level=log_level, redis_client=redis_client, **kwargs)
    return logger


# Export main classes and functions
__all__ = [
    'DaisyLogger',
    'LogLevel',
    'EventType',
    'LogEntry',
    'MetricEntry',
    'get_logger',
    'init_logger'
]
