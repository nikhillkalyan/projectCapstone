package backend.backend.Entity;

import backend.backend.Enums.ChapterType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "chapters")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Chapter {

    @Id
    @GeneratedValue
    @Column(columnDefinition = "UUID")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String title;

    private String duration;

    @Enumerated(EnumType.STRING)
    @Column(length = 10)
    private ChapterType type;

    @Column(name = "video_url", columnDefinition = "TEXT")
    private String videoUrl;

    @Column(name = "text_content", columnDefinition = "TEXT")
    private String textContent;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "chapter_order")
    private Integer chapterOrder;

    @Column(name = "deadline")
    private LocalDateTime deadline;

    @Column(name = "penalty_per_day")
    @Builder.Default
    private Double penaltyPerDay = 0.0;

    @Column(name = "is_published")
    @Builder.Default
    private Boolean isPublished = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @OneToOne(mappedBy = "chapter", cascade = CascadeType.ALL, orphanRemoval = true)
    private Assessment assessment;
}
