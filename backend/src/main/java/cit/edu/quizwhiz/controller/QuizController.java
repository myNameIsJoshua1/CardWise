package cit.edu.quizwhiz.controller;

import cit.edu.quizwhiz.entity.FlashcardEntity;
import cit.edu.quizwhiz.entity.QuizEntity;
import cit.edu.quizwhiz.service.QuizService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.concurrent.ExecutionException;

@RestController
@RequestMapping("/quiz")
@CrossOrigin(origins = "*")
public class QuizController {

    private final QuizService quizService;

    @Autowired
    public QuizController(QuizService quizService) {
        this.quizService = quizService;
    }

    @PostMapping("/add")
    public ResponseEntity<QuizEntity> createQuiz(@RequestBody QuizEntity quiz) {
        try {
            QuizEntity createdQuiz = quizService.createQuiz(quiz);
            return new ResponseEntity<>(createdQuiz, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/get")
    public ResponseEntity<List<QuizEntity>> getAllQuizzes() {
        try {
            List<QuizEntity> quizzes = quizService.getAllQuizzes();
            return new ResponseEntity<>(quizzes, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/get/{id}")
    public ResponseEntity<QuizEntity> getQuizById(@PathVariable String id) {
        try {
            return quizService.getQuizById(id)
                    .map(quiz -> new ResponseEntity<>(quiz, HttpStatus.OK))
                    .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/getByFlashcardId/{flashcardId}")
    public ResponseEntity<List<QuizEntity>> getQuizzesByFlashcardId(@PathVariable String flashcardId) {
        try {
            List<QuizEntity> quizzes = quizService.getQuizzesByFlashcardId(flashcardId);
            return new ResponseEntity<>(quizzes, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/update")
    public ResponseEntity<QuizEntity> updateQuiz(@RequestBody QuizEntity quiz) {
        try {
            String quizId = quiz.getQuizModeId();
            if (quizId == null || quizId.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            }

            return quizService.getQuizById(quizId)
                    .map(existingQuiz -> {
                        try {
                            QuizEntity updatedQuiz = quizService.updateQuiz(quizId, quiz);
                            return new ResponseEntity<>(updatedQuiz, HttpStatus.OK);
                        } catch (Exception e) {
                            return new ResponseEntity<QuizEntity>(HttpStatus.INTERNAL_SERVER_ERROR);
                        }
                    })
                    .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteQuiz(@PathVariable String id) {
        try {
            return quizService.getQuizById(id)
                    .map(quiz -> {
                        try {
                            quizService.deleteQuiz(id);
                            return new ResponseEntity<Void>(HttpStatus.NO_CONTENT);
                        } catch (Exception e) {
                            return new ResponseEntity<Void>(HttpStatus.INTERNAL_SERVER_ERROR);
                        }
                    })
                    .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/{id}/flashcards")
    public ResponseEntity<List<FlashcardEntity>> getFlashcardsForQuiz(@PathVariable String id) {
        try {
            List<FlashcardEntity> flashcards = quizService.getFlashcardsForQuiz(id);
            return ResponseEntity.ok(flashcards);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    /**
     * Complete a quiz and check for achievements.
     * @param userId The ID of the user.
     * @param quizId The ID of the quiz.
     * @param score The score the user achieved.
     * @return HTTP 200 if the quiz is processed successfully.
     */
    @PostMapping("/complete")
    public ResponseEntity<Void> completeQuiz(
            @RequestParam String userId,
            @RequestParam String quizId,
            @RequestParam int score) {
        try {
            quizService.completeQuiz(userId, quizId, score);
            return ResponseEntity.ok().build();
        } catch (ExecutionException | InterruptedException e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(400).body(null);
        }
    }
}