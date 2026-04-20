package backend.backend.Service.Impl;

import backend.backend.Dto.Request.CreateUniversityCourseRequest;
import backend.backend.Dto.Request.RejectRequest;
import backend.backend.Dto.Response.UniversityCourseResponse;
import backend.backend.Entity.*;
import backend.backend.Exceptions.BadRequestException;
import backend.backend.Exceptions.ResourceNotFoundException;
import backend.backend.Exceptions.UnauthorizedException;
import backend.backend.Repository.*;
import backend.backend.Service.UniversityCourseService;
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
public class UniversityCourseServiceImpl implements UniversityCourseService {

    private final CourseRepository courseRepository;
    private final InstructorRepository instructorRepository;
    private final BranchRepository branchRepository;
    private final UserRepository userRepository;

    // ── Helpers ──────────────────────────────────────────────────────────────

    private User resolveAdmin(String adminEmail) {
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));
        if (admin.getUniversity() == null)
            throw new BadRequestException("Admin is not linked to any university");
        return admin;
    }

    private Instructor resolveInstructor(String instructorEmail) {
        User user = userRepository.findByEmail(instructorEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return instructorRepository.findById(user.getId())
                .orElseThrow(() -> new UnauthorizedException("Only instructors can create university courses"));
    }

    private UniversityCourseResponse mapToResponse(Course course) {
        Instructor ins = course.getInstructor();
        University uni = course.getUniversity();
        Branch branch = course.getTargetBranch();

        String status;
        if (Boolean.TRUE.equals(course.getIsApprovedByUniAdmin())) {
            status = "APPROVED";
        } else if (course.getRejectionReason() != null) {
            status = "REJECTED";
        } else {
            status = "PENDING";
        }

        return UniversityCourseResponse.builder()
                .id(course.getId())
                .title(course.getTitle())
                .description(course.getDescription())
                .longDescription(course.getLongDescription())
                .thumbnail(course.getThumbnail())
                .duration(course.getDuration())
                .universityId(uni != null ? uni.getId() : null)
                .universityName(uni != null ? uni.getName() : null)
                .targetBranchId(branch != null ? branch.getId() : null)
                .targetBranchName(branch != null ? branch.getName() : null)
                .targetYear(course.getTargetYear())
                .weightTests(course.getWeightTests())
                .weightAttendance(course.getWeightAttendance())
                .weightLiveTests(course.getWeightLiveTests())
                .weightProject(course.getWeightProject())
                .instructorId(ins.getUser().getId())
                .instructorName(ins.getUser().getName())
                .instructorAvatar(ins.getUser().getAvatarUrl())
                .instructorEmployeeId(ins.getEmployeeId())
                .isApprovedByUniAdmin(course.getIsApprovedByUniAdmin())
                .approvalStatus(status)
                .rejectionReason(course.getRejectionReason())
                .createdAt(course.getCreatedAt())
                .build();
    }

    // ── Create ────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public UniversityCourseResponse createCourse(String instructorEmail, CreateUniversityCourseRequest req) {
        Instructor instructor = resolveInstructor(instructorEmail);

        // Instructor must have joined a university space
        University university = instructor.getUser().getUniversity();
        if (university == null)
            throw new BadRequestException("You must join a University Space before creating university courses.");

        // Instructor must be approved by uni-admin
        if (instructor.getApprovalStatus() == null ||
                !instructor.getApprovalStatus().name().equals("APPROVED"))
            throw new BadRequestException("Your university membership is pending approval. Wait for the University Admin to approve you.");

        // Validate weightages sum to 100
        int total = req.getWeightTests() + req.getWeightAttendance() + req.getWeightLiveTests() + req.getWeightProject();
        if (total != 100)
            throw new BadRequestException("Weightages must sum to 100. Current total: " + total);

        // Resolve branch — must belong to instructor's university
        Branch branch = branchRepository.findById(req.getTargetBranchId())
                .orElseThrow(() -> new ResourceNotFoundException("Branch not found"));
        if (!branch.getUniversity().getId().equals(university.getId()))
            throw new BadRequestException("That branch does not belong to your university.");

        Course course = Course.builder()
                .title(req.getTitle())
                .description(req.getDescription())
                .longDescription(req.getLongDescription())
                .thumbnail(req.getThumbnail())
                .duration(req.getDuration())
                .instructor(instructor)
                .university(university)
                .targetBranch(branch)
                .targetYear(req.getTargetYear())
                .isUniversityCourse(true)
                .isApprovedByUniAdmin(false)
                .weightTests(req.getWeightTests())
                .weightAttendance(req.getWeightAttendance())
                .weightLiveTests(req.getWeightLiveTests())
                .weightProject(req.getWeightProject())
                // university courses don't use public course fields
                .category("UNIVERSITY")
                .price(0.0)
                .rating(0.0f)
                .totalEnrollments(0)
                .build();

        course = courseRepository.save(course);
        log.info("University course '{}' created by instructor '{}' for university '{}'",
                course.getTitle(), instructor.getUser().getName(), university.getName());
        return mapToResponse(course);
    }

    // ── Instructor: my courses ────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public List<UniversityCourseResponse> getMyCourses(String instructorEmail) {
        Instructor instructor = resolveInstructor(instructorEmail);
        return courseRepository.findByInstructorIdAndIsUniversityCourseTrue(instructor.getUser().getId())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ── Uni-Admin: course pool ────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public List<UniversityCourseResponse> getCoursePool(String adminEmail) {
        User admin = resolveAdmin(adminEmail);
        return courseRepository.findByUniversityIdAndIsUniversityCourseTrue(admin.getUniversity().getId())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ── Uni-Admin: approve ────────────────────────────────────────────────────

    @Override
    @Transactional
    public UniversityCourseResponse approveCourse(String adminEmail, UUID courseId) {
        User admin = resolveAdmin(adminEmail);
        Course course = getCourseAndVerifyOwnership(courseId, admin.getUniversity().getId());

        course.setIsApprovedByUniAdmin(true);
        course.setRejectionReason(null);
        course = courseRepository.save(course);
        log.info("Course '{}' approved by admin of '{}'", course.getTitle(), admin.getUniversity().getName());
        return mapToResponse(course);
    }

    // ── Uni-Admin: reject ─────────────────────────────────────────────────────

    @Override
    @Transactional
    public UniversityCourseResponse rejectCourse(String adminEmail, UUID courseId, RejectRequest request) {
        User admin = resolveAdmin(adminEmail);
        Course course = getCourseAndVerifyOwnership(courseId, admin.getUniversity().getId());

        course.setIsApprovedByUniAdmin(false);
        course.setRejectionReason(request.getReason());
        course = courseRepository.save(course);
        log.info("Course '{}' rejected by admin of '{}'", course.getTitle(), admin.getUniversity().getName());
        return mapToResponse(course);
    }

    // ── Private helper ────────────────────────────────────────────────────────

    private Course getCourseAndVerifyOwnership(UUID courseId, UUID universityId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        if (!Boolean.TRUE.equals(course.getIsUniversityCourse()))
            throw new BadRequestException("This is not a university course");
        if (course.getUniversity() == null || !course.getUniversity().getId().equals(universityId))
            throw new UnauthorizedException("This course does not belong to your university");
        return course;
    }
}
