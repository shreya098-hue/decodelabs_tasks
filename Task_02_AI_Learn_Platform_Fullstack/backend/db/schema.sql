-- Run this file once to setup your database
-- psql -U postgres -d ailearn_db -f schema.sql

-- Users table (for auth)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Contact form submissions
CREATE TABLE IF NOT EXISTS contacts (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Course enrollments
CREATE TABLE IF NOT EXISTS enrollments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  course_name VARCHAR(100) NOT NULL,
  enrolled_at TIMESTAMP DEFAULT NOW()
);

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
  id SERIAL PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Seed some courses
INSERT INTO courses (title, description, price) VALUES
  ('Machine Learning', 'Learn algorithms, prediction models and data analysis.', 999),
  ('Deep Learning', 'Build neural networks and advanced AI applications.', 1499),
  ('Generative AI', 'Create AI-powered content, images and applications.', 1999),
  ('Prompt Engineering', 'Master ChatGPT and modern AI prompting techniques.', 799),
  ('Computer Vision', 'Teach machines to understand images and videos.', 1299),
  ('Natural Language Processing', 'Build chatbots and language understanding systems.', 1399)
ON CONFLICT DO NOTHING;
