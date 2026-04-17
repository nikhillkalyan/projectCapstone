package backend.backend.Dto.Request;

import lombok.Data;

@Data
public class CreateUniversityRequest {
    private String universityName;
    private String adminName;
    private String adminEmail;
    private String adminPassword;
}
