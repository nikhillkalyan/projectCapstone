package backend.backend.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;
import backend.backend.Entity.Chapter;
import java.util.List;

public interface ChapterRepository extends JpaRepository<Chapter, UUID> {
    List<Chapter> findByCourseIdOrderByChapterOrderAsc(UUID courseId);
}
