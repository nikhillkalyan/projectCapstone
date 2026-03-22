package backend.backend.Service;

import backend.backend.Dto.Request.CreateCourseRequest;
import backend.backend.Dto.Request.UpdateCourseRequest;
import backend.backend.Dto.Response.CourseResponse;

import java.util.List;
import java.util.UUID;

public interface CourseService {
    List<CourseResponse> getAllCourses(String category, String level, String search);
    CourseResponse getCourseById(UUID courseId);
    CourseResponse createCourse(CreateCourseRequest request);
    CourseResponse updateCourse(UUID courseId, UpdateCourseRequest request);
    void deleteCourse(UUID courseId);
    List<CourseResponse> getCoursesByInstructor(UUID instructorId);
}