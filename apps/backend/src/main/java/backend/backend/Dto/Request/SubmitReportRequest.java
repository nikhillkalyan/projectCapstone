package backend.backend.Dto.Request;

import lombok.Data;

@Data
public class SubmitReportRequest {
    private String fileUrl;
    private String description;
}
