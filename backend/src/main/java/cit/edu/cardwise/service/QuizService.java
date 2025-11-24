package cit.edu.cardwise.service;

import cit.edu.cardwise.entity.FlashcardEntity;
import cit.edu.cardwise.entity.QuizEntity;
import cit.edu.cardwise.repository.QuizRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class QuizService {

    @Autowired
    private QuizRepository quizRepository;

    @Autowired
    private FlashcardService flashcardService;

    @Autowired
    private AchievementService achievementService;

    public QuizEntity createQuiz(QuizEntity quiz) {
        if (quiz.getQuizModeId() == null || quiz.getQuizModeId().isEmpty()) {
            quiz.setQuizModeId(UUID.randomUUID().toString());
        }
        quiz.setCreatedAt(LocalDateTime.now());
        quiz.setUpdatedAt(LocalDateTime.now());
        return quizRepository.save(quiz);
    }

    public List<QuizEntity> getAllQuizzes() {
        return quizRepository.findAll();
    }

    public Optional<QuizEntity> getQuizById(String id) {
        return quizRepository.findById(id);
    }

    public List<QuizEntity> getQuizzesByFlashcardId(String flashcardId) {
        // Quizzes are associated to decks; to find quizzes related to a flashcard,
        // find the flashcard, get its deckId and return quizzes for that deck
        Optional<FlashcardEntity> fc = flashcardService.getFlashcardById(flashcardId);
        if (fc.isEmpty()) return List.of();
        return quizRepository.findByDeckId(fc.get().getDeckId());
    }

    public QuizEntity updateQuiz(String id, QuizEntity quizDetails) {
        quizDetails.setQuizModeId(id);
        quizDetails.setUpdatedAt(LocalDateTime.now());
        return quizRepository.save(quizDetails);
    }

    public void deleteQuiz(String id) {
        quizRepository.deleteById(id);
    }

    public List<FlashcardEntity> getFlashcardsForQuiz(String quizId) {
        Optional<QuizEntity> quiz = getQuizById(quizId);
        if (quiz.isEmpty()) {
            throw new IllegalArgumentException("Quiz not found");
        }

        String deckId = quiz.get().getDeckId(); // Use deckId to fetch flashcards
        return flashcardService.getFlashcardsByDeckId(deckId);
    }

    public void completeQuiz(String userId, String quizId, int score) {
        Optional<QuizEntity> quiz = getQuizById(quizId);
        if (quiz.isEmpty()) {
            throw new IllegalArgumentException("Quiz not found");
        }

        if (score == 100) {
            achievementService.unlockAchievement(userId, "Quiz Champion", "Score 100% on a quiz");
        }
    }
}