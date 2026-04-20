package backend.backend.Dto.Request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class CreateUniversityCourseRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    private String longDescription;
    private String thumbnail;
    private String duration;

    @NotNull(message = "Target branch is required")
    private java.util.UUID targetBranchId;

    @NotBlank(message = "Target year is required")
    private String targetYear;

    // Weightages — must sum to 100
    @NotNull @Min(0) @Max(100)
    private Integer weightTests;        // pre-built chapter tests

    @NotNull @Min(0) @Max(100)
    private Integer weightAttendance;   // lecture completion / attendance

    @NotNull @Min(0) @Max(100)
    private Integer weightLiveTests;    // live tests conducted by instructor

    @NotNull @Min(0) @Max(100)
    private Integer weightProject;      // project evaluation
}
