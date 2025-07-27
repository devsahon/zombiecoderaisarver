from typing import Dict, List
from datetime import datetime
from ..base_agent import BaseAgent
from ..memory_system import MemorySystem

class LearningAgent(BaseAgent):
    def __init__(self):
        self.name = "learning_agent"
        self.memory_system = MemorySystem("learning_agent")
        self.learning_styles = [
            "visual",
            "auditory",
            "reading",
            "kinesthetic"
        ]
        self.difficulty_levels = [
            "beginner",
            "intermediate",
            "advanced",
            "expert"
        ]
        
    def process(self, input_text: str, **kwargs) -> Dict:
        student_id = kwargs.get('student_id', 'default_student')
        topic = kwargs.get('topic', 'general')
        style = kwargs.get('style', 'visual')
        
        student_data = self._get_student_data(student_id)
        learning_plan = self._create_learning_plan(input_text, student_data, style)
        
        self._update_student_progress(student_id, topic, learning_plan)
        
        return {
            "plan": learning_plan,
            "resources": self._recommend_resources(topic, student_data),
            "exercises": self._generate_exercises(topic, student_data["level"]),
            "next_steps": self._suggest_next_topics(topic, student_data)
        }
        
    def _get_student_data(self, student_id: str) -> Dict:
        return self.memory_system.get_user_data(student_id) or {
            "level": "beginner",
            "preferred_style": "visual",
            "completed_topics": [],
            "current_topics": [],
            "strengths": [],
            "weaknesses": []
        }
        
    def _create_learning_plan(self, text: str, data: Dict, style: str) -> Dict:
        level = data.get("level", "beginner")
        return {
            "steps": self._generate_study_steps(level),
            "duration": self._estimate_duration(level),
            "milestones": self._set_milestones(level),
            "style_adjustments": self._adapt_to_style(style)
        }
        
    def _generate_study_steps(self, level: str) -> List[str]:
        base_steps = {
            "beginner": ["Learn basics", "Practice fundamentals", "Simple projects"],
            "intermediate": ["Advanced concepts", "Complex problems", "Real projects"],
            "advanced": ["Expert topics", "Specialized skills", "Industry projects"],
            "expert": ["Research", "Innovation", "Leadership"]
        }
        return base_steps.get(level, ["Customize learning path"])
        
    def _estimate_duration(self, level: str) -> Dict:
        base_hours = {
            "beginner": 20,
            "intermediate": 40,
            "advanced": 80,
            "expert": 160
        }
        hours = base_hours.get(level, 40)
        return {
            "total_hours": hours,
            "weekly_hours": hours / 4,
            "estimated_weeks": 4
        }
        
    def _set_milestones(self, level: str) -> List[Dict]:
        return [
            {"name": "Milestone 1", "target_date": "Week 1"},
            {"name": "Milestone 2", "target_date": "Week 2"},
            {"name": "Final Project", "target_date": "Week 4"}
        ]
        
    def _adapt_to_style(self, style: str) -> Dict:
        adaptations = {
            "visual": {
                "methods": ["diagrams", "videos", "charts"],
                "tools": ["mind maps", "flowcharts"]
            },
            "auditory": {
                "methods": ["lectures", "discussions", "audio"],
                "tools": ["podcasts", "recordings"]
            },
            "reading": {
                "methods": ["books", "articles", "documentation"],
                "tools": ["notes", "summaries"]
            },
            "kinesthetic": {
                "methods": ["hands-on", "experiments", "projects"],
                "tools": ["lab work", "simulations"]
            }
        }
        return adaptations.get(style, adaptations["visual"])
        
    def _recommend_resources(self, topic: str, data: Dict) -> List[Dict]:
        level = data.get("level", "beginner")
        style = data.get("preferred_style", "visual")
        
        return [
            {
                "type": "primary",
                "resources": self._get_primary_resources(topic, level, style)
            },
            {
                "type": "supplementary",
                "resources": self._get_supplementary_resources(topic, level)
            }
        ]
        
    def _get_primary_resources(self, topic: str, level: str, style: str) -> List[str]:
        return [
            f"{style} guide to {topic}",
            f"{level} tutorial for {topic}",
            f"Interactive {topic} learning"
        ]
        
    def _get_supplementary_resources(self, topic: str, level: str) -> List[str]:
        return [
            f"Additional reading on {topic}",
            f"Practice exercises for {level}",
            f"Community resources for {topic}"
        ]
        
    def _generate_exercises(self, topic: str, level: str) -> List[Dict]:
        return [
            {
                "type": "practice",
                "difficulty": level,
                "description": f"Exercise 1 for {topic}",
                "estimated_time": "30 min"
            },
            {
                "type": "project",
                "difficulty": level,
                "description": f"Project for {topic}",
                "estimated_time": "2 hours"
            }
        ]
        
    def _suggest_next_topics(self, current_topic: str, data: Dict) -> List[str]:
        level = data.get("level", "beginner")
        completed = data.get("completed_topics", [])
        
        # Example topic progression
        progressions = {
            "programming": ["basics", "functions", "objects", "algorithms"],
            "math": ["arithmetic", "algebra", "calculus", "statistics"],
            "science": ["physics", "chemistry", "biology", "advanced"]
        }
        
        current_progression = None
        for subject, topics in progressions.items():
            if current_topic in topics:
                current_progression = topics
                break
                
        if current_progression:
            current_index = current_progression.index(current_topic)
            return current_progression[current_index + 1:current_index + 3]
        
        return ["Related Topic 1", "Related Topic 2"]
        
    def _update_student_progress(self, student_id: str, topic: str, plan: Dict) -> None:
        student_data = self._get_student_data(student_id)
        
        if topic not in student_data["current_topics"]:
            student_data["current_topics"].append(topic)
            
        student_data["last_update"] = {
            "timestamp": datetime.now().isoformat(),
            "topic": topic,
            "plan": plan
        }
        
        self.memory_system.update_user_data(student_id, student_data)
