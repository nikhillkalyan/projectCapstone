package backend.backend.Dto.Response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class UniversityResponse {
    private UUID id;
    private String name;
    private String joinCode;
    private Boolean isActive;
    private String adminName;
    private String adminEmail;
    private UUID adminUserId;
    private LocalDateTime createdAt;
}
