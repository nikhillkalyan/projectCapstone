package backend.backend.Dto.Request;

import lombok.Data;

@Data
public class ReviewProposalRequest {
    private String action; // "APPROVE" or "REJECT"
    private String rejectionReason; // required if action = REJECT
}
