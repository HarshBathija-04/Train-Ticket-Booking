<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ page import="com.train.model.User" %>
<%
    User user = (User) session.getAttribute("user");
%>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Railway Reservation System - Book Train Tickets Online</title>
    <link rel="stylesheet" href="css/style.css">
    <style>
        .home-hero { position: relative; width: 100%; }
        .hero-img-container { position: relative; }
        .hero-img-container img { width: 100%; height: 380px; object-fit: cover; display: block; }
        .hero-img-container::after { content: ''; position: absolute; inset: 0; background: rgba(0,0,0,0.2); }
        .search-panel {
            position: absolute;
            top: 0; left: 0; bottom: 0;
            width: 360px;
            background: rgba(26, 35, 126, 0.93);
            padding: 28px 24px;
            z-index: 2;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }
        .search-panel h2 { color: #fff; font-size: 1.15rem; font-weight: 600; margin-bottom: 16px; }
        .search-panel .form-control { background: #fff; border: none; border-radius: 3px; padding: 9px 12px; font-size: 0.9rem; }
        .search-panel .form-group { margin-bottom: 12px; }
        .btn-row { display: flex; gap: 8px; margin-top: 6px; }
        .btn-row .btn { flex: 1; padding: 9px 12px; font-size: 0.89rem; }
    </style>
</head>
<body>

    <!-- Site Header -->
    <div class="site-header">
        <a href="index.jsp" class="brand-title">Railway <span>Reservation System</span></a>
    </div>

    <!-- Navbar -->
    <nav class="navbar">
        <div class="nav-links">
            <a href="index.jsp" class="active">Home</a>
            <a href="about.jsp">About</a>
            <a href="index.jsp">Search Train</a>
            <% if (user != null) { %>
                <% if ("ADMIN".equals(user.getRole())) { %>
                    <div class="dropdown nav-links">
                        <a href="#">My Administration ▾</a>
                        <div class="dropdown-menu">
                            <a href="admin.jsp">Admin Dashboard</a>
                        </div>
                    </div>
                <% } %>
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

    <!-- Hero + Search -->
    <div class="home-hero">
        <div class="hero-img-container">
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Maharajas_Express_at_Jodhpur.jpg/1280px-Maharajas_Express_at_Jodhpur.jpg"
                 alt="Train"
                 onerror="this.style.background='#1a237e';this.style.height='380px';">
        </div>
        <div class="search-panel">
            <h2>Search Your Train</h2>

            <% String error = request.getParameter("error");
               if (error != null) { %>
               <div class="alert alert-error"><%= error %></div>
            <% } %>

            <form action="SearchTrainServlet" method="GET">
                <div class="form-group">
                    <select name="source" class="form-control" required>
                        <option value="">Select From City</option>
                        <option value="Delhi">Delhi</option>
                        <option value="New Delhi">New Delhi</option>
                        <option value="Mumbai">Mumbai</option>
                        <option value="Bengaluru">Bengaluru</option>
                        <option value="Bhopal">Bhopal</option>
                        <option value="Lucknow">Lucknow</option>
                        <option value="Gaya">Gaya</option>
                        <option value="Chennai">Chennai</option>
                        <option value="Kolkata">Kolkata</option>
                        <option value="Hyderabad">Hyderabad</option>
                    </select>
                </div>
                <div class="form-group">
                    <select name="destination" class="form-control" required>
                        <option value="">Select To City</option>
                        <option value="Delhi">Delhi</option>
                        <option value="New Delhi">New Delhi</option>
                        <option value="Mumbai">Mumbai</option>
                        <option value="Bengaluru">Bengaluru</option>
                        <option value="Bhopal">Bhopal</option>
                        <option value="Lucknow">Lucknow</option>
                        <option value="Gaya">Gaya</option>
                        <option value="Chennai">Chennai</option>
                        <option value="Kolkata">Kolkata</option>
                        <option value="Hyderabad">Hyderabad</option>
                    </select>
                </div>
                <div class="form-group">
                    <select name="passengers" class="form-control">
                        <option value="1">1 Passenger</option>
                        <option value="2">2 Passengers</option>
                        <option value="3">3 Passengers</option>
                        <option value="4">4 Passengers</option>
                        <option value="5">5 Passengers</option>
                        <option value="6">6 Passengers</option>
                    </select>
                </div>
                <div class="form-group">
                    <input type="date" name="date" class="form-control" required>
                </div>
                <div class="btn-row">
                    <button type="submit" class="btn btn-search">Search</button>
                    <button type="reset" class="btn btn-reset">Reset</button>
                </div>
            </form>
        </div>
    </div>

    <!-- Featured Trains Section -->
    <div class="trains-section">
        <h2>Top Routes and Destinations - Railway Reservation System</h2>
        <div class="train-cards-grid">
            <div class="train-card">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Tejas_Express_in_Pune_%28Cropped%29.jpg/640px-Tejas_Express_in_Pune_%28Cropped%29.jpg"
                     alt="Tejas Express"
                     onerror="this.style.background='#1a237e';this.style.height='170px';">
                <div class="train-card-info"><h4>Tejas Express</h4></div>
            </div>
            <div class="train-card">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/ICE_1_Br401_at_Frankfurt_Hbf.jpg/640px-ICE_1_Br401_at_Frankfurt_Hbf.jpg"
                     alt="Satabdi Express"
                     onerror="this.style.background='#333';this.style.height='170px';">
                <div class="train-card-info"><h4>Satabdi Express</h4></div>
            </div>
            <div class="train-card">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Vande_Bharat_Express_at_Haridwar_Junction_%28cropped%29.jpg/640px-Vande_Bharat_Express_at_Haridwar_Junction_%28cropped%29.jpg"
                     alt="Gatiman Express"
                     onerror="this.style.background='#555';this.style.height='170px';">
                <div class="train-card-info"><h4>Gatiman Express</h4></div>
            </div>
            <div class="train-card">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Rajdhani_Express_Indian_Railways.jpg/640px-Rajdhani_Express_Indian_Railways.jpg"
                     alt="Rajdhani Express"
                     onerror="this.style.background='#777';this.style.height='170px';">
                <div class="train-card-info"><h4>Rajdhani Express</h4></div>
            </div>
        </div>
    </div>

    <!-- Footer -->
    <footer class="site-footer">
        Copyright &copy; All rights reserved
    </footer>

    <script src="js/script.js"></script>
</body>
</html>
