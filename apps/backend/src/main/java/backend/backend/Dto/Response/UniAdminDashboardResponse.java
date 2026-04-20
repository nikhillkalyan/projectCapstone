package backend.backend.Dto.Response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UniAdminDashboardResponse {
    private long totalStudents;
    private long totalInstructors;
    private long totalBranches;
    private long totalSections;
    private long pendingInstructors;  // awaiting approval
}
