package backend.backend.Controller;

import backend.backend.Dto.Response.NotificationResponse;
import backend.backend.Service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping("/my")
    public ResponseEntity<List<NotificationResponse>> getMyNotifications(
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(
                notificationService.getMyNotifications(principal.getUsername()));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(
            @AuthenticationPrincipal UserDetails principal) {
        long count = notificationService.getUnreadCount(principal.getUsername());
        return ResponseEntity.ok(Map.of("count", count));
    }

    @PatchMapping("/mark-all-read")
    public ResponseEntity<Void> markAllRead(
            @AuthenticationPrincipal UserDetails principal) {
        notificationService.markAllRead(principal.getUsername());
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{notificationId}/read")
    public ResponseEntity<Void> markOneRead(
            @PathVariable UUID notificationId,
            @AuthenticationPrincipal UserDetails principal) {
        notificationService.markOneRead(principal.getUsername(), notificationId);
        return ResponseEntity.noContent().build();
    }
}
