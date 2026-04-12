<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ page import="com.train.model.User" %>
<%@ page import="com.train.dao.BookingDAO" %>
<%@ page import="com.train.model.Booking" %>
<%@ page import="java.util.List" %>
<%
    User user = (User) session.getAttribute("user");
    if (user == null) {
        response.sendRedirect("login.jsp?error=Please login to view bookings");
        return;
    }

    BookingDAO dao = new BookingDAO();
    List<Booking> list = dao.getUserBookings(user.getId());

    // Check if tab requested
    String tab = request.getParameter("tab");
    boolean showDashboard = (tab == null || "dashboard".equals(tab));
    boolean showBookings = "bookings".equals(tab);
%>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>User Dashboard - Railway Reservation System</title>
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
            <a href="my_bookings.jsp" class="active">Dashboard</a>
            <a href="about.jsp">About</a>
            <a href="index.jsp">Search Train</a>
            <a href="my_bookings.jsp?tab=bookings">My Bookings</a>
            <a href="#">My Account</a>
            <a href="LogoutServlet">Logout</a>
        </div>
    </nav>

    <div class="dashboard-wrapper">
        <h2>User Dashboard</h2>

        <% String msg = request.getParameter("msg");
           String error = request.getParameter("error");
           if (msg != null) { %><div class="alert alert-success"><%= msg %></div><% }
           if (error != null) { %><div class="alert alert-error"><%= error %></div><% } %>

        <% if (showDashboard) { %>
        <!-- Dashboard Tab: Menu + Banner Image -->
        <div class="dashboard-layout">
            <div class="dashboard-menu">
                <a href="index.jsp">Home</a>
                <a href="my_bookings.jsp">Dashboard</a>
                <a href="about.jsp">About</a>
                <a href="index.jsp">Search Train</a>
                <a href="my_bookings.jsp?tab=bookings">My Bookings</a>
                <a href="#">My Account</a>
                <a href="LogoutServlet">Logout</a>
            </div>
            <div class="dashboard-image-block">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/A_man_at_Railway_station.jpg/640px-A_man_at_Railway_station.jpg"
                     alt="Bookings Open"
                     onerror="this.style.background='#1a237e';this.removeAttribute('src');">
                <div class="bookings-open-badge">Bookings<br>Open</div>
            </div>
        </div>
        <% } %>

        <% if (showBookings || !showDashboard) { %>
        <!-- My Bookings Tab: Table -->
        <h3 style="font-size:1rem; font-weight:700; margin:20px 0 12px; color:#333;">My Ticket History</h3>
        <% if (list != null && !list.isEmpty()) { %>
            <div class="table-responsive">
                <table>
                    <thead>
                        <tr>
                            <th>Booking ID</th>
                            <th>Train</th>
                            <th>Route</th>
                            <th>Date</th>
                            <th>Seats</th>
                            <th>Fare</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <% for (Booking b : list) { %>
                            <tr>
                                <td>BKG-<%= String.format("%04d", b.getBookingId()) %></td>
                                <td><%= b.getTrainName() %> (<%= b.getTrainNumber() %>)</td>
                                <td><%= b.getSource() %> to <%= b.getDestination() %></td>
                                <td><%= b.getJourneyDate() %></td>
                                <td><%= b.getNoOfSeats() %></td>
                                <td>₹<%= b.getTotalFare() %></td>
                                <td>
                                    <% if ("CONFIRMED".equals(b.getBookingStatus())) { %>
                                        <span class="status-confirmed">Confirmed</span>
                                    <% } else { %>
                                        <span class="status-cancelled">Cancelled</span>
                                    <% } %>
                                </td>
                                <td>
                                    <% if ("CONFIRMED".equals(b.getBookingStatus())) { %>
                                        <form class="cancelForm" action="CancelTicketServlet" method="POST" style="display:inline;">
                                            <input type="hidden" name="bookingId" value="<%= b.getBookingId() %>">
                                            <button type="submit" class="btn btn-danger" style="padding:5px 12px; font-size:0.82em;">Cancel</button>
                                        </form>
                                    <% } else { %>
                                        <span style="color:gray; font-size:0.85rem;">N/A</span>
                                    <% } %>
                                </td>
                            </tr>
                        <% } %>
                    </tbody>
                </table>
            </div>
        <% } else { %>
            <p style="color:#555; font-size:0.95rem;">
                You have not booked any tickets yet.
                <a href="index.jsp" style="color:#1a237e; font-weight:600; text-decoration:none;">Search for trains</a>
            </p>
        <% } %>
        <% } %>
    </div>

    <!-- Footer -->
    <footer class="site-footer">
        Copyright &copy; All rights reserved
    </footer>

    <script src="js/script.js"></script>
</body>
</html>
