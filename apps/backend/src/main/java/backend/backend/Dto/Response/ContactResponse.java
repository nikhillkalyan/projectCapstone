package backend.backend.Dto.Response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContactResponse {
    private UUID userId;
    private String userName;
    private String avatarUrl;
    private UUID courseId;
    private String courseTitle;
    private long unreadCount;
    private boolean isRemoved;
}
