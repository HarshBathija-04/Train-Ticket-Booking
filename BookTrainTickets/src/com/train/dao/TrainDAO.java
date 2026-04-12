package com.train.dao;

import com.train.model.Train;
import com.train.model.TrainSchedule;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class TrainDAO {
    
    public static List<Train> trains = new ArrayList<>();
    public static List<TrainSchedule> schedules = new ArrayList<>();
    
    static {
        Train t1 = new Train();
        t1.setTrainNumber("10101"); t1.setTrainName("Express Alpha");
        t1.setSource("New York"); t1.setDestination("Boston");
        t1.setFare(50.0); t1.setDepartureTime("10:00 AM"); t1.setArrivalTime("02:00 PM");
        
        Train t2 = new Train();
        t2.setTrainNumber("20202"); t2.setTrainName("Express Beta");
        t2.setSource("New York"); t2.setDestination("Washington");
        t2.setFare(75.5); t2.setDepartureTime("11:00 AM"); t2.setArrivalTime("03:30 PM");
        
        trains.add(t1);
        trains.add(t2);
        
        TrainSchedule ts1 = new TrainSchedule();
        ts1.setId(1); ts1.setTrainNumber("10101");
        ts1.setJourneyDate("2023-12-01"); ts1.setAvailableSeats(100);
        ts1.setTrain(t1);
        
        TrainSchedule ts2 = new TrainSchedule();
        ts2.setId(2); ts2.setTrainNumber("20202");
        ts2.setJourneyDate("2023-12-01"); ts2.setAvailableSeats(50);
        ts2.setTrain(t2);
        
        schedules.add(ts1);
        schedules.add(ts2);
    }

    public List<TrainSchedule> searchTrains(String source, String destination, String date) {
        return schedules.stream()
                .filter(s -> s.getTrain().getSource().equalsIgnoreCase(source) 
                          && s.getTrain().getDestination().equalsIgnoreCase(destination)
                          && s.getJourneyDate().equals(date))
                .collect(Collectors.toList());
    }

    public TrainSchedule getScheduleById(int scheduleId) {
        return schedules.stream()
                .filter(s -> s.getId() == scheduleId)
                .findFirst()
                .orElse(null);
    }

    public List<Train> getAllTrains() {
        return trains;
    }
}
