package backend.backend.Dto.Response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
public class MarksSheetListItemResponse {

    private UUID courseId;
    private String courseTitle;
    private String instructorName;
    private String targetBranch;
    private String targetYear;

    private Integer studentCount;
    private Double classAverage;
    private Integer passCount;
    private Integer failCount;

    private String status;
    private LocalDateTime submittedAt;
    private LocalDateTime approvedAt;
    private String approvedByName;
    private LocalDateTime returnedAt;
    private String returnReason;
}
