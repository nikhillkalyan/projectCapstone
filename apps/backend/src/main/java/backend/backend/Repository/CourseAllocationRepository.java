package backend.backend.Repository;

import backend.backend.Entity.CourseAllocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CourseAllocationRepository extends JpaRepository<CourseAllocation, UUID> {
    List<CourseAllocation> findBySectionId(UUID sectionId);
    List<CourseAllocation> findByCourseId(UUID courseId);
}
