package backend.backend.Service.Impl;

import backend.backend.Dto.Response.NotificationResponse;
import backend.backend.Entity.Course;
import backend.backend.Entity.Enrollment;
import backend.backend.Entity.LiveTest;
import backend.backend.Entity.Notification;
import backend.backend.Entity.User;
import backend.backend.Exceptions.ResourceNotFoundException;
import backend.backend.Exceptions.UnauthorizedException;
import backend.backend.Repository.EnrollmentRepository;
import backend.backend.Repository.NotificationRepository;
import backend.backend.Repository.UserRepository;
import backend.backend.Service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    @Transactional
    public void notifyEnrolledStudentsLiveTestStarted(LiveTest liveTest) {
        String title = "Live Test Started";
        String message = "\"" + liveTest.getTitle() + "\" is now live in "
                + liveTest.getCourse().getTitle() + ". You have "
                + liveTest.getDurationMinutes() + " minutes!";

        createAndPush(liveTest.getCourse(), liveTest.getId(),
                "LIVE_TEST_STARTED", title, message);
    }

    @Override
    @Transactional
    public void notifyEnrolledStudentsLiveTestClosed(LiveTest liveTest) {
        String title = "Live Test Closed";
        String message = "\"" + liveTest.getTitle() + "\" in "
                + liveTest.getCourse().getTitle() + " has ended.";

        createAndPush(liveTest.getCourse(), liveTest.getId(),
                "LIVE_TEST_CLOSED", title, message);
    }

    @Override
    @Transactional
    public void notifyEnrolledStudentsCourseUpdate(Course course, String title, String message) {
        createAndPush(course, null, "COURSE_UPDATE", title, message);
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> getMyNotifications(String email) {
        User user = resolveUser(email);
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public long getUnreadCount(String email) {
        User user = resolveUser(email);
        return notificationRepository.countByUserIdAndIsReadFalse(user.getId());
    }

    @Override
    @Transactional
    public void markAllRead(String email) {
        User user = resolveUser(email);
        notificationRepository.markAllReadByUserId(user.getId());
    }

    @Override
    @Transactional
    public void markOneRead(String email, UUID notificationId) {
        User user = resolveUser(email);
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        if (!notification.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedException("Not your notification");
        }
        notification.setIsRead(true);
        notificationRepository.save(notification);
    }

    private void createAndPush(Course course, UUID referenceId,
                               String type, String title, String message) {
        List<Enrollment> enrollments = enrollmentRepository.findByCourseId(course.getId());

        for (Enrollment enrollment : enrollments) {
            User studentUser = enrollment.getStudent().getUser();

            Notification notification = Notification.builder()
                    .user(studentUser)
                    .title(title)
                    .message(message)
                    .type(type)
                    .courseId(course.getId())
                    .referenceId(referenceId)
                    .isRead(false)
                    .build();

            Notification saved = notificationRepository.save(notification);
            messagingTemplate.convertAndSend(
                    "/topic/notifications/" + studentUser.getId(),
                    toResponse(saved)
            );
        }
    }

    private User resolveUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private NotificationResponse toResponse(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .type(notification.getType())
                .courseId(notification.getCourseId())
                .referenceId(notification.getReferenceId())
                .isRead(notification.getIsRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
