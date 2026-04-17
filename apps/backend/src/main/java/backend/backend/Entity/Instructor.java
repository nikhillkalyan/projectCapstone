package backend.backend.Entity;

import backend.backend.Enums.ApprovalStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "instructors")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Instructor {

    @Id
    @Column(columnDefinition = "UUID")
    private UUID id;

    @OneToOne
    @MapsId
    @JoinColumn(name = "id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id")
    private Branch branch;

    @Column(name = "employee_id", unique = true)
    private String employeeId;

    private String qualification;
    private String experience;
    private String specialization;

    @Column(columnDefinition = "TEXT")
    private String bio;

    private Float rating;

    @Column(name = "total_students")
    @Builder.Default
    private Integer totalStudents = 0;

    @Column(name = "is_verified")
    @Builder.Default
    private Boolean isVerified = false;

    @Column(name = "ug_certificate_url", columnDefinition = "TEXT")
    private String ugCertificateUrl;

    @Column(name = "pg_certificate_url", columnDefinition = "TEXT")
    private String pgCertificateUrl;

    @Column(name = "phd_certificate_url", columnDefinition = "TEXT")
    private String phdCertificateUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "approval_status", length = 20)
    @Builder.Default
    private ApprovalStatus approvalStatus = ApprovalStatus.PENDING;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @Column(name = "flag_message", columnDefinition = "TEXT")
    private String flagMessage;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @Column(name = "flagged_at")
    private LocalDateTime flaggedAt;

    @CreationTimestamp
    @Column(name = "registered_at", updatable = false)
    private LocalDateTime registeredAt;
}