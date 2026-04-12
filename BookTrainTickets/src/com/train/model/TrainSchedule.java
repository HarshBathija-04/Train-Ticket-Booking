package com.train.model;

public class TrainSchedule {
    private int id;
    private String trainNumber;
    private String journeyDate;
    private int totalSeats;
    private int availableSeats;
    
    // Auxiliary
    private Train train;

    public TrainSchedule() {}

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getTrainNumber() { return trainNumber; }
    public void setTrainNumber(String trainNumber) { this.trainNumber = trainNumber; }

    public String getJourneyDate() { return journeyDate; }
    public void setJourneyDate(String journeyDate) { this.journeyDate = journeyDate; }

    public int getTotalSeats() { return totalSeats; }
    public void setTotalSeats(int totalSeats) { this.totalSeats = totalSeats; }

    public int getAvailableSeats() { return availableSeats; }
    public void setAvailableSeats(int availableSeats) { this.availableSeats = availableSeats; }

    public Train getTrain() { return train; }
    public void setTrain(Train train) { this.train = train; }
}
