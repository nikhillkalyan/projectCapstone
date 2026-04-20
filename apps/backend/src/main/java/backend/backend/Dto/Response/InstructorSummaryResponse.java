package backend.backend.Dto.Response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class InstructorSummaryResponse {
    private UUID id;
    private String name;
    private String email;
    private String avatarUrl;
    private String employeeId;
    private String branchId;
    private String branchName;
    private String qualification;
    private String experience;
    private String specialization;
    private String approvalStatus;  // PENDING | APPROVED | REJECTED | REMOVED
    private Float rating;
    private Integer totalStudents;
    private LocalDateTime registeredAt;
}