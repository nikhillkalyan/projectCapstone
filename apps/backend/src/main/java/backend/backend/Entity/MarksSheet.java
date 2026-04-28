package backend.backend.Entity;

import backend.backend.Enums.MarksSheetStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "marks_sheets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MarksSheet {

    @Id
    @GeneratedValue
    @Column(columnDefinition = "UUID")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(name = "breakdown_json", columnDefinition = "TEXT")
    private String breakdownJson; // Store the matrix JSON (live tests, project, exams)

    @Column(name = "total_score")
    private Double totalScore;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20)
    @Builder.Default
    private MarksSheetStatus status = MarksSheetStatus.DRAFT;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by_id")
    private User approvedBy;

    @Column(name = "returned_at")
    private LocalDateTime returnedAt;

    @Column(name = "return_reason", columnDefinition = "TEXT")
    private String returnReason;

    @Column(name = "locked_final_score")
    private Double lockedFinalScore;

    @Column(name = "locked_grade", length = 5)
    private String lockedGrade;

    @Column(name = "instructor_remarks", columnDefinition = "TEXT")
    private String instructorRemarks;

    @Column(name = "is_approved_by_uni_admin")
    @Builder.Default
    private Boolean isApprovedByUniAdmin = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
