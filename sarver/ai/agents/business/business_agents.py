from typing import Dict, List
from datetime import datetime
from ..base_agent import BaseAgent
from ..memory_system import MemorySystem

class BusinessConsultantAgent(BaseAgent):
    def __init__(self):
        self.name = "business_consultant"
        self.memory_system = MemorySystem("business_consultant")
        self.expertise_areas = [
            "strategy",
            "marketing",
            "finance",
            "operations",
            "hr"
        ]
        
    def process(self, input_text: str, **kwargs) -> Dict:
        client_id = kwargs.get('client_id', 'default_client')
        area = kwargs.get('area', 'strategy')
        
        # Get client history
        client_data = self._get_client_data(client_id)
        analysis = self._analyze_business_case(input_text, area, client_data)
        
        # Save consultation record
        self._save_consultation(client_id, input_text, analysis)
        
        return {
            "analysis": analysis,
            "recommendations": self._generate_recommendations(area, analysis),
            "next_steps": self._suggest_next_steps(client_data)
        }
        
    def _get_client_data(self, client_id: str) -> Dict:
        return self.memory_system.get_user_data(client_id) or {
            "consultations": [],
            "industry": None,
            "company_size": None,
            "challenges": []
        }
        
    def _analyze_business_case(self, text: str, area: str, client_data: Dict) -> Dict:
        return {
            "area": area,
            "key_points": ["Point 1", "Point 2"],
            "risks": ["Risk 1", "Risk 2"],
            "opportunities": ["Opportunity 1", "Opportunity 2"]
        }
        
    def _generate_recommendations(self, area: str, analysis: Dict) -> List[str]:
        return [
            f"Recommendation 1 for {area}",
            f"Recommendation 2 for {area}"
        ]
        
    def _suggest_next_steps(self, client_data: Dict) -> List[str]:
        return [
            "Schedule follow-up meeting",
            "Prepare detailed proposal",
            "Conduct market research"
        ]
        
    def _save_consultation(self, client_id: str, query: str, analysis: Dict) -> None:
        client_data = self._get_client_data(client_id)
        client_data["consultations"].append({
            "timestamp": datetime.now().isoformat(),
            "query": query,
            "analysis": analysis
        })
        self.memory_system.update_user_data(client_id, client_data)

class MarketAnalystAgent(BaseAgent):
    def __init__(self):
        self.name = "market_analyst"
        self.memory_system = MemorySystem("market_analyst")
        self.markets = ["crypto", "stocks", "forex", "commodities"]
        
    def process(self, input_text: str, **kwargs) -> Dict:
        market = kwargs.get('market', 'stocks')
        timeframe = kwargs.get('timeframe', 'daily')
        
        analysis = self._analyze_market(market, timeframe)
        self._save_analysis(market, analysis)
        
        return {
            "market": market,
            "analysis": analysis,
            "predictions": self._make_predictions(market),
            "recommendations": self._get_recommendations(analysis)
        }
        
    def _analyze_market(self, market: str, timeframe: str) -> Dict:
        return {
            "trend": "bullish/bearish",
            "key_levels": [100, 200, 300],
            "volume": "high/low",
            "sentiment": "positive/negative"
        }
        
    def _make_predictions(self, market: str) -> List[str]:
        return [
            f"Short-term prediction for {market}",
            f"Mid-term prediction for {market}",
            f"Long-term prediction for {market}"
        ]
        
    def _get_recommendations(self, analysis: Dict) -> List[str]:
        trend = analysis.get("trend", "neutral")
        if trend == "bullish":
            return ["Consider long positions", "Look for buying opportunities"]
        else:
            return ["Consider short positions", "Look for selling opportunities"]
        
    def _save_analysis(self, market: str, analysis: Dict) -> None:
        analyses = self.memory_system.get_user_data(f"{market}_analyses") or []
        analyses.append({
            "timestamp": datetime.now().isoformat(),
            "analysis": analysis
        })
        self.memory_system.update_user_data(f"{market}_analyses", analyses)

class SalesAgent(BaseAgent):
    def __init__(self):
        self.name = "sales_agent"
        self.memory_system = MemorySystem("sales_agent")
        self.sales_stages = [
            "prospecting",
            "qualification",
            "proposal",
            "negotiation",
            "closing"
        ]
        
    def process(self, input_text: str, **kwargs) -> Dict:
        customer_id = kwargs.get('customer_id', 'default_customer')
        stage = kwargs.get('stage', 'qualification')
        
        customer_data = self._get_customer_data(customer_id)
        response = self._generate_sales_response(input_text, stage, customer_data)
        
        self._update_customer_record(customer_id, input_text, response)
        
        return {
            "response": response,
            "next_action": self._suggest_next_action(stage),
            "deal_probability": self._calculate_deal_probability(customer_data)
        }
        
    def _get_customer_data(self, customer_id: str) -> Dict:
        return self.memory_system.get_user_data(customer_id) or {
            "interactions": [],
            "preferences": {},
            "objections": [],
            "deal_stage": "prospecting"
        }
        
    def _generate_sales_response(self, text: str, stage: str, customer_data: Dict) -> str:
        if stage == "prospecting":
            return "Thanks for your interest! Let me tell you about our solutions..."
        elif stage == "qualification":
            return "I understand your needs. Here's how we can help..."
        elif stage == "proposal":
            return "Based on our discussion, I recommend..."
        else:
            return "Let's move forward with the next steps..."
            
    def _suggest_next_action(self, stage: str) -> str:
        actions = {
            "prospecting": "Schedule discovery call",
            "qualification": "Prepare needs assessment",
            "proposal": "Send detailed proposal",
            "negotiation": "Discuss pricing options",
            "closing": "Prepare final agreement"
        }
        return actions.get(stage, "Follow up with customer")
        
    def _calculate_deal_probability(self, customer_data: Dict) -> float:
        stage = customer_data.get("deal_stage", "prospecting")
        probabilities = {
            "prospecting": 0.2,
            "qualification": 0.4,
            "proposal": 0.6,
            "negotiation": 0.8,
            "closing": 0.9
        }
        return probabilities.get(stage, 0.1)
        
    def _update_customer_record(self, customer_id: str, query: str, response: str) -> None:
        customer_data = self._get_customer_data(customer_id)
        customer_data["interactions"].append({
            "timestamp": datetime.now().isoformat(),
            "query": query,
            "response": response
        })
        self.memory_system.update_user_data(customer_id, customer_data)

class ProductManagerAgent(BaseAgent):
    def __init__(self):
        self.name = "product_manager"
        self.memory_system = MemorySystem("product_manager")
        self.product_stages = [
            "ideation",
            "planning",
            "development",
            "testing",
            "launch"
        ]
        
    def process(self, input_text: str, **kwargs) -> Dict:
        product_id = kwargs.get('product_id', 'default_product')
        stage = kwargs.get('stage', 'planning')
        
        product_data = self._get_product_data(product_id)
        analysis = self._analyze_product_request(input_text, stage, product_data)
        
        self._update_product_record(product_id, input_text, analysis)
        
        return {
            "analysis": analysis,
            "action_items": self._generate_action_items(stage),
            "risks": self._identify_risks(product_data),
            "timeline": self._estimate_timeline(stage)
        }
        
    def _get_product_data(self, product_id: str) -> Dict:
        return self.memory_system.get_user_data(product_id) or {
            "features": [],
            "timeline": {},
            "stakeholders": [],
            "current_stage": "ideation",
            "updates": []
        }
        
    def _analyze_product_request(self, text: str, stage: str, data: Dict) -> Dict:
        return {
            "stage": stage,
            "requirements": ["Req 1", "Req 2"],
            "dependencies": ["Dep 1", "Dep 2"],
            "priority": "high/medium/low"
        }
        
    def _generate_action_items(self, stage: str) -> List[str]:
        actions = {
            "ideation": ["Conduct market research", "Define user personas"],
            "planning": ["Create product roadmap", "Set milestones"],
            "development": ["Assign tasks", "Set up sprints"],
            "testing": ["Define test cases", "Schedule QA"],
            "launch": ["Prepare marketing", "Plan rollout"]
        }
        return actions.get(stage, ["Review progress", "Update stakeholders"])
        
    def _identify_risks(self, data: Dict) -> List[str]:
        stage = data.get("current_stage", "ideation")
        risks = {
            "ideation": ["Market fit risk", "Competition risk"],
            "planning": ["Resource risk", "Timeline risk"],
            "development": ["Technical risk", "Quality risk"],
            "testing": ["Bug risk", "Performance risk"],
            "launch": ["Adoption risk", "Support risk"]
        }
        return risks.get(stage, ["Unknown risks"])
        
    def _estimate_timeline(self, stage: str) -> Dict:
        base_estimates = {
            "ideation": 14,  # days
            "planning": 30,
            "development": 90,
            "testing": 30,
            "launch": 14
        }
        days = base_estimates.get(stage, 30)
        return {
            "estimated_days": days,
            "confidence": "medium",
            "factors": ["team size", "complexity", "dependencies"]
        }
        
    def _update_product_record(self, product_id: str, request: str, analysis: Dict) -> None:
        product_data = self._get_product_data(product_id)
        product_data["updates"].append({
            "timestamp": datetime.now().isoformat(),
            "request": request,
            "analysis": analysis
        })
        self.memory_system.update_user_data(product_id, product_data)
