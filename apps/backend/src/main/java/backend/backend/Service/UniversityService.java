package backend.backend.Service;

import backend.backend.Dto.Request.CreateUniversityRequest;
import backend.backend.Dto.Response.UniversityResponse;

import java.util.List;
import java.util.UUID;

public interface UniversityService {
    UniversityResponse createUniversity(CreateUniversityRequest request);
    List<UniversityResponse> getAllUniversities();
    UniversityResponse toggleUniversityStatus(UUID universityId);
    void resetAdminPassword(UUID universityId, String newPassword);
}
