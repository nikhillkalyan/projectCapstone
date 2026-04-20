package backend.backend.Service;

import backend.backend.Dto.Request.CreateUniversityCourseRequest;
import backend.backend.Dto.Request.RejectRequest;
import backend.backend.Dto.Response.UniversityCourseResponse;

import java.util.List;
import java.util.UUID;

public interface UniversityCourseService {

    /** Instructor: create a university course (goes into pool as PENDING) */
    UniversityCourseResponse createCourse(String instructorEmail, CreateUniversityCourseRequest request);

    /** Instructor: list their own university courses */
    List<UniversityCourseResponse> getMyCourses(String instructorEmail);

    /** Uni-Admin: list the entire course pool for their university */
    List<UniversityCourseResponse> getCoursePool(String adminEmail);

    /** Uni-Admin: approve a course */
    UniversityCourseResponse approveCourse(String adminEmail, UUID courseId);

    /** Uni-Admin: reject a course with a reason */
    UniversityCourseResponse rejectCourse(String adminEmail, UUID courseId, RejectRequest request);
}
