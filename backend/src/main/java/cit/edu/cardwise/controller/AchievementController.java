package cit.edu.cardwise.controller;

import cit.edu.cardwise.entity.AchievementEntity;
import cit.edu.cardwise.service.AchievementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.concurrent.ExecutionException;

@RestController
@RequestMapping("/achievements")
public class AchievementController {

    @Autowired
    private AchievementService achievementService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<AchievementEntity>> getAchievementsByUserId(@PathVariable String userId)
            throws ExecutionException, InterruptedException {
        return ResponseEntity.ok(achievementService.getAchievementsByUserIdAsync(userId).get());
    }


    @PostMapping("/unlock")
    public ResponseEntity<Void> unlockAchievement(@RequestParam String userId, @RequestParam String title, @RequestParam String description) {
        try {
            achievementService.unlockAchievement(userId, title, description);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }


}