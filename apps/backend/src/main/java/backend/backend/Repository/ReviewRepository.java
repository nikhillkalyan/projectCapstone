package backend.backend.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;
import java.util.List;
import backend.backend.Entity.Review;

public interface ReviewRepository extends JpaRepository<Review, UUID> {
    List<Review> findByCourseId(UUID courseId);

    boolean existsByStudentIdAndCourseId(UUID studentId, UUID courseId);
}
