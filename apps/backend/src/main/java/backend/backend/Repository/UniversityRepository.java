package backend.backend.Repository;

import backend.backend.Entity.University;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UniversityRepository extends JpaRepository<University, UUID> {
    Optional<University> findByJoinCode(String joinCode);
    Optional<University> findByName(String name);
}
