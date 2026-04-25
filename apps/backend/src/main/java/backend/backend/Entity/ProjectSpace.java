package backend.backend.Entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "project_spaces")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectSpace {

    @Id
    @GeneratedValue
    @Column(columnDefinition = "UUID")
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false, unique = true)
    private Course course;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "instructor_id", nullable = false)
    private Instructor instructor;

    @Column(name = "group_size", nullable = false)
    private Integer groupSize;

    @Column(name = "proposal_deadline")
    private LocalDateTime proposalDeadline;

    @Column(name = "project_deadline")
    private LocalDateTime projectDeadline;

    @Column(name = "project_description", columnDefinition = "TEXT")
    private String projectDescription;

    @Column(name = "is_groups_formed")
    @Builder.Default
    private Boolean isGroupsFormed = false;

    @OneToMany(mappedBy = "projectSpace", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ProjectGroup> groups = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
