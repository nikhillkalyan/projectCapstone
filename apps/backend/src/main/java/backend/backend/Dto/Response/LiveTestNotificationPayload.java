package backend.backend.Dto.Response;

import lombok.Builder;
import lombok.Getter;

import java.util.UUID;

@Getter
@Builder
public class LiveTestNotificationPayload {

    private String event;
    private UUID liveTestId;
    private String title;
    private Integer durationMinutes;
    private UUID courseId;
    private String courseTitle;
}
