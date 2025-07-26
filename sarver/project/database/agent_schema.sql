CREATE TABLE IF NOT EXISTS agents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(64) NOT NULL,
  personality TEXT,
  preferred_provider VARCHAR(64),
  fallback_order TEXT,
  active TINYINT(1) DEFAULT 1
); 