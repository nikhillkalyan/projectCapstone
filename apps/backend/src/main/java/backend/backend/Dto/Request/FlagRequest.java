package backend.backend.Dto.Request;

import lombok.*;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class FlagRequest {
    private String message;
    private List<UUID> documentIds;
}