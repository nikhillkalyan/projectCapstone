package backend.backend.Service.Impl;

import backend.backend.Dto.Request.SendMessageRequest;
import backend.backend.Dto.Response.MessageResponse;
import backend.backend.Entity.Course;
import backend.backend.Entity.Message;
import backend.backend.Entity.User;
import backend.backend.Enums.MessageStatus;
import backend.backend.Exceptions.ResourceNotFoundException;
import backend.backend.Repository.CourseRepository;
import backend.backend.Repository.EnrollmentRepository;
import backend.backend.Repository.MessageRepository;
import backend.backend.Repository.UserRepository;
import backend.backend.Service.MessageService;
import backend.backend.Utils.SecurityUtils;
import backend.backend.Dto.Response.ContactResponse;
import backend.backend.Entity.Enrollment;
import backend.backend.Enums.Role;
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
    private final EnrollmentRepository enrollmentRepository;
    private final SecurityUtils securityUtils;

    // ─── Send Message (REST context) ──────────────────────────
    @Override
    @Transactional
    public MessageResponse sendMessage(SendMessageRequest request) {
        User sender = securityUtils.getCurrentUser();
        return processSendMessage(request, sender);
    }

    // ─── Send Message (WebSocket context) ─────────────────────
    @Override
    @Transactional
    public MessageResponse sendMessage(SendMessageRequest request, String senderEmail) {
        User sender = userRepository.findByEmail(senderEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Sender not found"));
        return processSendMessage(request, sender);
    }

    private MessageResponse processSendMessage(SendMessageRequest request, User sender) {
        User receiver = userRepository.findById(request.getReceiverId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Receiver not found with id: " + request.getReceiverId()));

        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Course not found with id: " + request.getCourseId()));

        Message replyToMessage = null;
        if (request.getReplyToId() != null) {
            replyToMessage = messageRepository.findById(request.getReplyToId())
                    .orElse(null);
        }

        Message message = Message.builder()
                .sender(sender)
                .receiver(receiver)
                .course(course)
                .messageText(request.getMessageText())
                .status(MessageStatus.SENT)
                .replyTo(replyToMessage)
                .build();

        messageRepository.save(message);
        return mapToMessageResponse(message);
    }

    // ─── Edit Message ─────────────────────────────────────────
    @Override
    @Transactional
    public MessageResponse editMessage(UUID messageId, String newText, String senderEmail) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new ResourceNotFoundException("Message not found"));

        if (!message.getSender().getEmail().equals(senderEmail)) {
            throw new IllegalArgumentException("You can only edit your own messages");
        }

        if (Boolean.TRUE.equals(message.getIsDeleted())) {
            throw new IllegalArgumentException("Cannot edit a deleted message");
        }

        message.setMessageText(newText);
        message.setIsEdited(true);
        messageRepository.save(message);

        return mapToMessageResponse(message);
    }

    // ─── Delete Message ───────────────────────────────────────
    @Override
    @Transactional
    public MessageResponse deleteMessage(UUID messageId, String senderEmail) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new ResourceNotFoundException("Message not found"));

        if (!message.getSender().getEmail().equals(senderEmail)) {
            throw new IllegalArgumentException("You can only delete your own messages");
        }

        message.setIsDeleted(true);
        message.setMessageText("This message was deleted.");
        messageRepository.save(message);

        return mapToMessageResponse(message);
    }

    // ─── Get Chat History ─────────────────────────────────────
    @Override
    @Transactional
    public List<MessageResponse> getChatHistory(UUID courseId, UUID otherUserId) {
        User currentUser = securityUtils.getCurrentUser();

        // Mark incoming messages as read
        messageRepository.updateStatusByCourseAndSenderAndReceiver(
                courseId, otherUserId, currentUser.getId(), MessageStatus.READ);

        return messageRepository
                .findChatHistory(courseId, currentUser.getId(), otherUserId)
                .stream()
                .map(this::mapToMessageResponse)
                .collect(Collectors.toList());
    }

    // ─── Get Chat Contacts ────────────────────────────────────
    @Override
    @Transactional(readOnly = true)
    public List<ContactResponse> getChatContacts() {
        User currentUser = securityUtils.getCurrentUser();
        List<ContactResponse> contacts = new java.util.ArrayList<>();

        if (currentUser.getRole() == Role.STUDENT) {
            List<Enrollment> enrollments = enrollmentRepository.findByStudentId(currentUser.getId());
            for (Enrollment enrollment : enrollments) {
                Course course = enrollment.getCourse();
                User instructorUser = course.getInstructor().getUser();

                long unreadCount = messageRepository.countByCourseIdAndSenderIdAndReceiverIdAndStatus(
                        course.getId(), instructorUser.getId(), currentUser.getId(), MessageStatus.SENT);

                contacts.add(ContactResponse.builder()
                        .userId(instructorUser.getId())
                        .userName(instructorUser.getName())
                        .avatarUrl(instructorUser.getAvatarUrl())
                        .courseId(course.getId())
                        .courseTitle(course.getTitle())
                        .unreadCount(unreadCount)
                        .build());
            }
        } else if (currentUser.getRole() == Role.INSTRUCTOR) {
            List<Course> courses = courseRepository.findByInstructorId(currentUser.getId());
            for (Course course : courses) {
                List<Enrollment> enrollments = enrollmentRepository.findByCourseId(course.getId());
                for (Enrollment enrollment : enrollments) {
                    User studentUser = enrollment.getStudent().getUser();

                    long unreadCount = messageRepository.countByCourseIdAndSenderIdAndReceiverIdAndStatus(
                            course.getId(), studentUser.getId(), currentUser.getId(), MessageStatus.SENT);

                    // Check if contact already exists in list (since a student can take multiple courses, but we group by course)
                    contacts.add(ContactResponse.builder()
                            .userId(studentUser.getId())
                            .userName(studentUser.getName())
                            .avatarUrl(studentUser.getAvatarUrl())
                            .courseId(course.getId())
                            .courseTitle(course.getTitle())
                            .unreadCount(unreadCount)
                            .build());
                }
            }
        }

        return contacts;
    }

    // ─── Mapper ───────────────────────────────────────────────
    private MessageResponse mapToMessageResponse(Message message) {
        MessageResponse.MessageResponseBuilder builder = MessageResponse.builder()
                .id(message.getId())
                .senderId(message.getSender().getId())
                .senderName(message.getSender().getName())
                .senderEmail(message.getSender().getEmail())
                .senderAvatar(message.getSender().getAvatarUrl())
                .receiverId(message.getReceiver().getId())
                .receiverName(message.getReceiver().getName())
                .receiverEmail(message.getReceiver().getEmail())
                .courseId(message.getCourse().getId())
                .messageText(message.getMessageText())
                .status(message.getStatus())
                .sentAt(message.getSentAt())
                .isEdited(Boolean.TRUE.equals(message.getIsEdited()))
                .isDeleted(Boolean.TRUE.equals(message.getIsDeleted()));

        if (message.getReplyTo() != null) {
            builder.replyToId(message.getReplyTo().getId())
                   .replyToMessageText(Boolean.TRUE.equals(message.getReplyTo().getIsDeleted()) ? "This message was deleted." : message.getReplyTo().getMessageText())
                   .replyToSenderName(message.getReplyTo().getSender().getName());
        }

        return builder.build();
    }
}