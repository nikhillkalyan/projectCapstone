package backend.backend.Service;

import backend.backend.Dto.Request.SendMessageRequest;
import backend.backend.Dto.Response.MessageResponse;

import java.util.List;
import java.util.UUID;

public interface MessageService {
    MessageResponse sendMessage(SendMessageRequest request);
    List<MessageResponse> getChatHistory(UUID courseId, UUID otherUserId);
}