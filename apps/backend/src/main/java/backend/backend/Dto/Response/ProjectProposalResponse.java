package backend.backend.Dto.Response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class ProjectProposalResponse {
    private UUID id;
    private String projectTitle;
    private String description;
    private String docUrl;
    private String status;
    private String rejectionReason;
    private LocalDateTime submittedAt;
    private LocalDateTime reviewedAt;
}
