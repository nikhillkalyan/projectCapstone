package backend.backend.Dto.Request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.UUID;

@Data
public class InstructorSignupRequest {

    @NotBlank(message = "Name is required")
    private String name;

    @Email(message = "Invalid email format")
    @NotBlank(message = "Email is required")
    private String email;

    @NotBlank(message = "Password is required")
    private String password;

    private String qualification;
    private String experience;
    private String specialization;
    private String bio;

    @NotBlank(message = "UG Certificate URL is required")
    private String ugCertificateUrl;

    private String pgCertificateUrl;
    private String phdCertificateUrl;

    // University onboarding — optional (null = standalone/public signup)
    private String joinCode;
    private UUID branchId;
}