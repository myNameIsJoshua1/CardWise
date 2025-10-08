package cit.edu.quizwhiz.controller;

import cit.edu.quizwhiz.entity.AdminEntity;
import cit.edu.quizwhiz.entity.UserEntity;
import cit.edu.quizwhiz.security.JwtUtil;
import cit.edu.quizwhiz.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ExecutionException;

@RestController
@RequestMapping("/admin")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/create")
    public ResponseEntity<AdminEntity> createAdmin(@RequestBody AdminEntity admin) {
        try {
            return ResponseEntity.ok(adminService.createAdmin(admin));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{adminId}")
    public ResponseEntity<AdminEntity> getAdminById(@PathVariable String adminId) {
        try {
            Optional<AdminEntity> user = adminService.getAdminById(adminId);
            return user.map(ResponseEntity::ok)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error fetching user: " + e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String password = credentials.get("password");

        try {
            Optional<AdminEntity> adminOpt = adminService.findByEmail(email);

            if (adminOpt.isEmpty() || !passwordEncoder.matches(password, adminOpt.get().getPassword())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            AdminEntity admin = adminOpt.get();
            String jwtToken = jwtUtil.generateToken(admin.getEmail());

            Map<String, Object> response = new HashMap<>();
            Map<String, Object> adminData = new HashMap<>();
            adminData.put("id", admin.getAdminId());
            adminData.put("email", admin.getEmail());
            adminData.put("firstName", admin.getFirstName());
            adminData.put("lastName", admin.getLastName());

            response.put("admin", adminData);
            response.put("token", jwtToken);

            return ResponseEntity.ok()
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + jwtToken)
                    .body(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/all")
    public ResponseEntity<List<AdminEntity>> getAllAdmins() {
        try {
            return ResponseEntity.ok(adminService.getAllAdmins());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}