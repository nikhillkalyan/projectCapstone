package backend.backend.Dto.Response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class ProjectActivityEventResponse {
    private UUID id;
    private UUID courseId;
    private UUID projectSpaceId;
    private UUID groupId;
    private String groupName;
    private String eventType;
    private String title;
    private String description;
    private UUID actorUserId;
    private String actorName;
    private LocalDateTime createdAt;
}
