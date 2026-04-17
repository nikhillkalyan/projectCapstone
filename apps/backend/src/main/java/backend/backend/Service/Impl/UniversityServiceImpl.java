package backend.backend.Service.Impl;

import backend.backend.Dto.Request.CreateUniversityRequest;
import backend.backend.Dto.Response.UniversityResponse;
import backend.backend.Entity.University;
import backend.backend.Entity.User;
import backend.backend.Enums.Role;
import backend.backend.Exceptions.BadRequestException;
import backend.backend.Repository.UniversityRepository;
import backend.backend.Repository.UserRepository;
import backend.backend.Service.UniversityService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UniversityServiceImpl implements UniversityService {

    private final UniversityRepository universityRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    private static final String CHARACTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    /**
     * Generates a unique, human-readable join code like "UNI-A3K7X".
     * Uses SecureRandom to avoid predictable codes.
     */
    private String generateJoinCode() {
        SecureRandom random = new SecureRandom();
        String candidate;
        do {
            StringBuilder sb = new StringBuilder("UNI-");
            for (int i = 0; i < 5; i++) {
                sb.append(CHARACTERS.charAt(random.nextInt(CHARACTERS.length())));
            }
            candidate = sb.toString();
        } while (universityRepository.findByJoinCode(candidate).isPresent());
        return candidate;
    }

    @Override
    @Transactional
    public UniversityResponse createUniversity(CreateUniversityRequest request) {

        // Guard: University name must be unique
        if (universityRepository.findByName(request.getUniversityName()).isPresent()) {
            throw new BadRequestException("A university with this name is already registered on the platform.");
        }

        // Guard: Admin email must not conflict with any existing user
        if (userRepository.existsByEmail(request.getAdminEmail())) {
            throw new BadRequestException("An account with this email already exists.");
        }

        // 1. Create the University
        University university = University.builder()
                .name(request.getUniversityName())
                .joinCode(generateJoinCode())
                .isActive(true)
                .build();
        university = universityRepository.save(university);

        // 2. Create the University Admin user linked to this university
        User adminUser = User.builder()
                .name(request.getAdminName())
                .email(request.getAdminEmail())
                .password(passwordEncoder.encode(request.getAdminPassword()))
                .role(Role.UNIVERSITY_ADMIN)
                .university(university)
                .build();
        adminUser = userRepository.save(adminUser);

        return mapToResponse(university, adminUser);
    }

    @Override
    public List<UniversityResponse> getAllUniversities() {
        return universityRepository.findAll()
                .stream()
                .map(u -> {
                    // Find the admin user for this university
                    User adminUser = userRepository
                            .findFirstByUniversityIdAndRole(u.getId(), Role.UNIVERSITY_ADMIN)
                            .orElse(null);
                    return mapToResponse(u, adminUser);
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public UniversityResponse toggleUniversityStatus(UUID universityId) {
        University university = universityRepository.findById(universityId)
                .orElseThrow(() -> new BadRequestException("University not found"));
        university.setIsActive(!university.getIsActive());
        university = universityRepository.save(university);

        User adminUser = userRepository
                .findFirstByUniversityIdAndRole(universityId, Role.UNIVERSITY_ADMIN)
                .orElse(null);
        return mapToResponse(university, adminUser);
    }

    @Override
    @Transactional
    public void resetAdminPassword(UUID universityId, String newPassword) {
        if (newPassword == null || newPassword.length() < 6) {
            throw new BadRequestException("Password must be at least 6 characters.");
        }
        User adminUser = userRepository
                .findFirstByUniversityIdAndRole(universityId, Role.UNIVERSITY_ADMIN)
                .orElseThrow(() -> new BadRequestException("University admin not found"));
        adminUser.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(adminUser);
    }

    private UniversityResponse mapToResponse(University university, User adminUser) {
        return UniversityResponse.builder()
                .id(university.getId())
                .name(university.getName())
                .joinCode(university.getJoinCode())
                .isActive(university.getIsActive())
                .adminName(adminUser != null ? adminUser.getName() : null)
                .adminEmail(adminUser != null ? adminUser.getEmail() : null)
                .adminUserId(adminUser != null ? adminUser.getId() : null)
                .createdAt(university.getCreatedAt())
                .build();
    }
}
