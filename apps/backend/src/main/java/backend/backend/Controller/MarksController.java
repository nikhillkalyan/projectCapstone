package backend.backend.Controller;

import backend.backend.Dto.Request.ReturnMarksSheetRequest;
import backend.backend.Dto.Request.UpsertFinalMarksSheetRequest;
import backend.backend.Dto.Response.CertificateRecordResponse;
import backend.backend.Dto.Response.FinalMarksSheetResponse;
import backend.backend.Dto.Response.MarksBreakdownResponse;
import backend.backend.Dto.Response.MarksSheetListItemResponse;
import backend.backend.Dto.Response.PublicCertificateVerificationResponse;
import backend.backend.Dto.Response.StudentApprovedFinalMarksResponse;
import backend.backend.Dto.Response.StudentMarksResponse;
import backend.backend.Service.MarksService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/marks")
@RequiredArgsConstructor
public class MarksController {

    private final MarksService marksService;

    @GetMapping("/student/course/{courseId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<MarksBreakdownResponse> getMyMarks(
            @PathVariable UUID courseId,
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(
                marksService.getStudentMarks(principal.getUsername(), courseId));
    }

    @GetMapping("/instructor/course/{courseId}/students")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<List<StudentMarksResponse>> getCourseStudentMarks(
            @PathVariable UUID courseId,
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(
                marksService.getCourseStudentMarks(principal.getUsername(), courseId));
    }

    @GetMapping("/student/course/{courseId}/final-sheet/approved")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<StudentApprovedFinalMarksResponse> getApprovedFinalMarks(
            @PathVariable UUID courseId,
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(
                marksService.getStudentApprovedFinalMarks(principal.getUsername(), courseId));
    }

    @GetMapping("/public/certificates/{certificateId}")
    public ResponseEntity<PublicCertificateVerificationResponse> getPublicCertificateVerification(
            @PathVariable String certificateId) {
        return ResponseEntity.ok(
                marksService.getPublicCertificateVerification(certificateId));
    }

    @GetMapping("/instructor/course/{courseId}/final-sheet")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<FinalMarksSheetResponse> getInstructorFinalMarksSheet(
            @PathVariable UUID courseId,
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(
                marksService.getInstructorFinalMarksSheet(principal.getUsername(), courseId));
    }

    @PutMapping("/instructor/course/{courseId}/final-sheet")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<FinalMarksSheetResponse> saveInstructorFinalMarksSheet(
            @PathVariable UUID courseId,
            @RequestBody UpsertFinalMarksSheetRequest request,
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(
                marksService.saveInstructorFinalMarksSheet(principal.getUsername(), courseId, request));
    }

    @PostMapping("/instructor/course/{courseId}/final-sheet/submit")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<FinalMarksSheetResponse> submitInstructorFinalMarksSheet(
            @PathVariable UUID courseId,
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(
                marksService.submitInstructorFinalMarksSheet(principal.getUsername(), courseId));
    }

    @GetMapping("/uni-admin/final-sheets")
    @PreAuthorize("hasRole('UNIVERSITY_ADMIN')")
    public ResponseEntity<List<MarksSheetListItemResponse>> getUniAdminFinalMarksSheets(
            @RequestParam(required = false) String status,
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(
                marksService.getUniAdminFinalMarksSheets(principal.getUsername(), status));
    }

    @GetMapping("/uni-admin/final-sheets/history")
    @PreAuthorize("hasRole('UNIVERSITY_ADMIN')")
    public ResponseEntity<List<MarksSheetListItemResponse>> getUniAdminHistory(
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(
                marksService.getUniAdminMarksHistory(principal.getUsername()));
    }

    @GetMapping("/uni-admin/certificates")
    @PreAuthorize("hasRole('UNIVERSITY_ADMIN')")
    public ResponseEntity<List<CertificateRecordResponse>> getUniAdminCertificates(
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(
                marksService.getUniAdminCertificates(principal.getUsername()));
    }

    @GetMapping("/uni-admin/course/{courseId}/final-sheet")
    @PreAuthorize("hasRole('UNIVERSITY_ADMIN')")
    public ResponseEntity<FinalMarksSheetResponse> getUniAdminFinalMarksSheet(
            @PathVariable UUID courseId,
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(
                marksService.getUniAdminFinalMarksSheet(principal.getUsername(), courseId));
    }

    @PostMapping("/uni-admin/course/{courseId}/final-sheet/approve")
    @PreAuthorize("hasRole('UNIVERSITY_ADMIN')")
    public ResponseEntity<FinalMarksSheetResponse> approveUniAdminFinalMarksSheet(
            @PathVariable UUID courseId,
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(
                marksService.approveUniAdminFinalMarksSheet(principal.getUsername(), courseId));
    }

    @PostMapping("/uni-admin/course/{courseId}/final-sheet/return")
    @PreAuthorize("hasRole('UNIVERSITY_ADMIN')")
    public ResponseEntity<FinalMarksSheetResponse> returnUniAdminFinalMarksSheet(
            @PathVariable UUID courseId,
            @RequestBody ReturnMarksSheetRequest request,
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(
                marksService.returnUniAdminFinalMarksSheet(principal.getUsername(), courseId, request));
    }
}
