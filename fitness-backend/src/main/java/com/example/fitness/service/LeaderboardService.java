package com.example.fitness.service;

import com.example.fitness.model.User;
import com.example.fitness.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class LeaderboardService {

    private final UserRepository userRepository;

    @Autowired
    public LeaderboardService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // Methods from class diagram
    public User addOrUpdateUser(User user) {
        return userRepository.save(user);
    }

    public List<User> sortUsersByPoints() {
        List<User> users = userRepository.findAll();
        // Sort in descending order of points
        users.sort((u1, u2) -> Integer.compare(u2.getTotalPoints(), u1.getTotalPoints()));
        return users;
    }

    public List<User> getTopPlayers(int limit) {
        return sortUsersByPoints().stream()
                .limit(limit)
                .collect(Collectors.toList());
    }
}
