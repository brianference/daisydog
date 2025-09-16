"""
Pydantic models for DaisyDog API
Defines request and response schemas for all endpoints
"""

from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any, Union
from datetime import datetime
from enum import Enum

class MoodType(str, Enum):
    """Daisy's possible moods"""
    HAPPY = "happy"
    EXCITED = "excited"
    HUNGRY = "hungry"
    SLEEPY = "sleepy"
    PLAYFUL = "playful"

class MessageType(str, Enum):
    """Types of messages/interactions"""
    CHAT = "chat"
    FEEDING = "feeding"
    TRICK = "trick"
    GAME = "game"
    JOKE = "joke"
    GREETING = "greeting"

class AgeGroup(str, Enum):
    """Age groups for users"""
    YOUNG = "5-7"
    MIDDLE = "8-10"
    OLDER = "11-12"

# Request Models
class ChatMessage(BaseModel):
    """Chat message from user to Daisy"""
    message: str = Field(..., min_length=1, max_length=1000, description="User's message to Daisy")
    context: Optional[Dict[str, Any]] = Field(default=None, description="Additional context for the message")
    
    @validator('message')
    def validate_message(cls, v):
        if not v.strip():
            raise ValueError('Message cannot be empty')
        return v.strip()

class FeedingRequest(BaseModel):
    """Request to feed Daisy"""
    treat_type: str = Field(..., description="Type of treat to give Daisy")
    
    @validator('treat_type')
    def validate_treat_type(cls, v):
        allowed_treats = ['bone', 'biscuit', 'bacon', 'chicken', 'cheese', 'apple', 'carrot']
        if v.lower() not in allowed_treats:
            raise ValueError(f'Treat type must be one of: {", ".join(allowed_treats)}')
        return v.lower()

class TrickRequest(BaseModel):
    """Request for Daisy to perform a trick"""
    trick_name: str = Field(..., description="Name of the trick to perform")
    
    @validator('trick_name')
    def validate_trick_name(cls, v):
        return v.strip().lower()

class JokeRequest(BaseModel):
    """Request for a joke (optional parameters)"""
    category: Optional[str] = Field(default=None, description="Joke category preference")

class GameActionRequest(BaseModel):
    """Action in a game"""
    action_type: str = Field(..., description="Type of action")
    data: Dict[str, Any] = Field(default_factory=dict, description="Action data")

class UserRegistration(BaseModel):
    """User registration data"""
    username: str = Field(..., min_length=3, max_length=50, description="Username")
    email: Optional[str] = Field(default=None, description="Email address")
    age_group: AgeGroup = Field(..., description="User's age group")
    
    @validator('username')
    def validate_username(cls, v):
        if not v.isalnum():
            raise ValueError('Username must contain only letters and numbers')
        return v.lower()

# Response Models
class ChatResponse(BaseModel):
    """Response from Daisy to user"""
    response: str = Field(..., description="Daisy's response message")
    mood: MoodType = Field(default=MoodType.HAPPY, description="Daisy's current mood")
    hunger_level: int = Field(default=3, ge=0, le=5, description="Daisy's hunger level (0-5)")
    energy_level: int = Field(default=5, ge=0, le=5, description="Daisy's energy level (0-5)")
    context: Dict[str, Any] = Field(default_factory=dict, description="Response context")
    suggested_actions: List[str] = Field(default_factory=list, description="Suggested user actions")

class DaisyState(BaseModel):
    """Daisy's current state"""
    user_id: str = Field(..., description="User ID")
    hunger_level: int = Field(default=3, ge=0, le=5, description="Hunger level (0-5)")
    mood: MoodType = Field(default=MoodType.HAPPY, description="Current mood")
    energy_level: int = Field(default=5, ge=0, le=5, description="Energy level (0-5)")
    last_fed: Optional[datetime] = Field(default=None, description="Last feeding time")
    last_played: Optional[datetime] = Field(default=None, description="Last play time")
    personality_traits: Dict[str, int] = Field(
        default_factory=lambda: {
            "playfulness": 8,
            "friendliness": 10,
            "mischief": 6,
            "food_motivation": 9
        },
        description="Personality trait scores"
    )
    updated_at: datetime = Field(default_factory=datetime.utcnow, description="Last update time")

class UserProfile(BaseModel):
    """User profile information"""
    id: str = Field(..., description="User ID")
    username: str = Field(..., description="Username")
    email: Optional[str] = Field(default=None, description="Email address")
    age_group: Optional[AgeGroup] = Field(default=None, description="Age group")
    created_at: datetime = Field(..., description="Account creation time")
    last_active: datetime = Field(..., description="Last activity time")
    preferences: Dict[str, Any] = Field(default_factory=dict, description="User preferences")
    is_active: bool = Field(default=True, description="Account active status")

class UserStats(BaseModel):
    """User statistics"""
    user_id: str = Field(..., description="User ID")
    total_conversations: int = Field(default=0, description="Total conversations with Daisy")
    treats_given: int = Field(default=0, description="Total treats given to Daisy")
    tricks_performed: int = Field(default=0, description="Total tricks performed")
    games_played: int = Field(default=0, description="Total games played")
    jokes_heard: int = Field(default=0, description="Total jokes heard")
    last_feeding: Optional[datetime] = Field(default=None, description="Last feeding time")
    achievements: List[str] = Field(default_factory=list, description="Earned achievements")
    favorite_activities: Dict[str, int] = Field(default_factory=dict, description="Activity preferences")
    session_count: int = Field(default=0, description="Total sessions")
    total_time_spent: int = Field(default=0, description="Total time spent (seconds)")

class Achievement(BaseModel):
    """User achievement"""
    id: str = Field(..., description="Achievement ID")
    user_id: str = Field(..., description="User ID")
    achievement_type: str = Field(..., description="Achievement type")
    achievement_name: str = Field(..., description="Achievement name")
    description: str = Field(..., description="Achievement description")
    earned_at: datetime = Field(..., description="Time earned")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional data")

class GameSession(BaseModel):
    """Game session information"""
    id: str = Field(..., description="Session ID")
    user_id: str = Field(..., description="User ID")
    game_type: str = Field(..., description="Game type")
    score: int = Field(default=0, description="Current score")
    completed: bool = Field(default=False, description="Session completed")
    started_at: datetime = Field(..., description="Start time")
    completed_at: Optional[datetime] = Field(default=None, description="Completion time")
    game_data: Dict[str, Any] = Field(default_factory=dict, description="Game state data")
    duration_seconds: Optional[int] = Field(default=None, description="Session duration")

class Conversation(BaseModel):
    """Conversation record"""
    id: str = Field(..., description="Conversation ID")
    user_id: str = Field(..., description="User ID")
    message: str = Field(..., description="User message")
    response: str = Field(..., description="Daisy's response")
    message_type: MessageType = Field(default=MessageType.CHAT, description="Message type")
    created_at: datetime = Field(..., description="Creation time")
    context: Dict[str, Any] = Field(default_factory=dict, description="Message context")
    sentiment: str = Field(default="neutral", description="Message sentiment")

class Trick(BaseModel):
    """Available trick"""
    id: str = Field(..., description="Trick ID")
    trick_name: str = Field(..., description="Trick name")
    trick_description: str = Field(..., description="Trick description")
    animation_data: Dict[str, Any] = Field(default_factory=dict, description="Animation data")
    difficulty: int = Field(default=1, ge=1, le=5, description="Difficulty level (1-5)")
    energy_cost: int = Field(default=1, ge=1, le=3, description="Energy cost (1-3)")
    created_at: datetime = Field(..., description="Creation time")

class Game(BaseModel):
    """Available game"""
    id: str = Field(..., description="Game ID")
    game_name: str = Field(..., description="Game name")
    game_description: str = Field(..., description="Game description")
    game_rules: Dict[str, Any] = Field(default_factory=dict, description="Game rules")
    min_age: int = Field(default=5, description="Minimum age")
    max_age: int = Field(default=12, description="Maximum age")
    estimated_duration: int = Field(default=300, description="Estimated duration (seconds)")
    created_at: datetime = Field(..., description="Creation time")

class Joke(BaseModel):
    """Dog joke"""
    id: str = Field(..., description="Joke ID")
    joke_text: str = Field(..., description="Joke text")
    category: str = Field(default="general", description="Joke category")
    difficulty_level: str = Field(default="easy", description="Difficulty level")
    age_appropriate: bool = Field(default=True, description="Age appropriate flag")
    created_at: datetime = Field(..., description="Creation time")
    usage_count: int = Field(default=0, description="Usage count")

class FeedbackRequest(BaseModel):
    """User feedback"""
    feedback_type: str = Field(default="general", description="Feedback type")
    rating: Optional[int] = Field(default=None, ge=1, le=5, description="Rating (1-5)")
    comment: Optional[str] = Field(default=None, max_length=1000, description="Feedback comment")

# Response wrapper models
class ApiResponse(BaseModel):
    """Generic API response wrapper"""
    success: bool = Field(..., description="Request success status")
    message: str = Field(..., description="Response message")
    data: Optional[Any] = Field(default=None, description="Response data")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Response timestamp")

class ErrorResponse(BaseModel):
    """Error response"""
    error: str = Field(..., description="Error message")
    detail: Optional[str] = Field(default=None, description="Error details")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Error timestamp")

class HealthResponse(BaseModel):
    """Health check response"""
    status: str = Field(..., description="Service status")
    database: str = Field(..., description="Database status")
    timestamp: datetime = Field(..., description="Check timestamp")
    version: str = Field(..., description="API version")

# Game-specific models
class FetchGameState(BaseModel):
    """Fetch game state"""
    ball_position: Dict[str, float] = Field(default_factory=dict, description="Ball position")
    daisy_position: Dict[str, float] = Field(default_factory=dict, description="Daisy position")
    throws_remaining: int = Field(default=10, description="Throws remaining")
    catches: int = Field(default=0, description="Successful catches")

class MemoryGameState(BaseModel):
    """Memory game state"""
    sequence: List[str] = Field(default_factory=list, description="Current sequence")
    user_input: List[str] = Field(default_factory=list, description="User input sequence")
    level: int = Field(default=1, description="Current level")
    max_level: int = Field(default=10, description="Maximum level")

class HideAndSeekGameState(BaseModel):
    """Hide and seek game state"""
    hiding_spots: List[str] = Field(default_factory=list, description="Available hiding spots")
    current_spot: Optional[str] = Field(default=None, description="Current hiding spot")
    found_count: int = Field(default=0, description="Times found")
    time_hidden: int = Field(default=0, description="Time hidden (seconds)")

# Configuration models
class AppConfig(BaseModel):
    """Application configuration"""
    database_url: str = Field(..., description="Database connection URL")
    cors_origins: List[str] = Field(default_factory=list, description="CORS allowed origins")
    jwt_secret: str = Field(..., description="JWT secret key")
    openai_api_key: Optional[str] = Field(default=None, description="OpenAI API key")
    environment: str = Field(default="development", description="Environment")
    log_level: str = Field(default="INFO", description="Logging level")

# Utility models for complex operations
class BulkOperation(BaseModel):
    """Bulk operation request"""
    operation: str = Field(..., description="Operation type")
    items: List[Dict[str, Any]] = Field(..., description="Items to process")
    options: Dict[str, Any] = Field(default_factory=dict, description="Operation options")

class SearchRequest(BaseModel):
    """Search request"""
    query: str = Field(..., min_length=1, description="Search query")
    filters: Dict[str, Any] = Field(default_factory=dict, description="Search filters")
    limit: int = Field(default=20, ge=1, le=100, description="Result limit")
    offset: int = Field(default=0, ge=0, description="Result offset")

class SearchResponse(BaseModel):
    """Search response"""
    results: List[Dict[str, Any]] = Field(..., description="Search results")
    total_count: int = Field(..., description="Total result count")
    query: str = Field(..., description="Original query")
    filters: Dict[str, Any] = Field(..., description="Applied filters")
    execution_time: float = Field(..., description="Query execution time (seconds)")

# Export all models for easy importing
__all__ = [
    # Enums
    "MoodType", "MessageType", "AgeGroup",
    
    # Request models
    "ChatMessage", "FeedingRequest", "TrickRequest", "JokeRequest",
    "GameActionRequest", "UserRegistration", "FeedbackRequest",
    
    # Response models
    "ChatResponse", "DaisyState", "UserProfile", "UserStats",
    "Achievement", "GameSession", "Conversation", "Trick", "Game", "Joke",
    
    # Wrapper models
    "ApiResponse", "ErrorResponse", "HealthResponse",
    
    # Game state models
    "FetchGameState", "MemoryGameState", "HideAndSeekGameState",
    
    # Utility models
    "AppConfig", "BulkOperation", "SearchRequest", "SearchResponse"
]
