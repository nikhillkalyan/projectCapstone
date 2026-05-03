package backend.backend.Dto.Response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class PublicCertificateVerificationResponse {

    private String certificateId;
    private String courseTitle;
    private String instructorName;
    private String studentName;
    private String rollNumber;
    private String branchName;
    private String sectionName;
    private String universityName;
    private Double finalScore;
    private String grade;
    private LocalDateTime approvedAt;
    private String status;
}
