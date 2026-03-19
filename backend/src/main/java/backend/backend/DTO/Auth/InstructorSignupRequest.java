package backend.backend.DTO.Auth;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InstructorSignupRequest {
    private String name;
    private String email;
    private String password;
    private String qualification;
    private String experience;
    private String specialization;
    private String bio;
}
