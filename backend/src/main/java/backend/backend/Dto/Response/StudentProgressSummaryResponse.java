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
public class StudentProgressSummaryResponse {
    private UUID studentId;
    private String studentName;
    private String studentAvatar;
    private Float overallProgress;
    private Boolean isCompleted;
    private Integer completedChapters;
    private Integer totalChapters;
    private List<ProgressResponse> chapterProgress;
}