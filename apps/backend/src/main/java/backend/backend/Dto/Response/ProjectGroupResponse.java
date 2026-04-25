package backend.backend.Dto.Response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class ProjectGroupResponse {
    private UUID id;
    private String name;
    private String status;
    private String projectTitle;
    private String rejectionReason;
    private Boolean assignedByInstructor;
    private String instructorAssignedDoc;
    private Boolean isProposalApproved;
    private LocalDateTime createdAt;
    private List<GroupMemberResponse> members;
    private ProjectProposalResponse proposal;
    private ProjectRepoResponse repo;
    private List<IndividualReportResponse> reports;

    @Data
    @Builder
    public static class GroupMemberResponse {
        private UUID studentId;
        private String name;
        private String email;
        private String rollNumber;
        private String githubUsername;
    }
}
