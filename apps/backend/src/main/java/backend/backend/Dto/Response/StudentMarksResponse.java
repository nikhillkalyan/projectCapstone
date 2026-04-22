package backend.backend.Dto.Response;

import lombok.Builder;
import lombok.Getter;

import java.util.UUID;

@Getter
@Builder
public class StudentMarksResponse {

    private UUID studentId;
    private String studentName;
    private String rollNumber;
    private String sectionName;

    private Double attendanceScore;
    private Double testsScore;
    private Double liveTestsScore;
    private Double projectScore;

    private Double totalPenalty;
    private Double finalScore;
    private String grade;

    private Integer completedChapters;
    private Integer totalChapters;
    private Float overallProgress;
}
