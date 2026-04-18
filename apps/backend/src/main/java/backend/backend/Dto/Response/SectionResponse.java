package backend.backend.Dto.Response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class SectionResponse {
    private UUID id;
    private String name;
    private String year;
    private UUID branchId;
    private String branchName;
    private LocalDateTime createdAt;
}
