package backend.backend.Dto.Request;

import lombok.Data;
import java.util.List;

@Data
public class UpdateProfileRequest {

    // Common
    private String name;
    private String avatarUrl;
    private String githubUsername;

    // Student fields
    private String rollNumber;
    private String bio;
    private String college;
    private String yearOfStudy;
    private List<String> interests;

    // Instructor fields
    private String employeeId;
    private String qualification;
    private String experience;
    private String specialization;
}
