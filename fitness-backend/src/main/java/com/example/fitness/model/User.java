package com.example.fitness.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDate;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Entity
@Table(name = "users")
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(min = 3, max = 30)
    @Column(nullable = false, unique = true)
    private String username;

    /**
     * BCrypt-hashed password. Never returned in API responses (@JsonIgnore).
     * The raw password is never stored or logged.
     */
    @JsonIgnore
    @Column(nullable = false)
    private String password;

    @Column(name = "total_points", nullable = false)
    private int totalPoints;

    @Column(name = "current_streak", nullable = false)
    private int currentStreak;

    @Column(name = "last_log_date")
    private LocalDate lastLogDate;

    @Column(name = "leaderboard_visible", nullable = false, columnDefinition = "boolean default true")
    private boolean leaderboardVisible = true;

    // ── Physical profile fields ────────────────────────────────────────────────
    /** Height in centimetres (nullable — user may not have filled the profile yet). */
    @Column(name = "height")
    private Double height;

    /** Weight in kilograms (nullable). */
    @Column(name = "weight")
    private Double weight;

    /** Age in years (nullable). */
    @Column(name = "age")
    private Integer age;

    /** Biological gender: "male" or "female" (nullable). */
    @Column(name = "gender")
    private String gender;

    /**
     * Activity level for Mifflin-St Jeor multiplier.
     * Values: "sedentary", "light", "active", "very_active" (nullable).
     */
    @Column(name = "activity_level")
    private String activityLevel;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonManagedReference
    private NutritionTracker nutritionTracker;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonManagedReference
    private WorkoutTracker workoutTracker;

    // ── Constructors ──────────────────────────────────────────────────────────

    public User() {}

    public User(String username, String password) {
        this.username = username;
        this.password = password;
        this.totalPoints = 0;
        this.currentStreak = 0;
    }

    // ── UserDetails implementation ────────────────────────────────────────────

    @Override
    @JsonIgnore
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_USER"));
    }

    @Override
    @JsonIgnore
    public boolean isAccountNonExpired() { return true; }

    @Override
    @JsonIgnore
    public boolean isAccountNonLocked() { return true; }

    @Override
    @JsonIgnore
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    @JsonIgnore
    public boolean isEnabled() { return true; }

    // ── Business Methods ──────────────────────────────────────────────────────

    public void logFood(FoodItem food) {
        if (this.nutritionTracker == null) {
            this.nutritionTracker = new NutritionTracker(150.0, 2000.0);
            this.nutritionTracker.setUser(this);
        }
        this.nutritionTracker.addFoodItem(food);
        updateStreak(LocalDate.now());
        addPoints(5); // Gain 5 points for logging food items
    }

    public void checkInWorkout(WorkoutSession session) {
        if (this.workoutTracker == null) {
            this.workoutTracker = new WorkoutTracker(4);
            this.workoutTracker.setUser(this);
        }
        if (session.isValidSession()) {
            this.workoutTracker.logSession(session);
            if (!session.isRestDay()) {
                updateStreak(LocalDate.now());
                addPoints(20); // Gain 20 points for checking in a workout session
            } else {
                addPoints(5); // Gain 5 points for recording a rest day
            }
        }
    }

    /**
     * Updates the current streak based on the provided date.
     *
     * <p>IMPORTANT: We accept {@code clientDate} from the caller (ultimately
     * the client's local date) rather than always using {@code LocalDate.now()}
     * on the server. The server's JVM timezone may differ from the user's
     * timezone, which would cause incorrect streak resets for users in timezones
     * that are ahead of the server clock. The frontend should pass the user's
     * local date (e.g. "2026-06-20") when calling log-food or check-in-workout.</p>
     *
     * @param clientDate the user's local date for the activity
     */
    public void updateStreak(LocalDate clientDate) {
        if (lastLogDate == null) {
            currentStreak = 1;
        } else {
            long daysBetween = java.time.temporal.ChronoUnit.DAYS.between(lastLogDate, clientDate);
            if (daysBetween == 1) {
                currentStreak++;
            } else if (daysBetween > 1) {
                currentStreak = 1;
            }
            // If daysBetween == 0, we don't change the streak (already logged today)
        }
        lastLogDate = clientDate;
    }

    public void addPoints(int points) {
        this.totalPoints += points;
    }

    // ── Getters and Setters ───────────────────────────────────────────────────

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    @Override
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    @Override
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public int getTotalPoints() { return totalPoints; }
    public void setTotalPoints(int totalPoints) { this.totalPoints = totalPoints; }

    public int getCurrentStreak() { return currentStreak; }
    public void setCurrentStreak(int currentStreak) { this.currentStreak = currentStreak; }

    public LocalDate getLastLogDate() { return lastLogDate; }
    public void setLastLogDate(LocalDate lastLogDate) { this.lastLogDate = lastLogDate; }

    public boolean isLeaderboardVisible() { return leaderboardVisible; }
    public void setLeaderboardVisible(boolean leaderboardVisible) { this.leaderboardVisible = leaderboardVisible; }

    // Physical profile getters/setters
    public Double getHeight() { return height; }
    public void setHeight(Double height) { this.height = height; }

    public Double getWeight() { return weight; }
    public void setWeight(Double weight) { this.weight = weight; }

    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public String getActivityLevel() { return activityLevel; }
    public void setActivityLevel(String activityLevel) { this.activityLevel = activityLevel; }

    /**
     * Virtual getter that returns physical profile fields as a nested map.
     * This matches the shape AppContext.jsx expects: profile.userProfile.height etc.
     */
    public Map<String, Object> getUserProfile() {
        Map<String, Object> profile = new HashMap<>();
        profile.put("height",   height   != null ? height   : "");
        profile.put("weight",   weight   != null ? weight   : "");
        profile.put("age",      age      != null ? age      : "");
        profile.put("gender",   gender   != null ? gender   : "male");
        profile.put("activity", activityLevel != null ? activityLevel : "light");
        profile.put("leaderboardVisible", leaderboardVisible);
        return profile;
    }

    public NutritionTracker getNutritionTracker() { return nutritionTracker; }
    public void setNutritionTracker(NutritionTracker nutritionTracker) {
        this.nutritionTracker = nutritionTracker;
        if (nutritionTracker != null && nutritionTracker.getUser() != this) {
            nutritionTracker.setUser(this);
        }
    }

    public WorkoutTracker getWorkoutTracker() { return workoutTracker; }
    public void setWorkoutTracker(WorkoutTracker workoutTracker) {
        this.workoutTracker = workoutTracker;
        if (workoutTracker != null && workoutTracker.getUser() != this) {
            workoutTracker.setUser(this);
        }
    }
}
