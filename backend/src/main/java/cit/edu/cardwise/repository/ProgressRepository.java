package cit.edu.cardwise.repository;

import cit.edu.cardwise.entity.ProgressEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProgressRepository extends JpaRepository<ProgressEntity, String> {
    List<ProgressEntity> findByFlashCardId(String flashCardId);
    List<ProgressEntity> findByUserId(String userId);
}
