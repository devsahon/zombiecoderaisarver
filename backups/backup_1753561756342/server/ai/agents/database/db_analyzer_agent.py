from typing import Dict, List, Optional
from datetime import datetime
import re
from ..base_agent import BaseAgent
from ..memory_system import MemorySystem

class DatabaseAnalyzerAgent(BaseAgent):
    def __init__(self):
        self.name = "db_analyzer"
        self.memory_system = MemorySystem("db_analyzer")
        self.supported_databases = {
            "mysql": {
                "analysis_queries": {
                    "performance": [
                        "SHOW GLOBAL STATUS",
                        "SHOW PROCESSLIST",
                        "EXPLAIN",
                        "SHOW ENGINE INNODB STATUS"
                    ],
                    "structure": [
                        "SHOW TABLES",
                        "SHOW CREATE TABLE",
                        "SHOW INDEX FROM"
                    ],
                    "storage": [
                        "SELECT table_name, table_rows, data_length, index_length FROM information_schema.tables",
                        "SHOW TABLE STATUS"
                    ]
                },
                "common_issues": {
                    "performance": [
                        "missing_indexes",
                        "slow_queries",
                        "connection_leaks",
                        "lock_contention"
                    ],
                    "structure": [
                        "poor_schema_design",
                        "redundant_indexes",
                        "missing_foreign_keys"
                    ],
                    "storage": [
                        "fragmentation",
                        "bloated_tables",
                        "unused_indexes"
                    ]
                }
            },
            "postgresql": {
                "analysis_queries": {
                    "performance": [
                        "SELECT * FROM pg_stat_activity",
                        "EXPLAIN ANALYZE"
                    ]
                }
            },
            "mongodb": {
                "analysis_commands": {
                    "performance": [
                        "db.currentOp()",
                        "db.serverStatus()"
                    ]
                }
            }
        }
        
    def process(self, input_text: str, **kwargs) -> Dict:
        db_type = kwargs.get('db_type', 'mysql')
        analysis_type = kwargs.get('analysis_type', 'all')
        connection_info = kwargs.get('connection_info', {})
        
        # Analyze database
        analysis_result = self._analyze_database(db_type, analysis_type, connection_info)
        
        # Generate recommendations
        recommendations = self._generate_recommendations(analysis_result)
        
        # Calculate health score
        health_score = self._calculate_health_score(analysis_result)
        
        # Save analysis results
        self._save_analysis_results(db_type, analysis_result, health_score)
        
        return {
            "analysis": analysis_result,
            "recommendations": recommendations,
            "health_score": health_score,
            "quick_fixes": self._suggest_quick_fixes(analysis_result),
            "optimization_plan": self._create_optimization_plan(analysis_result)
        }
        
    def _analyze_database(self, db_type: str, analysis_type: str, connection: Dict) -> Dict:
        results = {
            "performance_metrics": self._analyze_performance(db_type, connection),
            "structure_analysis": self._analyze_structure(db_type, connection),
            "storage_analysis": self._analyze_storage(db_type, connection),
            "security_audit": self._security_check(db_type, connection),
            "bottlenecks": self._identify_bottlenecks(db_type, connection)
        }
        
        # Add MySQL specific analysis
        if db_type == "mysql":
            results.update({
                "innodb_status": self._analyze_innodb_status(connection),
                "query_performance": self._analyze_slow_queries(connection),
                "connection_status": self._analyze_connections(connection)
            })
            
        return results
        
    def _analyze_performance(self, db_type: str, connection: Dict) -> Dict:
        return {
            "query_response_time": {
                "avg": "100ms",
                "p95": "200ms",
                "p99": "500ms"
            },
            "throughput": {
                "queries_per_second": 1000,
                "transactions_per_second": 100
            },
            "resource_usage": {
                "cpu": "60%",
                "memory": "75%",
                "disk_io": "40%"
            }
        }
        
    def _analyze_structure(self, db_type: str, connection: Dict) -> Dict:
        return {
            "schema_quality": {
                "normalization_score": 0.85,
                "index_efficiency": 0.90,
                "referential_integrity": 0.95
            },
            "potential_issues": [
                {
                    "type": "missing_index",
                    "table": "users",
                    "columns": ["email", "username"],
                    "impact": "high"
                }
            ]
        }
        
    def _analyze_storage(self, db_type: str, connection: Dict) -> Dict:
        return {
            "space_usage": {
                "total_size": "100GB",
                "free_space": "20GB",
                "growth_rate": "1GB/day"
            },
            "fragmentation": {
                "table_fragmentation": "15%",
                "index_fragmentation": "10%"
            }
        }
        
    def _security_check(self, db_type: str, connection: Dict) -> Dict:
        return {
            "permissions": self._analyze_permissions(connection),
            "encryption": self._check_encryption(connection),
            "vulnerabilities": self._scan_vulnerabilities(connection)
        }
        
    def _identify_bottlenecks(self, db_type: str, connection: Dict) -> List[Dict]:
        return [
            {
                "type": "query_bottleneck",
                "description": "Slow JOIN operation in users_orders table",
                "impact": "high",
                "solution": "Add composite index on (user_id, order_date)"
            }
        ]
        
    def _analyze_innodb_status(self, connection: Dict) -> Dict:
        return {
            "buffer_pool": {
                "size": "8GB",
                "usage": "75%",
                "hit_rate": "95%"
            },
            "locks": {
                "current_locks": 10,
                "lock_wait_time": "50ms",
                "deadlocks": 0
            }
        }
        
    def _analyze_slow_queries(self, connection: Dict) -> List[Dict]:
        return [
            {
                "query": "SELECT * FROM orders WHERE status = 'pending'",
                "execution_time": "2.5s",
                "frequency": "100/hour",
                "solution": "Add index on status column"
            }
        ]
        
    def _analyze_connections(self, connection: Dict) -> Dict:
        return {
            "active_connections": 100,
            "max_connections": 1000,
            "connection_usage": "10%",
            "avg_lifetime": "30m"
        }
        
    def _generate_recommendations(self, analysis: Dict) -> List[Dict]:
        recommendations = []
        
        # Performance recommendations
        if "performance_metrics" in analysis:
            perf = analysis["performance_metrics"]
            if float(perf["query_response_time"]["p95"][:-2]) > 150:
                recommendations.append({
                    "type": "performance",
                    "priority": "high",
                    "description": "High query response time detected",
                    "solution": "Implement query caching and optimize slow queries",
                    "effort": "medium"
                })
                
        # Storage recommendations
        if "storage_analysis" in analysis:
            storage = analysis["storage_analysis"]
            if float(storage["fragmentation"]["table_fragmentation"][:-1]) > 10:
                recommendations.append({
                    "type": "storage",
                    "priority": "medium",
                    "description": "High table fragmentation detected",
                    "solution": "Run OPTIMIZE TABLE on affected tables",
                    "effort": "low"
                })
                
        return recommendations
        
    def _calculate_health_score(self, analysis: Dict) -> Dict:
        scores = {
            "performance": self._score_performance(analysis.get("performance_metrics", {})),
            "structure": self._score_structure(analysis.get("structure_analysis", {})),
            "storage": self._score_storage(analysis.get("storage_analysis", {})),
            "security": self._score_security(analysis.get("security_audit", {}))
        }
        
        overall_score = sum(scores.values()) / len(scores)
        
        return {
            "overall": overall_score,
            "components": scores,
            "status": "healthy" if overall_score >= 0.8 else "needs_attention"
        }
        
    def _suggest_quick_fixes(self, analysis: Dict) -> List[Dict]:
        return [
            {
                "issue": "Missing index on frequently queried column",
                "fix": "CREATE INDEX idx_status ON orders(status)",
                "impact": "Reduce query time by 70%",
                "execution_time": "5 minutes"
            }
        ]
        
    def _create_optimization_plan(self, analysis: Dict) -> Dict:
        return {
            "immediate_actions": [
                "Optimize slow queries",
                "Add missing indexes"
            ],
            "short_term": [
                "Implement query caching",
                "Optimize table structure"
            ],
            "long_term": [
                "Consider sharding",
                "Implement read replicas"
            ],
            "estimated_timeline": "2 weeks",
            "expected_benefits": {
                "performance_improvement": "60%",
                "storage_savings": "30%"
            }
        }
        
    def _score_performance(self, metrics: Dict) -> float:
        # Implement scoring logic
        return 0.85
        
    def _score_structure(self, analysis: Dict) -> float:
        # Implement scoring logic
        return 0.90
        
    def _score_storage(self, analysis: Dict) -> float:
        # Implement scoring logic
        return 0.75
        
    def _score_security(self, audit: Dict) -> float:
        # Implement scoring logic
        return 0.95
        
    def _analyze_permissions(self, connection: Dict) -> Dict:
        return {
            "user_permissions": "Properly configured",
            "role_hierarchy": "Well-structured",
            "security_score": 0.9
        }
        
    def _check_encryption(self, connection: Dict) -> Dict:
        return {
            "data_at_rest": "Encrypted",
            "data_in_transit": "SSL enabled",
            "key_management": "Secure"
        }
        
    def _scan_vulnerabilities(self, connection: Dict) -> List[Dict]:
        return [
            {
                "type": "SQL Injection risk",
                "severity": "medium",
                "location": "login.php",
                "fix": "Use prepared statements"
            }
        ]
        
    def _save_analysis_results(self, db_type: str, analysis: Dict, health: Dict) -> None:
        self.memory_system.update_user_data(f"{db_type}_analysis", {
            "timestamp": datetime.now().isoformat(),
            "analysis": analysis,
            "health_score": health
        })
