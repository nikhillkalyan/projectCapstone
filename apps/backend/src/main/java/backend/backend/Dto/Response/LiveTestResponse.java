package backend.backend.Dto.Response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Builder
public class LiveTestResponse {

    private UUID id;
    private String title;
    private UUID courseId;
    private String courseTitle;
    private Integer durationMinutes;
    private Integer passingScore;
    private Boolean isLive;
    private Boolean isClosed;
    private LocalDateTime scheduledAt;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private LocalDateTime createdAt;
    private List<QuestionDto> questions;
    private Integer submissionCount;
    private Double averageScore;

    @Getter
    @Builder
    public static class QuestionDto {
        private String questionText;
        private List<String> options;
    }
}
