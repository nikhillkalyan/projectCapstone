package backend.backend.Dto.Request;

import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class FinalMarksSheetRowUpdateRequest {

    private UUID studentId;
    private Double projectWorkScore;
    private Double vivaScore;
    private Double internalModerationScore;
    private Double adjustmentScore;
    private String instructorRemarks;
}
