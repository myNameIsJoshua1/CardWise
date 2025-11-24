package cit.edu.cardwise.repository;

import cit.edu.cardwise.entity.AchievementEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AchievementRepository extends JpaRepository<AchievementEntity, String> {
    List<AchievementEntity> findByUserId(String userId);
}
