package backend.backend.Service.Impl;

import backend.backend.Dto.Request.CreateBranchRequest;
import backend.backend.Dto.Request.CreateSectionRequest;
import backend.backend.Dto.Response.BranchResponse;
import backend.backend.Dto.Response.SectionResponse;
import backend.backend.Entity.Branch;
import backend.backend.Entity.Section;
import backend.backend.Entity.User;
import backend.backend.Exceptions.BadRequestException;
import backend.backend.Exceptions.ResourceNotFoundException;
import backend.backend.Repository.BranchRepository;
import backend.backend.Repository.SectionRepository;
import backend.backend.Repository.UserRepository;
import backend.backend.Service.UniversityContextService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class UniversityContextServiceImpl implements UniversityContextService {

    private final UserRepository userRepository;
    private final BranchRepository branchRepository;
    private final SectionRepository sectionRepository;

    // ── Helpers ──────────────────────────────────────────────────────────────

    /**
     * Resolves the authenticated admin's university. This is the single point of
     * authorization — it guarantees the admin can only ever touch their own university.
     */
    private User resolveAdmin(String adminEmail) {
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Admin user not found"));
        if (admin.getUniversity() == null) {
            throw new BadRequestException("This user is not linked to any university");
        }
        return admin;
    }

    private SectionResponse mapSection(Section s) {
        return SectionResponse.builder()
                .id(s.getId())
                .name(s.getName())
                .year(s.getYear())
                .branchId(s.getBranch().getId())
                .branchName(s.getBranch().getName())
                .createdAt(s.getCreatedAt())
                .build();
    }

    private BranchResponse mapBranch(Branch b) {
        List<SectionResponse> sections = sectionRepository.findByBranchId(b.getId())
                .stream()
                .map(this::mapSection)
                .collect(Collectors.toList());

        return BranchResponse.builder()
                .id(b.getId())
                .name(b.getName())
                .createdAt(b.getCreatedAt())
                .sections(sections)
                .build();
    }

    // ── Branches ─────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public BranchResponse createBranch(String adminEmail, CreateBranchRequest request) {
        User admin = resolveAdmin(adminEmail);

        if (request.getName() == null || request.getName().isBlank()) {
            throw new BadRequestException("Branch name cannot be empty");
        }

        Branch branch = Branch.builder()
                .name(request.getName().trim())
                .university(admin.getUniversity())
                .build();

        branch = branchRepository.save(branch);
        log.info("Created branch '{}' for university '{}'", branch.getName(), admin.getUniversity().getName());

        // Return with empty sections list (freshly created)
        return BranchResponse.builder()
                .id(branch.getId())
                .name(branch.getName())
                .createdAt(branch.getCreatedAt())
                .sections(List.of())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<BranchResponse> getBranches(String adminEmail) {
        User admin = resolveAdmin(adminEmail);
        UUID universityId = admin.getUniversity().getId();

        return branchRepository.findByUniversityId(universityId)
                .stream()
                .map(this::mapBranch)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteBranch(String adminEmail, UUID branchId) {
        User admin = resolveAdmin(adminEmail);

        Branch branch = branchRepository.findById(branchId)
                .orElseThrow(() -> new ResourceNotFoundException("Branch not found"));

        // Security check: only delete if it belongs to this admin's university
        if (!branch.getUniversity().getId().equals(admin.getUniversity().getId())) {
            throw new BadRequestException("You do not have permission to delete this branch");
        }

        branchRepository.delete(branch);
        log.info("Deleted branch '{}' from university '{}'", branch.getName(), admin.getUniversity().getName());
    }

    // ── Sections ─────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public SectionResponse createSection(String adminEmail, CreateSectionRequest request) {
        User admin = resolveAdmin(adminEmail);

        if (request.getName() == null || request.getName().isBlank()) {
            throw new BadRequestException("Section name cannot be empty");
        }
        if (request.getYear() == null || request.getYear().isBlank()) {
            throw new BadRequestException("Year cannot be empty");
        }

        Branch branch = branchRepository.findById(request.getBranchId())
                .orElseThrow(() -> new ResourceNotFoundException("Branch not found"));

        // Security check: branch must belong to this admin's university
        if (!branch.getUniversity().getId().equals(admin.getUniversity().getId())) {
            throw new BadRequestException("That branch does not belong to your university");
        }

        Section section = Section.builder()
                .name(request.getName().trim())
                .year(request.getYear())
                .branch(branch)
                .build();

        section = sectionRepository.save(section);
        log.info("Created section '{}/{}' under branch '{}'", section.getYear(), section.getName(), branch.getName());

        return mapSection(section);
    }

    @Override
    @Transactional
    public void deleteSection(String adminEmail, UUID sectionId) {
        User admin = resolveAdmin(adminEmail);

        Section section = sectionRepository.findById(sectionId)
                .orElseThrow(() -> new ResourceNotFoundException("Section not found"));

        // Security check: section's branch must belong to this admin's university
        if (!section.getBranch().getUniversity().getId().equals(admin.getUniversity().getId())) {
            throw new BadRequestException("You do not have permission to delete this section");
        }

        sectionRepository.delete(section);
        log.info("Deleted section '{}' from branch '{}'", section.getName(), section.getBranch().getName());
    }
}
