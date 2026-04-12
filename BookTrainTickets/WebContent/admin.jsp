<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ page import="com.train.model.User" %>
<%@ page import="com.train.dao.BookingDAO" %>
<%@ page import="com.train.model.Booking" %>
<%@ page import="java.util.List" %>
<%
    User user = (User) session.getAttribute("user");
    if (user == null || !"ADMIN".equals(user.getRole())) {
        response.sendRedirect("login.jsp?error=Access Denied. Admin privileges required.");
        return;
    }

    BookingDAO dao = new BookingDAO();
    List<Booking> allBookings = dao.getAllBookings();
    
    int totalBookings = 0;
    int cancelledBookings = 0;
    double totalRevenue = 0;
    
    for(Booking b : allBookings) {
        if("CONFIRMED".equals(b.getBookingStatus())) {
            totalBookings++;
            totalRevenue += b.getTotalFare();
        } else {
            cancelledBookings++;
        }
    }
%>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard - Railway Reservation System</title>
    <link rel="stylesheet" href="css/style.css">
</head>
<body>

    <!-- Site Header -->
    <div class="site-header">
        <a href="index.jsp" class="brand-title">Railway <span>Reservation System</span></a>
    </div>

    <!-- Navbar -->
    <nav class="navbar">
        <div class="nav-links">
            <a href="index.jsp">Home</a>
            <a href="admin.jsp" class="active">Dashboard</a>
            <a href="about.jsp">About</a>
            <a href="index.jsp">Search Train</a>
            <a href="LogoutServlet">Logout</a>
        </div>
    </nav>

    <div class="dashboard-wrapper" style="max-width:1300px;">
        <h2>Admin Dashboard</h2>
        <p style="color:#666; font-size:0.9rem; margin-bottom:20px;">Overview of the Railway Reservation System</p>

        <!-- Stat Cards -->
        <div class="stat-cards">
            <div class="stat-card">
                <h3>Total Confirmed Bookings</h3>
                <div class="stat-value"><%= totalBookings %></div>
            </div>
            <div class="stat-card">
                <h3>Total Revenue</h3>
                <div class="stat-value">₹<%= String.format("%.0f", totalRevenue) %></div>
            </div>
            <div class="stat-card">
                <h3>Cancelled Tickets</h3>
                <div class="stat-value" style="color:#c62828;"><%= cancelledBookings %></div>
            </div>
        </div>

        <!-- Transactions Table -->
        <h3 style="font-size:1rem; font-weight:700; color:#333; margin-bottom:14px;">All Transaction Records</h3>
        <div class="table-responsive">
            <table>
                <thead>
                    <tr>
                        <th>Booking ID</th>
                        <th>User ID</th>
                        <th>Train</th>
                        <th>Route</th>
                        <th>Date</th>
                        <th>Seats</th>
                        <th>Fare</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    <% if(allBookings != null && !allBookings.isEmpty()) {
                        for(Booking b : allBookings) { %>
                        <tr>
                            <td>BKG-<%= String.format("%04d", b.getBookingId()) %></td>
                            <td>UID-<%= String.format("%03d", b.getUserId()) %></td>
                            <td><%= b.getTrainName() %> (<%= b.getTrainNumber() %>)</td>
                            <td><%= b.getSource() %> to <%= b.getDestination() %></td>
                            <td><%= b.getJourneyDate() %></td>
                            <td><%= b.getNoOfSeats() %></td>
                            <td>₹<%= b.getTotalFare() %></td>
                            <td>
                                <% if ("CONFIRMED".equals(b.getBookingStatus())) { %>
                                    <span class="status-confirmed">CONFIRMED</span>
                                <% } else { %>
                                    <span class="status-cancelled">CANCELLED</span>
                                <% } %>
                            </td>
                        </tr>
                    <% } 
                    } else { %>
                        <tr><td colspan="8" class="text-center">No bookings found in the system.</td></tr>
                    <% } %>
                </tbody>
            </table>
        </div>
    </div>

    <!-- Footer -->
    <footer class="site-footer">
        Copyright &copy; All rights reserved
    </footer>

</body>
</html>
