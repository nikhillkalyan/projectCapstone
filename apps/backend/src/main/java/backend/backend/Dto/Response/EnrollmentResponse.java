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
public class EnrollmentResponse {
    private UUID enrollmentId;
    private Float overallProgress;
    private Boolean isCompleted;
    private LocalDateTime enrolledAt;
    private CourseResponse course;
}