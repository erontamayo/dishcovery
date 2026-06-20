-- Dishcovery database schema
-- Run this once against your Aiven MySQL database (defaultdb)
-- via Aiven's web SQL console, or: mysql -h <host> -P <port> -u avnadmin -p --ssl-mode=REQUIRED defaultdb < schema.sql

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'student',
  reset_token VARCHAR(255) DEFAULT NULL,
  reset_expires BIGINT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS dishes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  image_url VARCHAR(500),
  difficulty_level VARCHAR(50) DEFAULT 'beginner',
  prep_time INT DEFAULT 0,
  cook_time INT DEFAULT 0,
  servings INT DEFAULT 2,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS recipes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  dish_id INT NOT NULL,
  ingredients_json JSON,
  instructions TEXT NOT NULL,
  techniques_used JSON,
  allergens JSON,
  dietary_info JSON,
  nutrition_info JSON,
  FOREIGN KEY (dish_id) REFERENCES dishes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS techniques (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  video_url VARCHAR(500),
  image_url VARCHAR(500),
  difficulty VARCHAR(50) DEFAULT 'beginner'
);

CREATE TABLE IF NOT EXISTS reflection_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  dish_id INT DEFAULT NULL,
  recipe_title VARCHAR(255) NOT NULL,
  notes TEXT NOT NULL,
  rating INT DEFAULT 5,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (dish_id) REFERENCES dishes(id) ON DELETE SET NULL
);
