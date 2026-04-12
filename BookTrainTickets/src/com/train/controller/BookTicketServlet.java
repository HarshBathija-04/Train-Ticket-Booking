package com.train.controller;

import com.train.dao.BookingDAO;
import com.train.dao.TrainDAO;
import com.train.model.Booking;
import com.train.model.TrainSchedule;
import com.train.model.User;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;
import java.io.IOException;

@WebServlet("/BookTicketServlet")
public class BookTicketServlet extends HttpServlet {
    
    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        HttpSession session = request.getSession();
        User user = (User) session.getAttribute("user");
        
        if (user == null) {
            response.sendRedirect("login.jsp?error=Please login to book tickets");
            return;
        }

        try {
            int scheduleId = Integer.parseInt(request.getParameter("scheduleId"));
            int seats = Integer.parseInt(request.getParameter("seats"));
            
            TrainDAO trainDAO = new TrainDAO();
            TrainSchedule schedule = trainDAO.getScheduleById(scheduleId);
            
            if (schedule != null && schedule.getAvailableSeats() >= seats) {
                double totalFare = schedule.getTrain().getFare() * seats;
                
                Booking booking = new Booking();
                booking.setUserId(user.getId());
                booking.setScheduleId(scheduleId);
                booking.setNoOfSeats(seats);
                booking.setTotalFare(totalFare);
                
                BookingDAO bookingDAO = new BookingDAO();
                if (bookingDAO.bookTicket(booking)) {
                    response.sendRedirect("my_bookings.jsp?msg=Booking Successful! Payment Simulated.");
                } else {
                    response.sendRedirect("booking.jsp?scheduleId=" + scheduleId + "&error=Booking Failed, Try Again");
                }
            } else {
                response.sendRedirect("booking.jsp?scheduleId=" + scheduleId + "&error=Not enough seats available");
            }
        } catch (Exception e) {
            e.printStackTrace();
            response.sendRedirect("index.jsp?error=Invalid Request");
        }
    }
}
