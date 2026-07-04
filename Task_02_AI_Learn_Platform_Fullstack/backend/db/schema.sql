DROP TABLE IF EXISTS progress CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS enrollments CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS contacts CASCADE;
DROP TABLE IF EXISTS users CASCADE;

---------------------------------------------------
-- USERS
---------------------------------------------------
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'student',
  phone VARCHAR(20),
  avatar TEXT,
  bio TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

---------------------------------------------------
-- CATEGORIES
---------------------------------------------------
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

---------------------------------------------------
-- COURSES
---------------------------------------------------
CREATE TABLE courses (
  id SERIAL PRIMARY KEY,
  category_id INTEGER REFERENCES categories(id),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  price NUMERIC(10,2) DEFAULT 0,
  thumbnail TEXT,
  level VARCHAR(50),
  duration VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

---------------------------------------------------
-- ENROLLMENTS
---------------------------------------------------
CREATE TABLE enrollments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
  status VARCHAR(30) DEFAULT 'active',
  enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, course_id)
);

---------------------------------------------------
-- ORDERS
---------------------------------------------------
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL,
  payment_status VARCHAR(30) DEFAULT 'Pending',
  payment_method VARCHAR(50),
  transaction_id VARCHAR(200),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

---------------------------------------------------
-- REVIEWS
---------------------------------------------------
CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
  rating INTEGER CHECK(rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, course_id)
);

---------------------------------------------------
-- PROGRESS
---------------------------------------------------
CREATE TABLE progress (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
  completed_percent INTEGER DEFAULT 0,
  last_video VARCHAR(200),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, course_id)
);

---------------------------------------------------
-- CONTACT
---------------------------------------------------
CREATE TABLE contacts (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

---------------------------------------------------
-- DEFAULT CATEGORIES
---------------------------------------------------
INSERT INTO categories(name) VALUES
  ('Machine Learning'),
  ('Deep Learning'),
  ('Generative AI'),
  ('Prompt Engineering'),
  ('Computer Vision'),
  ('NLP'),
  ('Data Science'),
  ('AI Ethics')
ON CONFLICT (name) DO NOTHING;

---------------------------------------------------
-- DEFAULT COURSES
---------------------------------------------------
INSERT INTO courses (category_id, title, description, price, level, duration) VALUES
  (1, 'Machine Learning Bootcamp', 'Complete ML bootcamp with hands-on projects', 999, 'Beginner', '10 Weeks'),
  (2, 'Deep Learning Masterclass', 'Master neural networks and deep learning', 1499, 'Intermediate', '12 Weeks'),
  (3, 'Generative AI Course', 'Build modern AI applications with transformers', 1999, 'Advanced', '8 Weeks'),
  (4, 'Prompt Engineering Pro', 'Master the art of prompt engineering', 799, 'Beginner', '4 Weeks'),
  (5, 'Computer Vision with Python', 'OpenCV and deep learning for vision', 1299, 'Intermediate', '6 Weeks'),
  (6, 'NLP and Chatbots', 'Build intelligent chatbots with NLP', 1399, 'Intermediate', '7 Weeks'),
  (7, 'Data Science with Python', 'Complete data science roadmap', 1499, 'Beginner', '12 Weeks'),
  (8, 'AI Ethics and Responsible AI', 'Build ethical and responsible AI systems', 599, 'All Levels', '3 Weeks')
ON CONFLICT DO NOTHING;

---------------------------------------------------
-- DEFAULT ADMIN USER (password: admin123)
---------------------------------------------------
INSERT INTO users (name, email, password, role) VALUES
  ('Admin', 'admin@ailearn.com', '$2a$10$rQZ8R8Y87f5C3nZ4q5x6Y.9Kx8mNqVwBcDfGhJkLmNoPqRsTuVwXyZ', 'admin')
ON CONFLICT (email) DO NOTHING;