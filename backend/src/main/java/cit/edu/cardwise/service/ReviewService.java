package cit.edu.cardwise.service;

import cit.edu.cardwise.entity.ReviewEntity;
import cit.edu.cardwise.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    public ReviewEntity createReview(ReviewEntity review) {
        if (review.getReviewId() == null || review.getReviewId().isEmpty()) {
            review.setReviewId(java.util.UUID.randomUUID().toString());
        }
        return reviewRepository.save(review);
    }

    public ReviewEntity getReviewById(String reviewId) {
        Optional<ReviewEntity> opt = reviewRepository.findById(reviewId);
        return opt.orElse(null);
    }

    public List<ReviewEntity> getAllReviews() {
        return reviewRepository.findAll();
    }

    public ReviewEntity updateReview(ReviewEntity review) {
        return reviewRepository.save(review);
    }

    public String deleteReview(String reviewId) {
        reviewRepository.deleteById(reviewId);
        return "Review with ID " + reviewId + " has been deleted";
    }
}
