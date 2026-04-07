package backend.backend.Dto.Response;

import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InstructorAdminResponse {
    private UUID id;
    private String name;
    private String email;
    private String qualification;
    private String experience;
    private String specialization;
    private String bio;
    private String avatarUrl;
    private String approvalStatus;
    private String rejectionReason;
    private String flagMessage;
    private LocalDateTime registeredAt;
    private LocalDateTime approvedAt;
    private LocalDateTime flaggedAt;
    private String ugCertificateUrl;
    private String pgCertificateUrl;
    private String phdCertificateUrl;
}