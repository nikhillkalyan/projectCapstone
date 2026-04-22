package backend.backend.Service;

import backend.backend.Dto.Request.CreateAssessmentRequest;
import backend.backend.Dto.Request.CreateChapterRequest;
import backend.backend.Dto.Request.UpdateChapterRequest;
import backend.backend.Dto.Response.AssessmentResponse;
import backend.backend.Dto.Response.ChapterResponse;

import java.util.List;
import java.util.UUID;

public interface ChapterService {
    List<ChapterResponse> getChaptersByCourse(UUID courseId);
    ChapterResponse addChapter(UUID courseId, CreateChapterRequest request);
    ChapterResponse updateChapter(UUID courseId, UUID chapterId, UpdateChapterRequest request);
    void deleteChapter(UUID courseId, UUID chapterId);
    AssessmentResponse addChapterAssessment(UUID courseId, UUID chapterId, CreateAssessmentRequest request);
    AssessmentResponse addGrandAssessment(UUID courseId, CreateAssessmentRequest request);
}
