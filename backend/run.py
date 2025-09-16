#!/usr/bin/env python3
"""
DaisyDog Backend Startup Script
Simple script to run the FastAPI server
"""

import uvicorn
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

if __name__ == "__main__":
    # Configuration
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))
    environment = os.getenv("ENVIRONMENT", "development")
    
    print("🐕 Starting DaisyDog Backend API...")
    print(f"Environment: {environment}")
    print(f"Host: {host}")
    print(f"Port: {port}")
    print("Woof woof! 🎾")
    
    # Run the server
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=environment == "development",
        log_level="info"
    )
