package backend.backend.Dto.Response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
public class StudentApprovedFinalMarksResponse {

    private UUID courseId;
    private String courseTitle;
    private String instructorName;

    private UUID studentId;
    private String studentName;
    private String rollNumber;
    private String branchName;
    private String sectionName;

    private Double finalScore;
    private String grade;
    private LocalDateTime approvedAt;
    private String status;
}
