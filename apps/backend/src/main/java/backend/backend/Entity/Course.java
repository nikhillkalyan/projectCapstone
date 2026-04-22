package backend.backend.Entity;

import backend.backend.Enums.CourseLevel;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "courses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Course {

    @Id
    @GeneratedValue
    @Column(columnDefinition = "UUID")
    private UUID id;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String title;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "instructor_id", nullable = false)
    private Instructor instructor;

    private String category;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private CourseLevel level;

    private String duration;

    @Column(columnDefinition = "TEXT")
    private String thumbnail;

    @Column(name = "preview_video", columnDefinition = "TEXT")
    private String previewVideo;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "long_description", columnDefinition = "TEXT")
    private String longDescription;

    private Double price;

    @Builder.Default
    private Float rating = 0.0f;

    @Builder.Default
    @Column(name = "total_enrollments")
    private Integer totalEnrollments = 0;

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("chapterOrder ASC")
    @Builder.Default
    private List<Chapter> chapters = new ArrayList<>();

    @Column(name = "is_university_course")
    @Builder.Default
    private Boolean isUniversityCourse = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "university_id")
    private University university;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_branch_id")
    private Branch targetBranch;

    @Column(name = "target_year")
    private String targetYear;

    @Column(name = "is_approved_by_uni_admin")
    @Builder.Default
    private Boolean isApprovedByUniAdmin = false;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @Column(name = "weight_tests")
    @Builder.Default
    private Integer weightTests = 0;

    @Column(name = "weight_attendance")
    @Builder.Default
    private Integer weightAttendance = 0;

    @Column(name = "weight_live_tests")
    @Builder.Default
    private Integer weightLiveTests = 0;

    @Column(name = "weight_project")
    @Builder.Default
    private Integer weightProject = 0;

    @Column(name = "default_penalty_per_day")
    @Builder.Default
    private Double defaultPenaltyPerDay = 0.0;

    @Column(name = "penalty_description", columnDefinition = "TEXT")
    private String penaltyDescription;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @OneToOne(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
    private Assessment grandAssessment;
}
