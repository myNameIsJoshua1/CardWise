package cit.edu.quizwhiz.controller;

import cit.edu.quizwhiz.entity.UserEntity;
import cit.edu.quizwhiz.security.GoogleTokenVerifier;
import cit.edu.quizwhiz.security.JwtUtil;
import cit.edu.quizwhiz.service.UserService;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
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

    @Autowired
    private GoogleTokenVerifier googleTokenVerifier;

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

        try {
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

        } catch (ExecutionException | InterruptedException | FirebaseAuthException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }


    @PostMapping("/google")
    public ResponseEntity<?> loginWithGoogle(@RequestBody Map<String, String> payload) {
        System.out.println("Received Google login request. Payload keys: " + payload.keySet());

        String idToken = payload.get("credential");
        System.out.println("Extracted ID token: " + (idToken != null ? "present" : "null"));

        if (idToken == null || idToken.isEmpty()) {
            System.out.println("ID token is missing");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("ID token is required");
        }

        try {
            System.out.println("Attempting to verify ID token with Google...");
            
            // Use Google token verifier instead of Firebase
            Map<String, Object> userData = googleTokenVerifier.verifyGoogleIdToken(idToken);
            
            if (userData == null) {
                System.out.println("Invalid Google token");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid Google ID token");
            }
            
            // Extract user information from the token data
            String email = (String) userData.get("email");
            String name = (String) userData.get("name");
            String firstName = (String) userData.get("firstName");
            String lastName = (String) userData.get("lastName");
            
            System.out.println("Google token verified. Email: " + email);

            // Create or retrieve the user from database
            UserEntity user = userService.createOrGetOAuthUser(email, name);
            
            // Update first and last name if available and not already set
            if (firstName != null && !firstName.isEmpty() && 
                (user.getFirstName() == null || user.getFirstName().isEmpty())) {
                user.setFirstName(firstName);
            }
            if (lastName != null && !lastName.isEmpty() && 
                (user.getLastName() == null || user.getLastName().isEmpty())) {
                user.setLastName(lastName);
            }
            
            // Save any updates
            userService.updateUser(user.getUserId(), user);

            // Generate JWT token for the user
            String jwt = jwtUtil.generateToken(user.getEmail());

            // Prepare response data
            Map<String, Object> response = new HashMap<>();
            response.put("user", user);
            response.put("token", jwt);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Unexpected error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }

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