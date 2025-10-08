package cit.edu.quizwhiz.entity;

import com.google.cloud.Timestamp;
import java.util.List;

public class DeckEntity {

    private String id;
    private String subject;
    private String category;
    private String userId; // Reference to UserEntity by ID

    private Timestamp createdAt;
    private Timestamp updatedAt;

    public DeckEntity() {}

    public DeckEntity(String id, String subject, String category, String userId) {
        this.id = id;
        this.subject = subject;
        this.category = category;
        this.userId = userId;
        this.createdAt = Timestamp.now();
        this.updatedAt = Timestamp.now();
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }

    public Timestamp getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Timestamp updatedAt) { this.updatedAt = updatedAt; }
}
