package backend.backend.Configs;

import backend.backend.Entity.LiveTest;
import backend.backend.Repository.LiveTestRepository;
import backend.backend.Service.LiveTestNotificationService;
import backend.backend.Service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class LiveTestScheduler {

    private final LiveTestRepository liveTestRepository;
    private final LiveTestNotificationService liveTestNotificationService;
    private final NotificationService notificationService;

    @Scheduled(fixedDelay = 30_000)
    @Transactional
    public void autoLaunchScheduledTests() {
        LocalDateTime now = LocalDateTime.now();
        List<LiveTest> dueTests = liveTestRepository
                .findByScheduledAtLessThanEqualAndIsLiveFalseAndIsClosedFalse(now);

        for (LiveTest test : dueTests) {
            boolean anotherLive = liveTestRepository
                    .findByCourseIdAndIsLiveTrueAndIsClosedFalse(test.getCourse().getId())
                    .isPresent();
            if (anotherLive) {
                log.info("Skipping auto-launch for '{}' because another live test is active", test.getTitle());
                continue;
            }

            test.setIsLive(true);
            test.setStartTime(now);
            liveTestRepository.save(test);

            liveTestNotificationService.notifyLiveTestStarted(test);
            notificationService.notifyEnrolledStudentsLiveTestStarted(test);

            log.info("Auto-launched live test '{}' for course {}", test.getTitle(), test.getCourse().getId());
        }
    }

    @Scheduled(fixedDelay = 30_000)
    @Transactional
    public void autoCloseExpiredTests() {
        LocalDateTime now = LocalDateTime.now();
        List<LiveTest> liveTests = liveTestRepository.findByIsLiveTrueAndIsClosedFalse();

        for (LiveTest test : liveTests) {
            if (test.getStartTime() == null || test.getDurationMinutes() == null) {
                continue;
            }

            LocalDateTime closeAt = test.getStartTime().plusMinutes(test.getDurationMinutes());
            if (!now.isAfter(closeAt)) {
                continue;
            }

            test.setIsLive(false);
            test.setIsClosed(true);
            test.setEndTime(now);
            liveTestRepository.save(test);

            liveTestNotificationService.notifyLiveTestClosed(test);
            notificationService.notifyEnrolledStudentsLiveTestClosed(test);

            log.info("Auto-closed expired live test '{}' for course {}", test.getTitle(), test.getCourse().getId());
        }
    }
}
