package backend.backend.Dto.Response;

import lombok.Builder;
import lombok.Getter;

import java.util.UUID;

@Getter
@Builder
public class LiveTestResultResponse {

    private UUID liveTestId;
    private String title;
    private Double score;
    private Boolean passed;
    private Integer passingScore;
    private Integer totalQuestions;
    private Integer correctAnswers;
}
