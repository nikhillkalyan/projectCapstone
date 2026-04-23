package backend.backend.Dto.Request;

import lombok.Data;

import java.util.List;

@Data
public class SubmitLiveTestRequest {
    private List<Integer> answers;
}
