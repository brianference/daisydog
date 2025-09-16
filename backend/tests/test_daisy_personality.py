"""
Unit tests for Daisy Personality Engine
Tests all personality features, responses, and behaviors
"""

import pytest
import asyncio
from unittest.mock import Mock, patch
from datetime import datetime

from daisy_personality import DaisyPersonality


class TestDaisyPersonality:
    """Test suite for DaisyPersonality class"""
    
    @pytest.fixture
    def personality(self):
        """Create DaisyPersonality instance for testing"""
        return DaisyPersonality()
    
    @pytest.fixture
    def sample_daisy_state(self):
        """Sample Daisy state for testing"""
        return {
            "user_id": "test-user",
            "hunger_level": 3,
            "mood": "happy",
            "energy_level": 5,
            "last_fed": None,
            "last_played": None,
            "personality_traits": {
                "playfulness": 8,
                "friendliness": 10,
                "mischief": 6,
                "food_motivation": 9
            },
            "updated_at": datetime.utcnow().isoformat()
        }
    
    # Test Response Generation
    @pytest.mark.asyncio
    async def test_greeting_response(self, personality, sample_daisy_state):
        """Test greeting message responses"""
        greetings = ["hello", "hi", "hey", "woof", "bark"]
        
        for greeting in greetings:
            response = await personality.generate_response(greeting, sample_daisy_state)
            
            assert response["message_type"] == "greeting"
            assert response["mood"] == "excited"
            assert "woof" in response["response"].lower() or "bark" in response["response"].lower()
            assert "daisy" in response["response"].lower()
    
    @pytest.mark.asyncio
    async def test_food_related_responses(self, personality, sample_daisy_state):
        """Test food-related keyword responses"""
        food_keywords = ["food", "treat", "hungry", "eat", "feed", "snack"]
        
        for keyword in food_keywords:
            response = await personality.generate_response(f"I want to give you {keyword}", sample_daisy_state)
            
            assert "food" in response["response"].lower() or "treat" in response["response"].lower()
            assert "suggested_actions" in response
            assert any("feed" in action.lower() or "treat" in action.lower() 
                      for action in response["suggested_actions"])
    
    @pytest.mark.asyncio
    async def test_play_related_responses(self, personality, sample_daisy_state):
        """Test play-related keyword responses"""
        play_keywords = ["play", "game", "fun", "toy", "ball", "fetch"]
        
        for keyword in play_keywords:
            response = await personality.generate_response(f"Let's {keyword}", sample_daisy_state)
            
            assert ("play" in response["response"].lower() or 
                   "game" in response["response"].lower() or
                   "fun" in response["response"].lower())
    
    @pytest.mark.asyncio
    async def test_trick_related_responses(self, personality, sample_daisy_state):
        """Test trick-related keyword responses"""
        trick_keywords = ["trick", "sit", "stay", "roll", "spin", "dance"]
        
        for keyword in trick_keywords:
            response = await personality.generate_response(f"Do a {keyword}", sample_daisy_state)
            
            assert "trick" in response["response"].lower()
            assert "suggested_actions" in response
    
    @pytest.mark.asyncio
    async def test_joke_related_responses(self, personality, sample_daisy_state):
        """Test joke-related keyword responses"""
        joke_keywords = ["joke", "funny", "laugh", "humor"]
        
        for keyword in joke_keywords:
            response = await personality.generate_response(f"Tell me something {keyword}", sample_daisy_state)
            
            assert "joke" in response["response"].lower()
            assert "suggested_actions" in response
    
    @pytest.mark.asyncio
    async def test_compliment_responses(self, personality, sample_daisy_state):
        """Test responses to compliments"""
        compliments = ["good girl", "smart", "cute", "adorable", "sweet", "nice"]
        
        for compliment in compliments:
            response = await personality.generate_response(f"You're so {compliment}", sample_daisy_state)
            
            assert response["mood"] == "happy"
            assert ("thank you" in response["response"].lower() or 
                   "good girl" in response["response"].lower())
    
    @pytest.mark.asyncio
    async def test_question_handling(self, personality, sample_daisy_state):
        """Test handling of questions about Daisy"""
        questions = [
            "who are you",
            "what's your name", 
            "how old are you",
            "what do you like",
            "where do you live"
        ]
        
        for question in questions:
            response = await personality.generate_response(question, sample_daisy_state)
            
            assert response["message_type"] == "chat"
            assert len(response["response"]) > 0
    
    @pytest.mark.asyncio
    async def test_sad_message_handling(self, personality, sample_daisy_state):
        """Test responses to sad or negative messages"""
        sad_messages = ["I'm sad", "I feel bad", "I'm angry", "I'm upset"]
        
        for message in sad_messages:
            response = await personality.generate_response(message, sample_daisy_state)
            
            assert "okay" in response["response"].lower() or "sad" in response["response"].lower()
            assert response["mood"] == "concerned"
    
    # Test Mood Influence
    @pytest.mark.asyncio
    async def test_hungry_mood_influence(self, personality, sample_daisy_state):
        """Test how hunger affects responses"""
        sample_daisy_state["hunger_level"] = 5
        sample_daisy_state["mood"] = "hungry"
        
        response = await personality.generate_response("Hello Daisy", sample_daisy_state)
        
        # Should mention hunger in some way
        assert ("hungry" in response["response"].lower() or 
               "food" in response["response"].lower() or
               "stomach" in response["response"].lower())
    
    @pytest.mark.asyncio
    async def test_sleepy_mood_influence(self, personality, sample_daisy_state):
        """Test how low energy affects responses"""
        sample_daisy_state["energy_level"] = 1
        sample_daisy_state["mood"] = "sleepy"
        
        response = await personality.generate_response("Hello Daisy", sample_daisy_state)
        
        # Should mention tiredness
        assert ("tired" in response["response"].lower() or 
               "sleepy" in response["response"].lower() or
               "yawn" in response["response"].lower())
    
    @pytest.mark.asyncio
    async def test_excited_mood_responses(self, personality, sample_daisy_state):
        """Test excited mood responses"""
        sample_daisy_state["mood"] = "excited"
        sample_daisy_state["energy_level"] = 5
        
        response = await personality.generate_response("Hi Daisy!", sample_daisy_state)
        
        # Should show excitement
        assert ("!" in response["response"] or 
               "WOOF" in response["response"] or
               "excited" in response["response"].lower())
    
    # Test Feeding Functionality
    @pytest.mark.asyncio
    async def test_feeding_bone(self, personality, sample_daisy_state):
        """Test feeding bone response"""
        response = await personality.handle_feeding("bone", sample_daisy_state)
        
        assert response["message_type"] == "feeding"
        assert response["mood"] == "happy"
        assert "bone" in response["response"].lower()
        assert "state_updates" in response
        assert response["state_updates"]["hunger_level"] == 2  # 3 - 1
    
    @pytest.mark.asyncio
    async def test_feeding_bacon(self, personality, sample_daisy_state):
        """Test feeding bacon response (should be very excited)"""
        response = await personality.handle_feeding("bacon", sample_daisy_state)
        
        assert response["message_type"] == "feeding"
        assert "bacon" in response["response"].lower()
        assert ("!" in response["response"] or 
               "WOOF" in response["response"] or
               "love" in response["response"].lower())
    
    @pytest.mark.asyncio
    async def test_feeding_unknown_treat(self, personality, sample_daisy_state):
        """Test feeding unknown treat type"""
        response = await personality.handle_feeding("pizza", sample_daisy_state)
        
        assert response["message_type"] == "feeding"
        assert "pizza" in response["response"].lower()
        assert "sniff" in response["response"].lower()
    
    # Test Trick Performance
    @pytest.mark.asyncio
    async def test_perform_sit_trick(self, personality, sample_daisy_state):
        """Test sit trick performance"""
        trick = {
            "trick_name": "sit",
            "trick_description": "Daisy sits down",
            "difficulty": 1,
            "energy_cost": 1
        }
        
        response = await personality.perform_trick(trick, sample_daisy_state)
        
        assert response["message_type"] == "trick"
        assert response["success"] is True
        assert response["trick_name"] == "sit"
        assert "sit" in response["response"].lower()
    
    @pytest.mark.asyncio
    async def test_perform_unknown_trick(self, personality, sample_daisy_state):
        """Test unknown trick performance"""
        trick = {
            "trick_name": "backflip",
            "trick_description": "Daisy does a backflip",
            "difficulty": 5,
            "energy_cost": 3
        }
        
        response = await personality.perform_trick(trick, sample_daisy_state)
        
        assert response["message_type"] == "trick"
        assert "backflip" in response["response"].lower()
        assert "learning" in response["response"].lower()
    
    # Test Joke Telling
    @pytest.mark.asyncio
    async def test_tell_joke(self, personality, sample_daisy_state):
        """Test joke telling functionality"""
        joke = {
            "id": "test-joke-1",
            "joke_text": "Why don't dogs make good DJs? Because they have ruff beats!",
            "category": "puns"
        }
        
        response = await personality.tell_joke(joke)
        
        assert response["message_type"] == "joke"
        assert response["mood"] == "excited"
        assert joke["joke_text"] in response["response"]
        assert ("woof" in response["response"].lower() or 
               "bark" in response["response"].lower())
    
    # Test Suggested Actions
    @pytest.mark.asyncio
    async def test_suggested_actions_hungry_state(self, personality, sample_daisy_state):
        """Test suggested actions when Daisy is hungry"""
        sample_daisy_state["hunger_level"] = 4
        
        response = await personality.generate_response("Hello", sample_daisy_state)
        
        suggested_actions = response.get("suggested_actions", [])
        assert any("feed" in action.lower() or "treat" in action.lower() 
                  for action in suggested_actions)
    
    @pytest.mark.asyncio
    async def test_suggested_actions_high_energy(self, personality, sample_daisy_state):
        """Test suggested actions when Daisy has high energy"""
        sample_daisy_state["energy_level"] = 5
        sample_daisy_state["mood"] = "playful"
        
        response = await personality.generate_response("Hello", sample_daisy_state)
        
        suggested_actions = response.get("suggested_actions", [])
        assert any("play" in action.lower() or "game" in action.lower() or "trick" in action.lower()
                  for action in suggested_actions)
    
    # Test Error Handling
    @pytest.mark.asyncio
    async def test_empty_message_handling(self, personality, sample_daisy_state):
        """Test handling of empty messages"""
        response = await personality.generate_response("", sample_daisy_state)
        
        assert response["message_type"] == "chat"
        assert len(response["response"]) > 0
        assert response["mood"] == "happy"
    
    @pytest.mark.asyncio
    async def test_very_long_message_handling(self, personality, sample_daisy_state):
        """Test handling of very long messages"""
        long_message = "hello " * 100  # 600 characters
        
        response = await personality.generate_response(long_message, sample_daisy_state)
        
        assert response["message_type"] == "greeting"  # Should detect "hello"
        assert len(response["response"]) > 0
    
    @pytest.mark.asyncio
    async def test_special_characters_handling(self, personality, sample_daisy_state):
        """Test handling of messages with special characters"""
        special_messages = [
            "hello!!! 🐕🎾💕",
            "Hi Daisy!!! ❤️❤️❤️",
            "woof woof!!! 🐶",
            "!!!@#$%^&*()"
        ]
        
        for message in special_messages:
            response = await personality.generate_response(message, sample_daisy_state)
            
            assert len(response["response"]) > 0
            assert response["message_type"] in ["greeting", "chat"]
    
    # Test Victoria-specific Scenarios
    @pytest.mark.asyncio
    async def test_victoria_dance_message(self, personality, sample_daisy_state):
        """Test Victoria's dance-related messages"""
        dance_messages = [
            "I just learned a new dance move! 💃",
            "I love to dance!",
            "Do you like dancing?",
            "I'm teaching my dog to dance with me!"
        ]
        
        for message in dance_messages:
            response = await personality.generate_response(message, sample_daisy_state)
            
            assert len(response["response"]) > 0
            # Should show interest or enthusiasm
            assert ("!" in response["response"] or 
                   "woof" in response["response"].lower() or
                   "love" in response["response"].lower())
    
    @pytest.mark.asyncio
    async def test_victoria_horse_message(self, personality, sample_daisy_state):
        """Test Victoria's horse-related messages"""
        horse_messages = [
            "Do you like horses? I rode Buttercup today!",
            "I love horses!",
            "I want to own a horse someday",
            "Horses are so beautiful!"
        ]
        
        for message in horse_messages:
            response = await personality.generate_response(message, sample_daisy_state)
            
            assert len(response["response"]) > 0
            # Should show curiosity or interest
            assert len(response["response"]) > 10  # Substantial response
    
    @pytest.mark.asyncio
    async def test_victoria_typing_style(self, personality, sample_daisy_state):
        """Test Victoria's typical typing patterns"""
        victoria_messages = [
            "Hi Daisy!!!",
            "WANNA PLAY A GAME?!",
            "ur so cute!",
            "can u do trix?",
            "tell me a funy joke! 😂"
        ]
        
        for message in victoria_messages:
            response = await personality.generate_response(message, sample_daisy_state)
            
            assert len(response["response"]) > 0
            assert response["message_type"] in ["greeting", "chat"]
    
    # Test Boundary Conditions
    @pytest.mark.asyncio
    async def test_extreme_hunger_level(self, personality, sample_daisy_state):
        """Test behavior with extreme hunger levels"""
        sample_daisy_state["hunger_level"] = 5  # Maximum hunger
        
        response = await personality.generate_response("Hello", sample_daisy_state)
        
        # Should strongly indicate hunger
        assert ("hungry" in response["response"].lower() or 
               "food" in response["response"].lower() or
               "eat" in response["response"].lower())
    
    @pytest.mark.asyncio
    async def test_zero_energy_level(self, personality, sample_daisy_state):
        """Test behavior with zero energy"""
        sample_daisy_state["energy_level"] = 0
        sample_daisy_state["mood"] = "sleepy"
        
        response = await personality.generate_response("Let's play!", sample_daisy_state)
        
        # Should indicate tiredness
        assert ("tired" in response["response"].lower() or 
               "sleepy" in response["response"].lower() or
               "rest" in response["response"].lower())
    
    # Test Personality Consistency
    @pytest.mark.asyncio
    async def test_personality_consistency(self, personality, sample_daisy_state):
        """Test that personality remains consistent across interactions"""
        messages = ["Hello", "Hi there", "Hey Daisy"]
        responses = []
        
        for message in messages:
            response = await personality.generate_response(message, sample_daisy_state)
            responses.append(response)
        
        # All should be greetings with similar enthusiasm
        for response in responses:
            assert response["message_type"] == "greeting"
            assert response["mood"] == "excited"
            assert ("woof" in response["response"].lower() or 
                   "bark" in response["response"].lower() or
                   "daisy" in response["response"].lower())
    
    @pytest.mark.asyncio
    async def test_context_awareness(self, personality, sample_daisy_state):
        """Test that Daisy maintains context awareness"""
        # Test with context from previous interaction
        context = {"last_topic": "feeding", "user_name": "Victoria"}
        
        response = await personality.generate_response("Hello again!", sample_daisy_state, context)
        
        assert len(response["response"]) > 0
        assert response["message_type"] in ["greeting", "chat"]
    
    # Performance Tests
    @pytest.mark.asyncio
    async def test_response_generation_performance(self, personality, sample_daisy_state):
        """Test response generation performance"""
        import time
        
        start_time = time.time()
        
        # Generate 10 responses
        for i in range(10):
            await personality.generate_response(f"Hello {i}", sample_daisy_state)
        
        end_time = time.time()
        avg_time = (end_time - start_time) / 10
        
        # Should be fast (less than 100ms per response)
        assert avg_time < 0.1, f"Average response time {avg_time:.3f}s is too slow"
    
    # Edge Cases for Victoria's Age Group
    @pytest.mark.asyncio
    async def test_age_appropriate_responses(self, personality, sample_daisy_state):
        """Test that all responses are age-appropriate for 8-year-olds"""
        test_messages = [
            "Tell me about yourself",
            "What do you do all day?",
            "Do you have friends?",
            "What's your favorite food?",
            "Are you real?"
        ]
        
        for message in test_messages:
            response = await personality.generate_response(message, sample_daisy_state)
            
            # Check for age-appropriate vocabulary and concepts
            response_text = response["response"].lower()
            
            # Should not contain complex words or concepts
            complex_words = ["sophisticated", "algorithm", "artificial", "programming"]
            for word in complex_words:
                assert word not in response_text, f"Response contains complex word: {word}"
            
            # Should contain dog-like expressions
            dog_expressions = ["woof", "bark", "tail", "paw", "puppy"]
            assert any(expr in response_text for expr in dog_expressions), \
                "Response should contain dog-like expressions"
