package backend.backend.Dto.Request;

import lombok.Data;

@Data
public class AiPromptRequest {
    private String prompt;
    private String context; // Optional additional context
}
