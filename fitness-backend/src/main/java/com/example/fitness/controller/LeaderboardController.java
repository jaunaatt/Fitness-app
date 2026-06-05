package com.example.fitness.controller;

import com.example.fitness.model.User;
import com.example.fitness.service.LeaderboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leaderboard")
@CrossOrigin(origins = "*")
public class LeaderboardController {

    private final LeaderboardService leaderboardService;

    @Autowired
    public LeaderboardController(LeaderboardService leaderboardService) {
        this.leaderboardService = leaderboardService;
    }

    @GetMapping
    public List<User> getLeaderboard() {
        return leaderboardService.sortUsersByPoints();
    }

    @GetMapping("/top")
    public List<User> getTopPlayers(@RequestParam(defaultValue = "10") int limit) {
        return leaderboardService.getTopPlayers(limit);
    }
}
