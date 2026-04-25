package backend.backend.Dto.Request;

import lombok.Data;

@Data
public class RandomGroupRequest {
    // groupSize is already on ProjectSpace, but instructor can override here
    // if null, uses projectSpace.groupSize
    private Integer groupSize;
}
