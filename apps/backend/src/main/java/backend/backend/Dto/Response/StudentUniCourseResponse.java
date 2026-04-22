package backend.backend.Dto.Response;

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
public class StudentUniCourseResponse {

    private UUID courseId;
    private String courseTitle;
    private String courseDescription;
    private String courseThumbnail;
    private String duration;

    private String instructorName;
    private String instructorAvatar;

    private String targetBranch;
    private String targetYear;

    private UUID allocationId;
    private LocalDateTime finalDeadline;
    private String sectionName;

    private Integer weightTests;
    private Integer weightAttendance;
    private Integer weightLiveTests;
    private Integer weightProject;

    private Float overallProgress;
    private Integer completedChapters;
    private Integer totalChapters;
    private Boolean isCompleted;

    private Double defaultPenaltyPerDay;
    private String penaltyDescription;
}
