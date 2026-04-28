package backend.backend.Service.Impl;

import backend.backend.Dto.Request.FinalMarksSheetRowUpdateRequest;
import backend.backend.Dto.Request.ReturnMarksSheetRequest;
import backend.backend.Dto.Request.UpsertFinalMarksSheetRequest;
import backend.backend.Dto.Response.CertificateRecordResponse;
import backend.backend.Dto.Response.FinalMarksSheetResponse;
import backend.backend.Dto.Response.FinalMarksSheetRowResponse;
import backend.backend.Dto.Response.FinalMarksSheetSummaryResponse;
import backend.backend.Dto.Response.MarksBreakdownResponse;
import backend.backend.Dto.Response.MarksSheetListItemResponse;
import backend.backend.Dto.Response.StudentApprovedFinalMarksResponse;
import backend.backend.Dto.Response.StudentMarksResponse;
import backend.backend.Entity.Chapter;
import backend.backend.Entity.Course;
import backend.backend.Entity.CourseAllocation;
import backend.backend.Entity.Enrollment;
import backend.backend.Entity.Instructor;
import backend.backend.Entity.MarksSheet;
import backend.backend.Entity.Progress;
import backend.backend.Entity.Student;
import backend.backend.Entity.User;
import backend.backend.Enums.MarksSheetStatus;
import backend.backend.Exceptions.BadRequestException;
import backend.backend.Exceptions.ResourceNotFoundException;
import backend.backend.Exceptions.UnauthorizedException;
import backend.backend.Repository.CourseAllocationRepository;
import backend.backend.Repository.CourseRepository;
import backend.backend.Repository.EnrollmentRepository;
import backend.backend.Repository.InstructorRepository;
import backend.backend.Repository.LiveTestSubmissionRepository;
import backend.backend.Repository.MarksSheetRepository;
import backend.backend.Repository.ProgressRepository;
import backend.backend.Repository.StudentRepository;
import backend.backend.Repository.UserRepository;
import backend.backend.Service.MarksService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class MarksServiceImpl implements MarksService {

    private static final double PASS_SCORE = 50.0;
    private static final double MIN_ADJUSTMENT = -20.0;
    private static final double MAX_ADJUSTMENT = 20.0;

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final InstructorRepository instructorRepository;
    private final CourseRepository courseRepository;
    private final CourseAllocationRepository courseAllocationRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final ProgressRepository progressRepository;
    private final MarksSheetRepository marksSheetRepository;
    private final LiveTestSubmissionRepository liveTestSubmissionRepository;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional(readOnly = true)
    public MarksBreakdownResponse getStudentMarks(String studentEmail, UUID courseId) {
        User user = resolveUser(studentEmail);
        Student student = resolveStudent(user);
        Course course = resolveCourse(courseId);

        ensureUniversityCourseEnrollments(course);

        Enrollment enrollment = enrollmentRepository
                .findByStudentIdAndCourseId(student.getId(), courseId)
                .orElseThrow(() -> new UnauthorizedException("You are not enrolled in this course"));

        MarksSheet marksSheet = marksSheetRepository
                .findByStudentIdAndCourseId(student.getId(), course.getId())
                .orElse(null);

        try {
            AutoMarksSnapshot auto = buildAutoMarksSnapshot(student, course, enrollment);
            FinalMarksSheetRowResponse row = buildDisplayRow(course, student, marksSheet, auto);
            return MarksBreakdownResponse.builder()
                    .courseId(course.getId())
                    .courseTitle(course.getTitle())
                    .attendanceScore(row.getAttendanceScore())
                    .testsScore(row.getTestsScore())
                    .liveTestsScore(row.getLiveTestsScore())
                    .projectScore(row.getProjectScore())
                    .weightAttendance(safeInt(course.getWeightAttendance()))
                    .weightTests(safeInt(course.getWeightTests()))
                    .weightLiveTests(safeInt(course.getWeightLiveTests()))
                    .weightProject(safeInt(course.getWeightProject()))
                    .attendanceWeighted(row.getAttendanceWeighted())
                    .testsWeighted(row.getTestsWeighted())
                    .liveTestsWeighted(row.getLiveTestsWeighted())
                    .projectWeighted(row.getProjectWeighted())
                    .totalPenalty(row.getLatePenalty())
                    .penaltyDescription(course.getPenaltyDescription())
                    .finalScore(row.getFinalScore())
                    .grade(row.getGrade())
                    .marksSheetStatus(resolveRowStatus(marksSheet).name())
                    .approvedAt(marksSheet != null ? marksSheet.getApprovedAt() : null)
                    .lockedFinal(isLocked(resolveRowStatus(marksSheet)))
                    .completedChapters(auto.completedChapters)
                    .totalChapters(auto.totalChapters)
                    .overallProgress(auto.overallProgress)
                    .build();
        } catch (Exception exception) {
            log.error("Failed to calculate marks for student '{}' and course '{}': {}",
                    student.getId(), course.getId(), exception.getMessage(), exception);
            return buildEmptyMarks(course, enrollment, resolveRowStatus(marksSheet).name());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<StudentMarksResponse> getCourseStudentMarks(String instructorEmail, UUID courseId) {
        Instructor instructor = resolveInstructor(resolveUser(instructorEmail));
        Course course = resolveCourse(courseId);

        if (course.getInstructor() == null || !course.getInstructor().getId().equals(instructor.getId())) {
            throw new UnauthorizedException("Not your course");
        }

        ensureUniversityCourseEnrollments(course);

        Map<UUID, MarksSheet> marksSheetsByStudent = marksSheetRepository.findByCourseId(courseId).stream()
                .filter(Objects::nonNull)
                .filter(sheet -> sheet.getStudent() != null)
                .collect(Collectors.toMap(
                        sheet -> sheet.getStudent().getId(),
                        Function.identity(),
                        (existing, replacement) -> existing
                ));

        return enrollmentRepository.findByCourseId(courseId).stream()
                .sorted(Comparator.comparing(
                        enrollment -> enrollment.getStudent().getUser().getName(),
                        String.CASE_INSENSITIVE_ORDER
                ))
                .map(enrollment -> {
                    Student student = enrollment.getStudent();
                    MarksSheet marksSheet = marksSheetsByStudent.get(student.getId());
                    try {
                        AutoMarksSnapshot auto = buildAutoMarksSnapshot(student, course, enrollment);
                        FinalMarksSheetRowResponse row = buildDisplayRow(course, student, marksSheet, auto);
                        return StudentMarksResponse.builder()
                                .studentId(student.getId())
                                .studentName(student.getUser().getName())
                                .rollNumber(student.getRollNumber())
                                .sectionName(student.getSection() != null ? student.getSection().getName() : null)
                                .attendanceScore(row.getAttendanceScore())
                                .testsScore(row.getTestsScore())
                                .liveTestsScore(row.getLiveTestsScore())
                                .projectScore(row.getProjectScore())
                                .totalPenalty(row.getLatePenalty())
                                .finalScore(row.getFinalScore())
                                .grade(row.getGrade())
                                .marksSheetStatus(resolveRowStatus(marksSheet).name())
                                .approvedAt(marksSheet != null ? marksSheet.getApprovedAt() : null)
                                .lockedFinal(isLocked(resolveRowStatus(marksSheet)))
                                .completedChapters(auto.completedChapters)
                                .totalChapters(auto.totalChapters)
                                .overallProgress(auto.overallProgress)
                                .build();
                    } catch (Exception exception) {
                        log.error("Failed to calculate marks for student '{}' and course '{}': {}",
                                student != null ? student.getId() : null,
                                course.getId(),
                                exception.getMessage(),
                                exception);
                        return StudentMarksResponse.builder()
                                .studentId(student.getId())
                                .studentName(student.getUser().getName())
                                .rollNumber(student.getRollNumber())
                                .sectionName(student.getSection() != null ? student.getSection().getName() : null)
                                .attendanceScore(0.0)
                                .testsScore(0.0)
                                .liveTestsScore(0.0)
                                .projectScore(0.0)
                                .totalPenalty(0.0)
                                .finalScore(0.0)
                                .grade("F")
                                .marksSheetStatus(resolveRowStatus(marksSheet).name())
                                .approvedAt(marksSheet != null ? marksSheet.getApprovedAt() : null)
                                .lockedFinal(isLocked(resolveRowStatus(marksSheet)))
                                .completedChapters(0)
                                .totalChapters(0)
                                .overallProgress(enrollment.getOverallProgress() != null ? enrollment.getOverallProgress() : 0f)
                                .build();
                    }
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public FinalMarksSheetResponse getInstructorFinalMarksSheet(String instructorEmail, UUID courseId) {
        Instructor instructor = resolveInstructor(resolveUser(instructorEmail));
        Course course = resolveInstructorCourse(courseId, instructor);
        ensureUniversityCourseEnrollments(course);
        return buildCourseSheetResponse(course);
    }

    @Override
    @Transactional
    public FinalMarksSheetResponse saveInstructorFinalMarksSheet(
            String instructorEmail,
            UUID courseId,
            UpsertFinalMarksSheetRequest request
    ) {
        Instructor instructor = resolveInstructor(resolveUser(instructorEmail));
        Course course = resolveInstructorCourse(courseId, instructor);
        ensureUniversityCourseEnrollments(course);

        List<MarksSheet> existingSheets = marksSheetRepository.findByCourseId(courseId);
        MarksSheetStatus courseStatus = determineCourseStatus(existingSheets);
        if (isLocked(courseStatus)) {
            throw new BadRequestException("This final marks sheet is locked while awaiting admin action.");
        }

        Map<UUID, MarksSheet> sheetByStudentId = existingSheets.stream()
                .filter(sheet -> sheet.getStudent() != null)
                .collect(Collectors.toMap(
                        sheet -> sheet.getStudent().getId(),
                        Function.identity(),
                        (existing, replacement) -> existing
                ));

        Set<UUID> enrolledIds = enrollmentRepository.findByCourseId(courseId).stream()
                .map(Enrollment::getStudent)
                .filter(Objects::nonNull)
                .map(Student::getId)
                .collect(Collectors.toCollection(LinkedHashSet::new));

        if (request != null && request.getRows() != null) {
            for (FinalMarksSheetRowUpdateRequest row : request.getRows()) {
                if (row == null || row.getStudentId() == null) {
                    continue;
                }
                if (!enrolledIds.contains(row.getStudentId())) {
                    throw new BadRequestException("Student does not belong to this course.");
                }

                validateManualRow(row);

                MarksSheet sheet = sheetByStudentId.get(row.getStudentId());
                if (sheet == null) {
                    Student student = studentRepository.findById(row.getStudentId())
                            .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
                    sheet = MarksSheet.builder()
                            .course(course)
                            .student(student)
                            .status(MarksSheetStatus.DRAFT)
                            .isApprovedByUniAdmin(false)
                            .build();
                }

                if (isLocked(resolveRowStatus(sheet))) {
                    throw new BadRequestException("Submitted rows cannot be edited until they are returned.");
                }

                MarksSheetPayload payload = deserializePayload(sheet.getBreakdownJson());
                payload.projectWorkScore = row.getProjectWorkScore();
                payload.vivaScore = row.getVivaScore();
                payload.internalModerationScore = row.getInternalModerationScore();
                payload.adjustmentScore = row.getAdjustmentScore();
                payload.instructorRemarks = trimToNull(row.getInstructorRemarks());

                sheet.setBreakdownJson(serializePayload(payload));
                sheet.setInstructorRemarks(payload.instructorRemarks);
                if (sheet.getStatus() == null) {
                    sheet.setStatus(MarksSheetStatus.DRAFT);
                }
                marksSheetRepository.save(sheet);
                sheetByStudentId.put(row.getStudentId(), sheet);
            }
        }

        return buildCourseSheetResponse(course);
    }

    @Override
    @Transactional
    public FinalMarksSheetResponse submitInstructorFinalMarksSheet(String instructorEmail, UUID courseId) {
        Instructor instructor = resolveInstructor(resolveUser(instructorEmail));
        Course course = resolveInstructorCourse(courseId, instructor);
        ensureUniversityCourseEnrollments(course);

        List<Enrollment> enrollments = enrollmentRepository.findByCourseId(courseId);
        if (enrollments.isEmpty()) {
            throw new BadRequestException("No students are enrolled in this course yet.");
        }

        List<MarksSheet> existingSheets = marksSheetRepository.findByCourseId(courseId);
        MarksSheetStatus courseStatus = determineCourseStatus(existingSheets);
        if (isLocked(courseStatus)) {
            throw new BadRequestException("This final marks sheet has already been submitted.");
        }

        Map<UUID, MarksSheet> sheetByStudentId = existingSheets.stream()
                .filter(sheet -> sheet.getStudent() != null)
                .collect(Collectors.toMap(
                        sheet -> sheet.getStudent().getId(),
                        Function.identity(),
                        (existing, replacement) -> existing
                ));

        LocalDateTime now = LocalDateTime.now();
        List<MarksSheet> toSave = new ArrayList<>();

        for (Enrollment enrollment : enrollments) {
            Student student = enrollment.getStudent();
            MarksSheet sheet = sheetByStudentId.get(student.getId());
            if (sheet == null) {
                sheet = MarksSheet.builder()
                        .course(course)
                        .student(student)
                        .status(MarksSheetStatus.DRAFT)
                        .isApprovedByUniAdmin(false)
                        .build();
            }

            if (isLocked(resolveRowStatus(sheet))) {
                throw new BadRequestException("This final marks sheet has already been submitted.");
            }

            AutoMarksSnapshot auto = buildAutoMarksSnapshot(student, course, enrollment);
            FinalMarksSheetRowResponse row = buildDraftRow(course, student, sheet, auto);
            MarksSheetPayload payload = toPayload(row);

            sheet.setBreakdownJson(serializePayload(payload));
            sheet.setTotalScore(row.getFinalScore());
            sheet.setLockedFinalScore(row.getFinalScore());
            sheet.setLockedGrade(row.getGrade());
            sheet.setInstructorRemarks(row.getInstructorRemarks());
            sheet.setStatus(MarksSheetStatus.SUBMITTED);
            sheet.setSubmittedAt(now);
            sheet.setApprovedAt(null);
            sheet.setApprovedBy(null);
            sheet.setReturnedAt(null);
            sheet.setReturnReason(null);
            sheet.setIsApprovedByUniAdmin(false);
            toSave.add(sheet);
        }

        marksSheetRepository.saveAll(toSave);
        return buildCourseSheetResponse(course);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MarksSheetListItemResponse> getUniAdminFinalMarksSheets(String adminEmail, String status) {
        User admin = resolveUniversityAdmin(adminEmail);
        List<Course> courses = courseRepository.findByUniversityIdAndIsUniversityCourseTrue(admin.getUniversity().getId());
        MarksSheetStatus filterStatus = parseStatusFilter(status);

        return courses.stream()
                .map(this::buildCourseSheetListItem)
                .filter(Objects::nonNull)
                .filter(item -> filterStatus == null || item.getStatus().equals(filterStatus.name()))
                .sorted(Comparator.comparing(
                        this::listItemSortTime,
                        Comparator.nullsLast(Comparator.reverseOrder())
                ))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public FinalMarksSheetResponse getUniAdminFinalMarksSheet(String adminEmail, UUID courseId) {
        User admin = resolveUniversityAdmin(adminEmail);
        Course course = resolveAdminCourse(courseId, admin);
        ensureUniversityCourseEnrollments(course);
        return buildCourseSheetResponse(course);
    }

    @Override
    @Transactional
    public FinalMarksSheetResponse approveUniAdminFinalMarksSheet(String adminEmail, UUID courseId) {
        User admin = resolveUniversityAdmin(adminEmail);
        Course course = resolveAdminCourse(courseId, admin);
        List<MarksSheet> sheets = marksSheetRepository.findByCourseId(courseId);

        if (sheets.isEmpty() || determineCourseStatus(sheets) != MarksSheetStatus.SUBMITTED) {
            throw new BadRequestException("Only submitted marks sheets can be approved.");
        }

        LocalDateTime now = LocalDateTime.now();
        for (MarksSheet sheet : sheets) {
            sheet.setStatus(MarksSheetStatus.APPROVED);
            sheet.setApprovedAt(now);
            sheet.setApprovedBy(admin);
            sheet.setReturnedAt(null);
            sheet.setReturnReason(null);
            sheet.setIsApprovedByUniAdmin(true);
        }

        marksSheetRepository.saveAll(sheets);
        return buildCourseSheetResponse(course);
    }

    @Override
    @Transactional
    public FinalMarksSheetResponse returnUniAdminFinalMarksSheet(
            String adminEmail,
            UUID courseId,
            ReturnMarksSheetRequest request
    ) {
        User admin = resolveUniversityAdmin(adminEmail);
        Course course = resolveAdminCourse(courseId, admin);
        List<MarksSheet> sheets = marksSheetRepository.findByCourseId(courseId);

        if (sheets.isEmpty() || determineCourseStatus(sheets) != MarksSheetStatus.SUBMITTED) {
            throw new BadRequestException("Only submitted marks sheets can be returned.");
        }

        String reason = trimToNull(request != null ? request.getReason() : null);
        if (reason == null) {
            throw new BadRequestException("Return reason is required.");
        }

        LocalDateTime now = LocalDateTime.now();
        for (MarksSheet sheet : sheets) {
            sheet.setStatus(MarksSheetStatus.RETURNED);
            sheet.setReturnedAt(now);
            sheet.setReturnReason(reason);
            sheet.setApprovedAt(null);
            sheet.setApprovedBy(null);
            sheet.setIsApprovedByUniAdmin(false);
        }

        marksSheetRepository.saveAll(sheets);
        return buildCourseSheetResponse(course);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CertificateRecordResponse> getUniAdminCertificates(String adminEmail) {
        User admin = resolveUniversityAdmin(adminEmail);
        List<Course> courses = courseRepository.findByUniversityIdAndIsUniversityCourseTrue(admin.getUniversity().getId());

        return courses.stream()
                .flatMap(course -> marksSheetRepository.findByCourseIdAndStatus(course.getId(), MarksSheetStatus.APPROVED).stream()
                        .map(sheet -> buildCertificateRecord(course, sheet)))
                .filter(Objects::nonNull)
                .sorted(Comparator
                        .comparing(CertificateRecordResponse::getApprovedAt, Comparator.nullsLast(Comparator.reverseOrder()))
                        .thenComparing(CertificateRecordResponse::getCourseTitle, String.CASE_INSENSITIVE_ORDER)
                        .thenComparing(CertificateRecordResponse::getStudentName, String.CASE_INSENSITIVE_ORDER))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<MarksSheetListItemResponse> getUniAdminMarksHistory(String adminEmail) {
        return getUniAdminFinalMarksSheets(adminEmail, MarksSheetStatus.APPROVED.name());
    }

    @Override
    @Transactional(readOnly = true)
    public StudentApprovedFinalMarksResponse getStudentApprovedFinalMarks(String studentEmail, UUID courseId) {
        User user = resolveUser(studentEmail);
        Student student = resolveStudent(user);
        Course course = resolveCourse(courseId);

        if (!enrollmentRepository.existsByStudentIdAndCourseId(student.getId(), courseId)) {
            throw new UnauthorizedException("You are not enrolled in this course.");
        }

        MarksSheet sheet = marksSheetRepository.findByStudentIdAndCourseId(student.getId(), courseId)
                .orElseThrow(() -> new BadRequestException("Certificate is not available yet."));

        if (resolveRowStatus(sheet) != MarksSheetStatus.APPROVED || sheet.getLockedFinalScore() == null) {
            throw new BadRequestException("Certificate is not available until the final marks sheet is approved.");
        }

        return StudentApprovedFinalMarksResponse.builder()
                .courseId(course.getId())
                .courseTitle(course.getTitle())
                .instructorName(course.getInstructor() != null && course.getInstructor().getUser() != null
                        ? course.getInstructor().getUser().getName()
                        : null)
                .studentId(student.getId())
                .studentName(student.getUser().getName())
                .rollNumber(student.getRollNumber())
                .branchName(student.getSection() != null && student.getSection().getBranch() != null
                        ? student.getSection().getBranch().getName()
                        : null)
                .sectionName(student.getSection() != null ? student.getSection().getName() : null)
                .finalScore(round2(sheet.getLockedFinalScore()))
                .grade(sheet.getLockedGrade())
                .approvedAt(sheet.getApprovedAt())
                .status(sheet.getStatus() != null ? sheet.getStatus().name() : MarksSheetStatus.DRAFT.name())
                .build();
    }

    private FinalMarksSheetResponse buildCourseSheetResponse(Course course) {
        List<Enrollment> enrollments = enrollmentRepository.findByCourseId(course.getId()).stream()
                .sorted(Comparator.comparing(
                        enrollment -> enrollment.getStudent().getUser().getName(),
                        String.CASE_INSENSITIVE_ORDER
                ))
                .collect(Collectors.toList());

        List<MarksSheet> sheets = marksSheetRepository.findByCourseId(course.getId());
        Map<UUID, MarksSheet> sheetByStudentId = sheets.stream()
                .filter(sheet -> sheet.getStudent() != null)
                .collect(Collectors.toMap(
                        sheet -> sheet.getStudent().getId(),
                        Function.identity(),
                        (existing, replacement) -> existing
                ));

        List<FinalMarksSheetRowResponse> rows = new ArrayList<>();
        for (Enrollment enrollment : enrollments) {
            Student student = enrollment.getStudent();
            AutoMarksSnapshot auto = buildAutoMarksSnapshot(student, course, enrollment);
            rows.add(buildDisplayRow(course, student, sheetByStudentId.get(student.getId()), auto));
        }

        FinalMarksSheetSummaryResponse summary = buildSummary(rows);
        MarksSheet representative = selectRepresentativeSheet(sheets);
        MarksSheetStatus status = determineCourseStatus(sheets);

        return FinalMarksSheetResponse.builder()
                .courseId(course.getId())
                .courseTitle(course.getTitle())
                .instructorName(course.getInstructor() != null && course.getInstructor().getUser() != null
                        ? course.getInstructor().getUser().getName()
                        : null)
                .targetBranch(course.getTargetBranch() != null ? course.getTargetBranch().getName() : null)
                .targetYear(course.getTargetYear())
                .weightAttendance(safeInt(course.getWeightAttendance()))
                .weightTests(safeInt(course.getWeightTests()))
                .weightLiveTests(safeInt(course.getWeightLiveTests()))
                .weightProject(safeInt(course.getWeightProject()))
                .penaltyDescription(course.getPenaltyDescription())
                .status(status.name())
                .locked(isLocked(status))
                .submittedAt(representative != null ? representative.getSubmittedAt() : null)
                .approvedAt(representative != null ? representative.getApprovedAt() : null)
                .approvedByName(representative != null && representative.getApprovedBy() != null
                        ? representative.getApprovedBy().getName()
                        : null)
                .returnedAt(representative != null ? representative.getReturnedAt() : null)
                .returnReason(representative != null ? representative.getReturnReason() : null)
                .rows(rows)
                .summary(summary)
                .build();
    }

    private MarksSheetListItemResponse buildCourseSheetListItem(Course course) {
        List<MarksSheet> sheets = marksSheetRepository.findByCourseId(course.getId());
        if (sheets.isEmpty()) {
            return null;
        }

        MarksSheetStatus status = determineCourseStatus(sheets);
        if (status == MarksSheetStatus.DRAFT) {
            return null;
        }

        FinalMarksSheetSummaryResponse summary = buildCourseSheetResponse(course).getSummary();
        MarksSheet representative = selectRepresentativeSheet(sheets);

        return MarksSheetListItemResponse.builder()
                .courseId(course.getId())
                .courseTitle(course.getTitle())
                .instructorName(course.getInstructor() != null && course.getInstructor().getUser() != null
                        ? course.getInstructor().getUser().getName()
                        : null)
                .targetBranch(course.getTargetBranch() != null ? course.getTargetBranch().getName() : null)
                .targetYear(course.getTargetYear())
                .studentCount(summary.getTotalStudents())
                .classAverage(summary.getClassAverage())
                .passCount(summary.getPassCount())
                .failCount(summary.getFailCount())
                .status(status.name())
                .submittedAt(representative != null ? representative.getSubmittedAt() : null)
                .approvedAt(representative != null ? representative.getApprovedAt() : null)
                .approvedByName(representative != null && representative.getApprovedBy() != null
                        ? representative.getApprovedBy().getName()
                        : null)
                .returnedAt(representative != null ? representative.getReturnedAt() : null)
                .returnReason(representative != null ? representative.getReturnReason() : null)
                .build();
    }

    private CertificateRecordResponse buildCertificateRecord(Course course, MarksSheet sheet) {
        if (sheet == null || sheet.getStudent() == null || sheet.getLockedFinalScore() == null) {
            return null;
        }

        Student student = sheet.getStudent();
        return CertificateRecordResponse.builder()
                .courseId(course.getId())
                .courseTitle(course.getTitle())
                .instructorName(course.getInstructor() != null && course.getInstructor().getUser() != null
                        ? course.getInstructor().getUser().getName()
                        : null)
                .studentId(student.getId())
                .studentName(student.getUser() != null ? student.getUser().getName() : "Unknown")
                .rollNumber(student.getRollNumber())
                .branchName(student.getSection() != null && student.getSection().getBranch() != null
                        ? student.getSection().getBranch().getName()
                        : null)
                .sectionName(student.getSection() != null ? student.getSection().getName() : null)
                .finalScore(round2(sheet.getLockedFinalScore()))
                .grade(sheet.getLockedGrade())
                .approvedAt(sheet.getApprovedAt())
                .build();
    }

    private FinalMarksSheetRowResponse buildDisplayRow(
            Course course,
            Student student,
            MarksSheet sheet,
            AutoMarksSnapshot auto
    ) {
        MarksSheetStatus status = resolveRowStatus(sheet);
        if (isLocked(status)) {
            return buildLockedRow(course, student, sheet, auto);
        }
        return buildDraftRow(course, student, sheet, auto);
    }

    private FinalMarksSheetRowResponse buildDraftRow(
            Course course,
            Student student,
            MarksSheet sheet,
            AutoMarksSnapshot auto
    ) {
        MarksSheetPayload payload = deserializePayload(sheet != null ? sheet.getBreakdownJson() : null);
        double projectWorkScore = nullableRound(payload.projectWorkScore);
        double vivaScore = nullableRound(payload.vivaScore);
        double internalModerationScore = nullableRound(payload.internalModerationScore);
        double projectScore = round2(calculateProjectBucket(payload));
        double adjustmentScore = nullableRound(payload.adjustmentScore);

        int weightAttendance = safeInt(course.getWeightAttendance());
        int weightTests = safeInt(course.getWeightTests());
        int weightLiveTests = safeInt(course.getWeightLiveTests());
        int weightProject = safeInt(course.getWeightProject());

        double attendanceWeighted = round2((auto.attendanceScore * weightAttendance) / 100.0);
        double testsWeighted = round2((auto.testsScore * weightTests) / 100.0);
        double liveTestsWeighted = round2((auto.liveTestsScore * weightLiveTests) / 100.0);
        double projectWeighted = round2((projectScore * weightProject) / 100.0);
        double weightedTotal = round2(attendanceWeighted + testsWeighted + liveTestsWeighted + projectWeighted);
        double finalScore = round2(clamp(weightedTotal - auto.latePenalty + adjustmentScore, 0.0, 100.0));

        return FinalMarksSheetRowResponse.builder()
                .studentId(student.getId())
                .studentName(student.getUser() != null ? student.getUser().getName() : "Unknown")
                .rollNumber(student.getRollNumber())
                .branchName(student.getSection() != null && student.getSection().getBranch() != null
                        ? student.getSection().getBranch().getName()
                        : null)
                .sectionName(student.getSection() != null ? student.getSection().getName() : null)
                .attendanceScore(round2(auto.attendanceScore))
                .testsScore(round2(auto.testsScore))
                .liveTestsScore(round2(auto.liveTestsScore))
                .projectWorkScore(payload.projectWorkScore != null ? round2(projectWorkScore) : null)
                .vivaScore(payload.vivaScore != null ? round2(vivaScore) : null)
                .internalModerationScore(payload.internalModerationScore != null ? round2(internalModerationScore) : null)
                .projectScore(projectScore)
                .adjustmentScore(payload.adjustmentScore != null ? round2(adjustmentScore) : null)
                .attendanceWeighted(attendanceWeighted)
                .testsWeighted(testsWeighted)
                .liveTestsWeighted(liveTestsWeighted)
                .projectWeighted(projectWeighted)
                .weightedTotal(weightedTotal)
                .latePenalty(round2(auto.latePenalty))
                .finalScore(finalScore)
                .grade(toGrade(finalScore))
                .passed(finalScore >= PASS_SCORE)
                .instructorRemarks(trimToNull(
                        sheet != null && sheet.getInstructorRemarks() != null
                                ? sheet.getInstructorRemarks()
                                : payload.instructorRemarks))
                .build();
    }

    private FinalMarksSheetRowResponse buildLockedRow(
            Course course,
            Student student,
            MarksSheet sheet,
            AutoMarksSnapshot auto
    ) {
        MarksSheetPayload payload = deserializePayload(sheet != null ? sheet.getBreakdownJson() : null);
        double finalScore = sheet != null && sheet.getLockedFinalScore() != null
                ? round2(sheet.getLockedFinalScore())
                : round2(payload.finalScore);
        String grade = sheet != null && sheet.getLockedGrade() != null
                ? sheet.getLockedGrade()
                : toGrade(finalScore);

        return FinalMarksSheetRowResponse.builder()
                .studentId(student.getId())
                .studentName(student.getUser() != null ? student.getUser().getName() : "Unknown")
                .rollNumber(student.getRollNumber())
                .branchName(student.getSection() != null && student.getSection().getBranch() != null
                        ? student.getSection().getBranch().getName()
                        : null)
                .sectionName(student.getSection() != null ? student.getSection().getName() : null)
                .attendanceScore(nullableRound(payload.attendanceScore))
                .testsScore(nullableRound(payload.testsScore))
                .liveTestsScore(nullableRound(payload.liveTestsScore))
                .projectWorkScore(payload.projectWorkScore != null ? round2(payload.projectWorkScore) : null)
                .vivaScore(payload.vivaScore != null ? round2(payload.vivaScore) : null)
                .internalModerationScore(payload.internalModerationScore != null ? round2(payload.internalModerationScore) : null)
                .projectScore(nullableRound(payload.projectScore))
                .adjustmentScore(payload.adjustmentScore != null ? round2(payload.adjustmentScore) : null)
                .attendanceWeighted(nullableRound(payload.attendanceWeighted))
                .testsWeighted(nullableRound(payload.testsWeighted))
                .liveTestsWeighted(nullableRound(payload.liveTestsWeighted))
                .projectWeighted(nullableRound(payload.projectWeighted))
                .weightedTotal(nullableRound(payload.weightedTotal))
                .latePenalty(nullableRound(payload.latePenalty))
                .finalScore(finalScore)
                .grade(grade)
                .passed(finalScore >= PASS_SCORE)
                .instructorRemarks(trimToNull(
                        sheet != null && sheet.getInstructorRemarks() != null
                                ? sheet.getInstructorRemarks()
                                : payload.instructorRemarks))
                .build();
    }

    private FinalMarksSheetSummaryResponse buildSummary(List<FinalMarksSheetRowResponse> rows) {
        if (rows.isEmpty()) {
            return FinalMarksSheetSummaryResponse.builder()
                    .totalStudents(0)
                    .passCount(0)
                    .failCount(0)
                    .classAverage(0.0)
                    .highestScore(0.0)
                    .lowestScore(0.0)
                    .build();
        }

        int passCount = (int) rows.stream()
                .filter(row -> Boolean.TRUE.equals(row.getPassed()))
                .count();

        double classAverage = rows.stream()
                .map(FinalMarksSheetRowResponse::getFinalScore)
                .filter(Objects::nonNull)
                .mapToDouble(Double::doubleValue)
                .average()
                .orElse(0.0);

        double highest = rows.stream()
                .map(FinalMarksSheetRowResponse::getFinalScore)
                .filter(Objects::nonNull)
                .mapToDouble(Double::doubleValue)
                .max()
                .orElse(0.0);

        double lowest = rows.stream()
                .map(FinalMarksSheetRowResponse::getFinalScore)
                .filter(Objects::nonNull)
                .mapToDouble(Double::doubleValue)
                .min()
                .orElse(0.0);

        return FinalMarksSheetSummaryResponse.builder()
                .totalStudents(rows.size())
                .passCount(passCount)
                .failCount(rows.size() - passCount)
                .classAverage(round2(classAverage))
                .highestScore(round2(highest))
                .lowestScore(round2(lowest))
                .build();
    }

    private AutoMarksSnapshot buildAutoMarksSnapshot(Student student, Course course, Enrollment enrollment) {
        List<Chapter> chapters = safeChapters(course);
        int totalChapters = chapters.size();

        List<Progress> progressList = progressRepository
                .findByStudentIdAndChapterCourseId(student.getId(), course.getId())
                .stream()
                .filter(Objects::nonNull)
                .filter(progress -> progress.getChapter() != null)
                .collect(Collectors.toList());

        Map<UUID, Progress> progressMap = progressList.stream()
                .collect(Collectors.toMap(
                        progress -> progress.getChapter().getId(),
                        Function.identity(),
                        (existing, replacement) -> existing
                ));

        long completedCount = progressList.stream()
                .filter(progress -> Boolean.TRUE.equals(progress.getCompleted()))
                .count();

        double attendanceScore = totalChapters > 0
                ? (completedCount * 100.0) / totalChapters
                : 0.0;

        List<Progress> withQuizScore = progressList.stream()
                .filter(progress -> progress.getAssessmentScore() != null)
                .collect(Collectors.toList());

        double testsScore = withQuizScore.isEmpty()
                ? 0.0
                : withQuizScore.stream()
                .mapToDouble(progress -> progress.getAssessmentScore() != null ? progress.getAssessmentScore() : 0.0)
                .average()
                .orElse(0.0);

        double liveTestsScore = liveTestSubmissionRepository
                .findByStudentIdAndLiveTestCourseId(student.getId(), course.getId())
                .stream()
                .map(submission -> submission.getScore() != null ? submission.getScore() : 0.0)
                .mapToDouble(Double::doubleValue)
                .average()
                .orElse(0.0);

        double totalPenalty = 0.0;
        LocalDateTime now = LocalDateTime.now();

        for (Chapter chapter : chapters) {
            if (chapter.getDeadline() == null || chapter.getDeadline().isAfter(now)) {
                continue;
            }

            Progress progress = progressMap.get(chapter.getId());
            boolean completed = progress != null && Boolean.TRUE.equals(progress.getCompleted());
            if (completed) {
                continue;
            }

            double penaltyRate = chapter.getPenaltyPerDay() != null && chapter.getPenaltyPerDay() > 0
                    ? chapter.getPenaltyPerDay()
                    : (course.getDefaultPenaltyPerDay() != null ? course.getDefaultPenaltyPerDay() : 0.0);

            if (penaltyRate <= 0) {
                continue;
            }

            long daysLate = ChronoUnit.DAYS.between(chapter.getDeadline(), now);
            if (daysLate < 1) {
                daysLate = 1;
            }
            totalPenalty += penaltyRate * daysLate;
        }

        float overallProgress = enrollment != null && enrollment.getOverallProgress() != null
                ? enrollment.getOverallProgress()
                : 0f;

        return new AutoMarksSnapshot(
                round2(attendanceScore),
                round2(testsScore),
                round2(liveTestsScore),
                round2(totalPenalty),
                (int) completedCount,
                totalChapters,
                overallProgress
        );
    }

    private MarksBreakdownResponse buildEmptyMarks(Course course, Enrollment enrollment, String status) {
        float overallProgress = enrollment != null && enrollment.getOverallProgress() != null
                ? enrollment.getOverallProgress()
                : 0f;

        return MarksBreakdownResponse.builder()
                .courseId(course.getId())
                .courseTitle(course.getTitle())
                .attendanceScore(0.0)
                .testsScore(0.0)
                .liveTestsScore(0.0)
                .projectScore(0.0)
                .weightAttendance(safeInt(course.getWeightAttendance()))
                .weightTests(safeInt(course.getWeightTests()))
                .weightLiveTests(safeInt(course.getWeightLiveTests()))
                .weightProject(safeInt(course.getWeightProject()))
                .attendanceWeighted(0.0)
                .testsWeighted(0.0)
                .liveTestsWeighted(0.0)
                .projectWeighted(0.0)
                .totalPenalty(0.0)
                .penaltyDescription(course.getPenaltyDescription())
                .finalScore(0.0)
                .grade("F")
                .marksSheetStatus(status)
                .approvedAt(null)
                .lockedFinal(false)
                .completedChapters(0)
                .totalChapters(safeChapters(course).size())
                .overallProgress(overallProgress)
                .build();
    }

    private User resolveUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private Student resolveStudent(User user) {
        return studentRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
    }

    private Instructor resolveInstructor(User user) {
        return instructorRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Instructor not found"));
    }

    private User resolveUniversityAdmin(String email) {
        User user = resolveUser(email);
        if (user.getUniversity() == null) {
            throw new BadRequestException("University admin is not linked to a university.");
        }
        return user;
    }

    private Course resolveCourse(UUID courseId) {
        return courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
    }

    private Course resolveInstructorCourse(UUID courseId, Instructor instructor) {
        Course course = resolveCourse(courseId);
        if (!Boolean.TRUE.equals(course.getIsUniversityCourse())) {
            throw new BadRequestException("Final marks sheet is available only for university courses.");
        }
        if (course.getInstructor() == null || !course.getInstructor().getId().equals(instructor.getId())) {
            throw new UnauthorizedException("You do not own this course.");
        }
        return course;
    }

    private Course resolveAdminCourse(UUID courseId, User admin) {
        Course course = resolveCourse(courseId);
        if (!Boolean.TRUE.equals(course.getIsUniversityCourse())) {
            throw new BadRequestException("Final marks sheet is available only for university courses.");
        }
        if (course.getUniversity() == null || !course.getUniversity().getId().equals(admin.getUniversity().getId())) {
            throw new UnauthorizedException("This course does not belong to your university.");
        }
        return course;
    }

    private void validateManualRow(FinalMarksSheetRowUpdateRequest row) {
        validateScoreRange(row.getProjectWorkScore(), 0.0, 100.0, "Project score");
        validateScoreRange(row.getVivaScore(), 0.0, 100.0, "Viva score");
        validateScoreRange(row.getInternalModerationScore(), 0.0, 100.0, "Internal moderation score");
        validateScoreRange(row.getAdjustmentScore(), MIN_ADJUSTMENT, MAX_ADJUSTMENT, "Adjustment score");
    }

    private void validateScoreRange(Double value, double min, double max, String label) {
        if (value == null) {
            return;
        }
        if (value < min || value > max) {
            throw new BadRequestException(label + " must be between " + min + " and " + max + ".");
        }
    }

    private MarksSheetStatus parseStatusFilter(String status) {
        if (status == null || status.isBlank() || "ALL".equalsIgnoreCase(status)) {
            return null;
        }
        try {
            return MarksSheetStatus.valueOf(status.trim().toUpperCase());
        } catch (IllegalArgumentException exception) {
            throw new BadRequestException("Invalid marks sheet status filter.");
        }
    }

    private MarksSheetStatus determineCourseStatus(List<MarksSheet> sheets) {
        if (sheets == null || sheets.isEmpty()) {
            return MarksSheetStatus.DRAFT;
        }
        boolean approved = sheets.stream().anyMatch(sheet -> resolveRowStatus(sheet) == MarksSheetStatus.APPROVED);
        if (approved) {
            return MarksSheetStatus.APPROVED;
        }
        boolean submitted = sheets.stream().anyMatch(sheet -> resolveRowStatus(sheet) == MarksSheetStatus.SUBMITTED);
        if (submitted) {
            return MarksSheetStatus.SUBMITTED;
        }
        boolean returned = sheets.stream().anyMatch(sheet -> resolveRowStatus(sheet) == MarksSheetStatus.RETURNED);
        if (returned) {
            return MarksSheetStatus.RETURNED;
        }
        return MarksSheetStatus.DRAFT;
    }

    private MarksSheetStatus resolveRowStatus(MarksSheet sheet) {
        return sheet != null && sheet.getStatus() != null
                ? sheet.getStatus()
                : MarksSheetStatus.DRAFT;
    }

    private boolean isLocked(MarksSheetStatus status) {
        return status == MarksSheetStatus.SUBMITTED || status == MarksSheetStatus.APPROVED;
    }

    private MarksSheet selectRepresentativeSheet(List<MarksSheet> sheets) {
        return sheets.stream()
                .filter(Objects::nonNull)
                .max(Comparator.comparing(this::representativeTime, Comparator.nullsLast(Comparator.naturalOrder())))
                .orElse(null);
    }

    private LocalDateTime representativeTime(MarksSheet sheet) {
        if (sheet == null) {
            return null;
        }
        if (sheet.getApprovedAt() != null) {
            return sheet.getApprovedAt();
        }
        if (sheet.getReturnedAt() != null) {
            return sheet.getReturnedAt();
        }
        if (sheet.getSubmittedAt() != null) {
            return sheet.getSubmittedAt();
        }
        if (sheet.getUpdatedAt() != null) {
            return sheet.getUpdatedAt();
        }
        return sheet.getCreatedAt();
    }

    private LocalDateTime listItemSortTime(MarksSheetListItemResponse item) {
        if (item.getApprovedAt() != null) {
            return item.getApprovedAt();
        }
        if (item.getReturnedAt() != null) {
            return item.getReturnedAt();
        }
        return item.getSubmittedAt();
    }

    private List<Chapter> safeChapters(Course course) {
        return (course.getChapters() != null ? course.getChapters() : Collections.<Chapter>emptyList())
                .stream()
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    private void ensureUniversityCourseEnrollments(Course course) {
        if (!Boolean.TRUE.equals(course.getIsUniversityCourse())) {
            return;
        }

        List<CourseAllocation> allocations = courseAllocationRepository.findByCourseId(course.getId());
        for (CourseAllocation allocation : allocations) {
            if (allocation.getSection() == null) {
                continue;
            }

            List<Student> studentsInSection = studentRepository.findBySectionId(allocation.getSection().getId());
            for (Student student : studentsInSection) {
                boolean alreadyEnrolled = enrollmentRepository
                        .existsByStudentIdAndCourseId(student.getId(), course.getId());

                if (!alreadyEnrolled) {
                    try {
                        Enrollment enrollment = Enrollment.builder()
                                .student(student)
                                .course(course)
                                .overallProgress(0.0f)
                                .isCompleted(false)
                                .build();
                        enrollmentRepository.save(enrollment);
                    } catch (DataIntegrityViolationException exception) {
                        log.debug("Enrollment already created concurrently for student '{}' and course '{}'",
                                student.getId(), course.getId());
                    }
                }
            }
        }
    }

    private MarksSheetPayload deserializePayload(String json) {
        if (json == null || json.isBlank()) {
            return new MarksSheetPayload();
        }
        try {
            return objectMapper.readValue(json, MarksSheetPayload.class);
        } catch (Exception exception) {
            try {
                Map<?, ?> legacy = objectMapper.readValue(json, Map.class);
                MarksSheetPayload payload = new MarksSheetPayload();
                payload.liveTestsScore = toNullableDouble(legacy.get("liveTestsScore"));
                payload.projectScore = toNullableDouble(legacy.get("projectScore"));
                payload.projectWorkScore = payload.projectScore;
                payload.adjustmentScore = toNullableDouble(legacy.get("adjustmentScore"));
                payload.instructorRemarks = legacy.get("instructorRemarks") != null
                        ? legacy.get("instructorRemarks").toString()
                        : null;
                return payload;
            } catch (Exception ignored) {
                return new MarksSheetPayload();
            }
        }
    }

    private String serializePayload(MarksSheetPayload payload) {
        try {
            return objectMapper.writeValueAsString(payload);
        } catch (Exception exception) {
            return "{}";
        }
    }

    private MarksSheetPayload toPayload(FinalMarksSheetRowResponse row) {
        MarksSheetPayload payload = new MarksSheetPayload();
        payload.attendanceScore = row.getAttendanceScore();
        payload.testsScore = row.getTestsScore();
        payload.liveTestsScore = row.getLiveTestsScore();
        payload.projectWorkScore = row.getProjectWorkScore();
        payload.vivaScore = row.getVivaScore();
        payload.internalModerationScore = row.getInternalModerationScore();
        payload.projectScore = row.getProjectScore();
        payload.adjustmentScore = row.getAdjustmentScore();
        payload.attendanceWeighted = row.getAttendanceWeighted();
        payload.testsWeighted = row.getTestsWeighted();
        payload.liveTestsWeighted = row.getLiveTestsWeighted();
        payload.projectWeighted = row.getProjectWeighted();
        payload.weightedTotal = row.getWeightedTotal();
        payload.latePenalty = row.getLatePenalty();
        payload.finalScore = row.getFinalScore();
        payload.grade = row.getGrade();
        payload.instructorRemarks = row.getInstructorRemarks();
        return payload;
    }

    private double calculateProjectBucket(MarksSheetPayload payload) {
        List<Double> provided = new ArrayList<>();
        if (payload.projectWorkScore != null) {
            provided.add(payload.projectWorkScore);
        }
        if (payload.vivaScore != null) {
            provided.add(payload.vivaScore);
        }
        if (payload.internalModerationScore != null) {
            provided.add(payload.internalModerationScore);
        }
        if (!provided.isEmpty()) {
            return provided.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
        }
        return payload.projectScore != null ? payload.projectScore : 0.0;
    }

    private Double toNullableDouble(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof Number number) {
            return number.doubleValue();
        }
        try {
            return Double.parseDouble(value.toString());
        } catch (NumberFormatException exception) {
            return null;
        }
    }

    private int safeInt(Integer value) {
        return value != null ? value : 0;
    }

    private double round2(double value) {
        return Math.round(value * 100.0) / 100.0;
    }

    private double nullableRound(Double value) {
        return value != null ? round2(value) : 0.0;
    }

    private double clamp(double value, double min, double max) {
        return Math.max(min, Math.min(max, value));
    }

    private String toGrade(double score) {
        if (score >= 90) return "S";
        if (score >= 80) return "A";
        if (score >= 70) return "B";
        if (score >= 60) return "C";
        if (score >= 50) return "D";
        return "F";
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private static class AutoMarksSnapshot {
        private final double attendanceScore;
        private final double testsScore;
        private final double liveTestsScore;
        private final double latePenalty;
        private final int completedChapters;
        private final int totalChapters;
        private final float overallProgress;

        private AutoMarksSnapshot(
                double attendanceScore,
                double testsScore,
                double liveTestsScore,
                double latePenalty,
                int completedChapters,
                int totalChapters,
                float overallProgress
        ) {
            this.attendanceScore = attendanceScore;
            this.testsScore = testsScore;
            this.liveTestsScore = liveTestsScore;
            this.latePenalty = latePenalty;
            this.completedChapters = completedChapters;
            this.totalChapters = totalChapters;
            this.overallProgress = overallProgress;
        }
    }

    private static class MarksSheetPayload {
        public Double attendanceScore;
        public Double testsScore;
        public Double liveTestsScore;
        public Double projectWorkScore;
        public Double vivaScore;
        public Double internalModerationScore;
        public Double projectScore;
        public Double adjustmentScore;
        public Double attendanceWeighted;
        public Double testsWeighted;
        public Double liveTestsWeighted;
        public Double projectWeighted;
        public Double weightedTotal;
        public Double latePenalty;
        public Double finalScore;
        public String grade;
        public String instructorRemarks;
    }
}
