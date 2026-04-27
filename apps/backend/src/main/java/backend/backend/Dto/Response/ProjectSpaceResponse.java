package backend.backend.Dto.Response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class ProjectSpaceResponse {
    private UUID id;
    private UUID courseId;
    private String courseTitle;
    private Integer groupSize;
    private Integer totalStudents;
    private Integer totalGroups;
    private Integer approvedGroupCount;
    private Integer repoLinkedGroupCount;
    private LocalDateTime proposalDeadline;
    private LocalDateTime projectDeadline;
    private String projectDescription;
    private Boolean isGroupsFormed;
    private LocalDateTime createdAt;
    private List<ProjectGroupResponse> groups;
    private List<ProjectActivityEventResponse> recentActivity;
}
