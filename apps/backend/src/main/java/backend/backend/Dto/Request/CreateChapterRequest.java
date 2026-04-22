package backend.backend.Dto.Request;

import backend.backend.Enums.ChapterType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CreateChapterRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String duration;

    @NotNull(message = "Chapter type is required")
    private ChapterType type;

    private String videoUrl;
    private String textContent;
    private String description;
    private Integer chapterOrder;
    private LocalDateTime deadline;
    private Double penaltyPerDay;
}
