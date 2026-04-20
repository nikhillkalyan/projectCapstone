package backend.backend.Repository;

import backend.backend.Entity.Section;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SectionRepository extends JpaRepository<Section, UUID> {
    List<Section> findByBranchId(UUID branchId);
    long countByBranchUniversityId(UUID universityId);
}
