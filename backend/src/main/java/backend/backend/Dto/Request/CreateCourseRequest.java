package backend.backend.Dto.Request;

import backend.backend.Enums.CourseLevel;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateCourseRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Category is required")
    private String category;

    @NotNull(message = "Level is required")
    private CourseLevel level;

    private String duration;
    private String thumbnail;
    private String previewVideo;

    @NotBlank(message = "Description is required")
    private String description;

    private String longDescription;
    private Double price;
}