package backend.backend.Dto.Request;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class SubmitAssessmentRequest {

    @NotEmpty(message = "Answers are required")
    private List<Integer> answers;
}