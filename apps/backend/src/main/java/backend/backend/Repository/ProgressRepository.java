package backend.backend.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;
import java.util.List;
import backend.backend.Entity.Progress;

public interface ProgressRepository extends JpaRepository<Progress, UUID> {
    List<Progress> findByStudentIdAndChapterCourseId(UUID studentId, UUID courseId);

    Optional<Progress> findByStudentIdAndChapterId(UUID studentId, UUID chapterId);
}
