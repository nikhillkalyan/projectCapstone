package backend.backend.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;
import backend.backend.Entity.Message;
import java.util.List;

public interface MessageRepository extends JpaRepository<Message, UUID> {
    List<Message> findByCourseIdAndSenderIdAndReceiverIdOrCourseIdAndReceiverIdAndSenderId(
            UUID courseId, UUID senderId, UUID receiverId,
            UUID courseId2, UUID receiverId2, UUID senderId2);
}
