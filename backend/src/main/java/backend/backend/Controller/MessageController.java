package backend.backend.Controller;

import backend.backend.Dto.Request.SendMessageRequest;
import backend.backend.Dto.Response.MessageResponse;
import backend.backend.Service.MessageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;
    private final SimpMessagingTemplate messagingTemplate;

    // ─── WebSocket Send ───────────────────────────────────────
    @MessageMapping("/chat.send")
    public void sendMessageViaWebSocket(
            @Payload SendMessageRequest request) {

        MessageResponse response = messageService.sendMessage(request);

        // Send to receiver's private queue
        messagingTemplate.convertAndSendToUser(
                response.getReceiverId().toString(),
                "/queue/messages",
                response
        );

        // Send back to sender's private queue too
        messagingTemplate.convertAndSendToUser(
                response.getSenderId().toString(),
                "/queue/messages",
                response
        );
    }

    // ─── REST: Get Chat History ───────────────────────────────
    @GetMapping("/api/v1/messages/{courseId}/{otherUserId}")
    public ResponseEntity<List<MessageResponse>> getChatHistory(
            @PathVariable UUID courseId,
            @PathVariable UUID otherUserId) {
        return ResponseEntity.ok(messageService.getChatHistory(courseId, otherUserId));
    }

    // ─── REST: Send Message (fallback) ────────────────────────
    @PostMapping("/api/v1/messages")
    public ResponseEntity<MessageResponse> sendMessage(
            @Valid @RequestBody SendMessageRequest request) {
        MessageResponse response = messageService.sendMessage(request);

        // Also push via WebSocket if connected
        messagingTemplate.convertAndSendToUser(
                response.getReceiverId().toString(),
                "/queue/messages",
                response
        );

        return ResponseEntity.ok(response);
    }
}