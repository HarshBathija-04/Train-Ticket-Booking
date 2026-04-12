package com.train.dao;

import com.train.model.Booking;
import com.train.model.TrainSchedule;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class BookingDAO {
    
    private static List<Booking> bookings = new ArrayList<>();
    private static int bookingIdCounter = 1;

    public boolean bookTicket(Booking booking) {
        TrainSchedule schedule = new TrainDAO().getScheduleById(booking.getScheduleId());
        if (schedule != null && schedule.getAvailableSeats() >= booking.getNoOfSeats()) {
            schedule.setAvailableSeats(schedule.getAvailableSeats() - booking.getNoOfSeats());
            booking.setBookingId(bookingIdCounter++);
            booking.setBookingStatus("CONFIRMED");
            booking.setTrainName(schedule.getTrain().getTrainName());
            booking.setTrainNumber(schedule.getTrain().getTrainNumber());
            booking.setSource(schedule.getTrain().getSource());
            booking.setDestination(schedule.getTrain().getDestination());
            booking.setJourneyDate(schedule.getJourneyDate());
            bookings.add(0, booking); // prepend
            return true;
        }
        return false;
    }

    public List<Booking> getUserBookings(int userId) {
        return bookings.stream()
                .filter(b -> b.getUserId() == userId)
                .collect(Collectors.toList());
    }

    public boolean cancelTicket(int bookingId) {
        for (Booking b : bookings) {
            if (b.getBookingId() == bookingId && "CONFIRMED".equals(b.getBookingStatus())) {
                b.setBookingStatus("CANCELLED");
                TrainSchedule schedule = new TrainDAO().getScheduleById(b.getScheduleId());
                if (schedule != null) {
                    schedule.setAvailableSeats(schedule.getAvailableSeats() + b.getNoOfSeats());
                }
                return true;
            }
        }
        return false;
    }

    public List<Booking> getAllBookings() {
        return new ArrayList<>(bookings);
    }
}
