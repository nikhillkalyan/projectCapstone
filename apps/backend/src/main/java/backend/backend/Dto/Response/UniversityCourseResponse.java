package backend.backend.Dto.Response;

import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UniversityCourseResponse {

    private UUID id;
    private String title;
    private String description;
    private String longDescription;
    private String thumbnail;
    private String duration;

    // University context
    private UUID universityId;
    private String universityName;

    // Targeting
    private UUID targetBranchId;
    private String targetBranchName;
    private String targetYear;

    // Weightage breakdown
    private Integer weightTests;
    private Integer weightAttendance;
    private Integer weightLiveTests;
    private Integer weightProject;
    private Double defaultPenaltyPerDay;
    private String penaltyDescription;

    // Instructor info
    private UUID instructorId;
    private String instructorName;
    private String instructorAvatar;
    private String instructorEmployeeId;

    // Status
    private Boolean isApprovedByUniAdmin;
    private String approvalStatus;   // "PENDING" | "APPROVED" | "REJECTED"
    private String rejectionReason;

    private LocalDateTime createdAt;
}
