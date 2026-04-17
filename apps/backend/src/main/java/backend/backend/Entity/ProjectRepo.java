package backend.backend.Entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "project_repos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectRepo {

    @Id
    @GeneratedValue
    @Column(columnDefinition = "UUID")
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", nullable = false)
    private ProjectGroup projectGroup;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "instructor_owner_id", nullable = false)
    private Instructor instructorOwner;

    @Column(name = "repo_name", nullable = false)
    private String repoName;

    @Column(name = "github_url", nullable = false, columnDefinition = "TEXT")
    private String githubUrl;

    @Column(name = "default_branch")
    @Builder.Default
    private String defaultBranch = "master";

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
