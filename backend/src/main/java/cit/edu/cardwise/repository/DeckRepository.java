package cit.edu.cardwise.repository;

import cit.edu.cardwise.entity.DeckEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DeckRepository extends JpaRepository<DeckEntity, String> {
    List<DeckEntity> findByUserId(String userId);
}
