package backend.backend.Dto.Response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseProgressResponse {
    private UUID courseId;
    private String courseTitle;
    private Float overallProgress;
    private Boolean isCompleted;
    private Integer totalChapters;
    private Integer completedChapters;
    private List<ProgressResponse> chapterProgress;
    private AssessmentResultResponse grandAssessmentResult;
}