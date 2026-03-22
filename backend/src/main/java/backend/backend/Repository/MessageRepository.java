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
}