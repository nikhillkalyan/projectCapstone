package backend.backend.Entity;

import backend.backend.Enums.GroupStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "project_groups")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectGroup {

    @Id
    @GeneratedValue
    @Column(columnDefinition = "UUID")
    private UUID id;

    @Column(nullable = false)
    private String name;

    // Keep course for backward compat but primary parent is now ProjectSpace
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_space_id", nullable = false)
    private ProjectSpace projectSpace;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 30)
    @Builder.Default
    private GroupStatus status = GroupStatus.FORMING;

    @Column(name = "proposal_doc_url", columnDefinition = "TEXT")
    private String proposalDocUrl;

    @Column(name = "project_title", columnDefinition = "TEXT")
    private String projectTitle;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    // True when instructor assigned a project idea to this group (missed deadline)
    @Column(name = "assigned_by_instructor")
    @Builder.Default
    private Boolean assignedByInstructor = false;

    @Column(name = "instructor_assigned_doc", columnDefinition = "TEXT")
    private String instructorAssignedDoc;

    @Column(name = "is_proposal_approved")
    @Builder.Default
    private Boolean isProposalApproved = false;

    @ManyToMany
    @JoinTable(name = "group_students", joinColumns = @JoinColumn(name = "group_id"), inverseJoinColumns = @JoinColumn(name = "student_id"))
    @Builder.Default
    private List<Student> students = new ArrayList<>();

    @OneToOne(mappedBy = "projectGroup", cascade = CascadeType.ALL, orphanRemoval = true)
    private ProjectRepo projectRepo;

    @OneToOne(mappedBy = "projectGroup", cascade = CascadeType.ALL, orphanRemoval = true)
    private ProjectProposal proposal;

    @OneToMany(mappedBy = "projectGroup", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<IndividualReport> individualReports = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}