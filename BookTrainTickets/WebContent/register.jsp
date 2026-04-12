<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Registration - Railway Reservation System</title>
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
            <a href="login.jsp">Customer Login</a>
            <a href="register.jsp" class="active">Registration</a>
            <a href="#">Contact</a>
            <a href="#">Feedback</a>
        </div>
    </nav>

    <div class="auth-wrapper">
        <h2>User Registration</h2>

        <% String error = request.getParameter("error");
           if (error != null) { %>
           <div class="alert alert-error" style="margin: 10px 30px;"><%= error %></div>
        <% } %>

        <form action="RegisterServlet" method="POST">

            <!-- Section: Login Information -->
            <div class="form-section-header">User Login Information</div>
            <div class="form-body">
                <div class="form-group">
                    <label>Email ID</label>
                    <input type="email" name="email" id="email" class="form-control" required>
                </div>
                <div class="form-group">
                    <label>Password</label>
                    <input type="password" name="password" id="password" class="form-control" required>
                </div>
            </div>

            <!-- Section: User Information -->
            <div class="form-section-header">User Information</div>
            <div class="form-body">
                <div class="form-group">
                    <label>Full Name</label>
                    <input type="text" name="name" id="name" class="form-control" required>
                </div>
                <div class="form-group">
                    <label>Phone Number</label>
                    <input type="text" name="phone" id="phone" class="form-control"
                           pattern="[0-9]{10}" title="10 digit phone number" required>
                </div>
                <div class="form-group">
                    <label>Date of Birth</label>
                    <input type="date" name="dob" id="dob" class="form-control">
                </div>
                <div class="form-group">
                    <label>Nationality</label>
                    <input type="text" name="nationality" id="nationality" class="form-control" placeholder="Indian">
                </div>
            </div>

            <!-- Section: Address Details -->
            <div class="form-section-header">User Address Details</div>
            <div class="form-body">
                <div class="form-group">
                    <label>Full Address</label>
                    <textarea name="address" id="address" class="form-control" rows="3"></textarea>
                </div>
                <div class="form-group">
                    <label>City</label>
                    <input type="text" name="city" id="city" class="form-control">
                </div>
                <div class="form-group">
                    <label>State</label>
                    <input type="text" name="state" id="state" class="form-control">
                </div>
                <div class="form-group">
                    <label>PIN Code</label>
                    <input type="text" name="pin" id="pin" class="form-control" pattern="[0-9]{6}" title="6-digit PIN code">
                </div>

                <button type="submit" class="btn btn-primary" style="margin-top:10px; padding: 11px 30px;">Register</button>
                <p style="margin-top: 16px; font-size: 0.88rem; color:#555;">
                    Already have an account? <a href="login.jsp" style="color:#1a237e; font-weight:600; text-decoration:none;">Login here</a>
                </p>
            </div>

        </form>
    </div>

    <!-- Footer -->
    <footer class="site-footer">
        Copyright &copy; All rights reserved
    </footer>

</body>
</html>
