package backend.backend.Dto.Request;

import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class ManualGroupRequest {
    private List<GroupDefinition> groups;

    @Data
    public static class GroupDefinition {
        private String name;
        private List<UUID> studentIds;
    }
}
