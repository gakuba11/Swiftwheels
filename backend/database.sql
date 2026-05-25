CREATE DATABASE IF NOT EXISTS swiftwheels;
USE swiftwheels;

CREATE TABLE IF NOT EXISTS buses (
  bus_id INT AUTO_INCREMENT PRIMARY KEY,
  plate_number VARCHAR(30) NOT NULL UNIQUE,
  total_seats INT NOT NULL
);

CREATE TABLE IF NOT EXISTS routes (
  r_id INT AUTO_INCREMENT PRIMARY KEY,
  source VARCHAR(100) NOT NULL,
  destination VARCHAR(100) NOT NULL,
  price DECIMAL(10, 2) NOT NULL
);

CREATE TABLE IF NOT EXISTS schedules (
  sch_id INT AUTO_INCREMENT PRIMARY KEY,
  bus_id INT NOT NULL,
  r_id INT NOT NULL,
  departure_time DATETIME NOT NULL,
  FOREIGN KEY (bus_id) REFERENCES buses(bus_id) ON DELETE CASCADE,
  FOREIGN KEY (r_id) REFERENCES routes(r_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tickets (
  ticket_id INT AUTO_INCREMENT PRIMARY KEY,
  customer_name VARCHAR(120) NOT NULL,
  sch_id INT NOT NULL,
  seat_number INT NOT NULL,
  FOREIGN KEY (sch_id) REFERENCES schedules(sch_id) ON DELETE CASCADE,
  UNIQUE (sch_id, seat_number)
);

CREATE TABLE IF NOT EXISTS users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(120) NOT NULL UNIQUE,
  phone VARCHAR(30),
  password VARCHAR(255) NOT NULL DEFAULT '',
  role ENUM('customer', 'fleet manager') DEFAULT 'customer'
);

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS password VARCHAR(255) NOT NULL DEFAULT '' AFTER phone;

INSERT INTO buses (plate_number, total_seats)
VALUES
  ('SW-1001', 40),
  ('SW-2002', 32)
ON DUPLICATE KEY UPDATE plate_number = plate_number;

INSERT INTO routes (source, destination, price)
VALUES
  ('Johannesburg', 'Cape Town', 850.00),
  ('Pretoria', 'Durban', 520.00);
