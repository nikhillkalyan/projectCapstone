package backend.backend.Dto.Response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class IndividualReportResponse {
    private UUID id;
    private UUID studentId;
    private String studentName;
    private String rollNumber;
    private String fileUrl;
    private String description;
    private LocalDateTime submittedAt;
}
