package backend.backend.Dto.Request;

import lombok.Data;
import java.util.List;

@Data
public class UpdateProfileRequest {

    // Common
    private String avatarUrl;

    // Student fields
    private String bio;
    private String college;
    private String yearOfStudy;
    private List<String> interests;

    // Instructor fields
    private String qualification;
    private String experience;
    private String specialization;
}