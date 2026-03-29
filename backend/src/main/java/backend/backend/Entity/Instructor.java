package backend.backend.Entity;

import jakarta.persistence.*;
import lombok.*;
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
}