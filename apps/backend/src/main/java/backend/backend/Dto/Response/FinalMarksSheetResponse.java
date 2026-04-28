package backend.backend.Dto.Response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Builder
public class FinalMarksSheetResponse {

    private UUID courseId;
    private String courseTitle;
    private String instructorName;
    private String targetBranch;
    private String targetYear;

    private Integer weightAttendance;
    private Integer weightTests;
    private Integer weightLiveTests;
    private Integer weightProject;
    private String penaltyDescription;

    private String status;
    private Boolean locked;
    private LocalDateTime submittedAt;
    private LocalDateTime approvedAt;
    private String approvedByName;
    private LocalDateTime returnedAt;
    private String returnReason;

    private List<FinalMarksSheetRowResponse> rows;
    private FinalMarksSheetSummaryResponse summary;
}
