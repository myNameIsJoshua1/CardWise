package cit.edu.cardwise.service;

import cit.edu.cardwise.entity.DeckEntity;
import cit.edu.cardwise.repository.DeckRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class DeckService {

    @Autowired
    private DeckRepository deckRepository;

    @Autowired
    private AchievementService achievementService;

    public DeckEntity createDeck(DeckEntity deck) {
        List<DeckEntity> userDecks = deckRepository.findByUserId(deck.getUserId());
        boolean isFirstDeck = userDecks.isEmpty();

        if (deck.getId() == null || deck.getId().isEmpty()) {
            deck.setId(UUID.randomUUID().toString());
        }
        deck.setCreatedAt(LocalDateTime.now());
        deck.setUpdatedAt(LocalDateTime.now());

        DeckEntity saved = deckRepository.save(deck);

        if (isFirstDeck) {
            achievementService.unlockAchievement(deck.getUserId(), "Deck Creator", "Create your first deck");
        }

        return saved;
    }

    public List<DeckEntity> getAllDecks() {
        return deckRepository.findAll();
    }

    public Optional<DeckEntity> getDeckById(String id) {
        return deckRepository.findById(id);
    }

    public DeckEntity updateDeck(String id, DeckEntity deckDetails) {
        deckDetails.setUpdatedAt(LocalDateTime.now());
        deckDetails.setId(id);
        return deckRepository.save(deckDetails);
    }

    public void deleteDeck(String id) {
        deckRepository.deleteById(id);
    }
}