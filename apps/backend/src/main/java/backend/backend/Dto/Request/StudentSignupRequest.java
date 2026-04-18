package backend.backend.Dto.Request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class StudentSignupRequest {

    @NotBlank(message = "Name is required")
    private String name;

    @Email(message = "Invalid email format")
    @NotBlank(message = "Email is required")
    private String email;

    @NotBlank(message = "Password is required")
    private String password;

    private String college;
    private String yearOfStudy;
    private List<String> interests;

    // University onboarding — optional (null = standalone/public signup)
    private String joinCode;
    private UUID sectionId;
}