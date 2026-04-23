package backend.backend.Dto.Request;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class CreateLiveTestRequest {

    private String title;
    private Integer durationMinutes;
    private Integer passingScore;
    private LocalDateTime scheduledAt;
    private List<QuestionDto> questions;

    @Data
    public static class QuestionDto {
        private String questionText;
        private List<String> options;
        private Integer correctOptionIndex;
    }
}
