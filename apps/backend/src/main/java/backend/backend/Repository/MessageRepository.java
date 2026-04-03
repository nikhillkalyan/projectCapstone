package backend.backend.Repository;

import backend.backend.Entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface MessageRepository extends JpaRepository<Message, UUID> {

    @Query("SELECT m FROM Message m WHERE m.course.id = :courseId " +
            "AND ((m.sender.id = :userId AND m.receiver.id = :otherUserId) " +
            "OR (m.sender.id = :otherUserId AND m.receiver.id = :userId)) " +
            "ORDER BY m.sentAt ASC")
    List<Message> findChatHistory(
            @Param("courseId") UUID courseId,
            @Param("userId") UUID userId,
            @Param("otherUserId") UUID otherUserId);

    Long countByCourseIdAndSenderIdAndReceiverIdAndStatus(UUID courseId, UUID senderId, UUID receiverId, backend.backend.Enums.MessageStatus status);

    @org.springframework.data.jpa.repository.Modifying
    @Query("UPDATE Message m SET m.status = :status WHERE m.course.id = :courseId AND m.sender.id = :senderId AND m.receiver.id = :receiverId")
    void updateStatusByCourseAndSenderAndReceiver(
            @Param("courseId") UUID courseId,
            @Param("senderId") UUID senderId,
            @Param("receiverId") UUID receiverId,
            @Param("status") backend.backend.Enums.MessageStatus status);
}