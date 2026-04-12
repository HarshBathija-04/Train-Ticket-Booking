package com.train.controller;

import com.train.dao.BookingDAO;
import com.train.model.User;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;
import java.io.IOException;

@WebServlet("/CancelTicketServlet")
public class CancelTicketServlet extends HttpServlet {
    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        HttpSession session = request.getSession();
        User user = (User) session.getAttribute("user");
        if (user == null) {
            response.sendRedirect("login.jsp?error=Please login");
            return;
        }

        int bookingId = Integer.parseInt(request.getParameter("bookingId"));
        BookingDAO dao = new BookingDAO();
        if (dao.cancelTicket(bookingId)) {
            response.sendRedirect("my_bookings.jsp?msg=Ticket Cancelled Successfully");
        } else {
            response.sendRedirect("my_bookings.jsp?error=Cancellation Failed");
        }
    }
}
