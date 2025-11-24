package cit.edu.cardwise.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "progress")
public class ProgressEntity {
    @Id
    private String progressId;
    private String flashCardId;  // Reference to FlashcardEntity
    private String userId; // Reference to UserEntity
    private int score;
    private int timeSpent;
    private String scoreComparison;  // EXCELLENT, GOOD, FAIR, NEEDS_IMPROVEMENT
    private LocalDateTime createdAt;

    public ProgressEntity() {
    }

    public ProgressEntity(String progressId, String flashCardId, int score,
                          int timeSpent, String scoreComparison) {
        this.progressId = progressId;
        this.flashCardId = flashCardId;
        this.userId = null;
        this.score = score;
        this.timeSpent = timeSpent;
        this.scoreComparison = scoreComparison;
        this.createdAt = LocalDateTime.now();
    }

    public String getProgressId() {
        return progressId;
    }

    public void setProgressId(String progressId) {
        this.progressId = progressId;
    }

    public String getFlashCardId() {
        return flashCardId;
    }

    public void setFlashCardId(String flashCardId) {
        this.flashCardId = flashCardId;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public int getScore() {
        return score;
    }

    public void setScore(int score) {
        this.score = score;
    }

    public int getTimeSpent() {
        return timeSpent;
    }

    public void setTimeSpent(int timeSpent) {
        this.timeSpent = timeSpent;
    }

    public String getScoreComparison() {
        return scoreComparison;
    }

    public void setScoreComparison(String scoreComparison) {
        this.scoreComparison = scoreComparison;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}