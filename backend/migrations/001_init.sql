-- Ported from the original MySQL schema (BookTrainTickets/database/train_booking.sql).
-- Users, Trains, Train_Schedules and Bookings are kept; stations, per-class
-- inventory and passengers are added for class/seat selection and PNRs.

CREATE TABLE users (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  phone         VARCHAR(15),
  role          VARCHAR(10) NOT NULL DEFAULT 'USER' CHECK (role IN ('USER', 'ADMIN')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE stations (
  code  VARCHAR(6) PRIMARY KEY,
  name  VARCHAR(100) NOT NULL,
  city  VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL
);

CREATE TABLE trains (
  train_number   VARCHAR(10) PRIMARY KEY,
  train_name     VARCHAR(100) NOT NULL,
  train_type     VARCHAR(30) NOT NULL,
  source         VARCHAR(6) NOT NULL REFERENCES stations(code),
  destination    VARCHAR(6) NOT NULL REFERENCES stations(code),
  departure_time TIME NOT NULL,
  arrival_time   TIME NOT NULL,
  duration_min   INT NOT NULL CHECK (duration_min > 0),
  CHECK (source <> destination)
);
CREATE INDEX trains_route_idx ON trains (source, destination);

-- Class template per train (fare + coach capacity); copied into each schedule.
CREATE TABLE train_classes (
  train_number VARCHAR(10) NOT NULL REFERENCES trains(train_number) ON DELETE CASCADE,
  class_code   VARCHAR(3) NOT NULL CHECK (class_code IN ('1A', '2A', '3A', 'SL', 'CC', 'EC')),
  fare         NUMERIC(10, 2) NOT NULL CHECK (fare > 0),
  total_seats  INT NOT NULL CHECK (total_seats > 0),
  PRIMARY KEY (train_number, class_code)
);

CREATE TABLE train_schedules (
  id           SERIAL PRIMARY KEY,
  train_number VARCHAR(10) NOT NULL REFERENCES trains(train_number) ON DELETE CASCADE,
  journey_date DATE NOT NULL,
  UNIQUE (train_number, journey_date)
);

CREATE TABLE schedule_classes (
  id              SERIAL PRIMARY KEY,
  schedule_id     INT NOT NULL REFERENCES train_schedules(id) ON DELETE CASCADE,
  class_code      VARCHAR(3) NOT NULL,
  fare            NUMERIC(10, 2) NOT NULL,
  total_seats     INT NOT NULL,
  available_seats INT NOT NULL,
  UNIQUE (schedule_id, class_code),
  -- last line of defence against overbooking
  CHECK (available_seats >= 0 AND available_seats <= total_seats)
);

CREATE TABLE bookings (
  booking_id        SERIAL PRIMARY KEY,
  pnr               CHAR(10) NOT NULL UNIQUE,
  user_id           INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  schedule_class_id INT NOT NULL REFERENCES schedule_classes(id) ON DELETE CASCADE,
  no_of_seats       INT NOT NULL CHECK (no_of_seats BETWEEN 1 AND 6),
  total_fare        NUMERIC(10, 2) NOT NULL,
  payment_status    VARCHAR(10) NOT NULL DEFAULT 'PAID' CHECK (payment_status IN ('PAID', 'PENDING')),
  booking_status    VARCHAR(10) NOT NULL DEFAULT 'CONFIRMED' CHECK (booking_status IN ('CONFIRMED', 'CANCELLED')),
  booking_date      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX bookings_user_idx ON bookings (user_id, booking_date DESC);

CREATE TABLE passengers (
  id                SERIAL PRIMARY KEY,
  booking_id        INT NOT NULL REFERENCES bookings(booking_id) ON DELETE CASCADE,
  schedule_class_id INT NOT NULL REFERENCES schedule_classes(id) ON DELETE CASCADE,
  seat_no           INT NOT NULL CHECK (seat_no > 0),
  name              VARCHAR(100) NOT NULL,
  age               INT NOT NULL CHECK (age BETWEEN 1 AND 120),
  gender            CHAR(1) NOT NULL CHECK (gender IN ('M', 'F', 'O')),
  cancelled         BOOLEAN NOT NULL DEFAULT false
);
-- a seat can be held by at most one active passenger
CREATE UNIQUE INDEX passengers_active_seat_uidx
  ON passengers (schedule_class_id, seat_no) WHERE NOT cancelled;
