package backend.backend.Service.Impl;

import backend.backend.Dto.Response.AdminStatsResponse;
import backend.backend.Dto.Response.InstructorAdminResponse;
import backend.backend.Entity.Instructor;
import backend.backend.Enums.ApprovalStatus;
import backend.backend.Exceptions.BadRequestException;
import backend.backend.Repository.InstructorRepository;
import backend.backend.Service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final InstructorRepository instructorRepository;

    @Override
    public AdminStatsResponse getStats() {
        return AdminStatsResponse.builder()
                .pending(instructorRepository.countByApprovalStatus(ApprovalStatus.PENDING))
                .approved(instructorRepository.countByApprovalStatus(ApprovalStatus.APPROVED))
                .rejected(instructorRepository.countByApprovalStatus(ApprovalStatus.REJECTED))
                .flagged(instructorRepository.countByApprovalStatus(ApprovalStatus.FLAGGED))
                .removed(instructorRepository.countByApprovalStatus(ApprovalStatus.REMOVED))
                .build();
    }

    @Override
    public List<InstructorAdminResponse> getInstructors(String status, String search) {
        ApprovalStatus approvalStatus = null;
        if (status != null && !status.isEmpty()) {
            try {
                approvalStatus = ApprovalStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Invalid status: " + status);
            }
        }

        String searchTerm = (search != null && !search.isEmpty()) ? search : null;
        String statusStr = approvalStatus != null ? approvalStatus.name() : null;

        return instructorRepository.findWithFilters(statusStr, searchTerm)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public InstructorAdminResponse getInstructor(UUID id) {
        Instructor instructor = instructorRepository.findById(id)
                .orElseThrow(() -> new BadRequestException("Instructor not found"));
        return mapToResponse(instructor);
    }

    @Override
    @Transactional
    public void approveInstructor(UUID id) {
        Instructor instructor = instructorRepository.findById(id)
                .orElseThrow(() -> new BadRequestException("Instructor not found"));
        instructor.setApprovalStatus(ApprovalStatus.APPROVED);
        instructor.setIsVerified(true);
        instructor.setApprovedAt(LocalDateTime.now());
        instructorRepository.save(instructor);
    }

    @Override
    @Transactional
    public void rejectInstructor(UUID id, String reason) {
        Instructor instructor = instructorRepository.findById(id)
                .orElseThrow(() -> new BadRequestException("Instructor not found"));
        instructor.setApprovalStatus(ApprovalStatus.REJECTED);
        instructor.setRejectionReason(reason);
        instructorRepository.save(instructor);
    }

    @Override
    @Transactional
    public void flagInstructor(UUID id, String message) {
        Instructor instructor = instructorRepository.findById(id)
                .orElseThrow(() -> new BadRequestException("Instructor not found"));
        instructor.setApprovalStatus(ApprovalStatus.FLAGGED);
        instructor.setFlagMessage(message);
        instructor.setFlaggedAt(LocalDateTime.now());
        instructorRepository.save(instructor);
    }

    @Override
    @Transactional
    public void removeInstructor(UUID id) {
        Instructor instructor = instructorRepository.findById(id)
                .orElseThrow(() -> new BadRequestException("Instructor not found"));
        instructor.setApprovalStatus(ApprovalStatus.REMOVED);
        instructorRepository.save(instructor);
    }

    @Override
    @Transactional
    public void reinstateInstructor(UUID id) {
        Instructor instructor = instructorRepository.findById(id)
                .orElseThrow(() -> new BadRequestException("Instructor not found"));
        instructor.setApprovalStatus(ApprovalStatus.APPROVED);
        instructor.setIsVerified(true);
        instructor.setApprovedAt(LocalDateTime.now());
        instructorRepository.save(instructor);
    }

    private InstructorAdminResponse mapToResponse(Instructor instructor) {
        return InstructorAdminResponse.builder()
                .id(instructor.getId())
                .name(instructor.getUser().getName())
                .email(instructor.getUser().getEmail())
                .avatarUrl(instructor.getUser().getAvatarUrl())
                .qualification(instructor.getQualification())
                .experience(instructor.getExperience())
                .specialization(instructor.getSpecialization())
                .bio(instructor.getBio())
                .approvalStatus(instructor.getApprovalStatus() != null
                        ? instructor.getApprovalStatus().name()
                        : "PENDING")
                .rejectionReason(instructor.getRejectionReason())
                .flagMessage(instructor.getFlagMessage())
                .registeredAt(instructor.getRegisteredAt())
                .approvedAt(instructor.getApprovedAt())
                .flaggedAt(instructor.getFlaggedAt())
                .ugCertificateUrl(instructor.getUgCertificateUrl())
                .pgCertificateUrl(instructor.getPgCertificateUrl())
                .phdCertificateUrl(instructor.getPhdCertificateUrl())
                .build();
    }
}