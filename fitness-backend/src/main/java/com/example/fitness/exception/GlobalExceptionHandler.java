package com.example.fitness.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Global exception handler that produces consistent JSON error shapes.
 * All error responses use the shape: { "error": "...", "message": "..." }
 * Stack traces are NEVER leaked to the client.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /** Bean Validation failures — HTTP 400 with per-field messages */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining("; "));
        return buildError(HttpStatus.BAD_REQUEST, "Validation failed", message);
    }

    /** Duplicate username on registration — HTTP 409 */
    @ExceptionHandler(UsernameAlreadyExistsException.class)
    public ResponseEntity<Map<String, Object>> handleDuplicateUsername(UsernameAlreadyExistsException ex) {
        return buildError(HttpStatus.CONFLICT, "Username already taken", ex.getMessage());
    }

    /** Bad credentials on login — HTTP 401 */
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<Map<String, Object>> handleAuthentication(AuthenticationException ex) {
        return buildError(HttpStatus.UNAUTHORIZED, "Authentication failed", "Invalid username or password");
    }

    /** Accessing another user's data — HTTP 403 */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> handleAccessDenied(AccessDeniedException ex) {
        return buildError(HttpStatus.FORBIDDEN, "Access denied", "You do not have permission to perform this action");
    }

    /** ResponseStatusException (404, 400, etc.) from controllers */
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, Object>> handleResponseStatus(ResponseStatusException ex) {
        return buildError(
                HttpStatus.valueOf(ex.getStatusCode().value()),
                ex.getReason() != null ? ex.getReason() : "Request error",
                ex.getMessage());
    }

    /** Catch-all — HTTP 500 without leaking internal details */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneric(Exception ex) {
        // Log the full exception server-side (visible in Render logs) but don't expose it to the client
        System.err.println("[ERROR] Unhandled exception: " + ex.getClass().getName() + ": " + ex.getMessage());
        return buildError(HttpStatus.INTERNAL_SERVER_ERROR, "Internal server error",
                "An unexpected error occurred. Please try again later.");
    }

    private ResponseEntity<Map<String, Object>> buildError(HttpStatus status, String error, String message) {
        Map<String, Object> body = new HashMap<>();
        body.put("error", error);
        body.put("message", message);
        return ResponseEntity.status(status).body(body);
    }
}
