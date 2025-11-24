package cit.edu.cardwise.controller;

import cit.edu.cardwise.entity.ReviewEntity;
import cit.edu.cardwise.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.concurrent.ExecutionException;

@RestController
@RequestMapping("/review")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @PostMapping("/add")
    public ReviewEntity createReview(@RequestBody ReviewEntity review) throws ExecutionException, InterruptedException {
        return reviewService.createReview(review);
    }

    @GetMapping("/get/{id}")
    public ReviewEntity getReviewById(@PathVariable String id) throws ExecutionException, InterruptedException {
        return reviewService.getReviewById(id);
    }

    @GetMapping("/get")
    public List<ReviewEntity> getAllReviews() throws ExecutionException, InterruptedException {
        return reviewService.getAllReviews();
    }

    @PutMapping("/update")
    public ReviewEntity updateReview(@RequestBody ReviewEntity review) throws ExecutionException, InterruptedException {
        return reviewService.updateReview(review);
    }

    @DeleteMapping("/delete/{id}")
    public String deleteReview(@PathVariable String id) {
        return reviewService.deleteReview(id);
    }
}

