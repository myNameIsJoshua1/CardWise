package cit.edu.cardwise.service;

import cit.edu.cardwise.entity.AchievementEntity;
import cit.edu.cardwise.repository.AchievementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;

@Service
public class AchievementService {

    @Autowired
    private AchievementRepository achievementRepository;

    private final Executor asyncExecutor;

    public AchievementService(Executor asyncExecutor) {
        this.asyncExecutor = asyncExecutor;
    }

    @Async
    public CompletableFuture<Boolean> isAchievementUnlockedAsync(String userId, String title) {
        return CompletableFuture.supplyAsync(() -> achievementRepository.findByUserId(userId).stream()
                .anyMatch(a -> a.isUnlocked() && title.equals(a.getTitle())), asyncExecutor);
    }

    @CacheEvict(value = "achievements", key = "#userId")
    public void unlockAchievement(String userId, String title, String description) {
        boolean already = achievementRepository.findByUserId(userId).stream()
                .anyMatch(a -> a.isUnlocked() && title.equals(a.getTitle()));
        if (already) {
            System.out.println("Achievement already unlocked for user: " + userId);
            return;
        }

        AchievementEntity achievement = new AchievementEntity();
        achievement.setAchievementId(java.util.UUID.randomUUID().toString());
        achievement.setUserId(userId);
        achievement.setTitle(title);
        achievement.setDescription(description);
        achievement.setUnlocked(true);

        achievementRepository.save(achievement);
    }

    @Async
    public CompletableFuture<List<AchievementEntity>> getAchievementsByUserIdAsync(String userId) {
        return CompletableFuture.supplyAsync(() -> achievementRepository.findByUserId(userId), asyncExecutor);
    }
}
