package com.example.fitness.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Request payload for the change-password endpoint.
 * The current password is verified before the new one is set.
 */
public class ChangePasswordRequest {

    @NotBlank(message = "Current password is required")
    private String currentPassword;

    @NotBlank(message = "New password is required")
    @Size(min = 8, message = "New password must be at least 8 characters")
    private String newPassword;

    // ── Getters and Setters ───────────────────────────────────────────────────

    public String getCurrentPassword() { return currentPassword; }
    public void setCurrentPassword(String currentPassword) {
        this.currentPassword = currentPassword;
    }

    public String getNewPassword() { return newPassword; }
    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }
}
