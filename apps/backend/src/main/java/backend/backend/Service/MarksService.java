package backend.backend.Service;

import backend.backend.Dto.Request.ReturnMarksSheetRequest;
import backend.backend.Dto.Request.UpsertFinalMarksSheetRequest;
import backend.backend.Dto.Response.CertificateRecordResponse;
import backend.backend.Dto.Response.FinalMarksSheetResponse;
import backend.backend.Dto.Response.MarksBreakdownResponse;
import backend.backend.Dto.Response.MarksSheetListItemResponse;
import backend.backend.Dto.Response.StudentApprovedFinalMarksResponse;
import backend.backend.Dto.Response.StudentMarksResponse;

import java.util.List;
import java.util.UUID;

public interface MarksService {
    MarksBreakdownResponse getStudentMarks(String studentEmail, UUID courseId);
    List<StudentMarksResponse> getCourseStudentMarks(String instructorEmail, UUID courseId);
    FinalMarksSheetResponse getInstructorFinalMarksSheet(String instructorEmail, UUID courseId);
    FinalMarksSheetResponse saveInstructorFinalMarksSheet(String instructorEmail, UUID courseId, UpsertFinalMarksSheetRequest request);
    FinalMarksSheetResponse submitInstructorFinalMarksSheet(String instructorEmail, UUID courseId);
    List<MarksSheetListItemResponse> getUniAdminFinalMarksSheets(String adminEmail, String status);
    FinalMarksSheetResponse getUniAdminFinalMarksSheet(String adminEmail, UUID courseId);
    FinalMarksSheetResponse approveUniAdminFinalMarksSheet(String adminEmail, UUID courseId);
    FinalMarksSheetResponse returnUniAdminFinalMarksSheet(String adminEmail, UUID courseId, ReturnMarksSheetRequest request);
    List<CertificateRecordResponse> getUniAdminCertificates(String adminEmail);
    List<MarksSheetListItemResponse> getUniAdminMarksHistory(String adminEmail);
    StudentApprovedFinalMarksResponse getStudentApprovedFinalMarks(String studentEmail, UUID courseId);
}
