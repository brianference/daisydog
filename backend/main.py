"""
DaisyDog Backend API
Main FastAPI application for the DaisyDog chatbot
"""

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv
import logging
from datetime import datetime, timedelta
import uuid
from typing import Optional, List, Dict, Any
import asyncio

# Import our modules
from models import (
    ChatMessage, ChatResponse, UserProfile, DaisyState, 
    GameSession, TrickRequest, FeedingRequest, JokeRequest,
    UserStats, Achievement
)
from database import DatabaseManager
from daisy_personality import DaisyPersonality
from game_engine import GameEngine

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global variables
db_manager = None
daisy_personality = None
game_engine = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    global db_manager, daisy_personality, game_engine
    
    # Startup
    logger.info("Starting DaisyDog API...")
    
    # Initialize database connection
    db_manager = DatabaseManager()
    await db_manager.connect()
    
    # Initialize Daisy personality engine
    daisy_personality = DaisyPersonality()
    
    # Initialize game engine
    game_engine = GameEngine(db_manager)
    
    logger.info("DaisyDog API started successfully!")
    
    yield
    
    # Shutdown
    logger.info("Shutting down DaisyDog API...")
    if db_manager:
        await db_manager.disconnect()

# Create FastAPI app
app = FastAPI(
    title="DaisyDog API",
    description="Backend API for DaisyDog - An AI chatbot dog for kids",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:5173").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to get database manager
async def get_db():
    return db_manager

# Dependency to get current user (simplified for demo)
async def get_current_user(user_id: str = "demo-user") -> str:
    """Get current user ID - simplified for demo purposes"""
    return user_id

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "Woof! DaisyDog API is running!",
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/health")
async def health_check():
    """Detailed health check"""
    try:
        # Check database connection
        db_status = await db_manager.health_check() if db_manager else False
        
        return {
            "status": "healthy" if db_status else "unhealthy",
            "database": "connected" if db_status else "disconnected",
            "timestamp": datetime.utcnow().isoformat(),
            "version": "1.0.0"
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={"status": "unhealthy", "error": str(e)}
        )

@app.post("/api/chat", response_model=ChatResponse)
async def chat_with_daisy(
    message: ChatMessage,
    user_id: str = Depends(get_current_user),
    db: DatabaseManager = Depends(get_db)
):
    """Main chat endpoint for talking with Daisy"""
    try:
        # Get user's Daisy state
        daisy_state = await db.get_daisy_state(user_id)
        
        # Generate response using Daisy personality
        response_data = await daisy_personality.generate_response(
            message.message,
            daisy_state,
            message.context or {}
        )
        
        # Save conversation to database
        await db.save_conversation(
            user_id=user_id,
            message=message.message,
            response=response_data["response"],
            message_type=response_data.get("message_type", "chat"),
            context=response_data.get("context", {})
        )
        
        # Update Daisy's state if needed
        if "state_updates" in response_data:
            await db.update_daisy_state(user_id, response_data["state_updates"])
        
        return ChatResponse(
            response=response_data["response"],
            mood=response_data.get("mood", daisy_state.get("mood", "happy")),
            hunger_level=response_data.get("hunger_level", daisy_state.get("hunger_level", 3)),
            energy_level=response_data.get("energy_level", daisy_state.get("energy_level", 5)),
            context=response_data.get("context", {}),
            suggested_actions=response_data.get("suggested_actions", [])
        )
        
    except Exception as e:
        logger.error(f"Chat error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Woof! Something went wrong. Please try again!"
        )

@app.post("/api/feed")
async def feed_daisy(
    feeding: FeedingRequest,
    user_id: str = Depends(get_current_user),
    db: DatabaseManager = Depends(get_db)
):
    """Feed Daisy treats"""
    try:
        # Get current state
        daisy_state = await db.get_daisy_state(user_id)
        
        # Process feeding
        response_data = await daisy_personality.handle_feeding(
            feeding.treat_type,
            daisy_state
        )
        
        # Update state
        await db.update_daisy_state(user_id, {
            "hunger_level": max(0, daisy_state.get("hunger_level", 3) - 1),
            "mood": "happy",
            "last_fed": datetime.utcnow().isoformat()
        })
        
        # Save feeding interaction
        await db.save_conversation(
            user_id=user_id,
            message=f"Fed Daisy a {feeding.treat_type}",
            response=response_data["response"],
            message_type="feeding",
            context={"treat_type": feeding.treat_type}
        )
        
        return response_data
        
    except Exception as e:
        logger.error(f"Feeding error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Woof! Couldn't eat the treat right now!"
        )

@app.post("/api/trick")
async def perform_trick(
    trick_request: TrickRequest,
    user_id: str = Depends(get_current_user),
    db: DatabaseManager = Depends(get_db)
):
    """Make Daisy perform a trick"""
    try:
        # Get available tricks
        tricks = await db.get_tricks()
        trick = next((t for t in tricks if t["trick_name"].lower() == trick_request.trick_name.lower()), None)
        
        if not trick:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Woof! I don't know that trick yet!"
            )
        
        # Get current state
        daisy_state = await db.get_daisy_state(user_id)
        
        # Check if Daisy has enough energy
        if daisy_state.get("energy_level", 5) < trick["energy_cost"]:
            return {
                "response": "Woof woof! I'm too tired to do tricks right now. Maybe after a nap or some food?",
                "success": False,
                "energy_needed": trick["energy_cost"]
            }
        
        # Perform trick
        response_data = await daisy_personality.perform_trick(trick, daisy_state)
        
        # Update energy
        new_energy = max(0, daisy_state.get("energy_level", 5) - trick["energy_cost"])
        await db.update_daisy_state(user_id, {"energy_level": new_energy})
        
        # Save trick interaction
        await db.save_conversation(
            user_id=user_id,
            message=f"Asked Daisy to {trick_request.trick_name}",
            response=response_data["response"],
            message_type="trick",
            context={"trick_name": trick_request.trick_name}
        )
        
        return response_data
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Trick error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Woof! Couldn't perform that trick right now!"
        )

@app.get("/api/joke")
async def get_joke(
    user_id: str = Depends(get_current_user),
    db: DatabaseManager = Depends(get_db)
):
    """Get a random dog joke from Daisy"""
    try:
        # Get a random joke
        joke = await db.get_random_joke()
        
        if not joke:
            return {
                "response": "Woof! I can't think of any jokes right now. My brain is a bit ruff today!",
                "joke": None
            }
        
        # Generate Daisy's response with the joke
        response_data = await daisy_personality.tell_joke(joke)
        
        # Save joke interaction
        await db.save_conversation(
            user_id=user_id,
            message="Tell me a joke",
            response=response_data["response"],
            message_type="joke",
            context={"joke_id": joke["id"]}
        )
        
        return response_data
        
    except Exception as e:
        logger.error(f"Joke error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Woof! My joke book is buried somewhere!"
        )

@app.get("/api/games", response_model=List[Dict[str, Any]])
async def get_available_games(db: DatabaseManager = Depends(get_db)):
    """Get list of available games"""
    try:
        games = await db.get_games()
        return games
    except Exception as e:
        logger.error(f"Games error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Woof! Can't fetch games right now!"
        )

@app.post("/api/games/{game_name}/start")
async def start_game(
    game_name: str,
    user_id: str = Depends(get_current_user),
    db: DatabaseManager = Depends(get_db)
):
    """Start a new game session"""
    try:
        # Get game info
        games = await db.get_games()
        game = next((g for g in games if g["game_name"].lower() == game_name.lower()), None)
        
        if not game:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Woof! I don't know that game!"
            )
        
        # Start game session
        session = await game_engine.start_game(user_id, game_name, game)
        
        return {
            "session_id": session["id"],
            "game_name": game_name,
            "message": f"Woof woof! Let's play {game_name}! {game['game_description']}",
            "game_state": session["game_data"],
            "instructions": game.get("game_rules", {})
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Start game error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Woof! Couldn't start the game!"
        )

@app.post("/api/games/{session_id}/action")
async def game_action(
    session_id: str,
    action: Dict[str, Any],
    user_id: str = Depends(get_current_user),
    db: DatabaseManager = Depends(get_db)
):
    """Perform an action in a game"""
    try:
        result = await game_engine.process_action(session_id, user_id, action)
        return result
    except Exception as e:
        logger.error(f"Game action error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Woof! Something went wrong with the game!"
        )

@app.get("/api/user/profile", response_model=UserProfile)
async def get_user_profile(
    user_id: str = Depends(get_current_user),
    db: DatabaseManager = Depends(get_db)
):
    """Get user profile and stats"""
    try:
        profile = await db.get_user_profile(user_id)
        return profile
    except Exception as e:
        logger.error(f"Profile error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Woof! Couldn't fetch your profile!"
        )

@app.get("/api/user/stats", response_model=UserStats)
async def get_user_stats(
    user_id: str = Depends(get_current_user),
    db: DatabaseManager = Depends(get_db)
):
    """Get user statistics"""
    try:
        stats = await db.get_user_stats(user_id)
        return stats
    except Exception as e:
        logger.error(f"Stats error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Woof! Couldn't fetch your stats!"
        )

@app.get("/api/daisy/state", response_model=DaisyState)
async def get_daisy_state(
    user_id: str = Depends(get_current_user),
    db: DatabaseManager = Depends(get_db)
):
    """Get Daisy's current state"""
    try:
        state = await db.get_daisy_state(user_id)
        return DaisyState(**state)
    except Exception as e:
        logger.error(f"Daisy state error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Woof! Can't check how I'm feeling right now!"
        )

@app.get("/api/conversations/history")
async def get_conversation_history(
    limit: int = 50,
    offset: int = 0,
    user_id: str = Depends(get_current_user),
    db: DatabaseManager = Depends(get_db)
):
    """Get conversation history"""
    try:
        conversations = await db.get_conversations(user_id, limit, offset)
        return {"conversations": conversations}
    except Exception as e:
        logger.error(f"Conversation history error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Woof! Can't remember our conversations right now!"
        )

@app.get("/api/tricks", response_model=List[Dict[str, Any]])
async def get_available_tricks(db: DatabaseManager = Depends(get_db)):
    """Get list of available tricks"""
    try:
        tricks = await db.get_tricks()
        return tricks
    except Exception as e:
        logger.error(f"Tricks error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Woof! Can't remember my tricks right now!"
        )

# Background task to update Daisy's state periodically
@app.on_event("startup")
async def start_background_tasks():
    """Start background tasks"""
    asyncio.create_task(update_daisy_states_periodically())

async def update_daisy_states_periodically():
    """Update Daisy states for all users periodically"""
    while True:
        try:
            await asyncio.sleep(300)  # Run every 5 minutes
            if db_manager:
                await db_manager.update_all_daisy_states()
        except Exception as e:
            logger.error(f"Background task error: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        reload=os.getenv("ENVIRONMENT") == "development"
    )
