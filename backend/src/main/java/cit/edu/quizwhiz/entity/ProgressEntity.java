package cit.edu.quizwhiz.entity;

import com.google.cloud.Timestamp;

public class ProgressEntity {
    private String progressId;
    private String flashCardId;  // Reference to FlashcardEntity
    private int score;
    private int timeSpent;
    private String scoreComparison;  // EXCELLENT, GOOD, FAIR, NEEDS_IMPROVEMENT
    private Timestamp createdAt;

    public ProgressEntity() {
    }

    public ProgressEntity(String progressId, String flashCardId, int score,
                          int timeSpent, String scoreComparison) {
        this.progressId = progressId;
        this.flashCardId = flashCardId;
        this.score = score;
        this.timeSpent = timeSpent;
        this.scoreComparison = scoreComparison;
        this.createdAt = Timestamp.now();
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

    public Timestamp getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Timestamp createdAt) {
        this.createdAt = createdAt;
    }
}