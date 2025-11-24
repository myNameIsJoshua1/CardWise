package cit.edu.cardwise.service;

import cit.edu.cardwise.entity.UserEntity;
import cit.edu.cardwise.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class UserService {

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private UserRepository userRepository;

    public UserEntity createUser(UserEntity user) {
        Optional<UserEntity> existingUser = userRepository.findByEmail(user.getEmail());
        if (existingUser.isPresent()) {
            throw new IllegalArgumentException("Email already exists");
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        if (user.getUserId() == null || user.getUserId().isEmpty()) {
            user.setUserId(UUID.randomUUID().toString());
        }
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }

    public List<UserEntity> getAllUsers() {
        return userRepository.findAll();
    }

    public Optional<UserEntity> getUserById(String id) {
        return userRepository.findById(id);
    }

    public UserEntity updateUser(String id, UserEntity updatedUser) {
        updatedUser.setUpdatedAt(LocalDateTime.now());
        updatedUser.setUserId(id);
        return userRepository.save(updatedUser);
    }

    public void deleteUser(String id) {
        userRepository.deleteById(id);
    }

    public Optional<UserEntity> loginUser(String email, String password) {
        Optional<UserEntity> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return Optional.empty();
        }

        UserEntity user = userOpt.get();
        return passwordEncoder.matches(password, user.getPassword()) ? Optional.of(user) : Optional.empty();
    }

    public Optional<UserEntity> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public UserEntity createOrGetOAuthUser(String email, String fullName) {
        Optional<UserEntity> existing = userRepository.findByEmail(email);
        if (existing.isPresent()) return existing.get();

        String[] nameParts = fullName != null ? fullName.split(" ", 2) : new String[]{"", ""};
        String firstName = nameParts.length > 0 ? nameParts[0] : "";
        String lastName = nameParts.length > 1 ? nameParts[1] : "";

        UserEntity user = new UserEntity();
        user.setUserId(UUID.randomUUID().toString());
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setEmail(email);
        user.setPassword("");
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        return userRepository.save(user);
    }

    public boolean changePassword(String userId, String currentPassword, String newPassword) {
        Optional<UserEntity> userOpt = getUserById(userId);
        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("User not found");
        }

        UserEntity user = userOpt.get();
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            return false;
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
        return true;
    }

    public long getUserCount() {
        return userRepository.count();
    }
}
