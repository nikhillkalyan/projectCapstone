package backend.backend.Dto.Response;

import backend.backend.Enums.CourseLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseResponse {
    private UUID id;
    private String title;
    private String category;
    private CourseLevel level;
    private String duration;
    private String thumbnail;
    private String previewVideo;
    private String description;
    private String longDescription;
    private Double price;
    private Float rating;
    private Integer totalEnrollments;
    private LocalDateTime createdAt;
    private InstructorSummaryResponse instructor;
}