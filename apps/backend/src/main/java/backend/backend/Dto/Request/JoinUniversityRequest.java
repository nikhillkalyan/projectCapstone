package backend.backend.Dto.Request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.UUID;

@Data
public class JoinUniversityRequest {
    @NotBlank(message = "Join code is required")
    private String joinCode;

    private UUID branchId;     // Optional for instructors, required for students
    private UUID sectionId;    // Required for students
    
    private String rollNumber; // Required for students
    private String college;    // Optional/Required for students based on context
    private String yearOfStudy;// Optional/Required for students based on context
    
    private String employeeId; // Optional for instructors
}
