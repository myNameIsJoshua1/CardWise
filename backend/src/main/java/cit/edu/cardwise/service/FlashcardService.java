package cit.edu.cardwise.service;

import cit.edu.cardwise.entity.DeckEntity;
import cit.edu.cardwise.entity.FlashcardEntity;
import cit.edu.cardwise.repository.DeckRepository;
import cit.edu.cardwise.repository.FlashcardRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class FlashcardService {

    @Autowired
    private FlashcardRepository flashcardRepository;

    @Autowired
    private DeckRepository deckRepository;

    @Autowired
    private AchievementService achievementService;

    public List<FlashcardEntity> getAllFlashcards() {
        return flashcardRepository.findAll();
    }

    public Optional<FlashcardEntity> getFlashcardById(String id) {
        return flashcardRepository.findById(id);
    }

    public FlashcardEntity createFlashcard(FlashcardEntity flashcard) {
        if (flashcard.getDeckId() == null || flashcard.getDeckId().isEmpty()) {
            throw new IllegalArgumentException("Flashcard must have a valid deckId");
        }

        Optional<DeckEntity> deckOpt = deckRepository.findById(flashcard.getDeckId());
        if (deckOpt.isEmpty()) {
            throw new IllegalArgumentException("Deck with ID " + flashcard.getDeckId() + " does not exist.");
        }

        if (flashcard.getId() == null || flashcard.getId().isEmpty()) {
            flashcard.setId(UUID.randomUUID().toString());
        }

        FlashcardEntity saved = flashcardRepository.save(flashcard);

        String userId = deckOpt.get().getUserId();
        List<FlashcardEntity> flashcardsInDeck = flashcardRepository.findByDeckId(flashcard.getDeckId());
        if (flashcardsInDeck.size() == 10) {
            achievementService.unlockAchievement(userId, "Flashcard Master", "Create 10 flashcards in a deck");
        }

        return saved;
    }

    public FlashcardEntity updateFlashcard(String id, FlashcardEntity flashcardDetails) {
        flashcardDetails.setId(id);
        return flashcardRepository.save(flashcardDetails);
    }

    public void deleteFlashcard(String id) {
        flashcardRepository.deleteById(id);
    }

    public List<FlashcardEntity> getFlashcardsByDeckId(String deckId) {
        return flashcardRepository.findByDeckId(deckId);
    }
}