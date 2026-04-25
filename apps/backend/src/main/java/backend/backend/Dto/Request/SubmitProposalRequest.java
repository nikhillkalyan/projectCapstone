package backend.backend.Dto.Request;

import lombok.Data;

@Data
public class SubmitProposalRequest {
    private String projectTitle;
    private String description;
    private String docUrl;
}
