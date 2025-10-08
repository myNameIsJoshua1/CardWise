package cit.edu.quizwhiz.service;

import cit.edu.quizwhiz.entity.DeckEntity;
import cit.edu.quizwhiz.entity.FlashcardEntity;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.google.firebase.cloud.FirestoreClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;

@Service
public class FlashcardService {

    private final Firestore firestore;
    private static final String COLLECTION_NAME = "flashcards";


    @Autowired
    private AchievementService achievementService;


    public FlashcardService() {
        this.firestore = FirestoreClient.getFirestore();
    }

    public List<FlashcardEntity> getAllFlashcards() throws ExecutionException, InterruptedException {
        ApiFuture<QuerySnapshot> future = firestore.collection(COLLECTION_NAME).get();
        List<QueryDocumentSnapshot> documents = future.get().getDocuments();
        return documents.stream()
                .map(doc -> doc.toObject(FlashcardEntity.class))
                .collect(Collectors.toList());
    }

    public Optional<FlashcardEntity> getFlashcardById(String id) throws ExecutionException, InterruptedException {
        DocumentReference docRef = firestore.collection(COLLECTION_NAME).document(id);
        ApiFuture<DocumentSnapshot> future = docRef.get();
        DocumentSnapshot document = future.get();
        return document.exists() ? Optional.of(document.toObject(FlashcardEntity.class)) : Optional.empty();
    }

    public FlashcardEntity createFlashcard(FlashcardEntity flashcard) throws ExecutionException, InterruptedException {
        if (flashcard.getDeckId() == null || flashcard.getDeckId().isEmpty()) {
            throw new IllegalArgumentException("Flashcard must have a valid deckId");
        }

        // Save the flashcard to Firestore
        DocumentReference docRef = firestore.collection("flashcards").document();
        flashcard.setId(docRef.getId());
        docRef.set(flashcard).get();

        // Retrieve the deck to get the userId
        DocumentReference deckRef = firestore.collection("decks").document(flashcard.getDeckId());
        DocumentSnapshot deckSnapshot = deckRef.get().get();

        if (!deckSnapshot.exists()) {
            throw new IllegalArgumentException("Deck with ID " + flashcard.getDeckId() + " does not exist.");
        }

        DeckEntity deck = deckSnapshot.toObject(DeckEntity.class);
        String userId = deck.getUserId(); // Get the userId from the deck

        // Check if the user has created 10 flashcards in the deck
        ApiFuture<QuerySnapshot> queryFuture = firestore.collection("flashcards")
                .whereEqualTo("deckId", flashcard.getDeckId())
                .get();

        List<QueryDocumentSnapshot> flashcardsInDeck = queryFuture.get().getDocuments();

        if (flashcardsInDeck.size() == 10) { // 10 flashcards created
            // Unlock the "Flashcard Master" achievement
            achievementService.unlockAchievement(
                    userId,
                    "Flashcard Master",
                    "Create 10 flashcards in a deck"
            );
        }

        return flashcard;
    }

    public FlashcardEntity updateFlashcard(String id, FlashcardEntity flashcardDetails) throws ExecutionException, InterruptedException {
        DocumentReference docRef = firestore.collection(COLLECTION_NAME).document(id);
        flashcardDetails.setId(id); // Ensure id is correct
        ApiFuture<WriteResult> future = docRef.set(flashcardDetails);
        future.get();
        return flashcardDetails;
    }


    public void deleteFlashcard(String id) throws ExecutionException, InterruptedException {
        ApiFuture<WriteResult> future = firestore.collection(COLLECTION_NAME).document(id).delete();
        future.get();
    }


    public List<FlashcardEntity> getFlashcardsByDeckId(String deckId) throws ExecutionException, InterruptedException {
        return firestore.collection("flashcards")
                .whereEqualTo("deckId", deckId)
                .get()
                .get()
                .getDocuments()
                .stream()
                .map(doc -> doc.toObject(FlashcardEntity.class))
                .collect(Collectors.toList());
    }
}