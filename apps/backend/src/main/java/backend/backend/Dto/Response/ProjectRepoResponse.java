package backend.backend.Dto.Response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class ProjectRepoResponse {
    private UUID id;
    private String repoName;
    private String githubUrl;
    private String defaultBranch;
    private LocalDateTime createdAt;
}
