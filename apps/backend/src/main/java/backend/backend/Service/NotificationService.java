package backend.backend.Service;

import backend.backend.Dto.Response.NotificationResponse;
import backend.backend.Entity.Course;
import backend.backend.Entity.LiveTest;

import java.util.List;
import java.util.UUID;

public interface NotificationService {

    void notifyEnrolledStudentsLiveTestStarted(LiveTest liveTest);

    void notifyEnrolledStudentsLiveTestClosed(LiveTest liveTest);

    void notifyEnrolledStudentsCourseUpdate(Course course, String title, String message);

    List<NotificationResponse> getMyNotifications(String email);

    long getUnreadCount(String email);

    void markAllRead(String email);

    void markOneRead(String email, UUID notificationId);
}
