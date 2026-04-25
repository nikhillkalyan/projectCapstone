package backend.backend.Dto.Request;

import lombok.Data;

@Data
public class LinkRepoRequest {
    private String githubUrl;   // e.g. https://github.com/org/repo
    private String repoName;
    private String defaultBranch; // defaults to "main" if null
}
