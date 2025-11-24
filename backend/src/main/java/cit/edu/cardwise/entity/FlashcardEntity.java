package cit.edu.cardwise.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "flashcards")
public class FlashcardEntity {

    @Id
    private String id;
    private String question;
    private String answer;
    private boolean learned;
    private String deckId;

    public FlashcardEntity() {}

    public FlashcardEntity(String id, String question, String answer, boolean learned, String deckId) {
        this.id = id;
        this.question = question;
        this.answer = answer;
        this.learned = learned;
        this.deckId = deckId;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getQuestion() {
        return question;
    }

    public void setQuestion(String question) {
        this.question = question;
    }

    public String getAnswer() {
        return answer;
    }

    public void setAnswer(String answer) {
        this.answer = answer;
    }

    public boolean isLearned() {
        return learned;
    }

    public void setLearned(boolean learned) {
        this.learned = learned;
    }

    public String getDeckId() {
        return deckId;
    }

    public void setDeckId(String deckId) {
        this.deckId = deckId;
    }
}
