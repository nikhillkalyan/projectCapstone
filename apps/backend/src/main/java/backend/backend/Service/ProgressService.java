package backend.backend.Service;

import backend.backend.Dto.Request.SubmitAssessmentRequest;
import backend.backend.Dto.Response.AssessmentResultResponse;
import backend.backend.Dto.Response.CourseProgressResponse;
import backend.backend.Dto.Response.StudentProgressSummaryResponse;

import java.util.List;
import java.util.UUID;

public interface ProgressService {
    CourseProgressResponse getCourseProgress(UUID courseId);
    void markChapterComplete(UUID courseId, UUID chapterId);
    AssessmentResultResponse submitChapterAssessment(UUID courseId, UUID chapterId,
                                                     SubmitAssessmentRequest request);
    AssessmentResultResponse submitGrandAssessment(UUID courseId,
                                                   SubmitAssessmentRequest request);
    List<StudentProgressSummaryResponse> getStudentsProgressForInstructor(UUID courseId);
}