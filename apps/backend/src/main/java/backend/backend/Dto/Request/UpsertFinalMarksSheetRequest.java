package backend.backend.Dto.Request;

import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class UpsertFinalMarksSheetRequest {

    private List<FinalMarksSheetRowUpdateRequest> rows = new ArrayList<>();
}
