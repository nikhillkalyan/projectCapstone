package backend.backend.Dto.Response;

import backend.backend.Enums.ChapterType;
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
public class ChapterResponse {
    private UUID id;
    private String title;
    private String duration;
    private ChapterType type;
    private String videoUrl;
    private String textContent;
    private String description;
    private Integer chapterOrder;
    private AssessmentResponse assessment;
    private LocalDateTime deadline;
    private Double penaltyPerDay;
    private Boolean isPublished;
    private LocalDateTime createdAt;
}
