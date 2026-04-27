package backend.backend.Repository;

import backend.backend.Entity.ProjectGroupMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProjectGroupMessageRepository extends JpaRepository<ProjectGroupMessage, UUID> {
    void deleteByProjectGroupIdIn(Collection<UUID> projectGroupIds);

    List<ProjectGroupMessage> findByProjectGroupIdOrderBySentAtAsc(UUID projectGroupId);

    Optional<ProjectGroupMessage> findTopByProjectGroupIdOrderBySentAtDesc(UUID projectGroupId);

    @Query("select count(message) from ProjectGroupMessage message where message.projectGroup.id = :projectGroupId and message.senderUser.id <> :senderUserId")
    long countUnreadWithoutReadState(@Param("projectGroupId") UUID projectGroupId, @Param("senderUserId") UUID senderUserId);

    @Query("select count(message) from ProjectGroupMessage message where message.projectGroup.id = :projectGroupId and message.senderUser.id <> :senderUserId and message.sentAt > :sentAt")
    long countUnreadAfter(@Param("projectGroupId") UUID projectGroupId, @Param("senderUserId") UUID senderUserId, @Param("sentAt") LocalDateTime sentAt);
}
