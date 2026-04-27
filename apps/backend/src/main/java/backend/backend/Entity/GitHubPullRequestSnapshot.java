package backend.backend.Entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "github_pull_request_snapshots")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GitHubPullRequestSnapshot {

    @Id
    @GeneratedValue
    @Column(columnDefinition = "UUID")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_group_id", nullable = false)
    private ProjectGroup projectGroup;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_repo_id", nullable = false)
    private ProjectRepo projectRepo;

    @Column(name = "pr_number", nullable = false)
    private Integer prNumber;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String title;

    @Column(nullable = false, length = 30)
    private String state;

    @Column(name = "author_name")
    private String author;

    @Column(name = "source_branch")
    private String sourceBranch;

    @Column(name = "target_branch")
    private String targetBranch;

    @Column(name = "created_at_remote")
    private String createdAtRemote;

    @Column(name = "merged_at_remote")
    private String mergedAtRemote;

    @Column(name = "pr_url", columnDefinition = "TEXT")
    private String url;

    @Column(name = "changed_files")
    private Integer changedFiles;

    private Integer additions;

    private Integer deletions;

    @CreationTimestamp
    @Column(name = "synced_at", updatable = false)
    private LocalDateTime syncedAt;
}
