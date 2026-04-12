<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - Railway Reservation System</title>
    <link rel="stylesheet" href="css/style.css">
    <style>
        .login-form-wrapper {
            max-width: 520px;
            margin: 40px auto;
            background: #fff;
            border: 1px solid #e0e0e0;
            border-radius: 4px;
            overflow: hidden;
        }
        .login-form-wrapper h2 {
            font-size: 1.2rem;
            font-weight: 700;
            color: #333;
            padding: 22px 30px;
            border-bottom: 1px solid #e0e0e0;
        }
        .login-form-body { padding: 24px 30px 30px; }
        .login-form-body .form-group label { color: #555; font-size: 0.9rem; }
        .login-form-body .btn-primary { width: 100%; margin-top: 8px; padding: 11px; }
        .login-link { text-align: center; margin-top: 18px; font-size: 0.88rem; color: #555; }
        .login-link a { color: #1a237e; font-weight: 600; text-decoration: none; }
        .login-link a:hover { text-decoration: underline; }
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
            <a href="index.jsp">Home</a>
            <a href="about.jsp">About</a>
            <a href="index.jsp">Search Train</a>
            <a href="login.jsp" class="active">Customer Login</a>
            <a href="register.jsp">Registration</a>
            <a href="#">Contact</a>
            <a href="#">Feedback</a>
        </div>
    </nav>

    <div class="login-form-wrapper">
        <h2>Customer Login</h2>
        <div class="login-form-body">

            <% String error = request.getParameter("error");
               String msg = request.getParameter("msg");
               if (error != null) { %><div class="alert alert-error"><%= error %></div><% }
               if (msg != null) { %><div class="alert alert-success"><%= msg %></div><% } %>

            <form action="LoginServlet" method="POST">
                <div class="form-group">
                    <label>Email Address</label>
                    <input type="email" name="email" id="email" class="form-control" required>
                </div>
                <div class="form-group">
                    <label>Password</label>
                    <input type="password" name="password" id="password" class="form-control" required>
                </div>
                <button type="submit" class="btn btn-primary">Login</button>
            </form>

            <p class="login-link">
                Don't have an account? <a href="register.jsp">Register here</a>
            </p>
        </div>
    </div>

    <!-- Footer -->
    <footer class="site-footer">
        Copyright &copy; All rights reserved
    </footer>

</body>
</html>
