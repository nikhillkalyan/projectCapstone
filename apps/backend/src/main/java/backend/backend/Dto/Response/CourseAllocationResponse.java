package backend.backend.Dto.Response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
public class CourseAllocationResponse {
    private UUID id;
    private UUID courseId;
    private String courseTitle;
    private String instructorName;
    private String targetBranch;
    private String targetYear;
    private UUID sectionId;
    private String sectionName;
    private LocalDateTime finalDeadline;
    private LocalDateTime allocatedAt;
}
