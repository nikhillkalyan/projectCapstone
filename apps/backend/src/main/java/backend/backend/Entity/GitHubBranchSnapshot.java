package backend.backend.Entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "github_branch_snapshots")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GitHubBranchSnapshot {

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

    @Column(name = "branch_name", nullable = false)
    private String branchName;

    @Column(name = "last_commit_sha", length = 120)
    private String lastCommitSha;

    @Column(name = "last_commit_message", columnDefinition = "TEXT")
    private String lastCommitMessage;

    @Column(name = "last_commit_author")
    private String lastCommitAuthor;

    @Column(name = "last_commit_date")
    private String lastCommitDate;

    @CreationTimestamp
    @Column(name = "synced_at", updatable = false)
    private LocalDateTime syncedAt;
}
