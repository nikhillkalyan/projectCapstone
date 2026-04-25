package backend.backend.Repository;

import backend.backend.Entity.ProjectGroup;
import backend.backend.Enums.GroupStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProjectGroupRepository extends JpaRepository<ProjectGroup, UUID> {

    List<ProjectGroup> findByCourseId(UUID courseId);

    List<ProjectGroup> findByProjectSpaceId(UUID projectSpaceId);

    List<ProjectGroup> findByProjectSpaceIdAndStatus(UUID projectSpaceId, GroupStatus status);

    // Find the group a specific student belongs to within a project space
    @Query("SELECT g FROM ProjectGroup g JOIN g.students s WHERE g.projectSpace.id = :spaceId AND s.id = :studentId")
    Optional<ProjectGroup> findByProjectSpaceIdAndStudentId(@Param("spaceId") UUID spaceId,
            @Param("studentId") UUID studentId);

    // Find the group a specific student belongs to within a course
    @Query("SELECT g FROM ProjectGroup g JOIN g.students s WHERE g.course.id = :courseId AND s.id = :studentId")
    Optional<ProjectGroup> findByCourseIdAndStudentId(@Param("courseId") UUID courseId,
            @Param("studentId") UUID studentId);

    // Count groups already formed in a project space
    long countByProjectSpaceId(UUID projectSpaceId);
}