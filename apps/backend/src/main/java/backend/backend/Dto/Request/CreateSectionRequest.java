package backend.backend.Dto.Request;

import lombok.Data;

import java.util.UUID;

@Data
public class CreateSectionRequest {
    private UUID branchId;
    private String name; // e.g. "Section A"
    private String year; // e.g. "First Year"
}
