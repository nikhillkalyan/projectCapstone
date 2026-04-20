package backend.backend.Dto.Response;

import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
@Builder
public class StudentSummaryResponse {
    private UUID id;
    private String name;
    private String email;
    private String avatarUrl;
    private String rollNumber;
    private String college;
    private String yearOfStudy;
    private String sectionId;
    private String sectionName;
    private String branchName;
    private String year;          // e.g. "First Year"
    private List<String> interests;
}
