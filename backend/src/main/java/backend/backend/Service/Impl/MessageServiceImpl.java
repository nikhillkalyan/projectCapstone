package backend.backend.Service.Impl;

import backend.backend.Dto.Request.SendMessageRequest;
import backend.backend.Dto.Response.MessageResponse;
import backend.backend.Entity.Course;
import backend.backend.Entity.Message;
import backend.backend.Entity.User;
import backend.backend.Enums.MessageStatus;
import backend.backend.Exceptions.ResourceNotFoundException;
import backend.backend.Repository.CourseRepository;
import backend.backend.Repository.MessageRepository;
import backend.backend.Repository.UserRepository;
import backend.backend.Service.MessageService;
import backend.backend.Utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MessageServiceImpl implements MessageService {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final SecurityUtils securityUtils;

    // ─── Send Message ─────────────────────────────────────────
    @Override
    @Transactional
    public MessageResponse sendMessage(SendMessageRequest request) {
        User sender = securityUtils.getCurrentUser();

        User receiver = userRepository.findById(request.getReceiverId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Receiver not found with id: " + request.getReceiverId()));

        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Course not found with id: " + request.getCourseId()));

        Message message = Message.builder()
                .sender(sender)
                .receiver(receiver)
                .course(course)
                .messageText(request.getMessageText())
                .status(MessageStatus.SENT)
                .build();

        messageRepository.save(message);
        return mapToMessageResponse(message);
    }

    // ─── Get Chat History ─────────────────────────────────────
    @Override
    @Transactional(readOnly = true)
    public List<MessageResponse> getChatHistory(UUID courseId, UUID otherUserId) {
        User currentUser = securityUtils.getCurrentUser();

        return messageRepository
                .findChatHistory(courseId, currentUser.getId(), otherUserId)
                .stream()
                .map(this::mapToMessageResponse)
                .collect(Collectors.toList());
    }

    // ─── Mapper ───────────────────────────────────────────────
    private MessageResponse mapToMessageResponse(Message message) {
        return MessageResponse.builder()
                .id(message.getId())
                .senderId(message.getSender().getId())
                .senderName(message.getSender().getName())
                .senderAvatar(message.getSender().getAvatarUrl())
                .receiverId(message.getReceiver().getId())
                .receiverName(message.getReceiver().getName())
                .courseId(message.getCourse().getId())
                .messageText(message.getMessageText())
                .status(message.getStatus())
                .sentAt(message.getSentAt())
                .build();
    }
}