package backend.backend.Service;

import backend.backend.Dto.Response.LiveTestNotificationPayload;
import backend.backend.Entity.LiveTest;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class LiveTestNotificationService {

    private final SimpMessagingTemplate messagingTemplate;

    public void notifyLiveTestStarted(LiveTest liveTest) {
        messagingTemplate.convertAndSend(
                "/topic/course/" + liveTest.getCourse().getId() + "/live-test",
                buildPayload("LIVE_TEST_STARTED", liveTest)
        );
    }

    public void notifyLiveTestClosed(LiveTest liveTest) {
        messagingTemplate.convertAndSend(
                "/topic/course/" + liveTest.getCourse().getId() + "/live-test",
                buildPayload("LIVE_TEST_CLOSED", liveTest)
        );
    }

    private LiveTestNotificationPayload buildPayload(String event, LiveTest liveTest) {
        return LiveTestNotificationPayload.builder()
                .event(event)
                .liveTestId(liveTest.getId())
                .title(liveTest.getTitle())
                .durationMinutes(liveTest.getDurationMinutes())
                .courseId(liveTest.getCourse().getId())
                .courseTitle(liveTest.getCourse().getTitle())
                .build();
    }
}
