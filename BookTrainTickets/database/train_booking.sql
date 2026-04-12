CREATE DATABASE IF NOT EXISTS train_booking;
USE train_booking;

CREATE TABLE Users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(15),
    role ENUM('USER', 'ADMIN') DEFAULT 'USER'
);

CREATE TABLE Trains (
    train_number VARCHAR(10) PRIMARY KEY,
    train_name VARCHAR(100) NOT NULL,
    source VARCHAR(100) NOT NULL,
    destination VARCHAR(100) NOT NULL,
    fare DECIMAL(10, 2) NOT NULL,
    departure_time TIME NOT NULL,
    arrival_time TIME NOT NULL
);

CREATE TABLE Train_Schedules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    train_number VARCHAR(10),
    journey_date DATE NOT NULL,
    total_seats INT NOT NULL,
    available_seats INT NOT NULL,
    FOREIGN KEY (train_number) REFERENCES Trains(train_number) ON DELETE CASCADE,
    UNIQUE KEY (train_number, journey_date)
);

CREATE TABLE Bookings (
    booking_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    schedule_id INT,
    no_of_seats INT NOT NULL,
    total_fare DECIMAL(10, 2) NOT NULL,
    payment_status ENUM('PAID', 'PENDING') DEFAULT 'PAID',
    booking_status ENUM('CONFIRMED', 'CANCELLED') DEFAULT 'CONFIRMED',
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (schedule_id) REFERENCES Train_Schedules(id) ON DELETE CASCADE
);

-- Insert Dummy Data --
INSERT INTO Users (name, email, password, phone, role) VALUES 
('System Admin', 'admin@train.com', 'admin123', '0000000000', 'ADMIN'),
('Student Demo', 'student@demo.com', 'demo123', '1234567890', 'USER');

INSERT INTO Trains (train_number, train_name, source, destination, fare, departure_time, arrival_time) VALUES
('12001', 'Shatabdi Express', 'Delhi', 'Bhopal', 1200.00, '06:00:00', '14:25:00'),
('12952', 'Rajdhani Express', 'Delhi', 'Mumbai', 2500.00, '16:30:00', '08:35:00'),
('12229', 'Lucknow Mail', 'Lucknow', 'Delhi', 800.00, '22:00:00', '06:45:00');

INSERT INTO Train_Schedules (train_number, journey_date, total_seats, available_seats) VALUES
('12001', CURDATE() + INTERVAL 1 DAY, 100, 100),
('12001', CURDATE() + INTERVAL 2 DAY, 100, 100),
('12952', CURDATE() + INTERVAL 1 DAY, 200, 200),
('12229', CURDATE() + INTERVAL 1 DAY, 150, 150);
