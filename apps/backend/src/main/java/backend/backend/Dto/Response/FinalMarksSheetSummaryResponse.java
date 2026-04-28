package backend.backend.Dto.Response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class FinalMarksSheetSummaryResponse {

    private Integer totalStudents;
    private Integer passCount;
    private Integer failCount;
    private Double classAverage;
    private Double highestScore;
    private Double lowestScore;
}
