package backend.backend.Dto.Request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class SendMessageRequest {

    @NotNull(message = "Receiver ID is required")
    private UUID receiverId;

    @NotBlank(message = "Message cannot be empty")
    private String messageText;

    private UUID replyToId;

    @NotNull(message = "Course ID is required")
    private UUID courseId;
}