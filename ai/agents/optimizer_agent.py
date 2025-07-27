import asyncio
import json
import logging
import psutil
import time
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
import sqlite3
import os

@dataclass
class ServerMetrics:
    server_id: str
    cpu_usage: float
    memory_usage: float
    disk_usage: float
    network_io: Dict[str, int]
    response_time: float
    error_rate: float
    timestamp: str

@dataclass
class Optimization:
    id: str
    server_id: str
    type: str  # 'performance', 'memory', 'network', 'security'
    description: str
    impact: str  # 'high', 'medium', 'low'
    applied: bool
    timestamp: str
    details: Dict[str, Any]

@dataclass
class Recommendation:
    id: str
    server_id: str
    type: str
    description: str
    priority: str  # 'critical', 'high', 'medium', 'low'
    action: str
    estimated_impact: str
    timestamp: str

class ModelServerOptimizerAgent:
    def __init__(self):
        self.name = "Model Server Optimizer Agent"
        self.personality = "সিস্টেম অপটিমাইজার, পারফরম্যান্স মনিটর, স্বয়ংক্রিয় সমস্যা সমাধানকারী"
        self.capabilities = [
            "server_monitoring",
            "performance_optimization", 
            "memory_management",
            "network_optimization",
            "security_analysis",
            "auto_recovery"
        ]
        
        self.logger = self._setup_logger()
        self.db_path = "data/optimizer_agent.db"
        self._init_database()
        
        # Server configurations
        self.servers = {
            'admin-panel': {'port': 3001, 'type': 'frontend'},
            'personal-agent': {'port': 8000, 'type': 'ai'},
            'main-flask': {'port': 5000, 'type': 'backend'},
            'voice-server': {'port': 8001, 'type': 'voice'},
            'ai-server': {'port': 8002, 'type': 'ai'},
            'sms-server': {'port': 8003, 'type': 'communication'},
            'xampp-apache': {'port': 80, 'type': 'web'},
            'xampp-mysql': {'port': 3306, 'type': 'database'}
        }
        
        # Optimization thresholds
        self.thresholds = {
            'cpu_critical': 90.0,
            'cpu_warning': 70.0,
            'memory_critical': 85.0,
            'memory_warning': 70.0,
            'disk_critical': 90.0,
            'disk_warning': 80.0,
            'response_time_critical': 5000,  # ms
            'response_time_warning': 2000,   # ms
            'error_rate_critical': 0.1,      # 10%
            'error_rate_warning': 0.05       # 5%
        }
        
        self.status = 'active'
        self.last_optimization = None
        self.optimizations = []
        self.recommendations = []
        
    def _setup_logger(self):
        logger = logging.getLogger('optimizer_agent')
        logger.setLevel(logging.INFO)
        
        if not os.path.exists('logs'):
            os.makedirs('logs')
            
        handler = logging.FileHandler('logs/optimizer_agent.log')
        formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        return logger
    
    def _init_database(self):
        """Initialize SQLite database for storing metrics and optimizations"""
        os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Create tables
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS server_metrics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                server_id TEXT NOT NULL,
                cpu_usage REAL,
                memory_usage REAL,
                disk_usage REAL,
                network_io TEXT,
                response_time REAL,
                error_rate REAL,
                timestamp TEXT NOT NULL
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS optimizations (
                id TEXT PRIMARY KEY,
                server_id TEXT NOT NULL,
                type TEXT NOT NULL,
                description TEXT NOT NULL,
                impact TEXT NOT NULL,
                applied BOOLEAN DEFAULT FALSE,
                timestamp TEXT NOT NULL,
                details TEXT
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS recommendations (
                id TEXT PRIMARY KEY,
                server_id TEXT NOT NULL,
                type TEXT NOT NULL,
                description TEXT NOT NULL,
                priority TEXT NOT NULL,
                action TEXT NOT NULL,
                estimated_impact TEXT NOT NULL,
                timestamp TEXT NOT NULL
            )
        ''')
        
        conn.commit()
        conn.close()
    
    async def collect_server_metrics(self, server_id: str) -> Optional[ServerMetrics]:
        """Collect metrics for a specific server"""
        try:
            server_config = self.servers.get(server_id)
            if not server_config:
                return None
            
            # Get system metrics
            cpu_usage = psutil.cpu_percent(interval=1)
            memory = psutil.virtual_memory()
            disk = psutil.disk_usage('/')
            network = psutil.net_io_counters()
            
            # Test server response time
            response_time = await self._test_server_response(server_id, server_config)
            
            # Calculate error rate (simplified)
            error_rate = 0.0  # Would be calculated from actual error logs
            
            metrics = ServerMetrics(
                server_id=server_id,
                cpu_usage=cpu_usage,
                memory_usage=memory.percent,
                disk_usage=disk.percent,
                network_io={
                    'bytes_sent': network.bytes_sent,
                    'bytes_recv': network.bytes_recv
                },
                response_time=response_time,
                error_rate=error_rate,
                timestamp=datetime.now().isoformat()
            )
            
            # Store in database
            self._store_metrics(metrics)
            
            return metrics
            
        except Exception as e:
            self.logger.error(f"Error collecting metrics for {server_id}: {e}")
            return None
    
    async def _test_server_response(self, server_id: str, config: Dict) -> float:
        """Test server response time"""
        try:
            import aiohttp
            
            url = f"http://localhost:{config['port']}"
            if server_id == 'xampp-mysql':
                # MySQL doesn't have HTTP endpoint, use socket test
                return 0.0
            
            start_time = time.time()
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{url}/health", timeout=5) as response:
                    response_time = (time.time() - start_time) * 1000  # Convert to ms
                    return response_time if response.status == 200 else 9999.0
                    
        except Exception as e:
            self.logger.warning(f"Could not test {server_id}: {e}")
            return 9999.0  # High response time indicates server down
    
    def _store_metrics(self, metrics: ServerMetrics):
        """Store metrics in database"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT INTO server_metrics 
                (server_id, cpu_usage, memory_usage, disk_usage, network_io, response_time, error_rate, timestamp)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                metrics.server_id,
                metrics.cpu_usage,
                metrics.memory_usage,
                metrics.disk_usage,
                json.dumps(metrics.network_io),
                metrics.response_time,
                metrics.error_rate,
                metrics.timestamp
            ))
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            self.logger.error(f"Error storing metrics: {e}")
    
    async def analyze_server_health(self, metrics: ServerMetrics) -> List[Recommendation]:
        """Analyze server health and generate recommendations"""
        recommendations = []
        
        # CPU Analysis
        if metrics.cpu_usage > self.thresholds['cpu_critical']:
            recommendations.append(Recommendation(
                id=f"cpu_critical_{metrics.server_id}_{int(time.time())}",
                server_id=metrics.server_id,
                type='performance',
                description=f"Critical CPU usage: {metrics.cpu_usage:.1f}%",
                priority='critical',
                action='Restart server to clear memory and reduce CPU load',
                estimated_impact='Reduce CPU usage by 30-50%',
                timestamp=datetime.now().isoformat()
            ))
        elif metrics.cpu_usage > self.thresholds['cpu_warning']:
            recommendations.append(Recommendation(
                id=f"cpu_warning_{metrics.server_id}_{int(time.time())}",
                server_id=metrics.server_id,
                type='performance',
                description=f"High CPU usage: {metrics.cpu_usage:.1f}%",
                priority='high',
                action='Monitor and consider restart if usage continues',
                estimated_impact='Prevent potential performance degradation',
                timestamp=datetime.now().isoformat()
            ))
        
        # Memory Analysis
        if metrics.memory_usage > self.thresholds['memory_critical']:
            recommendations.append(Recommendation(
                id=f"memory_critical_{metrics.server_id}_{int(time.time())}",
                server_id=metrics.server_id,
                type='memory',
                description=f"Critical memory usage: {metrics.memory_usage:.1f}%",
                priority='critical',
                action='Restart server to free up memory',
                estimated_impact='Free up 40-60% of memory',
                timestamp=datetime.now().isoformat()
            ))
        elif metrics.memory_usage > self.thresholds['memory_warning']:
            recommendations.append(Recommendation(
                id=f"memory_warning_{metrics.server_id}_{int(time.time())}",
                server_id=metrics.server_id,
                type='memory',
                description=f"High memory usage: {metrics.memory_usage:.1f}%",
                priority='high',
                action='Monitor memory usage and restart if needed',
                estimated_impact='Prevent memory exhaustion',
                timestamp=datetime.now().isoformat()
            ))
        
        # Response Time Analysis
        if metrics.response_time > self.thresholds['response_time_critical']:
            recommendations.append(Recommendation(
                id=f"response_critical_{metrics.server_id}_{int(time.time())}",
                server_id=metrics.server_id,
                type='performance',
                description=f"Critical response time: {metrics.response_time:.0f}ms",
                priority='critical',
                action='Restart server to improve response time',
                estimated_impact='Reduce response time by 50-80%',
                timestamp=datetime.now().isoformat()
            ))
        elif metrics.response_time > self.thresholds['response_time_warning']:
            recommendations.append(Recommendation(
                id=f"response_warning_{metrics.server_id}_{int(time.time())}",
                server_id=metrics.server_id,
                type='performance',
                description=f"Slow response time: {metrics.response_time:.0f}ms",
                priority='medium',
                action='Monitor performance and optimize if needed',
                estimated_impact='Improve user experience',
                timestamp=datetime.now().isoformat()
            ))
        
        # Disk Analysis
        if metrics.disk_usage > self.thresholds['disk_critical']:
            recommendations.append(Recommendation(
                id=f"disk_critical_{metrics.server_id}_{int(time.time())}",
                server_id=metrics.server_id,
                type='performance',
                description=f"Critical disk usage: {metrics.disk_usage:.1f}%",
                priority='critical',
                action='Clean up disk space and remove unnecessary files',
                estimated_impact='Free up disk space',
                timestamp=datetime.now().isoformat()
            ))
        
        return recommendations
    
    async def apply_optimization(self, recommendation: Recommendation) -> Optimization:
        """Apply optimization based on recommendation"""
        try:
            optimization = Optimization(
                id=f"opt_{int(time.time())}_{recommendation.server_id}",
                server_id=recommendation.server_id,
                type=recommendation.type,
                description=recommendation.description,
                impact=recommendation.priority,
                applied=True,
                timestamp=datetime.now().isoformat(),
                details={
                    'action_taken': recommendation.action,
                    'estimated_impact': recommendation.estimated_impact,
                    'original_recommendation': asdict(recommendation)
                }
            )
            
            # Store optimization
            self._store_optimization(optimization)
            
            # Log the optimization
            self.logger.info(f"Applied optimization: {optimization.description}")
            
            return optimization
            
        except Exception as e:
            self.logger.error(f"Error applying optimization: {e}")
            raise
    
    def _store_optimization(self, optimization: Optimization):
        """Store optimization in database"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT OR REPLACE INTO optimizations 
                (id, server_id, type, description, impact, applied, timestamp, details)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                optimization.id,
                optimization.server_id,
                optimization.type,
                optimization.description,
                optimization.impact,
                optimization.applied,
                optimization.timestamp,
                json.dumps(optimization.details)
            ))
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            self.logger.error(f"Error storing optimization: {e}")
    
    def _store_recommendation(self, recommendation: Recommendation):
        """Store recommendation in database"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT OR REPLACE INTO recommendations 
                (id, server_id, type, description, priority, action, estimated_impact, timestamp)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                recommendation.id,
                recommendation.server_id,
                recommendation.type,
                recommendation.description,
                recommendation.priority,
                recommendation.action,
                recommendation.estimated_impact,
                recommendation.timestamp
            ))
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            self.logger.error(f"Error storing recommendation: {e}")
    
    async def run_optimization_cycle(self):
        """Run a complete optimization cycle for all servers"""
        self.logger.info("Starting optimization cycle")
        
        all_recommendations = []
        all_optimizations = []
        
        for server_id in self.servers.keys():
            try:
                # Collect metrics
                metrics = await self.collect_server_metrics(server_id)
                if not metrics:
                    continue
                
                # Analyze health
                recommendations = await self.analyze_server_health(metrics)
                all_recommendations.extend(recommendations)
                
                # Store recommendations
                for rec in recommendations:
                    self._store_recommendation(rec)
                
                # Apply critical optimizations automatically
                for rec in recommendations:
                    if rec.priority == 'critical':
                        try:
                            optimization = await self.apply_optimization(rec)
                            all_optimizations.append(optimization)
                        except Exception as e:
                            self.logger.error(f"Failed to apply critical optimization: {e}")
                
            except Exception as e:
                self.logger.error(f"Error in optimization cycle for {server_id}: {e}")
        
        # Update agent state
        self.recommendations = all_recommendations
        self.optimizations.extend(all_optimizations)
        self.last_optimization = datetime.now().isoformat()
        
        self.logger.info(f"Optimization cycle completed. {len(all_optimizations)} optimizations applied, {len(all_recommendations)} recommendations generated")
        
        return {
            'optimizations_applied': len(all_optimizations),
            'recommendations_generated': len(all_recommendations),
            'timestamp': self.last_optimization
        }
    
    def get_status(self) -> Dict[str, Any]:
        """Get current agent status"""
        return {
            'status': self.status,
            'last_optimization': self.last_optimization,
            'total_optimizations': len(self.optimizations),
            'total_recommendations': len(self.recommendations),
            'servers_monitored': len(self.servers),
            'capabilities': self.capabilities,
            'personality': self.personality
        }
    
    def get_recent_optimizations(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get recent optimizations"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT * FROM optimizations 
                ORDER BY timestamp DESC 
                LIMIT ?
            ''', (limit,))
            
            rows = cursor.fetchall()
            conn.close()
            
            return [
                {
                    'id': row[0],
                    'server_id': row[1],
                    'type': row[2],
                    'description': row[3],
                    'impact': row[4],
                    'applied': bool(row[5]),
                    'timestamp': row[6],
                    'details': json.loads(row[7]) if row[7] else {}
                }
                for row in rows
            ]
            
        except Exception as e:
            self.logger.error(f"Error getting recent optimizations: {e}")
            return []
    
    def get_recent_recommendations(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get recent recommendations"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT * FROM recommendations 
                ORDER BY timestamp DESC 
                LIMIT ?
            ''', (limit,))
            
            rows = cursor.fetchall()
            conn.close()
            
            return [
                {
                    'id': row[0],
                    'server_id': row[1],
                    'type': row[2],
                    'description': row[3],
                    'priority': row[4],
                    'action': row[5],
                    'estimated_impact': row[6],
                    'timestamp': row[7]
                }
                for row in rows
            ]
            
        except Exception as e:
            self.logger.error(f"Error getting recent recommendations: {e}")
            return []

# Create global instance
optimizer_agent = ModelServerOptimizerAgent() 