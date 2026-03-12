-- Nutri-Global Explorer Database Schema

-- 1. Products Table: Stores the searchable database of food items
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT NOT NULL,
  brand TEXT,
  category TEXT,
  nutri_score CHAR(1) CHECK (nutri_score IN ('A', 'B', 'C', 'D', 'E')),
  image_url TEXT,
  energy NUMERIC, -- per 100g (kJ)
  sugars NUMERIC, -- per 100g (g)
  saturated_fat NUMERIC, -- per 100g (g)
  sodium NUMERIC, -- per 100g (mg)
  protein NUMERIC, -- per 100g (g)
  fiber NUMERIC, -- per 100g (g)
  metadata JSONB -- for any additional AI-extracted data
);

-- 2. Scan History: Tracks user scans
CREATE TABLE scan_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  product_name TEXT,
  image_path TEXT, -- pointer to storage bucket if image is saved
  nutri_score CHAR(1),
  extraction_raw JSONB -- the full JSON returned by Gemini
);

-- 3. Sample Data
INSERT INTO products (name, brand, category, nutri_score, image_url, energy, sugars)
VALUES 
('Kit Kat Chunky', 'Nestle', 'Snacks', 'E', null, 2180, 50),
('Fresh Broccoli', 'Nature', 'Vegetables', 'A', null, 140, 1.7),
('Oat Milk (Unsweetened)', 'Oatly', 'Beverages', 'B', null, 193, 0),
('Cheese Pizza (Frozen)', 'Dr. Oetker', 'Meals', 'D', null, 950, 3.5);
