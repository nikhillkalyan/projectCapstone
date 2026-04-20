package backend.backend.Repository;

import backend.backend.Entity.Instructor;
import backend.backend.Enums.ApprovalStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface InstructorRepository extends JpaRepository<Instructor, UUID> {

    List<Instructor> findByApprovalStatusOrderByRegisteredAtDesc(ApprovalStatus status);

    @Query(value = "SELECT i.* FROM instructors i JOIN users u ON u.id = i.id " +
                   "WHERE (:status IS NULL OR i.approval_status = :status) " +
                   "AND (:search IS NULL OR LOWER(u.name::text) LIKE LOWER(CONCAT('%', :search, '%')) " +
                   "OR LOWER(u.email::text) LIKE LOWER(CONCAT('%', :search, '%'))) " +
                   "ORDER BY i.registered_at DESC",
           nativeQuery = true)
    List<Instructor> findWithFilters(
            @Param("status") String status,
            @Param("search") String search);

    long countByApprovalStatus(ApprovalStatus status);

    /** All instructors belonging to a specific university. */
    List<Instructor> findByUserUniversityId(UUID universityId);

    /** Count instructors by university for dashboard stats. */
    long countByUserUniversityId(UUID universityId);

    /** Count instructors by university + approval status (e.g. pending). */
    long countByUserUniversityIdAndApprovalStatus(UUID universityId, ApprovalStatus approvalStatus);
}