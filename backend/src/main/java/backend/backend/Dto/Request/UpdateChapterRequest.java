package backend.backend.Dto.Request;

import backend.backend.Enums.ChapterType;
import lombok.Data;

@Data
public class UpdateChapterRequest {
    private String title;
    private String duration;
    private ChapterType type;
    private String videoUrl;
    private String textContent;
    private String description;
    private Integer chapterOrder;
}