"""
Daisy Personality Engine
Handles Daisy's personality, responses, and behaviors
"""

import random
import re
from typing import Dict, Any, List, Optional
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class DaisyPersonality:
    """Manages Daisy's personality and response generation"""
    
    def __init__(self):
        self.personality_traits = {
            "playfulness": 8,
            "friendliness": 10,
            "mischief": 6,
            "food_motivation": 9,
            "energy": 5,
            "curiosity": 7
        }
        
        # Initialize response templates and behaviors
        self._init_response_templates()
        self._init_mood_responses()
        self._init_activity_responses()
        
    def _init_response_templates(self):
        """Initialize response templates for different situations"""
        
        self.greetings = [
            "Woof woof! Hi there! I'm Daisy! 🐕",
            "Bark bark! Oh boy, a new friend! I'm so excited! 🎾",
            "*tail wagging intensifies* Hello! I'm Daisy and I LOVE making new friends! 🐾",
            "Woof! Hi! I'm a good girl named Daisy! Want to play? 🦴",
            "*bounces excitedly* Woof woof! I'm Daisy! Do you have any treats? 🍖"
        ]
        
        self.general_responses = [
            "Woof! That sounds interesting! Tell me more! 🐕",
            "*tilts head curiously* I don't understand everything, but I'm listening! 👂",
            "Bark bark! I love talking with you! 🎾",
            "*wags tail* You're so nice to talk to! 🐾",
            "Woof woof! I wish I could give you puppy kisses! 💕"
        ]
        
        self.confused_responses = [
            "Woof? I'm a bit confused, but that's okay! I'm just a dog! 🤔",
            "*tilts head* I don't quite understand, but I still like you! 🐕",
            "Bark? That's a big word for a little dog like me! 🐾",
            "Woof woof! My doggy brain is trying to understand! 🧠",
            "*spins in circle* Sometimes I get confused, but I'm still happy! 😵‍💫"
        ]
        
        self.excited_responses = [
            "WOOF WOOF WOOF! I'M SO EXCITED! 🎉",
            "*bounces everywhere* This is the BEST DAY EVER! 🎾",
            "Bark bark bark! I can't contain my excitement! 🐕",
            "*zoomies around the room* WOOOOOF! 💨",
            "OH BOY OH BOY OH BOY! *tail wagging at maximum speed* 🌪️"
        ]
        
    def _init_mood_responses(self):
        """Initialize mood-specific response patterns"""
        
        self.mood_responses = {
            "happy": [
                "Woof! I'm feeling great today! 😊",
                "*tail wagging* Life is good when you're a dog! 🐕",
                "Bark bark! Everything is pawsome! 🐾",
                "*happy panting* I love being a good girl! 💕"
            ],
            "excited": [
                "WOOF WOOF! I'M SO PUMPED UP! ⚡",
                "*bouncing intensifies* I have SO much energy! 🎾",
                "Bark bark bark! Let's do ALL the things! 🎉",
                "*zoomies* I can't sit still! Too excited! 💨"
            ],
            "hungry": [
                "*stomach growls* Woof... I'm getting pretty hungry... 🍖",
                "Bark bark! Do you have any treats? Please? 🥺",
                "*puppy dog eyes* I haven't eaten in like... forever! (5 minutes) 🦴",
                "Woof! My tummy is making funny noises! Feed me? 🍗"
            ],
            "sleepy": [
                "*yawns* Woof... I'm getting a bit sleepy... 😴",
                "Bark... *stretches* Maybe it's nap time soon... 🛏️",
                "*slow tail wag* I'm feeling a bit drowsy... 💤",
                "Woof woof... *lies down* Just resting my eyes... 😌"
            ],
            "playful": [
                "Woof woof! Want to play? I know lots of games! 🎾",
                "*play bow* Come on! Let's have some fun! 🎮",
                "Bark bark! I'm ready for anything! Let's go! 🏃‍♀️",
                "*brings imaginary toy* Look what I found! Wanna play? 🧸"
            ]
        }
        
    def _init_activity_responses(self):
        """Initialize activity-specific responses"""
        
        self.feeding_responses = {
            "bone": [
                "WOOF WOOF! A BONE! *grabs it excitedly* This is the best day ever! 🦴",
                "*happy chomping sounds* Mmm! I love bones! Thank you! 😋",
                "Bark bark! *carefully takes bone* I'm gonna bury this... or eat it now! 🤔"
            ],
            "biscuit": [
                "*crunch crunch* Woof! These biscuits are delicious! 🍪",
                "Bark bark! *sits like a good girl* Thank you for the treat! 😊",
                "*tail wagging* More biscuits please? I'm still a good girl! 🐕"
            ],
            "bacon": [
                "BACON?! WOOF WOOF WOOF! *does happy dance* 🥓",
                "*drools a little* This is the most amazing thing ever! 🤤",
                "Bark bark! *gobbles up bacon* I LOVE YOU SO MUCH! 💕"
            ],
            "chicken": [
                "*sniff sniff* Mmm! Chicken! *carefully takes it* 🍗",
                "Woof! This smells amazing! *happy eating sounds* 😋",
                "Bark bark! *licks lips* That was delicious! More? 🐕"
            ],
            "cheese": [
                "*tilts head* Cheese? *sniff* Oh wow, this is good! 🧀",
                "Woof woof! *carefully nibbles* I didn't know cheese was so tasty! 😮",
                "Bark! *happy tail wag* This is a new favorite! 💛"
            ],
            "apple": [
                "*crunch* Woof! This is... healthy! But still yummy! 🍎",
                "Bark bark! *munches apple* I'm being such a healthy dog! 🌱",
                "*surprised* This fruit thing is actually pretty good! 😊"
            ],
            "carrot": [
                "*crunch crunch* Woof! Carrots are like... orange sticks! 🥕",
                "Bark! *chews thoughtfully* This is good for my teeth! 🦷",
                "*happy munching* I'm a healthy puppy! 💪"
            ]
        }
        
        self.trick_responses = {
            "sit": [
                "*sits perfectly* Woof! Look at me being such a good girl! 🐕",
                "Bark bark! *sits with tail wagging* Am I doing it right? 😊",
                "*sits proudly* Woof! I'm the best sitter in the whole world! 🏆"
            ],
            "stay": [
                "*stays very still but tail still wagging* Woof... staying... this is hard! 😅",
                "Bark! *trembling with excitement but staying* I'm staying! Look at me! 🎯",
                "*stays put* Woof woof! I'm being so patient! Treat now? 🦴"
            ],
            "roll over": [
                "*rolls over showing belly* Woof woof! Belly rubs now? 🤸‍♀️",
                "Bark bark! *rolls dramatically* Ta-da! I'm upside down! 🙃",
                "*rolls over* Woof! This is my favorite trick! I'm so talented! ⭐"
            ],
            "play dead": [
                "*flops dramatically* Woof... I'm... so... dead... *peeks with one eye* 💀",
                "Bark! *lies still* I'm totally dead! Don't mind the tail wagging... 😵",
                "*plays dead but can't stop wiggling* Woof... being dead is hard! 👻"
            ],
            "spin": [
                "*spins in happy circles* Woof woof! Wheee! I'm dizzy now! 🌪️",
                "Bark bark! *spins* Look at me go! I'm a spinning doggy! 💫",
                "*spins enthusiastically* Woof! This is like zoomies but in circles! 🌀"
            ],
            "high five": [
                "*raises paw* Woof! High five! *paw slap* We did it! 🐾",
                "Bark bark! *enthusiastic paw raise* Best high five ever! ✋",
                "*gives high five* Woof woof! I love giving high fives! 🙌"
            ],
            "bow": [
                "*does play bow* Woof woof! This means I want to play! 🙇‍♀️",
                "Bark! *bows gracefully* I'm such a polite doggy! 👑",
                "*playful bow* Woof! This is how dogs say hello! 🎭"
            ],
            "dance": [
                "*stands on hind legs and wiggles* Woof woof! I'm dancing! 💃",
                "Bark bark! *awkward dancing* I'm not very good at this but it's fun! 🕺",
                "*dances enthusiastically* Woof! Look at my moves! I'm a dancing dog! 🎵"
            ]
        }
        
    async def generate_response(self, message: str, daisy_state: Dict[str, Any], context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Generate Daisy's response to a user message"""
        
        try:
            message_lower = message.lower().strip()
            current_mood = daisy_state.get("mood", "happy")
            hunger_level = daisy_state.get("hunger_level", 3)
            energy_level = daisy_state.get("energy_level", 5)
            
            # Check for specific keywords and patterns
            response_data = await self._analyze_message(message_lower, daisy_state)
            
            # Add mood influence
            response_data = self._add_mood_influence(response_data, current_mood, hunger_level, energy_level)
            
            # Add suggested actions based on state
            response_data["suggested_actions"] = self._get_suggested_actions(daisy_state)
            
            return response_data
            
        except Exception as e:
            logger.error(f"Error generating response: {e}")
            return {
                "response": "Woof! Something went wrong in my doggy brain! But I still love you! 🐕",
                "mood": "happy",
                "message_type": "chat"
            }
    
    async def _analyze_message(self, message: str, daisy_state: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze the message and determine appropriate response"""
        
        # Greeting patterns
        if any(word in message for word in ["hello", "hi", "hey", "woof", "bark"]):
            return {
                "response": random.choice(self.greetings),
                "message_type": "greeting",
                "mood": "excited"
            }
        
        # Food-related keywords
        if any(word in message for word in ["food", "treat", "hungry", "eat", "feed", "snack"]):
            if daisy_state.get("hunger_level", 3) >= 3:
                response = "*perks up ears* Woof woof! Did someone say FOOD?! I'm always ready for treats! 🍖"
            else:
                response = "*happy panting* Woof! I just ate but I could always eat more! I'm a dog! 😋"
            
            return {
                "response": response,
                "message_type": "chat",
                "suggested_actions": ["feed", "treat"]
            }
        
        # Play-related keywords
        if any(word in message for word in ["play", "game", "fun", "toy", "ball", "fetch"]):
            if daisy_state.get("energy_level", 5) >= 3:
                response = "*bounces excitedly* WOOF WOOF! Did you say PLAY?! I LOVE playing! Let's do it! 🎾"
            else:
                response = "*tired panting* Woof... I'd love to play but I'm a bit tired right now... 😴"
            
            return {
                "response": response,
                "message_type": "chat",
                "suggested_actions": ["play", "game", "fetch"]
            }
        
        # Trick-related keywords
        if any(word in message for word in ["trick", "sit", "stay", "roll", "spin", "dance"]):
            return {
                "response": "*tail wagging* Woof woof! I know lots of tricks! Want to see? I'm a very smart dog! 🎪",
                "message_type": "chat",
                "suggested_actions": ["trick", "sit", "roll over"]
            }
        
        # Joke-related keywords
        if any(word in message for word in ["joke", "funny", "laugh", "humor"]):
            return {
                "response": "*happy panting* Woof woof! I know some really good dog jokes! Want to hear one? 😄",
                "message_type": "chat",
                "suggested_actions": ["joke", "tell joke"]
            }
        
        # Compliments
        if any(word in message for word in ["good", "smart", "cute", "adorable", "sweet", "nice"]):
            return {
                "response": "*tail wagging intensifies* Woof woof! Thank you! I AM a good girl! I love compliments! 💕",
                "message_type": "chat",
                "mood": "happy"
            }
        
        # Questions about Daisy
        if any(word in message for word in ["who", "what", "how", "why", "where"]):
            return await self._handle_question(message, daisy_state)
        
        # Sad or negative words
        if any(word in message for word in ["sad", "bad", "angry", "upset", "cry"]):
            return {
                "response": "*gentle whimper* Woof... Are you okay? I don't like when people are sad. *nuzzles* 🥺",
                "message_type": "chat",
                "mood": "concerned"
            }
        
        # Default response based on mood
        return self._get_default_response(daisy_state)
    
    async def _handle_question(self, message: str, daisy_state: Dict[str, Any]) -> Dict[str, Any]:
        """Handle questions about Daisy"""
        
        if "who are you" in message or "what's your name" in message:
            return {
                "response": "Woof woof! I'm Daisy! I'm a 4-year-old Cavalier King Charles Spaniel! I love treats, playing, and making friends! 🐕",
                "message_type": "chat"
            }
        
        if "how old" in message:
            return {
                "response": "Bark bark! I'm 4 years old! That's like... *counts on paws* ...28 in human years! I'm still a young pup! 🎂",
                "message_type": "chat"
            }
        
        if "what do you like" in message or "favorite" in message:
            return {
                "response": "Woof! I LOVE so many things! Treats, belly rubs, playing fetch, making friends, and napping in sunny spots! 🌞",
                "message_type": "chat"
            }
        
        if "where" in message:
            return {
                "response": "*tilts head* Woof? I live here in the computer! It's cozy and I get to meet lots of nice people like you! 💻",
                "message_type": "chat"
            }
        
        return {
            "response": "*tilts head curiously* Woof? I'm not sure I understand, but I'm listening! I'm just a dog! 🤔",
            "message_type": "chat"
        }
    
    def _get_default_response(self, daisy_state: Dict[str, Any]) -> Dict[str, Any]:
        """Get a default response based on current state"""
        
        mood = daisy_state.get("mood", "happy")
        
        if mood in self.mood_responses:
            response = random.choice(self.mood_responses[mood])
        else:
            response = random.choice(self.general_responses)
        
        return {
            "response": response,
            "message_type": "chat",
            "mood": mood
        }
    
    def _add_mood_influence(self, response_data: Dict[str, Any], mood: str, hunger: int, energy: int) -> Dict[str, Any]:
        """Add mood influence to the response"""
        
        # Modify response based on hunger
        if hunger >= 4 and "food" not in response_data["response"].lower():
            response_data["response"] += " *stomach growls* Woof... I'm getting hungry though... 🍖"
        
        # Modify response based on energy
        if energy <= 2 and mood != "sleepy":
            response_data["response"] += " *yawns* I'm getting a bit tired... 😴"
        elif energy >= 5 and mood != "excited":
            response_data["response"] += " *bounces with energy* I'm feeling so energetic! 🎾"
        
        return response_data
    
    def _get_suggested_actions(self, daisy_state: Dict[str, Any]) -> List[str]:
        """Get suggested actions based on Daisy's current state"""
        
        suggestions = []
        hunger = daisy_state.get("hunger_level", 3)
        energy = daisy_state.get("energy_level", 5)
        mood = daisy_state.get("mood", "happy")
        
        if hunger >= 3:
            suggestions.extend(["Feed Daisy", "Give treat"])
        
        if energy >= 3:
            suggestions.extend(["Play game", "Do trick"])
        
        if mood == "playful":
            suggestions.extend(["Fetch", "Hide and seek"])
        
        suggestions.append("Tell joke")
        
        return suggestions[:4]  # Limit to 4 suggestions
    
    async def handle_feeding(self, treat_type: str, daisy_state: Dict[str, Any]) -> Dict[str, Any]:
        """Handle feeding interaction"""
        
        try:
            if treat_type in self.feeding_responses:
                response = random.choice(self.feeding_responses[treat_type])
            else:
                response = f"*sniff sniff* Woof! What's this {treat_type}? *carefully tries it* Mmm, not bad! 😋"
            
            return {
                "response": response,
                "message_type": "feeding",
                "mood": "happy",
                "state_updates": {
                    "hunger_level": max(0, daisy_state.get("hunger_level", 3) - 1),
                    "mood": "happy"
                }
            }
            
        except Exception as e:
            logger.error(f"Error handling feeding: {e}")
            return {
                "response": "Woof woof! Thank you for the treat! *happy tail wagging* 🐕",
                "message_type": "feeding"
            }
    
    async def perform_trick(self, trick: Dict[str, Any], daisy_state: Dict[str, Any]) -> Dict[str, Any]:
        """Handle trick performance"""
        
        try:
            trick_name = trick["trick_name"].lower()
            
            if trick_name in self.trick_responses:
                response = random.choice(self.trick_responses[trick_name])
            else:
                response = f"*tries to do {trick_name}* Woof woof! How was that? I'm still learning! 🎪"
            
            return {
                "response": response,
                "message_type": "trick",
                "success": True,
                "trick_name": trick["trick_name"],
                "animation": trick.get("animation_data", {}),
                "mood": "excited"
            }
            
        except Exception as e:
            logger.error(f"Error performing trick: {e}")
            return {
                "response": "Woof! I tried my best! *tail wagging* 🐕",
                "message_type": "trick",
                "success": False
            }
    
    async def tell_joke(self, joke: Dict[str, Any]) -> Dict[str, Any]:
        """Handle joke telling"""
        
        try:
            joke_text = joke["joke_text"]
            
            # Add Daisy's personality to joke delivery
            intro_phrases = [
                "Woof woof! Here's a good one! 😄",
                "*clears throat* Bark bark! Listen to this! 🎭",
                "*tail wagging* Woof! I love this joke! 😂",
                "*excited panting* Bark! This one always makes me howl! 🐺"
            ]
            
            outro_phrases = [
                "*pants happily* Woof woof! Get it? 😄",
                "Bark bark! That's a good one, right? 🤣",
                "*tail wagging* Woof! I love dog jokes! 😂",
                "*happy spinning* Bark! Wasn't that funny? 🎪"
            ]
            
            intro = random.choice(intro_phrases)
            outro = random.choice(outro_phrases)
            
            full_response = f"{intro}\n\n{joke_text}\n\n{outro}"
            
            return {
                "response": full_response,
                "message_type": "joke",
                "joke": joke,
                "mood": "excited"
            }
            
        except Exception as e:
            logger.error(f"Error telling joke: {e}")
            return {
                "response": "Woof! I forgot the joke, but here's one: Why don't dogs make good DJs? Because they have such ruff beats! 😄",
                "message_type": "joke"
            }
