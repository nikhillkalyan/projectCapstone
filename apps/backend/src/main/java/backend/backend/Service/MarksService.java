package backend.backend.Service;

import backend.backend.Dto.Response.MarksBreakdownResponse;
import backend.backend.Dto.Response.StudentMarksResponse;

import java.util.List;
import java.util.UUID;

public interface MarksService {
    MarksBreakdownResponse getStudentMarks(String studentEmail, UUID courseId);
    List<StudentMarksResponse> getCourseStudentMarks(String instructorEmail, UUID courseId);
}
