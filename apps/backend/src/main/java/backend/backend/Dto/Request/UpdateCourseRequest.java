package backend.backend.Dto.Request;

import backend.backend.Enums.CourseLevel;
import lombok.Data;

@Data
public class UpdateCourseRequest {
    private String title;
    private String category;
    private CourseLevel level;
    private String duration;
    private String thumbnail;
    private String previewVideo;
    private String description;
    private String longDescription;
    private Double price;
}