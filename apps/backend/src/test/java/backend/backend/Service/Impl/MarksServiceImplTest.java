package backend.backend.Service.Impl;

import backend.backend.Dto.Response.StudentApprovedFinalMarksResponse;
import backend.backend.Entity.Branch;
import backend.backend.Entity.Course;
import backend.backend.Entity.Instructor;
import backend.backend.Entity.MarksSheet;
import backend.backend.Entity.Section;
import backend.backend.Entity.Student;
import backend.backend.Entity.User;
import backend.backend.Enums.MarksSheetStatus;
import backend.backend.Enums.Role;
import backend.backend.Exceptions.BadRequestException;
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
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MarksServiceImplTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private StudentRepository studentRepository;
    @Mock
    private InstructorRepository instructorRepository;
    @Mock
    private CourseRepository courseRepository;
    @Mock
    private CourseAllocationRepository courseAllocationRepository;
    @Mock
    private EnrollmentRepository enrollmentRepository;
    @Mock
    private ProgressRepository progressRepository;
    @Mock
    private MarksSheetRepository marksSheetRepository;
    @Mock
    private LiveTestSubmissionRepository liveTestSubmissionRepository;

    private MarksServiceImpl marksService;

    @BeforeEach
    void setUp() {
        marksService = new MarksServiceImpl(
                userRepository,
                studentRepository,
                instructorRepository,
                courseRepository,
                courseAllocationRepository,
                enrollmentRepository,
                progressRepository,
                marksSheetRepository,
                liveTestSubmissionRepository,
                new ObjectMapper()
        );
    }

    @Test
    void getStudentApprovedFinalMarksReturnsApprovedCertificateDetails() {
        UUID studentId = UUID.randomUUID();
        UUID courseId = UUID.randomUUID();
        LocalDateTime approvedAt = LocalDateTime.of(2026, 5, 3, 10, 15);

        User studentUser = User.builder()
                .id(studentId)
                .name("Asha Sharma")
                .email("asha@student.com")
                .role(Role.STUDENT)
                .build();
        User instructorUser = User.builder()
                .id(UUID.randomUUID())
                .name("Dr. Raman")
                .email("raman@instructor.com")
                .role(Role.INSTRUCTOR)
                .build();
        Instructor instructor = Instructor.builder()
                .id(instructorUser.getId())
                .user(instructorUser)
                .build();
        Branch branch = Branch.builder()
                .name("Computer Science")
                .build();
        Section section = Section.builder()
                .name("A")
                .branch(branch)
                .build();
        Student student = Student.builder()
                .id(studentId)
                .user(studentUser)
                .rollNumber("22CS101")
                .section(section)
                .build();
        Course course = Course.builder()
                .id(courseId)
                .title("Advanced Java")
                .instructor(instructor)
                .isUniversityCourse(true)
                .build();
        MarksSheet approvedSheet = MarksSheet.builder()
                .course(course)
                .student(student)
                .status(MarksSheetStatus.APPROVED)
                .lockedFinalScore(91.236)
                .lockedGrade("A+")
                .approvedAt(approvedAt)
                .build();

        when(userRepository.findByEmail(studentUser.getEmail())).thenReturn(Optional.of(studentUser));
        when(studentRepository.findByUserId(studentId)).thenReturn(Optional.of(student));
        when(courseRepository.findById(courseId)).thenReturn(Optional.of(course));
        when(enrollmentRepository.existsByStudentIdAndCourseId(studentId, courseId)).thenReturn(true);
        when(marksSheetRepository.findByStudentIdAndCourseId(studentId, courseId)).thenReturn(Optional.of(approvedSheet));

        StudentApprovedFinalMarksResponse response =
                marksService.getStudentApprovedFinalMarks(studentUser.getEmail(), courseId);

        assertEquals(courseId, response.getCourseId());
        assertEquals("Advanced Java", response.getCourseTitle());
        assertEquals("Dr. Raman", response.getInstructorName());
        assertEquals(studentId, response.getStudentId());
        assertEquals("Asha Sharma", response.getStudentName());
        assertEquals("22CS101", response.getRollNumber());
        assertEquals("Computer Science", response.getBranchName());
        assertEquals("A", response.getSectionName());
        assertEquals(91.24, response.getFinalScore());
        assertEquals("A+", response.getGrade());
        assertEquals(approvedAt, response.getApprovedAt());
        assertEquals("APPROVED", response.getStatus());
    }

    @Test
    void getStudentApprovedFinalMarksRejectsStudentsWhoAreNotEnrolled() {
        UUID studentId = UUID.randomUUID();
        UUID courseId = UUID.randomUUID();

        User studentUser = User.builder()
                .id(studentId)
                .name("Asha Sharma")
                .email("asha@student.com")
                .role(Role.STUDENT)
                .build();
        Student student = Student.builder()
                .id(studentId)
                .user(studentUser)
                .build();
        Course course = Course.builder()
                .id(courseId)
                .title("Advanced Java")
                .build();

        when(userRepository.findByEmail(studentUser.getEmail())).thenReturn(Optional.of(studentUser));
        when(studentRepository.findByUserId(studentId)).thenReturn(Optional.of(student));
        when(courseRepository.findById(courseId)).thenReturn(Optional.of(course));
        when(enrollmentRepository.existsByStudentIdAndCourseId(studentId, courseId)).thenReturn(false);

        UnauthorizedException exception = assertThrows(
                UnauthorizedException.class,
                () -> marksService.getStudentApprovedFinalMarks(studentUser.getEmail(), courseId)
        );

        assertEquals("You are not enrolled in this course.", exception.getMessage());
    }

    @Test
    void getStudentApprovedFinalMarksRequiresApprovedSheetBeforeCertificateUnlocks() {
        UUID studentId = UUID.randomUUID();
        UUID courseId = UUID.randomUUID();

        User studentUser = User.builder()
                .id(studentId)
                .name("Asha Sharma")
                .email("asha@student.com")
                .role(Role.STUDENT)
                .build();
        Student student = Student.builder()
                .id(studentId)
                .user(studentUser)
                .build();
        Course course = Course.builder()
                .id(courseId)
                .title("Advanced Java")
                .build();
        MarksSheet draftSheet = MarksSheet.builder()
                .course(course)
                .student(student)
                .status(MarksSheetStatus.DRAFT)
                .lockedFinalScore(null)
                .build();

        when(userRepository.findByEmail(studentUser.getEmail())).thenReturn(Optional.of(studentUser));
        when(studentRepository.findByUserId(studentId)).thenReturn(Optional.of(student));
        when(courseRepository.findById(courseId)).thenReturn(Optional.of(course));
        when(enrollmentRepository.existsByStudentIdAndCourseId(studentId, courseId)).thenReturn(true);
        when(marksSheetRepository.findByStudentIdAndCourseId(studentId, courseId)).thenReturn(Optional.of(draftSheet));

        BadRequestException exception = assertThrows(
                BadRequestException.class,
                () -> marksService.getStudentApprovedFinalMarks(studentUser.getEmail(), courseId)
        );

        assertEquals(
                "Certificate is not available until the final marks sheet is approved.",
                exception.getMessage()
        );
    }
}
