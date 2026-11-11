export type ClassCode = '1A' | '2A' | '3A' | 'SL' | 'CC' | 'EC';

export interface Station {
  code: string;
  name: string;
  city: string;
  state?: string;
}

export interface ClassAvailability {
  classCode: ClassCode;
  fare: number;
  totalSeats: number;
  availableSeats: number;
}

export interface Schedule {
  scheduleId: number;
  journeyDate: string;
  trainNumber: string;
  trainName: string;
  trainType: string;
  departureTime: string;
  arrivalTime: string;
  durationMin: number;
  from: Station;
  to: Station;
  classes: ClassAvailability[];
}

export interface SeatMapData {
  classCode: ClassCode;
  totalSeats: number;
  availableSeats: number;
  booked: number[];
}

export type Gender = 'M' | 'F' | 'O';

export interface Passenger {
  name: string;
  age: number;
  gender: Gender;
  seatNo: number;
}

export interface Booking {
  pnr: string;
  noOfSeats: number;
  totalFare: number;
  paymentStatus: 'PAID' | 'PENDING';
  bookingStatus: 'CONFIRMED' | 'CANCELLED';
  bookingDate: string;
  classCode: ClassCode;
  scheduleId: number;
  journeyDate: string;
  trainNumber: string;
  trainName: string;
  departureTime: string;
  arrivalTime: string;
  durationMin: number;
  from: Station;
  to: Station;
  passengers: Passenger[];
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: 'USER' | 'ADMIN';
}

export interface AdminOverview {
  stats: { confirmedBookings: number; cancelledBookings: number; revenue: number; seatsSold: number; users: number };
  recent: {
    pnr: string;
    bookingStatus: Booking['bookingStatus'];
    totalFare: number;
    noOfSeats: number;
    bookingDate: string;
    userName: string;
    userEmail: string;
    trainNumber: string;
    trainName: string;
    classCode: ClassCode;
    journeyDate: string;
    from: string;
    to: string;
  }[];
}
