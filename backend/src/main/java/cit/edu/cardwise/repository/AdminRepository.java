package cit.edu.cardwise.repository;

import cit.edu.cardwise.entity.AdminEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AdminRepository extends JpaRepository<AdminEntity, String> {
    Optional<AdminEntity> findByEmail(String email);
}
