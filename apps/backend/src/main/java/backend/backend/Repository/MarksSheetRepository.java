package backend.backend.Repository;

import backend.backend.Entity.MarksSheet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MarksSheetRepository extends JpaRepository<MarksSheet, UUID> {
    List<MarksSheet> findByCourseId(UUID courseId);
    List<MarksSheet> findByStudentId(UUID studentId);
}
