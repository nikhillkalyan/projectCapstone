package backend.backend.Dto.Request;

import lombok.Data;

@Data
public class AssignProjectRequest {
    private String projectTitle;
    private String projectDoc;   // description or URL of what they need to build
}
