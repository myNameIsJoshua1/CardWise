package cit.edu.quizwhiz.controller;

import cit.edu.quizwhiz.entity.FlashcardEntity;
import cit.edu.quizwhiz.service.FlashcardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.concurrent.ExecutionException;

@RestController
@RequestMapping("/flashcards")
public class FlashcardController {

    @Autowired
    private FlashcardService flashcardService;

    @PostMapping
    public ResponseEntity<FlashcardEntity> createFlashcard(@RequestBody FlashcardEntity flashcard) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(flashcardService.createFlashcard(flashcard));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping
    public ResponseEntity<List<FlashcardEntity>> getAllFlashcards() {
        try {
            return ResponseEntity.ok(flashcardService.getAllFlashcards());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<FlashcardEntity> getFlashcardById(@PathVariable String id) {
        try {
            Optional<FlashcardEntity> flashcard = flashcardService.getFlashcardById(id);
            return flashcard.map(ResponseEntity::ok)
                    .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<FlashcardEntity> updateFlashcard(@PathVariable String id, @RequestBody FlashcardEntity flashcardDetails) {
        try {
            return ResponseEntity.ok(flashcardService.updateFlashcard(id, flashcardDetails));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFlashcard(@PathVariable String id) {
        try {
            flashcardService.deleteFlashcard(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/getByDeckId/{deckId}")
    public ResponseEntity<List<FlashcardEntity>> getFlashcardsByDeckId(@PathVariable String deckId) {
        try {
            List<FlashcardEntity> flashcards = flashcardService.getFlashcardsByDeckId(deckId);
            return ResponseEntity.ok(flashcards);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
}