package cit.edu.quizwhiz.service;

import cit.edu.quizwhiz.entity.AdminEntity;
import cit.edu.quizwhiz.entity.UserEntity;
import com.google.api.core.ApiFuture;
import com.google.cloud.Timestamp;
import com.google.cloud.firestore.*;
import com.google.firebase.cloud.FirestoreClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private final Firestore firestore;
    private static final String COLLECTION_NAME = "admins";

    @Autowired
    private PasswordEncoder passwordEncoder;

    public AdminService() {
        this.firestore = FirestoreClient.getFirestore();
    }

    public AdminEntity createAdmin(AdminEntity admin) throws ExecutionException, InterruptedException {
        // Check if admin email already exists
        Optional<AdminEntity> existingAdmin = findByEmail(admin.getEmail());
        if (existingAdmin.isPresent()) {
            throw new IllegalArgumentException("Admin email already exists");
        }

        admin.setPassword(passwordEncoder.encode(admin.getPassword()));
        admin.setCreatedAt(Timestamp.now());
        admin.setUpdatedAt(Timestamp.now());

        DocumentReference docRef = firestore.collection(COLLECTION_NAME).document();
        admin.setAdminId(docRef.getId());
        ApiFuture<WriteResult> future = docRef.set(admin);
        future.get();
        return admin;
    }

    public Optional<AdminEntity> findByEmail(String email) throws ExecutionException, InterruptedException {
        Query query = firestore.collection(COLLECTION_NAME).whereEqualTo("email", email);
        List<QueryDocumentSnapshot> docs = query.get().get().getDocuments();
        return docs.isEmpty() ? Optional.empty() : Optional.of(docs.get(0).toObject(AdminEntity.class));
    }


    public List<AdminEntity> getAllAdmins() throws ExecutionException, InterruptedException {
        ApiFuture<QuerySnapshot> future = firestore.collection(COLLECTION_NAME).get();
        List<QueryDocumentSnapshot> documents = future.get().getDocuments();
        return documents.stream()
                .map(doc -> doc.toObject(AdminEntity.class))
                .collect(Collectors.toList());
    }

    public Optional<AdminEntity> getAdminById(String id) throws ExecutionException, InterruptedException {
        DocumentReference docRef = firestore.collection(COLLECTION_NAME).document(id);
        ApiFuture<DocumentSnapshot> future = docRef.get();
        DocumentSnapshot document = future.get();
        return document.exists() ? Optional.of(document.toObject(AdminEntity.class)) : Optional.empty();
    }

    public void deleteAdmin(String id) throws ExecutionException, InterruptedException {
        firestore.collection(COLLECTION_NAME).document(id).delete().get();
    }
}