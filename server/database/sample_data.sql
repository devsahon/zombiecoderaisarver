-- ZombieCoder AI - Sample Database Data
-- This file contains sample data for the Windows package

-- Users table sample data
INSERT OR REPLACE INTO users (id, username, email, password_hash, role, created_at) VALUES
(1, 'admin', 'admin@zombiecoder.ai', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iQeO', 'admin', '2024-01-01 00:00:00'),
(2, 'user1', 'user1@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iQeO', 'user', '2024-01-01 00:00:00'),
(3, 'user2', 'user2@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iQeO', 'user', '2024-01-01 00:00:00');

-- AI Agents sample data
INSERT OR REPLACE INTO ai_agents (id, name, description, capabilities, status, created_at) VALUES
(1, 'Personal Assistant', 'আপনার ব্যক্তিগত সহকারী', '["chat", "reminders", "calendar"]', 'active', '2024-01-01 00:00:00'),
(2, 'Code Helper', 'প্রোগ্রামিং সহায়তা', '["code_generation", "debugging", "documentation"]', 'active', '2024-01-01 00:00:00'),
(3, 'Content Writer', 'বিষয়বস্তু লেখার সহায়তা', '["article_writing", "blog_posts", "social_media"]', 'active', '2024-01-01 00:00:00'),
(4, 'Voice Assistant', 'কণ্ঠস্বর সহায়তা', '["tts", "stt", "voice_commands"]', 'active', '2024-01-01 00:00:00'),
(5, 'Video Creator', 'ভিডিও তৈরি সহায়তা', '["video_generation", "editing", "animation"]', 'active', '2024-01-01 00:00:00');

-- Conversations sample data
INSERT OR REPLACE INTO conversations (id, user_id, agent_id, title, created_at) VALUES
(1, 1, 1, 'সকালের কাজের তালিকা', '2024-01-01 09:00:00'),
(2, 1, 2, 'Python কোড ডিবাগিং', '2024-01-01 10:00:00'),
(3, 2, 3, 'ব্লগ পোস্ট লেখা', '2024-01-01 11:00:00');

-- Messages sample data
INSERT OR REPLACE INTO messages (id, conversation_id, sender_type, content, timestamp) VALUES
(1, 1, 'user', 'আজ আমার কি কি কাজ আছে?', '2024-01-01 09:00:00'),
(2, 1, 'assistant', 'আপনার আজকের কাজের তালিকা:\n1. মিটিং - সকাল ১০টা\n2. প্রজেক্ট রিভিউ - দুপুর ২টা\n3. ইমেইল চেক - বিকাল ৪টা', '2024-01-01 09:00:01'),
(3, 2, 'user', 'এই Python কোডে error আসছে', '2024-01-01 10:00:00'),
(4, 2, 'assistant', 'কোডটি দেখতে পারি? তাহলে error ঠিক করে দিতে পারব।', '2024-01-01 10:00:01');

-- Licenses sample data
INSERT OR REPLACE INTO licenses (id, user_id, license_key, type, status, expires_at, created_at) VALUES
(1, 1, 'ZC-ADMIN-2024-001', 'admin', 'active', '2025-01-01 00:00:00', '2024-01-01 00:00:00'),
(2, 2, 'ZC-USER-2024-001', 'user', 'active', '2024-12-31 00:00:00', '2024-01-01 00:00:00'),
(3, 3, 'ZC-USER-2024-002', 'user', 'active', '2024-12-31 00:00:00', '2024-01-01 00:00:00');

-- Products sample data
INSERT OR REPLACE INTO products (id, name, description, price, category, stock, created_at) VALUES
(1, 'AI Assistant Pro', 'প্রফেশনাল AI সহকারী', 999.00, 'software', 100, '2024-01-01 00:00:00'),
(2, 'Voice System', 'বাংলা কণ্ঠস্বর সিস্টেম', 499.00, 'software', 50, '2024-01-01 00:00:00'),
(3, 'Video Creator', 'AI ভিডিও তৈরি টুল', 799.00, 'software', 75, '2024-01-01 00:00:00');

-- Orders sample data
INSERT OR REPLACE INTO orders (id, user_id, total_amount, status, created_at) VALUES
(1, 2, 999.00, 'completed', '2024-01-01 12:00:00'),
(2, 3, 1498.00, 'pending', '2024-01-01 13:00:00');

-- Order items sample data
INSERT OR REPLACE INTO order_items (id, order_id, product_id, quantity, price) VALUES
(1, 1, 1, 1, 999.00),
(2, 2, 2, 1, 499.00),
(3, 2, 3, 1, 799.00); 