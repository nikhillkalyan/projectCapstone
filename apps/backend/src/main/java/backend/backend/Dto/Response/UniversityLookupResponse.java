package backend.backend.Dto.Response;

import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.UUID;

/**
 * Returned by the public join-code lookup endpoint.
 * Gives the signup form everything it needs to populate branch/section dropdowns.
 */
@Data
@Builder
public class UniversityLookupResponse {
    private UUID id;
    private String name;
    private String joinCode;
    private List<BranchResponse> branches; // each BranchResponse includes its sections list
}
