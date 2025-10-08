package cit.edu.quizwhiz.entity;

import com.google.cloud.Timestamp;

public class ReviewEntity {
    private String reviewId;
    private String flashCardId;
    private String reviewCorrectAnswer;
    private String reviewIncorrectAnswer;
    private Timestamp createdAt;

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

    public Timestamp getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Timestamp createdAt) {
        this.createdAt = createdAt;
    }
}