package backend.backend.Dto.Response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminStatsResponse {
    private long pending;
    private long approved;
    private long rejected;
    private long flagged;
}