package backend.backend.Repository;

import backend.backend.Entity.IndividualReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface IndividualReportRepository extends JpaRepository<IndividualReport, UUID> {
    List<IndividualReport> findByProjectGroupId(UUID groupId);
    Optional<IndividualReport> findByStudentIdAndProjectGroupId(UUID studentId, UUID groupId);
    boolean existsByStudentIdAndProjectGroupId(UUID studentId, UUID groupId);
}
