package backend.backend.Dto.Response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class ProjectGroupMessageResponse {
    private UUID id;
    private UUID courseId;
    private UUID projectSpaceId;
    private UUID groupId;
    private UUID senderUserId;
    private String senderName;
    private String senderEmail;
    private String senderAvatar;
    private String senderRole;
    private String messageText;
    private Boolean isMine;
    private Boolean isEdited;
    private LocalDateTime sentAt;
}
