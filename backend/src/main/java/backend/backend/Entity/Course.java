package backend.backend.Entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
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

    @Column(nullable = false)
    private String title;

    @Column(name = "instructor_id", nullable = false)
    private UUID instructorId;

    private String category;

    private String level;

    private String duration;

    private String thumbnail;

    @Column(name = "preview_video")
    private String previewVideo;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "long_description", columnDefinition = "TEXT")
    private String longDescription;

    private Double price;

    private Float rating;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
