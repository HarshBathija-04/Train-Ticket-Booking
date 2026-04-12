<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ page import="com.train.model.User" %>
<%@ page import="com.train.dao.TrainDAO" %>
<%@ page import="com.train.model.TrainSchedule" %>
<%
    User user = (User) session.getAttribute("user");
    if (user == null) {
        response.sendRedirect("login.jsp?error=Please login to book tickets");
        return;
    }

    String scheduleIdStr = request.getParameter("scheduleId");
    TrainSchedule schedule = null;
    if (scheduleIdStr != null) {
        int scheduleId = Integer.parseInt(scheduleIdStr);
        TrainDAO dao = new TrainDAO();
        schedule = dao.getScheduleById(scheduleId);
    }

    if (schedule == null) {
        response.sendRedirect("index.jsp?error=Invalid booking request");
        return;
    }
%>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Book Ticket - Railway Reservation System</title>
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
            <a href="about.jsp">About</a>
            <a href="index.jsp">Search Train</a>
            <a href="my_bookings.jsp">My Bookings</a>
            <a href="LogoutServlet">Logout</a>
        </div>
    </nav>

    <!-- Page Subheader -->
    <div class="page-subheader">
        Book Your Ticket In <%= schedule.getTrain().getTrainName() %>
    </div>

    <!-- Train Detail Layout -->
    <div class="train-detail-layout">
        <!-- Train Image -->
        <div>
            <img class="train-detail-image"
                 src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Tejas_Express_in_Pune_%28Cropped%29.jpg/640px-Tejas_Express_in_Pune_%28Cropped%29.jpg"
                 alt="<%= schedule.getTrain().getTrainName() %>"
                 onerror="this.style.background='#1a237e';">
        </div>

        <!-- Train Info Panel -->
        <div class="train-detail-info">
            <div class="train-detail-info-header">
                <%= schedule.getTrain().getTrainName().toUpperCase() %>
            </div>
            <div class="detail-row">
                <span class="detail-label">Train No :</span>
                <span class="detail-value"><%= schedule.getTrainNumber() %></span>
            </div>
            <div class="detail-row">
                <span class="detail-label">From City :</span>
                <span class="detail-value"><%= schedule.getTrain().getSource() %></span>
            </div>
            <div class="detail-row">
                <span class="detail-label">To City :</span>
                <span class="detail-value"><%= schedule.getTrain().getDestination() %></span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Departure Time :</span>
                <span class="detail-value"><%= schedule.getTrain().getDepartureTime() %></span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Arrival Time :</span>
                <span class="detail-value"><%= schedule.getTrain().getArrivalTime() %></span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Journey Date :</span>
                <span class="detail-value"><%= schedule.getJourneyDate() %></span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Economy Fare :</span>
                <span class="detail-value">₹<%= (int)(schedule.getTrain().getFare() * 0.7) %></span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Business Fare :</span>
                <span class="detail-value">₹<%= schedule.getTrain().getFare() %></span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Available Seats :</span>
                <span class="detail-value <%= schedule.getAvailableSeats() > 0 ? "seats-available" : "seats-full" %>">
                    <%= schedule.getAvailableSeats() > 0 ? schedule.getAvailableSeats() + " seats" : "FULL" %>
                </span>
            </div>
            <div class="detail-row" style="align-items:center;">
                <span class="detail-label">Select Ticket Type :</span>
                <span class="detail-value">
                    <select name="ticketType" class="form-control" style="max-width:200px;" id="ticketTypeSelect">
                        <option value="">Select Ticket Type</option>
                        <option value="economy">Economy</option>
                        <option value="business">Business</option>
                    </select>
                </span>
            </div>
        </div>
    </div>

    <!-- Booking Form (shown below layout) -->
    <div style="padding: 0 30px 30px;">
        <% String error = request.getParameter("error");
           if (error != null) { %><div class="alert alert-error"><%= error %></div><% } %>

        <form id="bookingForm" action="BookTicketServlet" method="POST" style="display:flex; flex-wrap:wrap; gap:16px; align-items:flex-end; margin-top:4px;">
            <input type="hidden" name="scheduleId" value="<%= schedule.getId() %>">
            <input type="hidden" id="availableSeats" value="<%= schedule.getAvailableSeats() %>">
            <div class="form-group" style="min-width:180px;">
                <label>Number of Seats</label>
                <input type="number" name="seats" id="seats" class="form-control" min="1" max="6" value="1" required>
            </div>
            <div class="form-group" style="min-width:220px;">
                <label>Credit Card Number (Simulated)</label>
                <input type="text" class="form-control" placeholder="XXXX XXXX XXXX XXXX" required>
            </div>
            <div class="form-group" style="min-width:120px;">
                <label>CVV</label>
                <input type="password" class="form-control" placeholder="XXX" required>
            </div>
            <div class="form-group">
                <button type="submit" class="btn btn-primary" style="padding:10px 26px;">
                    Login To Book Ticket
                </button>
            </div>
        </form>
    </div>

    <!-- Footer -->
    <footer class="site-footer">
        Copyright &copy; All rights reserved
    </footer>

    <script src="js/script.js"></script>
</body>
</html>
