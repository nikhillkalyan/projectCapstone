package backend.backend.Repository;

import backend.backend.Entity.User;
import backend.backend.Enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    Optional<User> findFirstByUniversityIdAndRole(UUID universityId, Role role);
}