package backend.backend.DTO.Auth;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentSignupRequest {
    private String name;
    private String email;
    private String password;
    private String college;
    private String year;
    private List<String> interests;
}
