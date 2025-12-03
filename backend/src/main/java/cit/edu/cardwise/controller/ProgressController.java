package cit.edu.cardwise.controller;

import cit.edu.cardwise.entity.ProgressEntity;
import cit.edu.cardwise.service.ProgressService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.concurrent.ExecutionException;

@RestController
@RequestMapping("/progress")
public class ProgressController {

    private final ProgressService progressService;

    @Autowired
    public ProgressController(ProgressService progressService) {
        this.progressService = progressService;
    }

    @PostMapping("/add")
    public ResponseEntity<ProgressEntity> createProgress(@RequestBody ProgressEntity progress) {
        try {
            // Extract userId from authenticated user
            org.springframework.security.core.Authentication authentication = 
                org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            
            if (authentication != null && authentication.getPrincipal() instanceof org.springframework.security.core.userdetails.UserDetails) {
                org.springframework.security.core.userdetails.UserDetails userDetails = 
                    (org.springframework.security.core.userdetails.UserDetails) authentication.getPrincipal();
                String username = userDetails.getUsername();
                
                // Get userId from UserService by email
                String userId = progressService.getUserIdByEmail(username);
                if (userId != null) {
                    progress.setUserId(userId);
                }
            }
            
            ProgressEntity createdProgress = progressService.createProgress(progress);
            return new ResponseEntity<>(createdProgress, HttpStatus.CREATED);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/get")
    public ResponseEntity<List<ProgressEntity>> getAllProgress() {
        try {
            List<ProgressEntity> progressList = progressService.getAllProgress();
            return new ResponseEntity<>(progressList, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/get/{id}")
    public ResponseEntity<ProgressEntity> getProgressById(@PathVariable String id) {
        try {
            return progressService.getProgressById(id)
                    .map(progress -> new ResponseEntity<>(progress, HttpStatus.OK))
                    .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/getByFlashcardId/{flashcardId}")
    public ResponseEntity<List<ProgressEntity>> getProgressByFlashcardId(@PathVariable String flashcardId) {
        try {
            List<ProgressEntity> progressList = progressService.getProgressByFlashcardId(flashcardId);
            return new ResponseEntity<>(progressList, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/getByUserId/{userId}")
    public ResponseEntity<List<ProgressEntity>> getProgressByUserId(@PathVariable String userId) {
        try {
            List<ProgressEntity> progressList = progressService.getProgressByUserId(userId);
            return new ResponseEntity<>(progressList, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/update")
    public ResponseEntity<ProgressEntity> updateProgress(@RequestBody ProgressEntity progress) {
        try {
            String progressId = progress.getProgressId();
            if (progressId == null || progressId.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            }

            return progressService.getProgressById(progressId)
                    .map(existingProgress -> {
                        try {
                            ProgressEntity updatedProgress = progressService.updateProgress(progressId, progress);
                            return new ResponseEntity<>(updatedProgress, HttpStatus.OK);
                        } catch (Exception e) {
                            return new ResponseEntity<ProgressEntity>(HttpStatus.INTERNAL_SERVER_ERROR);
                        }
                    })
                    .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteProgress(@PathVariable String id) {
        try {
            return progressService.getProgressById(id)
                    .map(progress -> {
                        try {
                            progressService.deleteProgress(id);
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

    /**
     * Track study time for a user and unlock the "Study Streak" achievement if applicable.
     * @param userId The ID of the user.
     * @param minutesSpent The number of minutes spent in study mode.
     * @return HTTP 200 if the study time is tracked successfully.
     */
    @PostMapping("/trackStudyTime")
    public ResponseEntity<Void> trackStudyTime(
            @RequestParam String userId,
            @RequestParam int minutesSpent) {
        try {
            progressService.trackStudyTime(userId, minutesSpent);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

}