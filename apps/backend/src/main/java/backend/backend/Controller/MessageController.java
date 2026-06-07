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

import backend.backend.Dto.Response.ContactResponse;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;
    private final SimpMessagingTemplate messagingTemplate;

    // ─── WebSocket Send ───────────────────────────────────────
    @MessageMapping("/chat.send")
    public void sendMessageViaWebSocket(
            @Payload SendMessageRequest request,
            java.security.Principal principal) {

        MessageResponse response = messageService.sendMessage(request, principal.getName());

        // Send to receiver's private queue
        messagingTemplate.convertAndSendToUser(
                response.getReceiverEmail(),
                "/queue/messages",
                response
        );

        // Send back to sender's private queue too
        messagingTemplate.convertAndSendToUser(
                response.getSenderEmail(),
                "/queue/messages",
                response
        );
    }

    // ─── REST: Get Chat History ───────────────────────────────
    @GetMapping("/{courseId}/{otherUserId}")
    public ResponseEntity<List<MessageResponse>> getChatHistory(
            @PathVariable UUID courseId,
            @PathVariable UUID otherUserId) {
        return ResponseEntity.ok(messageService.getChatHistory(courseId, otherUserId));
    }

    // ─── REST: Get Chat Contacts ──────────────────────────────
    @GetMapping("/contacts")
    public ResponseEntity<List<ContactResponse>> getChatContacts() {
        return ResponseEntity.ok(messageService.getChatContacts());
    }

    // ─── Edit Message ─────────────────────────────────────────
    @PutMapping("/{messageId}")
    public ResponseEntity<MessageResponse> editMessage(
            @PathVariable UUID messageId,
            @RequestBody Map<String, String> requestBody,
            java.security.Principal principal) {
        
        String newText = requestBody.get("messageText");
        MessageResponse response = messageService.editMessage(messageId, newText, principal.getName());

        // Broadcast the modified message to both queues
        messagingTemplate.convertAndSendToUser(response.getReceiverEmail(), "/queue/messages", response);
        messagingTemplate.convertAndSendToUser(response.getSenderEmail(), "/queue/messages", response);

        return ResponseEntity.ok(response);
    }

    // ─── Delete Message ────────────────────────────────
    @DeleteMapping("/{messageId}")
    public ResponseEntity<MessageResponse> deleteMessage(
            @PathVariable UUID messageId,
            java.security.Principal principal) {
        
        MessageResponse response = messageService.deleteMessage(messageId, principal.getName());

        // Broadcast the modified (deleted) message to both queues
        messagingTemplate.convertAndSendToUser(response.getReceiverEmail(), "/queue/messages", response);
        messagingTemplate.convertAndSendToUser(response.getSenderEmail(), "/queue/messages", response);

        return ResponseEntity.ok(response);
    }

    // ─── REST: Send Message (fallback) ────────────────────────
    @PostMapping
    public ResponseEntity<MessageResponse> sendMessage(
            @Valid @RequestBody SendMessageRequest request) {
        MessageResponse response = messageService.sendMessage(request);

        // Also push via WebSocket if connected
        messagingTemplate.convertAndSendToUser(
                response.getReceiverEmail(),
                "/queue/messages",
                response
        );
        messagingTemplate.convertAndSendToUser(
                response.getSenderEmail(),
                "/queue/messages",
                response
        );

        return ResponseEntity.ok(response);
    }
}
