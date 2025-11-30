package cit.edu.cardwise.controller;

import cit.edu.cardwise.entity.UserEntity;
import cit.edu.cardwise.entity.AdminEntity;
import cit.edu.cardwise.service.UserService;
import cit.edu.cardwise.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpSession;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/session")
public class SessionController {

    @Autowired
    private UserService userService;

    @Autowired
    private AdminService adminService;

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> sessionLogin(
            @RequestBody Map<String, String> credentials,
            HttpSession session) {
        
        String email = credentials.get("email");
        String password = credentials.get("password");
        String role = credentials.get("role");

        // Determine if this is a user or admin login
        boolean isAdmin = "admin".equalsIgnoreCase(role);

        try {
            Map<String, Object> response = new HashMap<>();

            if (isAdmin) {
                Optional<AdminEntity> adminOpt = adminService.loginAdmin(email, password);
                if (adminOpt.isEmpty()) {
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                            .body(Map.of("error", "Invalid admin credentials"));
                }

                AdminEntity admin = adminOpt.get();
                
                // Store admin data in session
                session.setAttribute("adminId", admin.getAdminId());
                session.setAttribute("email", admin.getEmail());
                session.setAttribute("role", "ADMIN");
                session.setAttribute("name", admin.getName());
                
                response.put("id", admin.getAdminId());
                response.put("email", admin.getEmail());
                response.put("name", admin.getName());
                response.put("role", "ADMIN");
                response.put("sessionId", session.getId());
                
            } else {
                Optional<UserEntity> userOpt = userService.loginUser(email, password);
                if (userOpt.isEmpty()) {
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                            .body(Map.of("error", "Invalid user credentials"));
                }

                UserEntity user = userOpt.get();
                
                // Store user data in session
                session.setAttribute("userId", user.getUserId());
                session.setAttribute("email", user.getEmail());
                session.setAttribute("role", "USER");
                session.setAttribute("name", user.getName());
                
                response.put("id", user.getUserId());
                response.put("email", user.getEmail());
                response.put("name", user.getName());
                response.put("role", "USER");
                response.put("sessionId", session.getId());
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Login failed: " + e.getMessage()));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> sessionLogout(HttpSession session) {
        try {
            session.invalidate();
            SecurityContextHolder.clearContext();
            return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Logout failed: " + e.getMessage()));
        }
    }

    @GetMapping("/validate")
    public ResponseEntity<Map<String, Object>> validateSession(HttpSession session) {
        try {
            String userId = (String) session.getAttribute("userId");
            String adminId = (String) session.getAttribute("adminId");
            String email = (String) session.getAttribute("email");
            String role = (String) session.getAttribute("role");

            if (email == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("valid", false, "message", "No active session"));
            }

            Map<String, Object> response = new HashMap<>();
            response.put("valid", true);
            response.put("email", email);
            response.put("role", role);
            if (userId != null) {
                response.put("id", userId);
            }
            if (adminId != null) {
                response.put("id", adminId);
            }
            response.put("sessionId", session.getId());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("valid", false, "error", e.getMessage()));
        }
    }

    @GetMapping("/info")
    public ResponseEntity<Map<String, Object>> getSessionInfo(HttpSession session) {
        try {
            String email = (String) session.getAttribute("email");
            
            if (email == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "No active session"));
            }

            Map<String, Object> response = new HashMap<>();
            response.put("email", email);
            response.put("role", session.getAttribute("role"));
            response.put("name", session.getAttribute("name"));
            response.put("sessionId", session.getId());
            response.put("creationTime", session.getCreationTime());
            response.put("lastAccessedTime", session.getLastAccessedTime());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }
}
