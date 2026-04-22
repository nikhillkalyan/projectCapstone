package backend.backend.Service;

import backend.backend.Dto.Request.CreateUniversityCourseAllocationRequest;
import backend.backend.Dto.Request.CreateUniversityCourseRequest;
import backend.backend.Dto.Request.RejectRequest;
import backend.backend.Dto.Request.UpdateUniversityCourseSettingsRequest;
import backend.backend.Dto.Response.CourseAllocationResponse;
import backend.backend.Dto.Response.SectionResponse;
import backend.backend.Dto.Response.StudentUniCourseResponse;
import backend.backend.Dto.Response.UniversityCourseResponse;

import java.util.List;
import java.util.UUID;

public interface UniversityCourseService {

    /** Instructor: create a university course (goes into pool as PENDING) */
    UniversityCourseResponse createCourse(String instructorEmail, CreateUniversityCourseRequest request);

    /** Instructor: list their own university courses */
    List<UniversityCourseResponse> getMyCourses(String instructorEmail);

    /** Uni-Admin: list the entire course pool for their university, optional filter by status */
    List<UniversityCourseResponse> getCoursePool(String adminEmail, String status);

    /** Uni-Admin: approve a course */
    UniversityCourseResponse approveCourse(String adminEmail, UUID courseId);

    /** Uni-Admin: reject a course with a reason */
    UniversityCourseResponse rejectCourse(String adminEmail, UUID courseId, RejectRequest request);

    /** Allocations */
    List<CourseAllocationResponse> getAllocations(String email);
    List<CourseAllocationResponse> allocateCourse(CreateUniversityCourseAllocationRequest req, String email);
    void removeAllocation(UUID allocationId, String email);

    /** Sections */
    List<SectionResponse> getSectionsForAdmin(String email);

    List<UniversityCourseResponse> getMyUniversityCourses(String email);
    List<CourseAllocationResponse> getStudentAllocatedCourses(String email);
    List<StudentUniCourseResponse> getStudentEnrolledCourses(String email);
    void deletePendingCourse(UUID courseId, String email);
    UniversityCourseResponse updateCourseSettings(String instructorEmail, UUID courseId, UpdateUniversityCourseSettingsRequest request);
}
