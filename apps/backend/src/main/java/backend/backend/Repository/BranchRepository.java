package backend.backend.Repository;

import backend.backend.Entity.Branch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface BranchRepository extends JpaRepository<Branch, UUID> {
    List<Branch> findByUniversityId(UUID universityId);
    long countByUniversityId(UUID universityId);
}
