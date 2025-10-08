package cit.edu.quizwhiz.entity;

import com.google.cloud.Timestamp;
import java.util.HashMap;
import java.util.Map;

public class UserEntity {
    private String userId;
    private String firstName;
    private String lastName;
    private String email;
    private String password;
    private String role; // STUDENT, EDUCATOR
    private String profilePictureUrl;
    private Timestamp createdAt;
    private Timestamp updatedAt;

    // Empty constructor (required for Firestore deserialization)
    public UserEntity() {}

    public UserEntity(String userId, String firstName, String lastName, String email,
                      String password, String role, String profilePictureUrl) {
        this.userId = userId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.password = password;
        this.role = role;
        this.profilePictureUrl = profilePictureUrl;
        this.createdAt = Timestamp.now();
        this.updatedAt = Timestamp.now();
    }

    // Converts UserEntity to a Map for Firestore
    public Map<String, Object> toFirestoreMap() {
        Map<String, Object> map = new HashMap<>();
        map.put("userId", userId);
        map.put("firstName", firstName);
        map.put("lastName", lastName);
        map.put("email", email);
        map.put("password", password);
        map.put("role", role);
        map.put("profilePictureUrl", profilePictureUrl);
        map.put("createdAt", createdAt);
        map.put("updatedAt", updatedAt);
        return map;
    }

    // Getters and Setters
    public String getUserId() {
        return userId;
    }
    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getFirstName() {
        return firstName;
    }
    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }
    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getEmail() {
        return email;
    }
    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }
    public void setPassword(String password) {
        this.password = password;
    }

    public String getRole() {
        return role;
    }
    public void setRole(String role) {
        this.role = role;
    }

    public String getProfilePictureUrl() {
        return profilePictureUrl;
    }
    public void setProfilePictureUrl(String profilePictureUrl) {
        this.profilePictureUrl = profilePictureUrl;
    }

    public Timestamp getCreatedAt() {
        return createdAt;
    }
    public void setCreatedAt(Timestamp createdAt) {
        this.createdAt = createdAt;
    }

    public Timestamp getUpdatedAt() {
        return updatedAt;
    }
    public void setUpdatedAt(Timestamp updatedAt) {
        this.updatedAt = updatedAt;
    }
}