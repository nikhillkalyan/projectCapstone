package backend.backend.Dto.Request;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
public class CreateUniversityCourseAllocationRequest {
    private UUID courseId;
    private List<UUID> sectionIds;
    private LocalDateTime finalDeadline;
}
