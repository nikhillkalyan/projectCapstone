package backend.backend.Dto.Request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SendProjectGroupMessageRequest {
    @NotBlank(message = "Message cannot be empty")
    private String messageText;
}
