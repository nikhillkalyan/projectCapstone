package backend.backend.Repository;

import backend.backend.Entity.LiveTestSubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LiveTestSubmissionRepository extends JpaRepository<LiveTestSubmission, UUID> {

    Optional<LiveTestSubmission> findByLiveTestIdAndStudentId(UUID liveTestId, UUID studentId);

    List<LiveTestSubmission> findByLiveTestId(UUID liveTestId);

    List<LiveTestSubmission> findByStudentId(UUID studentId);

    List<LiveTestSubmission> findByStudentIdAndLiveTestCourseId(UUID studentId, UUID courseId);

    boolean existsByLiveTestIdAndStudentId(UUID liveTestId, UUID studentId);

    @Query("SELECT AVG(submission.score) FROM LiveTestSubmission submission WHERE submission.liveTest.id = :liveTestId")
    Double findAverageScoreByLiveTestId(@Param("liveTestId") UUID liveTestId);
}
