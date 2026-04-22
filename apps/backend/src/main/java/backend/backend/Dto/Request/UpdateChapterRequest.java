package backend.backend.Dto.Request;

import backend.backend.Enums.ChapterType;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UpdateChapterRequest {
    private String title;
    private String duration;
    private ChapterType type;
    private String videoUrl;
    private String textContent;
    private String description;
    private Integer chapterOrder;
    private LocalDateTime deadline;
    private Double penaltyPerDay;
    private Boolean isPublished;
}
