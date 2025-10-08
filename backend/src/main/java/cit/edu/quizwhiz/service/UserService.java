package cit.edu.quizwhiz.service;

import cit.edu.quizwhiz.entity.UserEntity;
import com.google.api.core.ApiFuture;
import com.google.cloud.Timestamp;
import com.google.cloud.firestore.*;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import com.google.firebase.cloud.FirestoreClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private PasswordEncoder passwordEncoder;

    private final Firestore firestore;
    private static final String COLLECTION_NAME = "users";


    public UserService() {
        this.firestore = FirestoreClient.getFirestore();
    }

    public UserEntity createUser(UserEntity user) throws ExecutionException, InterruptedException {
        Optional<UserEntity> existingUser = findByEmail(user.getEmail());
        if (existingUser.isPresent()) {
            throw new IllegalArgumentException("Email already exists");
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setCreatedAt(Timestamp.now());
        user.setUpdatedAt(Timestamp.now());
        DocumentReference docRef = firestore.collection(COLLECTION_NAME).document();
        user.setUserId(docRef.getId());
        ApiFuture<WriteResult> future = docRef.set(user);
        future.get();
        return user;
    }


    // Get all users
    public List<UserEntity> getAllUsers() throws ExecutionException, InterruptedException {
        ApiFuture<QuerySnapshot> future = firestore.collection(COLLECTION_NAME).get();
        List<QueryDocumentSnapshot> documents = future.get().getDocuments();

        System.out.println("Fetched documents: " + documents.size());

        return documents.stream()
                .map(doc -> {
                    try {
                        return doc.toObject(UserEntity.class);
                    } catch (Exception e) {
                        System.err.println("Error converting doc: " + doc.getId());
                        e.printStackTrace();
                        return null;
                    }
                })
                .filter(u -> u != null)
                .collect(Collectors.toList());
    }

    // Get user by ID
    public Optional<UserEntity> getUserById(String id) throws ExecutionException, InterruptedException {
        DocumentReference docRef = firestore.collection(COLLECTION_NAME).document(id);
        ApiFuture<DocumentSnapshot> future = docRef.get();
        DocumentSnapshot document = future.get();
        return document.exists() ? Optional.of(document.toObject(UserEntity.class)) : Optional.empty();
    }

    // Update user
    public UserEntity updateUser(String id, UserEntity updatedUser) throws ExecutionException, InterruptedException {
        updatedUser.setUpdatedAt(Timestamp.now());
        DocumentReference docRef = firestore.collection(COLLECTION_NAME).document(id);
        ApiFuture<WriteResult> future = docRef.set(updatedUser);
        future.get(); // Wait for the update to complete
        return updatedUser;
    }

    // Delete user
    public void deleteUser(String id) throws ExecutionException, InterruptedException {
        ApiFuture<WriteResult> future = firestore.collection(COLLECTION_NAME).document(id).delete();
        future.get();
    }

    public Optional<UserEntity> loginUser(String email, String password) throws ExecutionException, InterruptedException, FirebaseAuthException {
        if (password == null || password.isEmpty()) {
            // OAuth login: treat 'email' as Firebase token (rename this param for clarity if needed)
            FirebaseToken firebaseToken = FirebaseAuth.getInstance().verifyIdToken(email);
            if (firebaseToken != null) {
                return findByEmail(firebaseToken.getEmail());
            } else {
                return Optional.empty();
            }
        } else {
            // Email/password login
            List<QueryDocumentSnapshot> documents = firestore
                    .collection(COLLECTION_NAME)
                    .whereEqualTo("email", email)
                    .get()
                    .get()
                    .getDocuments();

            if (documents.isEmpty()) {
                return Optional.empty();
            }

            UserEntity user = documents.get(0).toObject(UserEntity.class);
            return passwordEncoder.matches(password, user.getPassword()) ? Optional.of(user) : Optional.empty();
        }
    }



    public Optional<UserEntity> findByEmail(String email) throws ExecutionException, InterruptedException {
        Query query = firestore.collection(COLLECTION_NAME)
                .whereEqualTo("email", email);
        List<QueryDocumentSnapshot> docs = query.get().get().getDocuments();
        return docs.isEmpty() ? Optional.empty() : Optional.of(docs.get(0).toObject(UserEntity.class));
    }


    public UserEntity createOrGetOAuthUser(String email, String fullName) throws ExecutionException, InterruptedException {
        Firestore db = FirestoreClient.getFirestore();

        // Check if the user already exists in Firestore
        ApiFuture<QuerySnapshot> query = db.collection("users")
                .whereEqualTo("email", email)
                .get();
        List<QueryDocumentSnapshot> documents = query.get().getDocuments();

        if (!documents.isEmpty()) {
            // User already exists, return the existing user
            return documents.get(0).toObject(UserEntity.class);
        }

        // Split the full name into first and last name
        String[] nameParts = fullName.split(" ", 2);
        String firstName = nameParts[0];
        String lastName = nameParts.length > 1 ? nameParts[1] : "";

        // Create a new user
        UserEntity user = new UserEntity();
        user.setUserId(UUID.randomUUID().toString());
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setEmail(email);
        user.setPassword(""); // No password for OAuth users
        user.setCreatedAt(Timestamp.now());
        user.setUpdatedAt(Timestamp.now());

        // Save the user to Firestore
        db.collection("users").document(user.getUserId()).set(user);

        return user;
    }

    // Change user password
    public boolean changePassword(String userId, String currentPassword, String newPassword)
            throws ExecutionException, InterruptedException {

        // Retrieve user by ID
        Optional<UserEntity> userOpt = getUserById(userId);
        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("User not found");
        }

        UserEntity user = userOpt.get();

        // Verify current password
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            return false; // Incorrect current password
        }

        // Hash and set new password
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setUpdatedAt(Timestamp.now());

        // Update user in database
        DocumentReference docRef = firestore.collection(COLLECTION_NAME).document(userId);
        ApiFuture<WriteResult> future = docRef.set(user);
        future.get(); // Wait for the update to complete

        return true;
    }


    // Get user count
    public long getUserCount() throws ExecutionException, InterruptedException {
        return firestore.collection(COLLECTION_NAME).get().get().size();
    }
}
