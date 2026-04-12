<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ page import="java.util.List" %>
<%@ page import="com.train.model.TrainSchedule" %>
<%@ page import="com.train.model.User" %>
<%
    User user = (User) session.getAttribute("user");
    List<TrainSchedule> schedules = (List<TrainSchedule>) request.getAttribute("schedules");
    String source = (String) request.getAttribute("source");
    String destination = (String) request.getAttribute("destination");
    String date = (String) request.getAttribute("date");
%>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Search Trains - Railway Reservation System</title>
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
            <a href="index.jsp" class="active">Search Train</a>
            <% if (user != null) { %>
                <a href="my_bookings.jsp">My Bookings</a>
                <a href="LogoutServlet">Logout</a>
            <% } else { %>
                <a href="login.jsp">Customer Login</a>
                <a href="register.jsp">Registration</a>
                <a href="#">Contact</a>
                <a href="#">Feedback</a>
            <% } %>
        </div>
    </nav>

    <!-- Page Subheader -->
    <div class="search-bar-section">Search Your Train</div>

    <!-- Inline Search Filter Bar -->
    <div class="search-filter-row">
        <label>Search :</label>
        <form action="SearchTrainServlet" method="GET" style="display:flex; align-items:center; gap:10px; flex-wrap:wrap; flex:1;">
            <select name="source" class="form-control">
                <option value="">Select From City</option>
                <option value="Delhi" <%= "Delhi".equals(source) ? "selected" : "" %>>Delhi</option>
                <option value="New Delhi" <%= "New Delhi".equals(source) ? "selected" : "" %>>New Delhi</option>
                <option value="Mumbai" <%= "Mumbai".equals(source) ? "selected" : "" %>>Mumbai</option>
                <option value="Bengaluru" <%= "Bengaluru".equals(source) ? "selected" : "" %>>Bengaluru</option>
                <option value="Bhopal" <%= "Bhopal".equals(source) ? "selected" : "" %>>Bhopal</option>
                <option value="Lucknow" <%= "Lucknow".equals(source) ? "selected" : "" %>>Lucknow</option>
                <option value="Gaya" <%= "Gaya".equals(source) ? "selected" : "" %>>Gaya</option>
                <option value="Chennai" <%= "Chennai".equals(source) ? "selected" : "" %>>Chennai</option>
                <option value="Kolkata" <%= "Kolkata".equals(source) ? "selected" : "" %>>Kolkata</option>
            </select>
            <select name="destination" class="form-control">
                <option value="">Select To City</option>
                <option value="Delhi" <%= "Delhi".equals(destination) ? "selected" : "" %>>Delhi</option>
                <option value="New Delhi" <%= "New Delhi".equals(destination) ? "selected" : "" %>>New Delhi</option>
                <option value="Mumbai" <%= "Mumbai".equals(destination) ? "selected" : "" %>>Mumbai</option>
                <option value="Bengaluru" <%= "Bengaluru".equals(destination) ? "selected" : "" %>>Bengaluru</option>
                <option value="Bhopal" <%= "Bhopal".equals(destination) ? "selected" : "" %>>Bhopal</option>
                <option value="Lucknow" <%= "Lucknow".equals(destination) ? "selected" : "" %>>Lucknow</option>
                <option value="Gaya" <%= "Gaya".equals(destination) ? "selected" : "" %>>Gaya</option>
                <option value="Chennai" <%= "Chennai".equals(destination) ? "selected" : "" %>>Chennai</option>
                <option value="Kolkata" <%= "Kolkata".equals(destination) ? "selected" : "" %>>Kolkata</option>
            </select>
            <select name="passengers" class="form-control" style="max-width:170px;">
                <option value="1">1 Passenger</option>
                <option value="2">2 Passengers</option>
                <option value="3">3 Passengers</option>
            </select>
            <input type="date" name="date" class="form-control" value="<%= date != null ? date : "" %>" style="max-width:180px;">
            <button type="submit" class="btn btn-search">Search</button>
            <a href="index.jsp" class="btn btn-reset">Reset</a>
        </form>
    </div>

    <!-- Results -->
    <% if (schedules != null && !schedules.isEmpty()) { %>
        <div class="result-cards-grid">
            <% for(TrainSchedule ts : schedules) { %>
                <div class="result-card">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Tejas_Express_in_Pune_%28Cropped%29.jpg/640px-Tejas_Express_in_Pune_%28Cropped%29.jpg"
                         alt="<%= ts.getTrain().getTrainName() %>"
                         onerror="this.style.background='#1a237e';this.style.height='180px';this.removeAttribute('src');">
                    <div class="result-card-body">
                        <h4><%= ts.getTrain().getTrainName() %></h4>
                        <div class="result-card-meta">
                            <span>Business Fare : ₹<%= ts.getTrain().getFare() %></span>
                            <span>Economy Fare : ₹<%= (int)(ts.getTrain().getFare() * 0.7) %></span>
                        </div>
                        <div class="result-card-route">
                            Destination : <%= source %> to <%= destination %>
                        </div>
                    </div>
                    <div class="result-card-action">
                        <% if (ts.getAvailableSeats() > 0) { %>
                            <a href="booking.jsp?scheduleId=<%= ts.getId() %>" class="btn btn-success" style="font-size:0.85rem; padding:7px 18px;">Book Now</a>
                        <% } else { %>
                            <button class="btn btn-danger" disabled style="font-size:0.85rem; padding:7px 18px; opacity:0.6; cursor:not-allowed;">Full</button>
                        <% } %>
                    </div>
                </div>
            <% } %>
        </div>
    <% } else { %>
        <div style="padding: 30px;">
            <div class="alert alert-error">
                No trains found for this route and date. Try another date or route.
            </div>
            <a href="index.jsp" class="btn btn-primary" style="display:inline-block; width:auto;">Back to Search</a>
        </div>
    <% } %>

    <!-- Footer -->
    <footer class="site-footer">
        Copyright &copy; All rights reserved
    </footer>

</body>
</html>
