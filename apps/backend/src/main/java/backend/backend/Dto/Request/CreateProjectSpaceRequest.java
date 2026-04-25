package backend.backend.Dto.Request;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CreateProjectSpaceRequest {
    private Integer groupSize;
    private LocalDateTime proposalDeadline;
    private LocalDateTime projectDeadline;
    private String projectDescription;
}
