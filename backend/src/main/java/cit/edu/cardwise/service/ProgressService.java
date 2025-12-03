package cit.edu.cardwise.service;

import cit.edu.cardwise.entity.ProgressEntity;
import cit.edu.cardwise.repository.ProgressRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ProgressService {

    @Autowired
    private ProgressRepository progressRepository;

    @Autowired
    private AchievementService achievementService;

    @Autowired
    private cit.edu.cardwise.repository.UserRepository userRepository;

    public ProgressEntity createProgress(ProgressEntity progress) {
        if (progress.getProgressId() == null || progress.getProgressId().isEmpty()) {
            progress.setProgressId(java.util.UUID.randomUUID().toString());
        }
        progress.setCreatedAt(LocalDateTime.now());
        return progressRepository.save(progress);
    }

    public List<ProgressEntity> getAllProgress() {
        return progressRepository.findAll();
    }

    public Optional<ProgressEntity> getProgressById(String id) {
        return progressRepository.findById(id);
    }

    public List<ProgressEntity> getProgressByFlashcardId(String flashcardId) {
        return progressRepository.findByFlashCardId(flashcardId);
    }

    public List<ProgressEntity> getProgressByUserId(String userId) {
        return progressRepository.findByUserId(userId);
    }

    public ProgressEntity updateProgress(String id, ProgressEntity progressDetails) {
        progressDetails.setProgressId(id);
        return progressRepository.save(progressDetails);
    }

    public void deleteProgress(String id) {
        progressRepository.deleteById(id);
    }

    public void trackStudyTime(String userId, int minutesSpent) {
        ProgressEntity progress = new ProgressEntity();
        progress.setProgressId(java.util.UUID.randomUUID().toString());
        progress.setUserId(userId);
        progress.setFlashCardId(null);
        progress.setScore(0);
        progress.setTimeSpent(minutesSpent);
        progress.setScoreComparison(null);
        createProgress(progress);

        List<ProgressEntity> progressList = progressRepository.findByUserId(userId);
        int totalMinutes = progressList.stream().mapToInt(ProgressEntity::getTimeSpent).sum();

        if (totalMinutes >= 30) {
            achievementService.unlockAchievement(userId, "Study Streak", "Spend 30 minutes in study mode");
        }
    }

    /**
     * Get userId by email address.
     * @param email The email address of the user.
     * @return The userId if found, null otherwise.
     */
    public String getUserIdByEmail(String email) {
        return userRepository.findByEmail(email)
                .map(cit.edu.cardwise.entity.UserEntity::getUserId)
                .orElse(null);
    }
}