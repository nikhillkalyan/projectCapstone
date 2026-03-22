package backend.backend.Dto.Response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProgressResponse {
    private UUID chapterId;
    private String chapterTitle;
    private Boolean completed;
    private Integer assessmentScore;
    private Boolean assessmentPassed;
    private LocalDateTime completedAt;
}