package cit.edu.quizwhiz.service;

import cit.edu.quizwhiz.entity.AchievementEntity;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.google.firebase.cloud.FirestoreClient;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Executor;
import java.util.stream.Collectors;

@Service
public class AchievementService {

    private final Firestore firestore;
    private final Executor asyncExecutor;
    private static final String COLLECTION_NAME = "achievements";

    public AchievementService(Executor asyncExecutor) {
        this.firestore = FirestoreClient.getFirestore();
        this.asyncExecutor = asyncExecutor;
    }

    @Async
    public CompletableFuture<Boolean> isAchievementUnlockedAsync(String userId, String title) {
        ApiFuture<QuerySnapshot> future = firestore.collection(COLLECTION_NAME)
                .whereEqualTo("userId", userId)
                .whereEqualTo("title", title)
                .whereEqualTo("unlocked", true)
                .get();

        return CompletableFuture.supplyAsync(() -> {
            try {
                return !future.get().getDocuments().isEmpty();
            } catch (InterruptedException | ExecutionException e) {
                throw new RuntimeException("Failed to check achievement", e);
            }
        }, asyncExecutor);
    }

    @CacheEvict(value = "achievements", key = "#userId")
    public void unlockAchievement(String userId, String title, String description) throws ExecutionException, InterruptedException {
        ApiFuture<QuerySnapshot> future = firestore.collection(COLLECTION_NAME)
                .whereEqualTo("userId", userId)
                .whereEqualTo("title", title)
                .whereEqualTo("unlocked", true)
                .get();

        if (!future.get().getDocuments().isEmpty()) {
            System.out.println("Achievement already unlocked for user: " + userId);
            return;
        }

        AchievementEntity achievement = new AchievementEntity();
        achievement.setUserId(userId);
        achievement.setTitle(title);
        achievement.setDescription(description);
        achievement.setUnlocked(true);

        DocumentReference docRef = firestore.collection(COLLECTION_NAME).document();
        achievement.setAchievementId(docRef.getId());
        docRef.set(achievement).get();
    }

    @Async
    public CompletableFuture<List<AchievementEntity>> getAchievementsByUserIdAsync(String userId) {
        ApiFuture<QuerySnapshot> future = firestore.collection(COLLECTION_NAME)
                .whereEqualTo("userId", userId)
                .get();

        return CompletableFuture.supplyAsync(() -> {
            try {
                return future.get().getDocuments().stream()
                        .map(doc -> doc.toObject(AchievementEntity.class))
                        .collect(Collectors.toList());
            } catch (InterruptedException | ExecutionException e) {
                throw new RuntimeException("Failed to fetch achievements", e);
            }
        }, asyncExecutor);
    }
}
