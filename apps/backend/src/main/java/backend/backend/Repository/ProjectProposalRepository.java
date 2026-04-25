package backend.backend.Repository;

import backend.backend.Entity.ProjectProposal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProjectProposalRepository extends JpaRepository<ProjectProposal, UUID> {
    Optional<ProjectProposal> findByProjectGroupId(UUID groupId);
    List<ProjectProposal> findByStatus(String status);
}
