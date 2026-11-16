-- SQL Sample
/*
This file demonstrates SQL features including:
- SQL DDL (Data Definition Language)
- SQL DML (Data Manipulation Language)
- SQL queries and joins
- SQL functions and procedures
- SQL constraints and indexes
- SQL optimization and performance
*/

-- Create table
CREATE TABLE users (
    id INT PRIMARY KEY,
    name VARCHAR(50),
    age INT
);

-- Insert data
INSERT INTO users (id, name, age) VALUES (1, 'Alice', 25);

-- Select data
SELECT * FROM users WHERE age > 20;

-- Update data
UPDATE users SET age = age + 1 WHERE id = 1;

-- Delete data
DELETE FROM users WHERE id = 1;
