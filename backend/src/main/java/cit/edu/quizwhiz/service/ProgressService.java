package cit.edu.quizwhiz.service;

import cit.edu.quizwhiz.entity.ProgressEntity;
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
public class ProgressService {

    private final Firestore firestore;
    private static final String COLLECTION_NAME = "progress";

    @Autowired
    private AchievementService achievementService;

    public ProgressService() {
        this.firestore = FirestoreClient.getFirestore();
    }

    public ProgressEntity createProgress(ProgressEntity progress) throws ExecutionException, InterruptedException {
        DocumentReference docRef = firestore.collection(COLLECTION_NAME).document();
        progress.setProgressId(docRef.getId());
        progress.setCreatedAt(Timestamp.now());
        ApiFuture<WriteResult> future = docRef.set(progress);
        future.get();
        return progress;
    }

    public List<ProgressEntity> getAllProgress() throws ExecutionException, InterruptedException {
        ApiFuture<QuerySnapshot> future = firestore.collection(COLLECTION_NAME).get();
        List<QueryDocumentSnapshot> documents = future.get().getDocuments();
        return documents.stream()
                .map(doc -> doc.toObject(ProgressEntity.class))
                .collect(Collectors.toList());
    }

    public Optional<ProgressEntity> getProgressById(String id) throws ExecutionException, InterruptedException {
        DocumentReference docRef = firestore.collection(COLLECTION_NAME).document(id);
        ApiFuture<DocumentSnapshot> future = docRef.get();
        DocumentSnapshot document = future.get();
        return document.exists() ? Optional.of(document.toObject(ProgressEntity.class)) : Optional.empty();
    }

    public List<ProgressEntity> getProgressByFlashcardId(String flashcardId) throws ExecutionException, InterruptedException {
        ApiFuture<QuerySnapshot> future = firestore.collection(COLLECTION_NAME)
                .whereEqualTo("flashCardId", flashcardId)
                .get();
        List<QueryDocumentSnapshot> documents = future.get().getDocuments();
        return documents.stream()
                .map(doc -> doc.toObject(ProgressEntity.class))
                .collect(Collectors.toList());
    }

    public ProgressEntity updateProgress(String id, ProgressEntity progressDetails) throws ExecutionException, InterruptedException {
        DocumentReference docRef = firestore.collection(COLLECTION_NAME).document(id);
        progressDetails.setProgressId(id); // Ensure ID is correct
        ApiFuture<WriteResult> future = docRef.set(progressDetails);
        future.get();
        return progressDetails;
    }

    public void deleteProgress(String id) throws ExecutionException, InterruptedException {
        ApiFuture<WriteResult> future = firestore.collection(COLLECTION_NAME).document(id).delete();
        future.get();
    }

    public void trackStudyTime(String userId, int minutesSpent) throws ExecutionException, InterruptedException {
        // Save the study session
        ProgressEntity progress = new ProgressEntity();
        progress.setFlashCardId(null); // Not tied to a specific flashcard
        progress.setScore(0); // Not relevant for study mode
        progress.setTimeSpent(minutesSpent);
        progress.setScoreComparison(null); // Not relevant for study mode
        createProgress(progress);

        // Check if the user has spent 30 minutes in study mode
        List<ProgressEntity> progressList = firestore.collection(COLLECTION_NAME)
                .whereEqualTo("userId", userId)
                .get()
                .get()
                .getDocuments()
                .stream()
                .map(doc -> doc.toObject(ProgressEntity.class))
                .collect(Collectors.toList());

        int totalMinutes = progressList.stream().mapToInt(ProgressEntity::getTimeSpent).sum();

        if (totalMinutes >= 30) {
            // Unlock the "Study Streak" achievement
            achievementService.unlockAchievement(
                    userId,
                    "Study Streak",
                    "Spend 30 minutes in study mode"
            );
        }
    }
}