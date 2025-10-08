package cit.edu.quizwhiz.service;

import cit.edu.quizwhiz.entity.DeckEntity;
import com.google.api.core.ApiFuture;
import com.google.cloud.Timestamp;
import com.google.cloud.firestore.*;
import com.google.firebase.cloud.FirestoreClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;

@Service
public class DeckService {

    private final Firestore firestore;
    private static final String COLLECTION_NAME = "decks";

    @Autowired
    private AchievementService achievementService;

    public DeckService() {
        this.firestore = FirestoreClient.getFirestore();
    }

    public DeckEntity createDeck(DeckEntity deck) throws ExecutionException, InterruptedException {
        // Check if this is the user's first deck
        ApiFuture<QuerySnapshot> queryFuture = firestore.collection(COLLECTION_NAME)
                .whereEqualTo("userId", deck.getUserId())
                .get();

        List<QueryDocumentSnapshot> userDecks = queryFuture.get().getDocuments();
        boolean isFirstDeck = userDecks.isEmpty();

        // Now create and save the deck
        DocumentReference docRef = firestore.collection(COLLECTION_NAME).document(); // Auto-generated ID
        deck.setId(docRef.getId());
        deck.setCreatedAt(Timestamp.now());
        deck.setUpdatedAt(Timestamp.now());

        ApiFuture<WriteResult> future = docRef.set(deck);
        future.get();

        // Unlock achievement only if it's the first deck
        if (isFirstDeck) {
            achievementService.unlockAchievement(
                    deck.getUserId(),
                    "Deck Creator",
                    "Create your first deck"
            );
        }

        return deck;
    }



    public List<DeckEntity> getAllDecks() throws ExecutionException, InterruptedException {
        ApiFuture<QuerySnapshot> future = firestore.collection(COLLECTION_NAME).get();
        List<QueryDocumentSnapshot> documents = future.get().getDocuments();
        return documents.stream()
                .map(doc -> doc.toObject(DeckEntity.class))
                .collect(Collectors.toList());
    }

    public Optional<DeckEntity> getDeckById(String id) throws ExecutionException, InterruptedException {
        DocumentReference docRef = firestore.collection(COLLECTION_NAME).document(id);
        ApiFuture<DocumentSnapshot> future = docRef.get();
        DocumentSnapshot document = future.get();
        return document.exists() ? Optional.of(document.toObject(DeckEntity.class)) : Optional.empty();
    }

    public DeckEntity updateDeck(String id, DeckEntity deckDetails) throws ExecutionException, InterruptedException {
        DocumentReference docRef = firestore.collection(COLLECTION_NAME).document(id);
        deckDetails.setUpdatedAt(Timestamp.now());
        ApiFuture<WriteResult> future = docRef.set(deckDetails);
        future.get();
        return deckDetails;
    }


    public void deleteDeck(String id) throws ExecutionException, InterruptedException {
        ApiFuture<WriteResult> future = firestore.collection(COLLECTION_NAME).document(id).delete();
        future.get(); // Wait for the delete operation to complete
    }
}