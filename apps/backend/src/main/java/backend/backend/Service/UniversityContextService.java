package backend.backend.Service;

import backend.backend.Dto.Request.CreateBranchRequest;
import backend.backend.Dto.Request.CreateSectionRequest;
import backend.backend.Dto.Response.BranchResponse;
import backend.backend.Dto.Response.SectionResponse;

import java.util.List;
import java.util.UUID;

public interface UniversityContextService {

    /** Create a new branch for the currently authenticated university admin's university. */
    BranchResponse createBranch(String adminEmail, CreateBranchRequest request);

    /** Get all branches (with their sections) for the admin's university. */
    List<BranchResponse> getBranches(String adminEmail);

    /** Delete a branch by ID (only allowed if it belongs to the admin's university). */
    void deleteBranch(String adminEmail, UUID branchId);

    /** Create a new section under a specific branch. */
    SectionResponse createSection(String adminEmail, CreateSectionRequest request);

    /** Delete a section by ID (only allowed if it belongs to the admin's university). */
    void deleteSection(String adminEmail, UUID sectionId);
}
