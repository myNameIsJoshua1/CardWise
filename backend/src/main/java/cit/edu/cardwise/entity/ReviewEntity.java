package cit.edu.cardwise.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "reviews")
public class ReviewEntity {
    @Id
    private String reviewId;
    private String flashCardId;
    private String reviewCorrectAnswer;
    private String reviewIncorrectAnswer;
    private LocalDateTime createdAt;

    public ReviewEntity() {
    }

    public String getReviewId() {
        return reviewId;
    }

    public void setReviewId(String reviewId) {
        this.reviewId = reviewId;
    }

    public String getFlashCardId() {
        return flashCardId;
    }

    public void setFlashCardId(String flashCardId) {
        this.flashCardId = flashCardId;
    }

    public String getReviewCorrectAnswer() {
        return reviewCorrectAnswer;
    }

    public void setReviewCorrectAnswer(String reviewCorrectAnswer) {
        this.reviewCorrectAnswer = reviewCorrectAnswer;
    }

    public String getReviewIncorrectAnswer() {
        return reviewIncorrectAnswer;
    }

    public void setReviewIncorrectAnswer(String reviewIncorrectAnswer) {
        this.reviewIncorrectAnswer = reviewIncorrectAnswer;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}