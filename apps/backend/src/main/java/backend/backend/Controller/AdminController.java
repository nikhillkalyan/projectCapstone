package backend.backend.Controller;

import backend.backend.Dto.Request.FlagRequest;
import backend.backend.Dto.Request.RejectRequest;
import backend.backend.Dto.Response.AdminStatsResponse;
import backend.backend.Dto.Response.InstructorAdminResponse;
import backend.backend.Service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/stats")
    public ResponseEntity<AdminStatsResponse> getStats() {
        return ResponseEntity.ok(adminService.getStats());
    }

    @GetMapping("/instructors")
    public ResponseEntity<List<InstructorAdminResponse>> getInstructors(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(adminService.getInstructors(status, search));
    }

    @GetMapping("/instructors/{id}")
    public ResponseEntity<InstructorAdminResponse> getInstructor(@PathVariable UUID id) {
        return ResponseEntity.ok(adminService.getInstructor(id));
    }

    @PutMapping("/instructors/{id}/approve")
    public ResponseEntity<Void> approveInstructor(@PathVariable UUID id) {
        adminService.approveInstructor(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/instructors/{id}/reject")
    public ResponseEntity<Void> rejectInstructor(
            @PathVariable UUID id,
            @RequestBody RejectRequest request) {
        adminService.rejectInstructor(id, request.getReason());
        return ResponseEntity.ok().build();
    }

    @PutMapping("/instructors/{id}/flag")
    public ResponseEntity<Void> flagInstructor(
            @PathVariable UUID id,
            @RequestBody FlagRequest request) {
        adminService.flagInstructor(id, request.getMessage());
        return ResponseEntity.ok().build();
    }

    @PutMapping("/instructors/{id}/remove")
    public ResponseEntity<Void> removeInstructor(@PathVariable UUID id) {
        adminService.removeInstructor(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/instructors/{id}/reinstate")
    public ResponseEntity<Void> reinstateInstructor(@PathVariable UUID id) {
        adminService.reinstateInstructor(id);
        return ResponseEntity.ok().build();
    }
}