package backend.backend.Dto.Response;

import lombok.Builder;
import lombok.Getter;

import java.util.UUID;

@Getter
@Builder
public class FinalMarksSheetRowResponse {

    private UUID studentId;
    private String studentName;
    private String rollNumber;
    private String branchName;
    private String sectionName;

    private Double attendanceScore;
    private Double testsScore;
    private Double liveTestsScore;

    private Double projectWorkScore;
    private Double vivaScore;
    private Double internalModerationScore;
    private Double projectScore;
    private Double adjustmentScore;

    private Double attendanceWeighted;
    private Double testsWeighted;
    private Double liveTestsWeighted;
    private Double projectWeighted;
    private Double weightedTotal;

    private Double latePenalty;
    private Double finalScore;
    private String grade;
    private Boolean passed;

    private String instructorRemarks;
}
