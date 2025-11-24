package cit.edu.cardwise.controller;

import cit.edu.cardwise.entity.UserEntity;
import cit.edu.cardwise.security.JwtUtil;
import cit.edu.cardwise.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;


import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ExecutionException;

@RestController
@RequestMapping("/user")
public class UserController {

    JwtUtil jwtUtil = new JwtUtil();


    @Autowired
    private UserService userService;


    @GetMapping("/welcome")
    public String welcome() {
        return "Welcome to the User API!";
    }

    // Create a new user
    @PostMapping("/create")
    public ResponseEntity<UserEntity> createUser(@RequestBody UserEntity user) {
        try {
            return ResponseEntity.ok(userService.createUser(user));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(null); // Email exists
        } catch (Exception e) {
            e.printStackTrace(); // Debugging
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error creating user: " + e.getMessage());
        }
    }

    //testing ra ni gamit thymeleaf
    //    @PostMapping("/create")
    //    public ResponseEntity<UserEntity> createUser(@ModelAttribute UserEntity user) {
    //        try {
    //            return ResponseEntity.ok(userService.createUser(user));
    //        } catch (Exception e) {
    //            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error creating user: " + e.getMessage());
    //        }
    //    }


    // Read all users
    @GetMapping("/all")
    public ResponseEntity<List<UserEntity>> getAllUsers() {
        try {
            return ResponseEntity.ok(userService.getAllUsers());
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error fetching users: " + e.getMessage());
        }
    }

    // Read user by ID
    @GetMapping("/{userId}")
    public ResponseEntity<UserEntity> getUserById(@PathVariable String userId) {
        try {
            Optional<UserEntity> user = userService.getUserById(userId);
            return user.map(ResponseEntity::ok)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error fetching user: " + e.getMessage());
        }
    }

    // Update user details
    @PutMapping("/update/{userId}")
    public ResponseEntity<UserEntity> updateUserDetails(@PathVariable String userId, @RequestBody UserEntity newUserDetails) {
        try {
            return ResponseEntity.ok(userService.updateUser(userId, newUserDetails));
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error updating user: " + e.getMessage());
        }
    }

    // Delete user by ID
    @DeleteMapping("/{userId}")
    public ResponseEntity<String> deleteUser(@PathVariable String userId) {
        try {
            userService.deleteUser(userId);
            return ResponseEntity.ok("User deleted successfully");
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error deleting user: " + e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String password = credentials.get("password");

        Optional<UserEntity> userOpt = userService.loginUser(email, password);

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        UserEntity user = userOpt.get();
        String jwtToken = jwtUtil.generateToken(user.getEmail());

        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getUserId());
        response.put("email", user.getEmail());
        response.put("token", jwtToken);

        return ResponseEntity.ok()
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + jwtToken)
                .body(response);
    }
    // NOTE: Google OAuth endpoint removed. Use email/password endpoints for authentication.

    // Change user password
    @PostMapping("/change-password/{userId}")
    public ResponseEntity<String> changePassword(
            @PathVariable String userId,
            @RequestBody Map<String, String> passwordData) {

        String currentPassword = passwordData.get("currentPassword");
        String newPassword = passwordData.get("newPassword");

        if (currentPassword == null || newPassword == null) {
            return ResponseEntity.badRequest().body("Current password and new password are required");
        }

        try {
            boolean success = userService.changePassword(userId, currentPassword, newPassword);

            if (success) {
                return ResponseEntity.ok("Password changed successfully");
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Current password is incorrect");
            }
        } catch (Exception e) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Error changing password: " + e.getMessage());
        }
    }


    // Get user count
    @GetMapping("/usercount")
    public ResponseEntity<Long> getUserCount() {
        try {
            return ResponseEntity.ok(userService.getUserCount());
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error counting users: " + e.getMessage());
        }
    }
}