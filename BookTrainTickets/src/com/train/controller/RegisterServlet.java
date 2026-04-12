package com.train.controller;

import com.train.dao.UserDAO;
import com.train.model.User;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;
import java.io.IOException;

@WebServlet("/RegisterServlet")
public class RegisterServlet extends HttpServlet {
    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        String name = request.getParameter("name");
        String email = request.getParameter("email");
        String password = request.getParameter("password");
        String phone = request.getParameter("phone");
        
        User user = new User(0, name, email, password, phone, "USER");
        UserDAO dao = new UserDAO();
        
        if (dao.registerUser(user)) {
            response.sendRedirect("login.jsp?msg=Registration Successful. Please login.");
        } else {
            response.sendRedirect("register.jsp?error=Registration Failed. Email might already exist.");
        }
    }
}
