package backend.backend.Service.Impl;

import backend.backend.Dto.Request.CreateUniversityCourseAllocationRequest;
import backend.backend.Dto.Request.CreateUniversityCourseRequest;
import backend.backend.Dto.Request.RejectRequest;
import backend.backend.Dto.Request.UpdateUniversityCourseSettingsRequest;
import backend.backend.Dto.Response.CourseAllocationResponse;
import backend.backend.Dto.Response.SectionResponse;
import backend.backend.Dto.Response.StudentUniCourseResponse;
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

import java.util.ArrayList;
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
    private final SectionRepository sectionRepository;
    private final CourseAllocationRepository courseAllocationRepository;
    private final StudentRepository studentRepository;
    private final EnrollmentRepository enrollmentRepository;

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
                .defaultPenaltyPerDay(course.getDefaultPenaltyPerDay())
                .penaltyDescription(course.getPenaltyDescription())
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
    public List<UniversityCourseResponse> getCoursePool(String adminEmail, String status) {
        User admin = resolveAdmin(adminEmail);
        return courseRepository.findByUniversityIdAndIsUniversityCourseTrue(admin.getUniversity().getId())
                .stream()
                .map(this::mapToResponse)
                .filter(res -> status == null || status.isBlank() || res.getApprovalStatus().equalsIgnoreCase(status))
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

    // ── Allocations ─────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public List<CourseAllocationResponse> allocateCourse(
            CreateUniversityCourseAllocationRequest req, String email) {

        User admin = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));

        University university = admin.getUniversity();
        if (university == null) throw new BadRequestException("Admin has no university");

        Course course = courseRepository.findById(req.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));

        if (!Boolean.TRUE.equals(course.getIsUniversityCourse()))
            throw new BadRequestException("Not a university course");
        if (!Boolean.TRUE.equals(course.getIsApprovedByUniAdmin()))
            throw new BadRequestException("Course is not approved yet");
        if (!university.getId().equals(course.getUniversity().getId()))
            throw new UnauthorizedException("Course does not belong to your university");

        List<CourseAllocationResponse> results = new ArrayList<>();

        for (UUID sectionId : req.getSectionIds()) {
            Section section = sectionRepository.findById(sectionId)
                    .orElseThrow(() -> new ResourceNotFoundException("Section not found: " + sectionId));

            if (!university.getId().equals(section.getBranch().getUniversity().getId()))
                throw new UnauthorizedException("Section does not belong to your university");

            // prevent duplicate allocation
            boolean alreadyAllocated = courseAllocationRepository
                    .findByCourseId(req.getCourseId())
                    .stream()
                    .anyMatch(a -> a.getSection().getId().equals(sectionId));

            if (alreadyAllocated) continue;

            CourseAllocation allocation = CourseAllocation.builder()
                    .course(course)
                    .section(section)
                    .finalDeadline(req.getFinalDeadline())
                    .build();

            allocation = courseAllocationRepository.save(allocation);

            List<Student> studentsInSection = studentRepository.findBySectionId(sectionId);
            for (Student student : studentsInSection) {
                boolean alreadyEnrolled = enrollmentRepository
                        .existsByStudentIdAndCourseId(student.getId(), course.getId());

                if (!alreadyEnrolled) {
                    Enrollment enrollment = Enrollment.builder()
                            .student(student)
                            .course(course)
                            .overallProgress(0.0f)
                            .isCompleted(false)
                            .build();
                    enrollmentRepository.save(enrollment);

                    log.info("Auto-enrolled student '{}' into university course '{}' via section allocation",
                            student.getUser().getName(), course.getTitle());
                }
            }

            results.add(mapToAllocationResponse(allocation));
        }

        return results;
    }

    @Override
    @Transactional(readOnly = true)
    public List<CourseAllocationResponse> getAllocations(String email) {
        User admin = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));

        University university = admin.getUniversity();
        if (university == null) return List.of();

        List<Course> uniCourses = courseRepository
                .findByUniversityIdAndIsUniversityCourseTrue(university.getId());

        return uniCourses.stream()
                .flatMap(c -> courseAllocationRepository.findByCourseId(c.getId()).stream())
                .map(this::mapToAllocationResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void removeAllocation(UUID allocationId, String email) {
        User admin = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));

        CourseAllocation allocation = courseAllocationRepository.findById(allocationId)
                .orElseThrow(() -> new ResourceNotFoundException("Allocation not found"));

        University university = admin.getUniversity();
        if (!university.getId().equals(
                allocation.getCourse().getUniversity().getId()))
            throw new UnauthorizedException("Not your university's allocation");

        courseAllocationRepository.delete(allocation);
    }

    private CourseAllocationResponse mapToAllocationResponse(CourseAllocation a) {
        Instructor instructor = a.getCourse().getInstructor();
        String instructorName = instructor != null
                ? instructor.getUser().getName()
                : "Unknown";

        return CourseAllocationResponse.builder()
                .id(a.getId())
                .courseId(a.getCourse().getId())
                .courseTitle(a.getCourse().getTitle())
                .instructorName(instructorName)
                .targetBranch(a.getCourse().getTargetBranch() != null
                        ? a.getCourse().getTargetBranch().getName() : null)
                .targetYear(a.getCourse().getTargetYear())
                .sectionId(a.getSection().getId())
                .sectionName(a.getSection().getName())
                .finalDeadline(a.getFinalDeadline())
                .allocatedAt(a.getAllocatedAt())
                .build();
    }

    // ── Sections ─────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public List<SectionResponse> getSectionsForAdmin(String email) {
        User admin = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));
        University university = admin.getUniversity();
        if (university == null) return List.of();

        return branchRepository.findByUniversityId(university.getId())
                .stream()
                .flatMap(b -> sectionRepository.findByBranchId(b.getId()).stream())
                .map(s -> SectionResponse.builder()
                        .id(s.getId())
                        .name(s.getName())
                        .year(s.getYear())
                        .branchId(s.getBranch().getId())
                        .branchName(s.getBranch().getName())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<UniversityCourseResponse> getMyUniversityCourses(String email) {
        return getMyCourses(email);
    }

    @Override
    @Transactional
    public List<CourseAllocationResponse> getStudentAllocatedCourses(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Student student = studentRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        if (student.getSection() == null) return List.of();

        ensureStudentSectionEnrollments(student);

        return courseAllocationRepository.findBySectionId(student.getSection().getId())
                .stream()
                .map(this::mapToAllocationResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public List<StudentUniCourseResponse> getStudentEnrolledCourses(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Student student = studentRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        ensureStudentSectionEnrollments(student);

        return enrollmentRepository.findByStudentId(student.getId())
                .stream()
                .filter(enrollment -> Boolean.TRUE.equals(enrollment.getCourse().getIsUniversityCourse()))
                .map(enrollment -> {
                    Course course = enrollment.getCourse();
                    Instructor instructor = course.getInstructor();

                    CourseAllocation allocation = null;
                    if (student.getSection() != null) {
                        allocation = courseAllocationRepository.findByCourseId(course.getId())
                                .stream()
                                .filter(item -> item.getSection().getId().equals(student.getSection().getId()))
                                .findFirst()
                                .orElse(null);
                    }

                    int totalChapters = course.getChapters() != null ? course.getChapters().size() : 0;

                    return StudentUniCourseResponse.builder()
                            .courseId(course.getId())
                            .courseTitle(course.getTitle())
                            .courseDescription(course.getDescription())
                            .courseThumbnail(course.getThumbnail())
                            .duration(course.getDuration())
                            .instructorName(instructor != null ? instructor.getUser().getName() : null)
                            .instructorAvatar(instructor != null ? instructor.getUser().getAvatarUrl() : null)
                            .targetBranch(course.getTargetBranch() != null ? course.getTargetBranch().getName() : null)
                            .targetYear(course.getTargetYear())
                            .allocationId(allocation != null ? allocation.getId() : null)
                            .finalDeadline(allocation != null ? allocation.getFinalDeadline() : null)
                            .sectionName(student.getSection() != null ? student.getSection().getName() : null)
                            .weightTests(course.getWeightTests())
                            .weightAttendance(course.getWeightAttendance())
                            .weightLiveTests(course.getWeightLiveTests())
                            .weightProject(course.getWeightProject())
                            .overallProgress(enrollment.getOverallProgress())
                            .completedChapters(Math.round(((enrollment.getOverallProgress() != null ? enrollment.getOverallProgress() : 0f) / 100f) * totalChapters))
                            .totalChapters(totalChapters)
                            .isCompleted(enrollment.getIsCompleted())
                            .defaultPenaltyPerDay(course.getDefaultPenaltyPerDay())
                            .penaltyDescription(course.getPenaltyDescription())
                            .build();
                })
                .collect(Collectors.toList());
    }

    private void ensureStudentSectionEnrollments(Student student) {
        if (student.getSection() == null) {
            return;
        }

        List<CourseAllocation> sectionAllocations = courseAllocationRepository.findBySectionId(student.getSection().getId());
        for (CourseAllocation allocation : sectionAllocations) {
            Course course = allocation.getCourse();
            if (!Boolean.TRUE.equals(course.getIsUniversityCourse())) {
                continue;
            }

            boolean alreadyEnrolled = enrollmentRepository
                    .existsByStudentIdAndCourseId(student.getId(), course.getId());

            if (!alreadyEnrolled) {
                Enrollment enrollment = Enrollment.builder()
                        .student(student)
                        .course(course)
                        .overallProgress(0.0f)
                        .isCompleted(false)
                        .build();
                enrollmentRepository.save(enrollment);

                log.info("Backfilled enrollment for student '{}' into allocated university course '{}'",
                        student.getUser().getName(), course.getTitle());
            }
        }
    }

    @Override
    @Transactional
    public void deletePendingCourse(UUID courseId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Instructor instructor = instructorRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Instructor not found"));

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));

        if (!course.getInstructor().getId().equals(instructor.getId()))
            throw new UnauthorizedException("Not your course");

        if (Boolean.TRUE.equals(course.getIsApprovedByUniAdmin()))
            throw new BadRequestException("Cannot delete an approved course");

        courseRepository.delete(course);
    }

    @Override
    @Transactional
    public UniversityCourseResponse updateCourseSettings(
            String instructorEmail, UUID courseId, UpdateUniversityCourseSettingsRequest request) {

        Instructor instructor = resolveInstructor(instructorEmail);

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));

        if (!course.getInstructor().getId().equals(instructor.getUser().getId())) {
            throw new UnauthorizedException("You are not authorized to update this course");
        }

        if (!Boolean.TRUE.equals(course.getIsUniversityCourse())) {
            throw new BadRequestException("Not a university course");
        }

        if (request.getDefaultPenaltyPerDay() != null) {
            course.setDefaultPenaltyPerDay(request.getDefaultPenaltyPerDay());
        }
        if (request.getPenaltyDescription() != null) {
            course.setPenaltyDescription(request.getPenaltyDescription());
        }
        if (request.getTitle() != null) {
            course.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) {
            course.setDescription(request.getDescription());
        }
        if (request.getLongDescription() != null) {
            course.setLongDescription(request.getLongDescription());
        }
        if (request.getThumbnail() != null) {
            course.setThumbnail(request.getThumbnail());
        }
        if (request.getDuration() != null) {
            course.setDuration(request.getDuration());
        }

        course = courseRepository.save(course);
        return mapToResponse(course);
    }
}
