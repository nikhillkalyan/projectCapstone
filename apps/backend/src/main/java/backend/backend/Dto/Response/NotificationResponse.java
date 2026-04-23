package backend.backend.Dto.Response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
public class NotificationResponse {

    private UUID id;
    private String title;
    private String message;
    private String type;
    private UUID courseId;
    private UUID referenceId;
    private Boolean isRead;
    private LocalDateTime createdAt;
}
