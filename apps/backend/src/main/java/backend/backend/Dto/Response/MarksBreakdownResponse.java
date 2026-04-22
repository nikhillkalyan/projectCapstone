package backend.backend.Dto.Response;

import lombok.Builder;
import lombok.Getter;

import java.util.UUID;

@Getter
@Builder
public class MarksBreakdownResponse {

    private UUID courseId;
    private String courseTitle;

    private Double attendanceScore;
    private Double testsScore;
    private Double liveTestsScore;
    private Double projectScore;

    private Integer weightAttendance;
    private Integer weightTests;
    private Integer weightLiveTests;
    private Integer weightProject;

    private Double attendanceWeighted;
    private Double testsWeighted;
    private Double liveTestsWeighted;
    private Double projectWeighted;

    private Double totalPenalty;
    private String penaltyDescription;

    private Double finalScore;
    private String grade;

    private Integer completedChapters;
    private Integer totalChapters;
    private Float overallProgress;
}
