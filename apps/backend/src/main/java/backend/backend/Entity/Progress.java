package backend.backend.Entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "progress", uniqueConstraints = @UniqueConstraint(columnNames = { "student_id", "chapter_id" }))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Progress {

    @Id
    @GeneratedValue
    @Column(columnDefinition = "UUID")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chapter_id", nullable = false)
    private Chapter chapter;

    @Builder.Default
    private Boolean completed = false;

    @Column(name = "assessment_score")
    private Integer assessmentScore;

    @Builder.Default
    @Column(name = "assessment_passed")
    private Boolean assessmentPassed = false;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;
}