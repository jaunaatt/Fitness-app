package com.example.fitness.service;

import com.example.fitness.model.User;
import com.example.fitness.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class LeaderboardServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private LeaderboardService leaderboardService;

    private User user1, user2, user3;

    @BeforeEach
    void setUp() {
        user1 = new User(); user1.setUsername("A"); user1.setTotalPoints(10);
        user2 = new User(); user2.setUsername("B"); user2.setTotalPoints(50);
        user3 = new User(); user3.setUsername("C"); user3.setTotalPoints(30);
    }

    @Test
    void testSortUsersByPoints_returnsDescendingOrder() {
        when(userRepository.findAll()).thenReturn(Arrays.asList(user1, user2, user3));

        List<User> sorted = leaderboardService.sortUsersByPoints();

        assertEquals("B", sorted.get(0).getUsername());
        assertEquals("C", sorted.get(1).getUsername());
        assertEquals("A", sorted.get(2).getUsername());
    }

    @Test
    void testGetTopPlayers_respectsLimit() {
        when(userRepository.findAll()).thenReturn(Arrays.asList(user1, user2, user3));

        List<User> top2 = leaderboardService.getTopPlayers(2);

        assertEquals(2, top2.size());
        assertEquals("B", top2.get(0).getUsername());
        assertEquals("C", top2.get(1).getUsername());
    }
}
