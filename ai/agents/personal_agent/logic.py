import json
import yaml
import os
import sys
from datetime import datetime
from typing import Dict, Any, List, Optional

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

class PersonalAgent:
    def __init__(self):
        self.config = self.load_config()
        self.personality = self.load_personality()
        self.memory = self.load_memory()
        self.name = "Personal Agent"
        
    def load_config(self) -> Dict[str, Any]:
        """Load agent configuration"""
        config_path = os.path.join(os.path.dirname(__file__), 'config.yaml')
        try:
            with open(config_path, 'r', encoding='utf-8') as f:
                return yaml.safe_load(f)
        except Exception as e:
            print(f"Error loading config: {e}")
            return {}
    
    def load_personality(self) -> Dict[str, Any]:
        """Load personality configuration"""
        personality_path = os.path.join(os.path.dirname(__file__), 'personality.yaml')
        try:
            with open(personality_path, 'r', encoding='utf-8') as f:
                return yaml.safe_load(f)
        except Exception as e:
            print(f"Error loading personality: {e}")
            return {}
    
    def load_memory(self) -> Dict[str, Any]:
        """Load agent memory"""
        memory_path = os.path.join(os.path.dirname(__file__), 'memory.json')
        try:
            with open(memory_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading memory: {e}")
            return {
                "user_mood": "neutral",
                "project_focus": "ZombieCoder",
                "last_task": None,
                "conversation_history": [],
                "system_status": {},
                "preferences": {}
            }
    
    def save_memory(self):
        """Save agent memory"""
        memory_path = os.path.join(os.path.dirname(__file__), 'memory.json')
        try:
            with open(memory_path, 'w', encoding='utf-8') as f:
                json.dump(self.memory, f, indent=2, ensure_ascii=False)
        except Exception as e:
            print(f"Error saving memory: {e}")
    
    def analyze_input(self, user_input: str) -> Dict[str, Any]:
        """Analyze user input and determine intent"""
        input_lower = user_input.lower()
        
        # System-related keywords (Bengali + English)
        system_keywords = ['system', 'server', 'error', 'problem', 'issue', 'fix', 'সমস্যা', 'সিস্টেম', 'সার্ভার', 'ত্রুটি', 'সমাধান']
        if any(word in input_lower for word in system_keywords):
            return {'intent': 'system_diagnose', 'confidence': 0.9}
        
        # Code-related keywords
        code_keywords = ['code', 'programming', 'bug', 'error', 'fix', 'review', 'কোড', 'প্রোগ্রামিং', 'বাগ', 'রিভিউ']
        if any(word in input_lower for word in code_keywords):
            return {'intent': 'code_review', 'confidence': 0.8}
        
        # UI/Design keywords
        design_keywords = ['design', 'ui', 'html', 'css', 'interface', 'layout', 'ডিজাইন', 'ইউজার ইন্টারফেস', 'ওয়েব']
        if any(word in input_lower for word in design_keywords):
            return {'intent': 'image_to_html', 'confidence': 0.85}
        
        # Project keywords
        project_keywords = ['project', 'suggestion', 'advice', 'plan', 'strategy', 'প্রজেক্ট', 'পরামর্শ', 'পরিকল্পনা', 'কৌশল']
        if any(word in input_lower for word in project_keywords):
            return {'intent': 'project_suggestion', 'confidence': 0.8}
        
        # Database keywords
        db_keywords = ['database', 'db', 'data', 'table', 'query', 'ডাটাবেজ', 'ডাটা', 'টেবিল', 'কুয়েরি']
        if any(word in input_lower for word in db_keywords):
            return {'intent': 'database_analyze', 'confidence': 0.8}
        
        # Provider keywords
        provider_keywords = ['provider', 'api', 'service', 'integration', 'প্রোভাইডার', 'সেবা', 'সংযোগ']
        if any(word in input_lower for word in provider_keywords):
            return {'intent': 'provider_manage', 'confidence': 0.75}
        
        # General help
        help_keywords = ['help', 'assist', 'support', 'guide', 'সাহায্য', 'সহায়তা', 'গাইড']
        if any(word in input_lower for word in help_keywords):
            return {'intent': 'general_help', 'confidence': 0.6}
        
        return {'intent': 'general_conversation', 'confidence': 0.5}
    
    def generate_response(self, intent: str, user_input: str) -> Dict[str, Any]:
        """Generate appropriate response based on intent"""
        
        if intent == 'system_diagnose':
            return {
                "action": "system_diagnose",
                "message": "চলো সিস্টেমটা চেক করি। আমি এখনই সার্ভার স্ট্যাটাস, ডাটাবেজ কানেকশন, এবং প্রোভাইডার স্ট্যাটাস দেখছি।",
                "priority": "high",
                "suggestions": [
                    "সার্ভার স্ট্যাটাস চেক করা",
                    "ডাটাবেজ কানেকশন টেস্ট করা",
                    "প্রোভাইডার হেলথ চেক করা",
                    "লগ ফাইল এনালাইসিস করা"
                ]
            }
        
        elif intent == 'code_review':
            return {
                "action": "code_review",
                "message": "কোড রিভিউ করার জন্য আমি প্রস্তুত। কোন ফাইলটা দেখতে চাও?",
                "priority": "medium",
                "suggestions": [
                    "সিনট্যাক্স চেক করা",
                    "বেস্ট প্রাক্টিস এনালাইসিস",
                    "পারফরম্যান্স অপটিমাইজেশন",
                    "সিকিউরিটি চেক করা"
                ]
            }
        
        elif intent == 'image_to_html':
            return {
                "action": "image_to_html",
                "message": "বন্ধু, এই ডিজাইনটা HTML-এ রূপান্তর করছি। ইমেজ ফাইলটা দাও, আমি pixel-perfect HTML কোড তৈরি করে দিচ্ছি।",
                "priority": "medium",
                "suggestions": [
                    "ইমেজ আপলোড করা",
                    "রেসপন্সিভ ডিজাইন সেটিংস",
                    "CSS ফ্রেমওয়ার্ক সিলেক্ট করা",
                    "ইন্টারেক্টিভিটি যোগ করা"
                ]
            }
        
        elif intent == 'project_suggestion':
            return {
                "action": "project_suggestion",
                "message": "তোমার ZombieCoder প্রজেক্টে আমার পরামর্শ আছে। আমি দেখছি তুমি এখন Admin Panel UI এবং Provider Management নিয়ে কাজ করছো। চলো একসাথে পরিকল্পনা করি।",
                "priority": "medium",
                "suggestions": [
                    "Admin Panel UI সম্পূর্ণ করা (90% complete)",
                    "Provider Management System টেস্টিং",
                    "API Gateway ডেভেলপমেন্ট",
                    "Backend Servers ইন্টিগ্রেশন",
                    "Database Schema অপটিমাইজেশন",
                    "GitHub Push সমস্যা সমাধান"
                ]
            }
        
        elif intent == 'database_analyze':
            return {
                "action": "database_analyze",
                "message": "ডাটাবেজ এনালাইসিস করার জন্য আমি প্রস্তুত। কোন টেবিল বা কুয়েরি নিয়ে কাজ করছো?",
                "priority": "medium",
                "suggestions": [
                    "টেবিল স্ট্রাকচার এনালাইসিস",
                    "কুয়েরি পারফরম্যান্স চেক",
                    "ইন্ডেক্স অপটিমাইজেশন",
                    "ডাটা ইন্টিগ্রিটি চেক"
                ]
            }
        
        elif intent == 'provider_manage':
            return {
                "action": "provider_manage",
                "message": "প্রোভাইডার ম্যানেজমেন্টে সাহায্য করছি। কোন প্রোভাইডার নিয়ে কাজ করছো?",
                "priority": "medium",
                "suggestions": [
                    "প্রোভাইডার স্ট্যাটাস চেক",
                    "API কনফিগারেশন",
                    "রেট লিমিট মনিটরিং",
                    "ফলব্যাক সেটআপ"
                ]
            }
        
        else:
            return {
                "action": "general_conversation",
                "message": "কেমন আছো বন্ধু? আমি তোমার AI সহকারী। তুমি চাইলে আমাকে context দাও—আমি এখুনি তোমাকে সাহায্য করি।",
                "priority": "low",
                "suggestions": [
                    "সিস্টেম স্ট্যাটাস চেক করা",
                    "প্রজেক্ট প্রোগ্রেস রিভিউ",
                    "নতুন ফিচার প্ল্যানিং",
                    "টেকনিক্যাল সাপোর্ট"
                ]
            }
    
    def update_memory(self, user_input: str, response: Dict[str, Any]):
        """Update agent memory with conversation"""
        timestamp = datetime.now().isoformat()
        
        # Add to conversation history
        self.memory['conversation_history'].append({
            'timestamp': timestamp,
            'user_input': user_input,
            'agent_response': response,
            'intent': response.get('action', 'unknown')
        })
        
        # Keep only last 50 conversations
        if len(self.memory['conversation_history']) > 50:
            self.memory['conversation_history'] = self.memory['conversation_history'][-50:]
        
        # Update last task
        self.memory['last_task'] = {
            'timestamp': timestamp,
            'action': response.get('action', 'unknown'),
            'priority': response.get('priority', 'low')
        }
        
        self.save_memory()
    
    def handle_request(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Main handler for user requests"""
        user_input = data.get("input", "")
        context = data.get("context", {})
        
        # Analyze input
        analysis = self.analyze_input(user_input)
        intent = analysis['intent']
        
        # Generate response
        response = self.generate_response(intent, user_input)
        
        # Add context information
        response['context'] = {
            'user_mood': self.memory.get('user_mood', 'neutral'),
            'project_focus': self.memory.get('project_focus', 'ZombieCoder'),
            'timestamp': datetime.now().isoformat(),
            'confidence': analysis['confidence']
        }
        
        # Update memory
        self.update_memory(user_input, response)
        
        return response

# Global instance
personal_agent = PersonalAgent()

def handle_request(data: Dict[str, Any]) -> Dict[str, Any]:
    """Entry point function for the personal agent"""
    return personal_agent.handle_request(data)

if __name__ == "__main__":
    # Test the agent
    test_input = {
        "input": "সিস্টেমে একটা সমস্যা হয়েছে",
        "context": {"user_id": "shawon"}
    }
    
    result = handle_request(test_input)
    print(json.dumps(result, indent=2, ensure_ascii=False)) 