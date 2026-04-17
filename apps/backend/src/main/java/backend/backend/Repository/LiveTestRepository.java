package backend.backend.Repository;

import backend.backend.Entity.LiveTest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface LiveTestRepository extends JpaRepository<LiveTest, UUID> {
    List<LiveTest> findByCourseId(UUID courseId);
    List<LiveTest> findByInstructorId(UUID instructorId);
}
