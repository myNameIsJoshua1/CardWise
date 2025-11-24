package cit.edu.cardwise.repository;

import cit.edu.cardwise.entity.QuizEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuizRepository extends JpaRepository<QuizEntity, String> {
    List<QuizEntity> findByDeckId(String deckId);
}
