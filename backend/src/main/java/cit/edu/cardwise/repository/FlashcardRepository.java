package cit.edu.cardwise.repository;

import cit.edu.cardwise.entity.FlashcardEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FlashcardRepository extends JpaRepository<FlashcardEntity, String> {
    List<FlashcardEntity> findByDeckId(String deckId);
}
