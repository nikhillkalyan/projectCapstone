package backend.backend.Service;

import backend.backend.Dto.Request.SendMessageRequest;
import backend.backend.Dto.Response.MessageResponse;

import backend.backend.Dto.Response.ContactResponse;

import java.util.List;
import java.util.UUID;

public interface MessageService {
    MessageResponse sendMessage(SendMessageRequest request);
    MessageResponse sendMessage(SendMessageRequest request, String senderEmail);
    List<MessageResponse> getChatHistory(UUID courseId, UUID otherUserId);
    List<ContactResponse> getChatContacts();
    
    MessageResponse editMessage(UUID messageId, String newText, String senderEmail);
    MessageResponse deleteMessage(UUID messageId, String senderEmail);
}