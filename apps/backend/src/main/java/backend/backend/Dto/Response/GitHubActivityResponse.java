package backend.backend.Dto.Response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class GitHubActivityResponse {
    private String repoName;
    private String githubUrl;
    private String defaultBranch;
    private List<BranchInfo> branches;
    private List<PullRequestInfo> pullRequests;
    private List<CommitInfo> recentCommits;

    @Data
    @Builder
    public static class BranchInfo {
        private String name;
        private String lastCommitSha;
        private String lastCommitMessage;
        private String lastCommitAuthor;
        private String lastCommitDate;
    }

    @Data
    @Builder
    public static class PullRequestInfo {
        private Integer number;
        private String title;
        private String state;   // open, closed, merged
        private String author;
        private String sourceBranch;
        private String targetBranch;
        private String createdAt;
        private String mergedAt;
        private String url;
        private Integer changedFiles;
        private Integer additions;
        private Integer deletions;
    }

    @Data
    @Builder
    public static class CommitInfo {
        private String sha;
        private String message;
        private String author;
        private String date;
        private String branch;
        private String url;
    }
}
