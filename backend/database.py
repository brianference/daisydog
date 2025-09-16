"""
Database Manager for DaisyDog
Handles all database operations using Supabase
"""

import os
import asyncio
import logging
from typing import Optional, List, Dict, Any, Union
from datetime import datetime, timedelta
import uuid
import json

from supabase import create_client, Client
from postgrest.exceptions import APIError
import asyncpg

logger = logging.getLogger(__name__)

class DatabaseManager:
    """Manages database operations for DaisyDog"""
    
    def __init__(self):
        self.supabase: Optional[Client] = None
        self.pool: Optional[asyncpg.Pool] = None
        self.connected = False
        
    async def connect(self):
        """Initialize database connections"""
        try:
            # Initialize Supabase client
            supabase_url = os.getenv("SUPABASE_URL")
            supabase_key = os.getenv("SUPABASE_ANON_KEY")
            
            if not supabase_url or not supabase_key:
                raise ValueError("Supabase credentials not found in environment variables")
            
            self.supabase = create_client(supabase_url, supabase_key)
            
            # Initialize direct PostgreSQL connection pool for complex queries
            database_url = os.getenv("DATABASE_URL")
            if database_url:
                self.pool = await asyncpg.create_pool(
                    database_url,
                    min_size=1,
                    max_size=10,
                    command_timeout=60
                )
            
            self.connected = True
            logger.info("Database connections established successfully")
            
        except Exception as e:
            logger.error(f"Failed to connect to database: {e}")
            raise
    
    async def disconnect(self):
        """Close database connections"""
        try:
            if self.pool:
                await self.pool.close()
            self.connected = False
            logger.info("Database connections closed")
        except Exception as e:
            logger.error(f"Error closing database connections: {e}")
    
    async def health_check(self) -> bool:
        """Check database connection health"""
        try:
            if not self.supabase:
                return False
            
            # Simple query to test connection
            result = self.supabase.table("users").select("count").limit(1).execute()
            return True
        except Exception as e:
            logger.error(f"Database health check failed: {e}")
            return False
    
    # User Management
    async def get_or_create_user(self, user_id: str, username: str = None, email: str = None) -> Dict[str, Any]:
        """Get existing user or create new one"""
        try:
            # Try to get existing user
            result = self.supabase.table("users").select("*").eq("id", user_id).execute()
            
            if result.data:
                return result.data[0]
            
            # Create new user
            user_data = {
                "id": user_id,
                "username": username or f"user_{user_id[:8]}",
                "email": email,
                "created_at": datetime.utcnow().isoformat(),
                "last_active": datetime.utcnow().isoformat()
            }
            
            result = self.supabase.table("users").insert(user_data).execute()
            
            # Initialize user data
            await self._initialize_user_data(user_id)
            
            return result.data[0]
            
        except Exception as e:
            logger.error(f"Error getting/creating user {user_id}: {e}")
            raise
    
    async def _initialize_user_data(self, user_id: str):
        """Initialize user stats and Daisy state for new user"""
        try:
            # Initialize user stats
            stats_data = {
                "user_id": user_id,
                "total_conversations": 0,
                "treats_given": 0,
                "tricks_performed": 0,
                "games_played": 0,
                "jokes_heard": 0
            }
            
            self.supabase.table("user_stats").insert(stats_data).execute()
            
            # Initialize Daisy state
            daisy_data = {
                "user_id": user_id,
                "hunger_level": 3,
                "mood": "happy",
                "energy_level": 5,
                "personality_traits": {
                    "playfulness": 8,
                    "friendliness": 10,
                    "mischief": 6,
                    "food_motivation": 9
                }
            }
            
            self.supabase.table("daisy_state").insert(daisy_data).execute()
            
        except Exception as e:
            logger.error(f"Error initializing user data for {user_id}: {e}")
            # Don't raise here as user creation should still succeed
    
    async def get_user_profile(self, user_id: str) -> Dict[str, Any]:
        """Get user profile information"""
        try:
            result = self.supabase.table("users").select("*").eq("id", user_id).execute()
            
            if not result.data:
                raise ValueError(f"User {user_id} not found")
            
            return result.data[0]
            
        except Exception as e:
            logger.error(f"Error getting user profile {user_id}: {e}")
            raise
    
    # Daisy State Management
    async def get_daisy_state(self, user_id: str) -> Dict[str, Any]:
        """Get Daisy's current state for a user"""
        try:
            result = self.supabase.table("daisy_state").select("*").eq("user_id", user_id).execute()
            
            if not result.data:
                # Create default state if not exists
                await self._initialize_user_data(user_id)
                result = self.supabase.table("daisy_state").select("*").eq("user_id", user_id).execute()
            
            return result.data[0] if result.data else {}
            
        except Exception as e:
            logger.error(f"Error getting Daisy state for {user_id}: {e}")
            raise
    
    async def update_daisy_state(self, user_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
        """Update Daisy's state"""
        try:
            updates["updated_at"] = datetime.utcnow().isoformat()
            
            result = self.supabase.table("daisy_state").update(updates).eq("user_id", user_id).execute()
            
            return result.data[0] if result.data else {}
            
        except Exception as e:
            logger.error(f"Error updating Daisy state for {user_id}: {e}")
            raise
    
    # Conversation Management
    async def save_conversation(self, user_id: str, message: str, response: str, 
                              message_type: str = "chat", context: Dict[str, Any] = None) -> str:
        """Save a conversation exchange"""
        try:
            conversation_data = {
                "id": str(uuid.uuid4()),
                "user_id": user_id,
                "message": message,
                "response": response,
                "message_type": message_type,
                "context": context or {},
                "created_at": datetime.utcnow().isoformat()
            }
            
            result = self.supabase.table("conversations").insert(conversation_data).execute()
            
            return result.data[0]["id"] if result.data else ""
            
        except Exception as e:
            logger.error(f"Error saving conversation for {user_id}: {e}")
            raise
    
    async def get_conversations(self, user_id: str, limit: int = 50, offset: int = 0) -> List[Dict[str, Any]]:
        """Get conversation history for a user"""
        try:
            result = (self.supabase.table("conversations")
                     .select("*")
                     .eq("user_id", user_id)
                     .order("created_at", desc=True)
                     .range(offset, offset + limit - 1)
                     .execute())
            
            return result.data or []
            
        except Exception as e:
            logger.error(f"Error getting conversations for {user_id}: {e}")
            raise
    
    # User Statistics
    async def get_user_stats(self, user_id: str) -> Dict[str, Any]:
        """Get user statistics"""
        try:
            result = self.supabase.table("user_stats").select("*").eq("user_id", user_id).execute()
            
            if not result.data:
                # Create default stats if not exists
                await self._initialize_user_data(user_id)
                result = self.supabase.table("user_stats").select("*").eq("user_id", user_id).execute()
            
            return result.data[0] if result.data else {}
            
        except Exception as e:
            logger.error(f"Error getting user stats for {user_id}: {e}")
            raise
    
    # Jokes Management
    async def get_random_joke(self) -> Optional[Dict[str, Any]]:
        """Get a random joke from the database"""
        try:
            # Use PostgreSQL's RANDOM() function for true randomness
            if self.pool:
                async with self.pool.acquire() as conn:
                    result = await conn.fetchrow(
                        "SELECT * FROM jokes WHERE age_appropriate = true ORDER BY RANDOM() LIMIT 1"
                    )
                    if result:
                        return dict(result)
            
            # Fallback to Supabase (less efficient but works)
            result = (self.supabase.table("jokes")
                     .select("*")
                     .eq("age_appropriate", True)
                     .limit(1)
                     .execute())
            
            return result.data[0] if result.data else None
            
        except Exception as e:
            logger.error(f"Error getting random joke: {e}")
            return None
    
    async def increment_joke_usage(self, joke_id: str):
        """Increment usage count for a joke"""
        try:
            self.supabase.rpc("increment_joke_usage", {"joke_id": joke_id}).execute()
        except Exception as e:
            logger.error(f"Error incrementing joke usage for {joke_id}: {e}")
    
    # Tricks Management
    async def get_tricks(self) -> List[Dict[str, Any]]:
        """Get all available tricks"""
        try:
            result = self.supabase.table("tricks").select("*").order("difficulty").execute()
            return result.data or []
            
        except Exception as e:
            logger.error(f"Error getting tricks: {e}")
            raise
    
    # Games Management
    async def get_games(self) -> List[Dict[str, Any]]:
        """Get all available games"""
        try:
            result = self.supabase.table("games").select("*").order("game_name").execute()
            return result.data or []
            
        except Exception as e:
            logger.error(f"Error getting games: {e}")
            raise
    
    # Game Sessions
    async def create_game_session(self, user_id: str, game_type: str, game_data: Dict[str, Any] = None) -> Dict[str, Any]:
        """Create a new game session"""
        try:
            session_data = {
                "id": str(uuid.uuid4()),
                "user_id": user_id,
                "game_type": game_type,
                "score": 0,
                "completed": False,
                "started_at": datetime.utcnow().isoformat(),
                "game_data": game_data or {}
            }
            
            result = self.supabase.table("game_sessions").insert(session_data).execute()
            
            return result.data[0] if result.data else {}
            
        except Exception as e:
            logger.error(f"Error creating game session for {user_id}: {e}")
            raise
    
    async def update_game_session(self, session_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
        """Update a game session"""
        try:
            result = self.supabase.table("game_sessions").update(updates).eq("id", session_id).execute()
            
            return result.data[0] if result.data else {}
            
        except Exception as e:
            logger.error(f"Error updating game session {session_id}: {e}")
            raise
    
    async def get_game_session(self, session_id: str, user_id: str) -> Optional[Dict[str, Any]]:
        """Get a game session"""
        try:
            result = (self.supabase.table("game_sessions")
                     .select("*")
                     .eq("id", session_id)
                     .eq("user_id", user_id)
                     .execute())
            
            return result.data[0] if result.data else None
            
        except Exception as e:
            logger.error(f"Error getting game session {session_id}: {e}")
            raise
    
    # Achievements
    async def add_achievement(self, user_id: str, achievement_type: str, 
                            achievement_name: str, description: str, 
                            metadata: Dict[str, Any] = None) -> str:
        """Add an achievement for a user"""
        try:
            achievement_data = {
                "id": str(uuid.uuid4()),
                "user_id": user_id,
                "achievement_type": achievement_type,
                "achievement_name": achievement_name,
                "description": description,
                "earned_at": datetime.utcnow().isoformat(),
                "metadata": metadata or {}
            }
            
            result = self.supabase.table("user_achievements").insert(achievement_data).execute()
            
            return result.data[0]["id"] if result.data else ""
            
        except Exception as e:
            logger.error(f"Error adding achievement for {user_id}: {e}")
            raise
    
    async def get_user_achievements(self, user_id: str) -> List[Dict[str, Any]]:
        """Get all achievements for a user"""
        try:
            result = (self.supabase.table("user_achievements")
                     .select("*")
                     .eq("user_id", user_id)
                     .order("earned_at", desc=True)
                     .execute())
            
            return result.data or []
            
        except Exception as e:
            logger.error(f"Error getting achievements for {user_id}: {e}")
            raise
    
    # Feedback
    async def save_feedback(self, user_id: str, feedback_type: str, 
                          rating: Optional[int] = None, comment: Optional[str] = None) -> str:
        """Save user feedback"""
        try:
            feedback_data = {
                "id": str(uuid.uuid4()),
                "user_id": user_id,
                "feedback_type": feedback_type,
                "rating": rating,
                "comment": comment,
                "created_at": datetime.utcnow().isoformat()
            }
            
            result = self.supabase.table("feedback").insert(feedback_data).execute()
            
            return result.data[0]["id"] if result.data else ""
            
        except Exception as e:
            logger.error(f"Error saving feedback for {user_id}: {e}")
            raise
    
    # Background Tasks
    async def update_all_daisy_states(self):
        """Update Daisy states for all users (background task)"""
        try:
            # Get all active users
            result = self.supabase.table("users").select("id").eq("is_active", True).execute()
            
            for user in result.data or []:
                await self._update_user_daisy_state(user["id"])
                
        except Exception as e:
            logger.error(f"Error updating all Daisy states: {e}")
    
    async def _update_user_daisy_state(self, user_id: str):
        """Update Daisy state for a single user based on time passage"""
        try:
            state = await self.get_daisy_state(user_id)
            
            if not state:
                return
            
            now = datetime.utcnow()
            last_update = datetime.fromisoformat(state.get("updated_at", now.isoformat()))
            time_diff = (now - last_update).total_seconds()
            
            updates = {}
            
            # Increase hunger over time (every 30 minutes)
            if time_diff > 1800:  # 30 minutes
                hunger_increase = int(time_diff // 1800)
                new_hunger = min(5, state.get("hunger_level", 3) + hunger_increase)
                if new_hunger != state.get("hunger_level"):
                    updates["hunger_level"] = new_hunger
            
            # Restore energy over time (every 15 minutes)
            if time_diff > 900:  # 15 minutes
                energy_increase = int(time_diff // 900)
                new_energy = min(5, state.get("energy_level", 5) + energy_increase)
                if new_energy != state.get("energy_level"):
                    updates["energy_level"] = new_energy
            
            # Update mood based on hunger and energy
            hunger = updates.get("hunger_level", state.get("hunger_level", 3))
            energy = updates.get("energy_level", state.get("energy_level", 5))
            
            if hunger >= 4:
                updates["mood"] = "hungry"
            elif energy <= 2:
                updates["mood"] = "sleepy"
            elif energy >= 4 and hunger <= 2:
                updates["mood"] = "playful"
            else:
                updates["mood"] = "happy"
            
            if updates:
                await self.update_daisy_state(user_id, updates)
                
        except Exception as e:
            logger.error(f"Error updating Daisy state for {user_id}: {e}")
    
    # Analytics and Reporting
    async def get_user_dashboard_data(self, user_id: str) -> Dict[str, Any]:
        """Get comprehensive dashboard data for a user"""
        try:
            if self.pool:
                async with self.pool.acquire() as conn:
                    result = await conn.fetchrow(
                        "SELECT * FROM user_dashboard WHERE id = $1",
                        user_id
                    )
                    if result:
                        return dict(result)
            
            # Fallback: get data separately
            profile = await self.get_user_profile(user_id)
            stats = await self.get_user_stats(user_id)
            daisy_state = await self.get_daisy_state(user_id)
            
            return {
                **profile,
                **stats,
                **daisy_state
            }
            
        except Exception as e:
            logger.error(f"Error getting dashboard data for {user_id}: {e}")
            raise
