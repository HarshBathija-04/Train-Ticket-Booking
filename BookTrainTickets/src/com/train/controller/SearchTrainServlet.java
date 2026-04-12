package com.train.controller;

import com.train.dao.TrainDAO;
import com.train.model.TrainSchedule;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;
import java.io.IOException;
import java.util.List;

@WebServlet("/SearchTrainServlet")
public class SearchTrainServlet extends HttpServlet {
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        String source = request.getParameter("source");
        String destination = request.getParameter("destination");
        String date = request.getParameter("date");
        
        TrainDAO dao = new TrainDAO();
        List<TrainSchedule> schedules = dao.searchTrains(source, destination, date);
        
        request.setAttribute("schedules", schedules);
        request.setAttribute("source", source);
        request.setAttribute("destination", destination);
        request.setAttribute("date", date);
        
        request.getRequestDispatcher("search.jsp").forward(request, response);
    }
}
