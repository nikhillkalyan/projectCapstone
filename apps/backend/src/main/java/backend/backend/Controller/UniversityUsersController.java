package backend.backend.Controller;

import backend.backend.Dto.Response.InstructorSummaryResponse;
import backend.backend.Dto.Response.StudentSummaryResponse;
import backend.backend.Entity.Instructor;
import backend.backend.Entity.Student;
import backend.backend.Entity.University;
import backend.backend.Exceptions.ResourceNotFoundException;
import backend.backend.Dto.Response.UniAdminDashboardResponse;
import backend.backend.Repository.BranchRepository;
import backend.backend.Repository.InstructorRepository;
import backend.backend.Repository.SectionRepository;
import backend.backend.Repository.StudentRepository;
import backend.backend.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * University-admin endpoints for managing users within their university.
 * All endpoints resolve the university from the authenticated admin's token —
 * zero risk of cross-university data leakage.
 */
@RestController
@RequestMapping("/api/v1/uni-admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('UNIVERSITY_ADMIN')")
public class UniversityUsersController {

    private final UserRepository userRepository;
    private final InstructorRepository instructorRepository;
    private final StudentRepository studentRepository;
    private final BranchRepository branchRepository;
    private final SectionRepository sectionRepository;

    // ══════════════════════════════════════════════════════════════════════
    // HELPERS
    // ══════════════════════════════════════════════════════════════════════

    private University resolveUniversity(String adminEmail) {
        return userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Admin user not found"))
                .getUniversity();
    }

    // ══════════════════════════════════════════════════════════════════════
    // INSTRUCTORS
    // ══════════════════════════════════════════════════════════════════════

    /**
     * GET /api/v1/uni-admin/users/instructors
     * Returns all instructors registered under this admin's university.
     */
    @GetMapping("/instructors")
    @Transactional(readOnly = true)
    public ResponseEntity<List<InstructorSummaryResponse>> getInstructors(
            @AuthenticationPrincipal UserDetails principal) {

        University university = resolveUniversity(principal.getUsername());
        if (university == null) {
            return ResponseEntity.ok(List.of());
        }

        List<InstructorSummaryResponse> result = instructorRepository
                .findByUserUniversityId(university.getId())
                .stream()
                .map(this::toInstructorSummary)
                .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    private InstructorSummaryResponse toInstructorSummary(Instructor ins) {
        String branchId   = ins.getBranch() != null ? ins.getBranch().getId().toString() : null;
        String branchName = ins.getBranch() != null ? ins.getBranch().getName() : null;

        return InstructorSummaryResponse.builder()
                .id(ins.getUser().getId())
                .name(ins.getUser().getName())
                .email(ins.getUser().getEmail())
                .avatarUrl(ins.getUser().getAvatarUrl())
                .employeeId(ins.getEmployeeId())
                .branchId(branchId)
                .branchName(branchName)
                .qualification(ins.getQualification())
                .experience(ins.getExperience())
                .specialization(ins.getSpecialization())
                .approvalStatus(ins.getApprovalStatus() != null ? ins.getApprovalStatus().name() : "PENDING")
                .rating(ins.getRating())
                .totalStudents(ins.getTotalStudents())
                .registeredAt(ins.getRegisteredAt())
                .build();
    }

    @PutMapping("/instructors/{id}/approve")
    @Transactional
    public ResponseEntity<Void> approveInstructor(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable UUID id) {
        University university = resolveUniversity(principal.getUsername());
        if (university == null) return ResponseEntity.notFound().build();

        Instructor instructor = instructorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Instructor not found"));

        if (!instructor.getUser().getUniversity().getId().equals(university.getId())) {
            return ResponseEntity.status(403).build();
        }

        instructor.setApprovalStatus(backend.backend.Enums.ApprovalStatus.APPROVED);
        instructor.setIsVerified(true);
        instructor.setApprovedAt(java.time.LocalDateTime.now());
        instructorRepository.save(instructor);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/instructors/{id}/reject")
    @Transactional
    public ResponseEntity<Void> rejectInstructor(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable UUID id,
            @RequestBody backend.backend.Dto.Request.RejectRequest request) {
        University university = resolveUniversity(principal.getUsername());
        if (university == null) return ResponseEntity.notFound().build();

        Instructor instructor = instructorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Instructor not found"));

        if (!instructor.getUser().getUniversity().getId().equals(university.getId())) {
            return ResponseEntity.status(403).build();
        }

        instructor.setApprovalStatus(backend.backend.Enums.ApprovalStatus.REJECTED);
        instructor.setRejectionReason(request.getReason());
        instructorRepository.save(instructor);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/instructors/{id}/remove")
    @Transactional
    public ResponseEntity<Void> removeInstructor(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable UUID id) {
        University university = resolveUniversity(principal.getUsername());
        if (university == null) return ResponseEntity.notFound().build();

        Instructor instructor = instructorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Instructor not found"));

        if (!instructor.getUser().getUniversity().getId().equals(university.getId())) {
            return ResponseEntity.status(403).build();
        }

        instructor.setApprovalStatus(backend.backend.Enums.ApprovalStatus.REMOVED);
        instructorRepository.save(instructor);
        return ResponseEntity.ok().build();
    }

    // ══════════════════════════════════════════════════════════════════════
    // STUDENTS
    // ══════════════════════════════════════════════════════════════════════

    /**
     * GET /api/v1/uni-admin/users/students
     * Returns all students registered under this admin's university.
     */
    @GetMapping("/students")
    @Transactional(readOnly = true)
    public ResponseEntity<List<StudentSummaryResponse>> getStudents(
            @AuthenticationPrincipal UserDetails principal) {

        University university = resolveUniversity(principal.getUsername());
        if (university == null) {
            return ResponseEntity.ok(List.of());
        }

        List<StudentSummaryResponse> result = studentRepository
                .findByUserUniversityId(university.getId())
                .stream()
                .map(this::toStudentSummary)
                .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    private StudentSummaryResponse toStudentSummary(Student s) {
        String sectionId   = s.getSection() != null ? s.getSection().getId().toString() : null;
        String sectionName = s.getSection() != null ? s.getSection().getName() : null;
        String branchName  = s.getSection() != null ? s.getSection().getBranch().getName() : null;
        String year        = s.getSection() != null ? s.getSection().getYear() : null;

        return StudentSummaryResponse.builder()
                .id(s.getUser().getId())
                .name(s.getUser().getName())
                .email(s.getUser().getEmail())
                .avatarUrl(s.getUser().getAvatarUrl())
                .rollNumber(s.getRollNumber())
                .college(s.getCollege())
                .yearOfStudy(s.getYearOfStudy())
                .sectionId(sectionId)
                .sectionName(sectionName)
                .branchName(branchName)
                .year(year)
                .interests(s.getInterests())
                .build();
    }

    // ══════════════════════════════════════════════════════════════════════
    // DASHBOARD
    // ══════════════════════════════════════════════════════════════════════

    /**
     * GET /api/v1/uni-admin/users/dashboard
     * Returns statistics for the uni-admin dashboard.
     */
    @GetMapping("/dashboard")
    @Transactional(readOnly = true)
    public ResponseEntity<UniAdminDashboardResponse> getDashboardStats(
            @AuthenticationPrincipal UserDetails principal) {

        University university = resolveUniversity(principal.getUsername());
        if (university == null) {
            return ResponseEntity.notFound().build();
        }

        long totalStudents = studentRepository.countByUserUniversityId(university.getId());
        long totalInstructors = instructorRepository.countByUserUniversityId(university.getId());
        long totalBranches = branchRepository.countByUniversityId(university.getId());
        long totalSections = sectionRepository.countByBranchUniversityId(university.getId());
        long pendingInstructors = instructorRepository.countByUserUniversityIdAndApprovalStatus(
                university.getId(), backend.backend.Enums.ApprovalStatus.PENDING);

        UniAdminDashboardResponse response = UniAdminDashboardResponse.builder()
                .totalStudents(totalStudents)
                .totalInstructors(totalInstructors)
                .totalBranches(totalBranches)
                .totalSections(totalSections)
                .pendingInstructors(pendingInstructors)
                .build();

        return ResponseEntity.ok(response);
    }
}
