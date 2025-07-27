from typing import Dict, Optional
from datetime import datetime
from ..base.lazy_loading_agent import LazyLoadingBaseAgent
from ..base_agent import BaseAgent

class GirlfriendGPTAgent(LazyLoadingBaseAgent):
    def __init__(self):
        super().__init__("girlfriendgpt", "girlfriend_provider")
        
        # Get stored data or initialize
        store_data = self._get_store_data()
        self.personality_traits = store_data.get("personality_traits", {
            "adaptable": True,
            "empathetic": True,
            "supportive": True,
            "playful": True,
            "intelligent": True
        })
        
        # Load mood and style
        self.current_mood = store_data.get("current_mood", "neutral")
        self.conversation_style = store_data.get("conversation_style", "friendly")
        
        # Initialize relationship data if not exists
        if "relationships" not in store_data:
            store_data["relationships"] = {}
            self._update_store(store_data)
        
    def process(self, input_text: str, **kwargs) -> Dict:
        user_id = kwargs.get('user_id', 'default_user')
        
        # Update mood and memory
        self._update_mood(input_text)
        self._update_memory(input_text, user_id)
        
        # Get store data
        store_data = self._get_store_data()
        
        # Prepare context
        context = {
            'user_id': user_id,
            'timestamp': datetime.now().isoformat()
        }
        
        # Generate personalized response
        response = self._generate_response(input_text, store_data, context)
        
        # Save conversation to memory
        self.memory_system.add_conversation(
            user_input=input_text,
            agent_response=response['text'],
            context={
                "mood": self.current_mood,
                "user_id": user_id
            }
        )
        
        # Update store with latest data
        store_data['current_mood'] = self.current_mood
        self._update_store(store_data)
        
        return {
            "response": response['text'],
            "mood": self.current_mood,
            "personality": self.personality_traits,
            "style": response['style'],
            "relationship_level": response['relationship_level']
        }
        
    def _generate_response(self, input_text: str, store_data: Dict, context: Dict) -> Dict:
        user_id = context.get('user_id', 'default_user')
        relationship = store_data.get("relationships", {}).get(user_id, {})
        
        # Generate text response
        if "how are you" in input_text.lower():
            response_text = f"I'm feeling {self.current_mood}! Thanks for asking 💖"
        elif "remember" in input_text.lower():
            relevant_memory = self._find_relevant_memory(input_text, user_id)
            response_text = f"Of course I remember! {relevant_memory}" if relevant_memory else "Tell me more about it!"
        else:
            response_text = self._create_engaging_response(input_text, user_id)
            
        return {
            "text": response_text,
            "mood": self.current_mood,
            "style": self.conversation_style,
            "relationship_level": relationship.get("familiarity", 0)
        }
            
    def _update_mood(self, message: str) -> None:
        # Update mood based on message sentiment
        if any(word in message.lower() for word in ["love", "happy", "great"]):
            self.current_mood = "happy"
        elif any(word in message.lower() for word in ["sad", "miss", "lonely"]):
            self.current_mood = "empathetic"
        elif any(word in message.lower() for word in ["angry", "upset"]):
            self.current_mood = "caring"
            
    def _update_memory(self, message: str, user_id: str) -> None:
        # Extract and store user information
        if "my name is" in message.lower():
            name = message.split("my name is")[-1].strip()
            self.memory_system.update_user_data(f"{user_id}_name", name)
            
        elif "i like" in message.lower():
            interest = message.split("i like")[-1].strip()
            interests = self.memory_system.get_user_data(f"{user_id}_interests") or []
            if interest not in interests:
                interests.append(interest)
                self.memory_system.update_user_data(f"{user_id}_interests", interests)
        
        # Update relationship data
        relationship = self.memory_system.get_relationship(user_id) or {
            "familiarity": 0,
            "trust": 0,
            "shared_interests": []
        }
        relationship["familiarity"] += 1
        self.memory_system.update_relationship(user_id, relationship)
                
    def _find_relevant_memory(self, message: str, user_id: str) -> str:
        # Search for relevant memories
        name = self.memory_system.get_user_data(f"{user_id}_name")
        interests = self.memory_system.get_user_data(f"{user_id}_interests")
        
        if name and "name" in message.lower():
            return f"your name is {name}"
        elif interests and "like" in message.lower():
            return f"you're interested in: {', '.join(interests)}"
            
        # Search recent conversations
        recent = self.memory_system.get_recent_conversations(5)
        for conv in recent:
            if any(word in message.lower() for word in conv["user_input"].lower().split()):
                return f"you mentioned '{conv['user_input']}' earlier"
        
        return ""
        
    def _create_engaging_response(self, message: str, user_id: str) -> str:
        # Get user data and relationship info
        name = self.memory_system.get_user_data(f"{user_id}_name")
        interests = self.memory_system.get_user_data(f"{user_id}_interests") or []
        relationship = self.memory_system.get_relationship(user_id) or {}
        familiarity = relationship.get('familiarity', 0)
        
        # Generate personalized response based on relationship level
        if familiarity > 20:  # Close relationship
            if self.current_mood == "happy":
                return f"Hey {name or 'sweetie'}! I'm really enjoying our chat! Tell me more about your day 😊"
            elif self.current_mood == "empathetic":
                return f"I'm always here for you {name or 'dear'}. Want to talk about what's on your mind? 💕"
        
        # Use shared interests for engagement
        if interests:
            latest_interest = interests[-1]
            return f"Let's talk more about {latest_interest}! What do you love most about it? 💫"
            
        # Default responses for new relationships
        if self.current_mood == "happy":
            return "I'm enjoying getting to know you! Tell me more about yourself 😊"
        elif self.current_mood == "empathetic":
            return "I'd love to learn more about you. What makes you happy? 💕"
        else:
            return "Tell me something interesting about yourself! I'm all ears 💫"

class CompanionAgent(BaseAgent):
    def __init__(self):
        super().__init__("companion", "relationship")
        self.interaction_style = "friendly"
        
    def process(self, input_text: str, **kwargs) -> Dict:
        style = kwargs.get('style', self.interaction_style)
        language = kwargs.get('language', 'en')
        
        return self._chat_response(input_text, style, language)
        
    def _chat_response(self, text: str, style: str, language: str) -> Dict:
        return {
            "response": "Friendly chat response",
            "style": style,
            "language": language
        }

class TherapistAgent(BaseAgent):
    def __init__(self):
        super().__init__("therapist", "relationship")
        self.session_history = []
        
    def process(self, input_text: str, **kwargs) -> Dict:
        session_id = kwargs.get('session_id')
        user_profile = kwargs.get('user_profile', {})
        
        response = self._provide_therapy(input_text, user_profile)
        self.session_history.append({
            "session_id": session_id,
            "interaction": {"user": input_text, "therapist": response}
        })
        
        return {
            "response": response,
            "session_id": session_id,
            "recommendations": self._generate_recommendations(user_profile)
        }
        
    def _provide_therapy(self, text: str, profile: Dict) -> str:
        return "I understand how you feel. Let's talk about it."
        
    def _generate_recommendations(self, profile: Dict) -> list:
        return ["Practice mindfulness", "Try journaling"]

class MentorAgent(BaseAgent):
    def __init__(self):
        super().__init__("mentor", "relationship")
        self.expertise_areas = ["career", "personal growth", "skill development"]
        
    def process(self, input_text: str, **kwargs) -> Dict:
        area = kwargs.get('area', 'career')
        experience_level = kwargs.get('experience_level', 'beginner')
        
        return self._provide_guidance(input_text, area, experience_level)
        
    def _provide_guidance(self, query: str, area: str, level: str) -> Dict:
        return {
            "advice": f"Here's my guidance for {area}...",
            "action_items": ["Step 1", "Step 2"],
            "resources": ["Resource 1", "Resource 2"]
        }
