package backend.backend.Dto.Request;

import lombok.Data;

@Data
public class UpdateUniversityCourseSettingsRequest {
    private Double defaultPenaltyPerDay;
    private String penaltyDescription;
    private String title;
    private String description;
    private String longDescription;
    private String thumbnail;
    private String duration;
}
