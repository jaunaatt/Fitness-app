package com.example.fitness.controller;

import com.example.fitness.exception.UsernameAlreadyExistsException;
import com.example.fitness.model.User;
import com.example.fitness.model.dto.AuthResponse;
import com.example.fitness.model.dto.LoginRequest;
import com.example.fitness.model.dto.RegisterRequest;
import com.example.fitness.repository.UserRepository;
import com.example.fitness.security.JwtService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

/**
 * Authentication endpoints — public (no JWT required).
 *
 * POST /api/auth/register  — create account, returns JWT
 * POST /api/auth/login     — validate credentials, returns JWT
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Autowired
    public AuthController(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    /**
     * Register a new account.
     * Returns 409 if the username is already taken.
     * Returns the JWT + user info on success.
     */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new UsernameAlreadyExistsException(request.getUsername());
        }

        User user = new User(
                request.getUsername(),
                passwordEncoder.encode(request.getPassword())
        );
        User saved = userRepository.save(user);

        String token = jwtService.generateToken(saved);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new AuthResponse(token, saved.getId(), saved.getUsername()));
    }

    /**
     * Login with existing credentials.
     * Returns 401 (via GlobalExceptionHandler) if credentials are invalid.
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        // AuthenticationManager validates credentials; throws AuthenticationException on failure
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        User user = (User) authentication.getPrincipal();
        String token = jwtService.generateToken(user);
        return ResponseEntity.ok(new AuthResponse(token, user.getId(), user.getUsername()));
    }
}
