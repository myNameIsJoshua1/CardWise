package cit.edu.cardwise.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "quizzes")
public class QuizEntity {
    @Id
    private String quizModeId;
    private String deckId;  // Reference to a deck containing multiple flashcards
    private String difficultyLevel;
    private String typeOfQuiz;
    private int score;
    private int timeLimit;
    private boolean randomizeQuestions;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public String getQuizModeId() {
        return quizModeId;
    }

    public void setQuizModeId(String quizModeId) {
        this.quizModeId = quizModeId;
    }

    public String getDeckId() {
        return deckId;
    }

    public void setDeckId(String deckId) {
        this.deckId = deckId;
    }

    public String getDifficultyLevel() {
        return difficultyLevel;
    }

    public void setDifficultyLevel(String difficultyLevel) {
        this.difficultyLevel = difficultyLevel;
    }

    public String getTypeOfQuiz() {
        return typeOfQuiz;
    }

    public void setTypeOfQuiz(String typeOfQuiz) {
        this.typeOfQuiz = typeOfQuiz;
    }

    public int getScore() {
        return score;
    }

    public void setScore(int score) {
        this.score = score;
    }

    public int getTimeLimit() {
        return timeLimit;
    }

    public void setTimeLimit(int timeLimit) {
        this.timeLimit = timeLimit;
    }

    public boolean isRandomizeQuestions() {
        return randomizeQuestions;
    }

    public void setRandomizeQuestions(boolean randomizeQuestions) {
        this.randomizeQuestions = randomizeQuestions;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}