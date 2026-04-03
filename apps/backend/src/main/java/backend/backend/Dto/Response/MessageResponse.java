package backend.backend.Dto.Response;

import backend.backend.Enums.MessageStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageResponse {
    private UUID id;
    private UUID senderId;
    private String senderName;
    private String senderEmail;
    private String senderAvatar;
    private UUID receiverId;
    private String receiverName;
    private String receiverEmail;
    private UUID courseId;
    private String messageText;
    private MessageStatus status;
    private LocalDateTime sentAt;
    
    private UUID replyToId;
    private String replyToMessageText;
    private String replyToSenderName;
    private boolean isEdited;
    private boolean isDeleted;
}