package cit.edu.quizwhiz.service;

import cit.edu.quizwhiz.entity.FlashcardEntity;
import cit.edu.quizwhiz.entity.QuizEntity;
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
public class QuizService {

    private FlashcardService flashcardService;
    private final Firestore firestore;
    private static final String COLLECTION_NAME = "quizzes";

    @Autowired
    private AchievementService achievementService;

    public QuizService() {
        this.firestore = FirestoreClient.getFirestore();
    }

    public QuizEntity createQuiz(QuizEntity quiz) throws ExecutionException, InterruptedException {
        DocumentReference docRef = firestore.collection(COLLECTION_NAME).document();
        quiz.setQuizModeId(docRef.getId());
        quiz.setCreatedAt(Timestamp.now());
        quiz.setUpdatedAt(Timestamp.now());

        ApiFuture<WriteResult> future = docRef.set(quiz);
        future.get();
        return quiz;
    }

    public List<QuizEntity> getAllQuizzes() throws ExecutionException, InterruptedException {
        ApiFuture<QuerySnapshot> future = firestore.collection(COLLECTION_NAME).get();
        List<QueryDocumentSnapshot> documents = future.get().getDocuments();
        return documents.stream()
                .map(doc -> doc.toObject(QuizEntity.class))
                .collect(Collectors.toList());
    }

    public Optional<QuizEntity> getQuizById(String id) throws ExecutionException, InterruptedException {
        DocumentReference docRef = firestore.collection(COLLECTION_NAME).document(id);
        ApiFuture<DocumentSnapshot> future = docRef.get();
        DocumentSnapshot document = future.get();
        return document.exists() ? Optional.of(document.toObject(QuizEntity.class)) : Optional.empty();
    }

    public List<QuizEntity> getQuizzesByFlashcardId(String flashcardId) throws ExecutionException, InterruptedException {
        ApiFuture<QuerySnapshot> future = firestore.collection(COLLECTION_NAME)
                .whereEqualTo("flashCardId", flashcardId)
                .get();
        List<QueryDocumentSnapshot> documents = future.get().getDocuments();
        return documents.stream()
                .map(doc -> doc.toObject(QuizEntity.class))
                .collect(Collectors.toList());
    }

    public QuizEntity updateQuiz(String id, QuizEntity quizDetails) throws ExecutionException, InterruptedException {
        DocumentReference docRef = firestore.collection(COLLECTION_NAME).document(id);
        quizDetails.setQuizModeId(id); // Ensure ID is correct
        quizDetails.setUpdatedAt(Timestamp.now());
        ApiFuture<WriteResult> future = docRef.set(quizDetails);
        future.get();
        return quizDetails;
    }

    public void deleteQuiz(String id) throws ExecutionException, InterruptedException {
        ApiFuture<WriteResult> future = firestore.collection(COLLECTION_NAME).document(id).delete();
        future.get();
    }

    public List<FlashcardEntity> getFlashcardsForQuiz(String quizId) throws ExecutionException, InterruptedException {
        Optional<QuizEntity> quiz = getQuizById(quizId);
        if (quiz.isEmpty()) {
            throw new IllegalArgumentException("Quiz not found");
        }

        String deckId = quiz.get().getDeckId(); // Use deckId to fetch flashcards
        return flashcardService.getFlashcardsByDeckId(deckId);
    }

    public void completeQuiz(String userId, String quizId, int score) throws ExecutionException, InterruptedException {
        // Save the quiz result (if needed)
        Optional<QuizEntity> quiz = getQuizById(quizId);
        if (quiz.isEmpty()) {
            throw new IllegalArgumentException("Quiz not found");
        }

        // Check if the score is 100%
        if (score == 100) {
            // Unlock the "Quiz Champion" achievement
            achievementService.unlockAchievement(
                    userId,
                    "Quiz Champion",
                    "Score 100% on a quiz"
            );
        }
    }
}