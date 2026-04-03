package backend.backend.Dto.Request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class CreateAssessmentRequest {

    private String title;
    private Integer passingScore;

    @NotEmpty(message = "Questions are required")
    private List<QuestionRequest> questions;

    @Data
    public static class QuestionRequest {

        @NotNull(message = "Question text is required")
        private String questionText;

        @NotNull(message = "Correct option index is required")
        private Integer correctOptionIndex;

        @NotEmpty(message = "Options are required")
        private List<String> options;
    }
}