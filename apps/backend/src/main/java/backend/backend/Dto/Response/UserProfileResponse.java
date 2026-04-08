package backend.backend.Dto.Response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {

    // Common fields
    private String avatarUrl;

    // Student specific
    private String college;
    private String yearOfStudy;
    private String bio;
    private List<String> interests;

    // Instructor specific
    private String qualification;
    private String experience;
    private String specialization;
    private Float rating;
    private Integer totalStudents;
    private String ugCertificateUrl;
    private String pgCertificateUrl;
    private String phdCertificateUrl;
    private String approvalStatus;
    private String rejectionReason;
    private String flagMessage;
}