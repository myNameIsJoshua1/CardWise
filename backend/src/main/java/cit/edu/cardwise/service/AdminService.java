package cit.edu.cardwise.service;

import cit.edu.cardwise.entity.AdminEntity;
import cit.edu.cardwise.repository.AdminRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class AdminService {

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public AdminEntity createAdmin(AdminEntity admin) {
        Optional<AdminEntity> existingAdmin = adminRepository.findByEmail(admin.getEmail());
        if (existingAdmin.isPresent()) {
            throw new IllegalArgumentException("Admin email already exists");
        }

        admin.setPassword(passwordEncoder.encode(admin.getPassword()));
        if (admin.getAdminId() == null || admin.getAdminId().isEmpty()) {
            admin.setAdminId(java.util.UUID.randomUUID().toString());
        }
        admin.setCreatedAt(LocalDateTime.now());
        admin.setUpdatedAt(LocalDateTime.now());

        return adminRepository.save(admin);
    }

    public Optional<AdminEntity> findByEmail(String email) {
        return adminRepository.findByEmail(email);
    }

    public List<AdminEntity> getAllAdmins() {
        return adminRepository.findAll();
    }

    public Optional<AdminEntity> getAdminById(String id) {
        return adminRepository.findById(id);
    }

    public void deleteAdmin(String id) {
        adminRepository.deleteById(id);
    }
}