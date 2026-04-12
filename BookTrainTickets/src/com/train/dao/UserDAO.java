package com.train.dao;

import com.train.model.User;
import java.util.ArrayList;
import java.util.List;

public class UserDAO {
    private static List<User> users = new ArrayList<>();
    private static int userIdCounter = 1;

    static {
        // Default admin and user
        users.add(new User(userIdCounter++, "Admin", "admin@train.com", "admin123", "1234567890", "ADMIN"));
        users.add(new User(userIdCounter++, "Test User", "user@train.com", "user123", "0987654321", "USER"));
    }

    public boolean registerUser(User user) {
        user.setId(userIdCounter++);
        if (user.getRole() == null || user.getRole().isEmpty()) {
            user.setRole("USER");
        }
        users.add(user);
        return true;
    }

    public User loginUser(String email, String password) {
        for (User user : users) {
            if (user.getEmail().equals(email) && user.getPassword().equals(password)) {
                return user;
            }
        }
        return null;
    }
}
