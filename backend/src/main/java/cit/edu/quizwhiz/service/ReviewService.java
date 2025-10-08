package cit.edu.quizwhiz.service;

import cit.edu.quizwhiz.entity.ReviewEntity;
import com.google.api.core.ApiFuture;
import com.google.cloud.Timestamp;
import com.google.cloud.firestore.*;
import com.google.firebase.cloud.FirestoreClient;
import org.springframework.stereotype.Service;

import java.util.concurrent.ExecutionException;
import java.util.List;
import java.util.ArrayList;

@Service
public class ReviewService {

    private static final String COLLECTION_NAME = "reviews";

    public String createReview(ReviewEntity review) throws ExecutionException, InterruptedException {
        Firestore db = FirestoreClient.getFirestore();
        review.setCreatedAt(Timestamp.now());
        ApiFuture<WriteResult> collectionsApiFuture = db.collection(COLLECTION_NAME).document(review.getReviewId()).set(review);
        return collectionsApiFuture.get().getUpdateTime().toString();
    }

    public ReviewEntity getReviewById(String reviewId) throws ExecutionException, InterruptedException {
        Firestore db = FirestoreClient.getFirestore();
        DocumentReference documentReference = db.collection(COLLECTION_NAME).document(reviewId);
        ApiFuture<DocumentSnapshot> future = documentReference.get();
        DocumentSnapshot document = future.get();
        if (document.exists()) {
            return document.toObject(ReviewEntity.class);
        }
        return null;
    }

    public List<ReviewEntity> getAllReviews() throws ExecutionException, InterruptedException {
        Firestore db = FirestoreClient.getFirestore();
        ApiFuture<QuerySnapshot> future = db.collection(COLLECTION_NAME).get();
        List<QueryDocumentSnapshot> documents = future.get().getDocuments();
        List<ReviewEntity> reviews = new ArrayList<>();
        for (QueryDocumentSnapshot doc : documents) {
            reviews.add(doc.toObject(ReviewEntity.class));
        }
        return reviews;
    }

    public String updateReview(ReviewEntity review) throws ExecutionException, InterruptedException {
        Firestore db = FirestoreClient.getFirestore();
        ApiFuture<WriteResult> future = db.collection(COLLECTION_NAME).document(review.getReviewId()).set(review);
        return future.get().getUpdateTime().toString();
    }

    public String deleteReview(String reviewId) {
        Firestore db = FirestoreClient.getFirestore();
        db.collection(COLLECTION_NAME).document(reviewId).delete();
        return "Review with ID " + reviewId + " has been deleted";
    }
}
