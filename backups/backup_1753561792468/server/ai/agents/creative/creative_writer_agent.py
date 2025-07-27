from typing import Dict, List
from datetime import datetime
from ..base_agent import BaseAgent

class CreativeWriterAgent(BaseAgent):
    def __init__(self):
        super().__init__('creative_writer', 'creative')
        from ..memory_system import MemorySystem
        self.memory_system = MemorySystem("creative_writer")
        
        self.writing_styles = {
            "romantic": "emotional and passionate",
            "poetic": "metaphorical and rhythmic",
            "story": "narrative and engaging",
            "letter": "personal and heartfelt"
        }
        
        # Load saved drafts from memory
        self.drafts = self.memory_system.get_user_data("drafts") or {}
        
    def process(self, input_text: str, **kwargs) -> Dict:
        style = kwargs.get('style', 'romantic')
        topic = kwargs.get('topic', input_text)
        length = kwargs.get('length', 'medium')
        
        content = self._generate_creative_content(topic, style, length)
        draft_id = self._save_draft(content, style)
        
        return {
            "content": content,
            "style": style,
            "draft_id": draft_id,
            "suggestions": self._generate_improvements(content)
        }
        
    def _generate_creative_content(self, topic: str, style: str, length: str) -> str:
        # Generate creative content based on style and topic
        if style == "romantic":
            return self._write_romantic_content(topic, length)
        elif style == "poetic":
            return self._write_poem(topic, length)
        elif style == "story":
            return self._write_story(topic, length)
        else:
            return self._write_letter(topic, length)
            
    def _write_romantic_content(self, topic: str, length: str) -> str:
        # Implement romantic content generation
        return f"A romantic piece about {topic}..."
        
    def _write_poem(self, topic: str, length: str) -> str:
        # Implement poem generation
        return f"A poem about {topic}..."
        
    def _write_story(self, topic: str, length: str) -> str:
        # Implement story generation
        return f"A story about {topic}..."
        
    def _write_letter(self, topic: str, length: str) -> str:
        # Implement letter writing
        return f"A letter about {topic}..."
        
    def _save_draft(self, content: str, style: str) -> str:
        # Create unique draft ID
        draft_id = f"{style}_{len(self.drafts)}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        # Create draft object
        draft = {
            "content": content,
            "style": style,
            "timestamp": datetime.now().isoformat(),
            "version": 1
        }
        
        # Save to local drafts
        self.drafts[draft_id] = draft
        
        # Save to persistent memory
        self.memory_system.update_user_data("drafts", self.drafts)
        
        # Save writing history
        self.memory_system.add_conversation(
            user_input=f"Created new {style} draft",
            agent_response=f"Draft saved with ID: {draft_id}",
            context={"draft_id": draft_id, "style": style}
        )
        
        return draft_id
        
    def _generate_improvements(self, content: str) -> List[str]:
        # Generate improvement suggestions
        return [
            "Try adding more descriptive language",
            "Consider incorporating metaphors",
            "You could expand on the emotional aspects"
        ]
        
    def _generate_response(self, message: str) -> str:
        msg = message.strip().lower()
        if "মানে" in msg or "what is" in msg or "explain" in msg:
            return f"'{message}' বলতে বোঝায়: এটি একটি গুরুত্বপূর্ণ ধারণা, যা নির্দিষ্ট প্রসঙ্গে ব্যবহৃত হয়। উদাহরণ: ধরুন, আপনি জানতে চাইলেন—'Agent Architecture' মানে কী? এটি হলো এজেন্ট ভিত্তিক সফটওয়্যার ডিজাইনের কাঠামো, যেখানে বিভিন্ন এজেন্ট স্বতন্ত্রভাবে কাজ করে।"
        elif "উদাহরণ" in msg or "example" in msg:
            return f"'{message}' এর একটি উদাহরণ: ধরুন, একটি চ্যাটবট এজেন্ট, যেটি ইউজারের প্রশ্ন বুঝে উত্তর দেয়।"
        else:
            return f"আপনার প্রশ্ন '{message}' পেয়েছি। দয়া করে আরও নির্দিষ্ট করে বলুন, তাহলে আরও ভালোভাবে সাহায্য করতে পারব।"
        
    def get_draft(self, draft_id: str) -> Dict:
        # Retrieve a saved draft
        return self.drafts.get(draft_id, {})
