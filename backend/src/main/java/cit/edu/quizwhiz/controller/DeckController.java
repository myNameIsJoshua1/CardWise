package cit.edu.quizwhiz.controller;

import cit.edu.quizwhiz.entity.DeckEntity;
import cit.edu.quizwhiz.entity.FlashcardEntity;
import cit.edu.quizwhiz.service.DeckService;
import cit.edu.quizwhiz.service.FlashcardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ExecutionException;

@RestController
@RequestMapping("/decks")
public class DeckController {

    @Autowired
    private DeckService deckService;

    @Autowired
    private FlashcardService flashcardService;

    @PostMapping
    public ResponseEntity<DeckEntity> createDeck(@RequestBody DeckEntity deck) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(deckService.createDeck(deck));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping
    public ResponseEntity<List<DeckEntity>> getAllDecks() {
        try {
            return ResponseEntity.ok(deckService.getAllDecks());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<DeckEntity> getDeckById(@PathVariable String id) {
        try {
            Optional<DeckEntity> deck = deckService.getDeckById(id);
            return deck.map(ResponseEntity::ok)
                    .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<DeckEntity> updateDeck(@PathVariable String id, @RequestBody DeckEntity deckDetails) {
        try {
            return ResponseEntity.ok(deckService.updateDeck(id, deckDetails));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDeck(@PathVariable String id) {
        try {
            deckService.deleteDeck(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}/flashcards")
    public ResponseEntity<List<FlashcardEntity>> getFlashcardsForDeck(@PathVariable String id) {
        try {
            List<FlashcardEntity> flashcards = flashcardService.getFlashcardsByDeckId(id);
            return ResponseEntity.ok(flashcards);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

}
