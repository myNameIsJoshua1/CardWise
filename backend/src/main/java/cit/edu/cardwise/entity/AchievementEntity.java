package cit.edu.cardwise.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;


@Entity
@Table(name = "achievements")
public class AchievementEntity {
    @Id
    private String achievementId;
    private String userId; // Reference to the user
    private String title; // Title of the achievement
    private String description; // Description of the achievement
    private boolean unlocked; // Whether the achievement is unlocked
    private LocalDateTime unlockedAt; // When the achievement was unlocked

    public AchievementEntity() {}

    public AchievementEntity(String achievementId, String userId, String title, String description, boolean unlocked) {
        this.achievementId = achievementId;
        this.userId = userId;
        this.title = title;
        this.description = description;
        this.unlocked = unlocked;
        this.unlockedAt = unlocked ? LocalDateTime.now() : null;
    }

    // Getters and Setters
    public String getAchievementId() {
        return achievementId;
    }

    public void setAchievementId(String achievementId) {
        this.achievementId = achievementId;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public boolean isUnlocked() {
        return unlocked;
    }

    public void setUnlocked(boolean unlocked) {
        this.unlocked = unlocked;
        this.unlockedAt = unlocked ? LocalDateTime.now() : null;
    }

    public LocalDateTime getUnlockedAt() {
        return unlockedAt;
    }

    public void setUnlockedAt(LocalDateTime unlockedAt) {
        this.unlockedAt = unlockedAt;
    }
}