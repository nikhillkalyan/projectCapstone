package backend.backend.Service;

import backend.backend.Dto.Response.AdminStatsResponse;
import backend.backend.Dto.Response.InstructorAdminResponse;

import java.util.List;
import java.util.UUID;

public interface AdminService {
    AdminStatsResponse getStats();

    List<InstructorAdminResponse> getInstructors(String status, String search);

    InstructorAdminResponse getInstructor(UUID id);

    void approveInstructor(UUID id);

    void rejectInstructor(UUID id, String reason);

    void flagInstructor(UUID id, String message);

    void removeInstructor(UUID id);

    void reinstateInstructor(UUID id);
}