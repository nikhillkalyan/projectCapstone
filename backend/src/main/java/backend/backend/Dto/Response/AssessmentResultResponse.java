package backend.backend.Dto.Response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssessmentResultResponse {
    private Integer score;
    private Integer passingScore;
    private Boolean passed;
    private Integer totalQuestions;
    private Integer correctAnswers;
}