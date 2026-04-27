package backend.backend.Repository;

import backend.backend.Entity.GitHubBranchSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Repository
public interface GitHubBranchSnapshotRepository extends JpaRepository<GitHubBranchSnapshot, UUID> {
    List<GitHubBranchSnapshot> findByProjectGroupIdOrderByBranchNameAsc(UUID projectGroupId);
    void deleteByProjectGroupId(UUID projectGroupId);
    void deleteByProjectGroupIdIn(Collection<UUID> projectGroupIds);
}
