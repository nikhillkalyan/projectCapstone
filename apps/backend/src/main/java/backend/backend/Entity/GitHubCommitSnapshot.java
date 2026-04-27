package backend.backend.Entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "github_commit_snapshots")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GitHubCommitSnapshot {

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

    @Column(name = "commit_sha", nullable = false, length = 120)
    private String sha;

    @Column(name = "short_sha", length = 20)
    private String shortSha;

    @Column(name = "commit_message", columnDefinition = "TEXT")
    private String message;

    @Column(name = "author_name")
    private String author;

    @Column(name = "committed_at")
    private String committedAt;

    @Column(name = "branch_name")
    private String branchName;

    @Column(name = "commit_url", columnDefinition = "TEXT")
    private String url;

    @CreationTimestamp
    @Column(name = "synced_at", updatable = false)
    private LocalDateTime syncedAt;
}
