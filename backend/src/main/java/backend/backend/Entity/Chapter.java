package backend.backend.Entity;

import backend.backend.Enums.ChapterType;
import jakarta.persistence.*;
import lombok.*;

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

    @Column(nullable = false)
    private String title;

    private String duration;

    @Enumerated(EnumType.STRING)
    @Column(length = 10)
    private ChapterType type;

    @Column(name = "video_url")
    private String videoUrl;

    @Column(name = "text_content", columnDefinition = "TEXT")
    private String textContent;

    private String description;

    @Column(name = "chapter_order")
    private Integer chapterOrder;

    @OneToOne(mappedBy = "chapter", cascade = CascadeType.ALL, orphanRemoval = true)
    private Assessment assessment;
}