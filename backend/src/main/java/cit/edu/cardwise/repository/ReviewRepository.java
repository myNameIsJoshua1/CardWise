package cit.edu.cardwise.repository;

import cit.edu.cardwise.entity.ReviewEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<ReviewEntity, String> {
    List<ReviewEntity> findByFlashCardId(String flashCardId);
}
