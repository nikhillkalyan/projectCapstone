package backend.backend.Service.Impl;

import backend.backend.Dto.Request.*;
import backend.backend.Dto.Response.*;
import backend.backend.Entity.*;
import backend.backend.Enums.GroupStatus;
import backend.backend.Exceptions.BadRequestException;
import backend.backend.Exceptions.ResourceNotFoundException;
import backend.backend.Exceptions.UnauthorizedException;
import backend.backend.Repository.*;
import backend.backend.Service.ProjectSpaceService;
import backend.backend.Utils.SecurityUtils;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectSpaceServiceImpl implements ProjectSpaceService {

    private final ProjectSpaceRepository projectSpaceRepository;
    private final ProjectGroupRepository projectGroupRepository;
    private final ProjectProposalRepository projectProposalRepository;
    private final ProjectRepoRepository projectRepoRepository;
    private final IndividualReportRepository individualReportRepository;
    private final InstructorRepository instructorRepository;
    private final StudentRepository studentRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final CourseRepository courseRepository;
    private final CourseAllocationRepository courseAllocationRepository;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final SecurityUtils securityUtils;

    // ─────────────────────────────────────────────────────────────
    // CREATE PROJECT SPACE
    // ─────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public ProjectSpaceResponse createProjectSpace(UUID courseId, CreateProjectSpaceRequest request) {
        Instructor instructor = currentInstructor();
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));

        if (!course.getInstructor().getId().equals(instructor.getId())) {
            throw new UnauthorizedException("You do not own this course");
        }
        if (projectSpaceRepository.existsByCourseId(courseId)) {
            throw new BadRequestException("Project space already exists for this course");
        }
        if (request.getGroupSize() == null || request.getGroupSize() < 1) {
            throw new BadRequestException("Group size must be at least 1");
        }

        ensureUniversityCourseEnrollments(course);

        ProjectSpace space = ProjectSpace.builder()
                .course(course)
                .instructor(instructor)
                .groupSize(request.getGroupSize())
                .proposalDeadline(request.getProposalDeadline())
                .projectDeadline(request.getProjectDeadline())
                .projectDescription(request.getProjectDescription())
                .build();

        return toSpaceResponse(projectSpaceRepository.save(space));
    }

    // ─────────────────────────────────────────────────────────────
    // GET PROJECT SPACE
    // ─────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public ProjectSpaceResponse getProjectSpace(UUID courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        ensureUniversityCourseEnrollments(course);

        ProjectSpace space = projectSpaceRepository.findByCourseId(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Project space not found for this course"));
        return toSpaceResponse(space);
    }

    // ─────────────────────────────────────────────────────────────
    // STUDENT: GET MY GROUP
    // ─────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public ProjectGroupResponse getMyGroup(UUID courseId) {
        Student student = currentStudent();
        return toGroupResponse(getStudentGroupForCourse(courseId, student));
    }

    // ─────────────────────────────────────────────────────────────
    // FORM GROUPS — RANDOM
    // ─────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public ProjectSpaceResponse formGroupsRandomly(UUID courseId, RandomGroupRequest request) {
        Instructor instructor = currentInstructor();
        ProjectSpace space = getOwnedSpace(courseId, instructor);
        ensureUniversityCourseEnrollments(space.getCourse());

        if (Boolean.TRUE.equals(space.getIsGroupsFormed())) {
            throw new BadRequestException("Groups have already been formed for this course");
        }

        // Get all enrolled students
        List<Enrollment> enrollments = enrollmentRepository.findByCourseId(courseId);
        if (enrollments.isEmpty()) {
            throw new BadRequestException("No students enrolled in this course");
        }

        List<Student> students = enrollments.stream()
                .map(Enrollment::getStudent)
                .collect(Collectors.toList());

        // Shuffle for randomness
        Collections.shuffle(students);

        int size = (request.getGroupSize() != null) ? request.getGroupSize() : space.getGroupSize();
        int groupNumber = 1;
        List<ProjectGroup> createdGroups = new ArrayList<>();

        for (int i = 0; i < students.size(); i += size) {
            List<Student> chunk = students.subList(i, Math.min(i + size, students.size()));
            ProjectGroup group = ProjectGroup.builder()
                    .name("Group " + groupNumber++)
                    .course(space.getCourse())
                    .projectSpace(space)
                    .status(GroupStatus.FORMING)
                    .students(new ArrayList<>(chunk))
                    .build();
            createdGroups.add(projectGroupRepository.save(group));
        }

        space.setIsGroupsFormed(true);
        projectSpaceRepository.save(space);

        return toSpaceResponse(projectSpaceRepository.findByCourseId(courseId).orElseThrow());
    }

    @Override
    @Transactional
    public ProjectSpaceResponse resetGroups(UUID courseId) {
        Instructor instructor = currentInstructor();
        ProjectSpace space = getOwnedSpace(courseId, instructor);
        ensureUniversityCourseEnrollments(space.getCourse());

        List<ProjectGroup> existingGroups = projectGroupRepository.findByProjectSpaceId(space.getId());
        if (!existingGroups.isEmpty()) {
            projectGroupRepository.deleteAll(existingGroups);
        }

        space.setIsGroupsFormed(false);
        projectSpaceRepository.save(space);

        return toSpaceResponse(projectSpaceRepository.findByCourseId(courseId).orElseThrow());
    }

    // ─────────────────────────────────────────────────────────────
    // FORM GROUPS — MANUAL
    // ─────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public ProjectSpaceResponse formGroupsManually(UUID courseId, ManualGroupRequest request) {
        Instructor instructor = currentInstructor();
        ProjectSpace space = getOwnedSpace(courseId, instructor);
        ensureUniversityCourseEnrollments(space.getCourse());

        if (Boolean.TRUE.equals(space.getIsGroupsFormed())) {
            throw new BadRequestException("Groups have already been formed for this course");
        }
        if (request.getGroups() == null || request.getGroups().isEmpty()) {
            throw new BadRequestException("At least one group definition is required");
        }

        // Validate no student appears in two groups
        Set<UUID> allStudentIds = new HashSet<>();
        for (ManualGroupRequest.GroupDefinition def : request.getGroups()) {
            for (UUID sid : def.getStudentIds()) {
                if (!allStudentIds.add(sid)) {
                    throw new BadRequestException("Student " + sid + " is assigned to multiple groups");
                }
            }
        }

        for (ManualGroupRequest.GroupDefinition def : request.getGroups()) {
            List<Student> members = def.getStudentIds().stream()
                    .map(sid -> studentRepository.findById(sid)
                            .orElseThrow(() -> new ResourceNotFoundException("Student not found: " + sid)))
                    .collect(Collectors.toList());

            ProjectGroup group = ProjectGroup.builder()
                    .name(def.getName())
                    .course(space.getCourse())
                    .projectSpace(space)
                    .status(GroupStatus.FORMING)
                    .students(members)
                    .build();
            projectGroupRepository.save(group);
        }

        space.setIsGroupsFormed(true);
        projectSpaceRepository.save(space);

        return toSpaceResponse(projectSpaceRepository.findByCourseId(courseId).orElseThrow());
    }

    // ─────────────────────────────────────────────────────────────
    // STUDENT: SUBMIT PROPOSAL
    // ─────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public ProjectProposalResponse submitProposal(UUID courseId, SubmitProposalRequest request) {
        Student student = currentStudent();
        ProjectGroup group = getStudentGroupForCourse(courseId, student);

        if (Boolean.TRUE.equals(group.getIsProposalApproved())) {
            throw new BadRequestException("Proposal already approved, cannot resubmit");
        }

        // Upsert proposal
        ProjectProposal proposal = projectProposalRepository.findByProjectGroupId(group.getId())
                .orElse(ProjectProposal.builder().projectGroup(group).build());

        proposal.setProjectTitle(request.getProjectTitle());
        proposal.setDescription(request.getDescription());
        proposal.setDocUrl(request.getDocUrl());
        proposal.setStatus("PENDING");
        proposal.setRejectionReason(null);

        group.setStatus(GroupStatus.PROPOSAL_PENDING);
        projectGroupRepository.save(group);

        return toProposalResponse(projectProposalRepository.save(proposal));
    }

    // ─────────────────────────────────────────────────────────────
    // INSTRUCTOR: REVIEW PROPOSAL
    // ─────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public ProjectProposalResponse reviewProposal(UUID courseId, UUID groupId, ReviewProposalRequest request) {
        Instructor instructor = currentInstructor();
        ProjectGroup group = getOwnedGroup(courseId, groupId, instructor);

        ProjectProposal proposal = projectProposalRepository.findByProjectGroupId(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("No proposal found for this group"));

        if ("APPROVE".equalsIgnoreCase(request.getAction())) {
            proposal.setStatus("APPROVED");
            proposal.setRejectionReason(null);
            group.setIsProposalApproved(true);
            group.setProjectTitle(proposal.getProjectTitle());
            group.setStatus(GroupStatus.PROPOSAL_APPROVED);
        } else if ("REJECT".equalsIgnoreCase(request.getAction())) {
            if (request.getRejectionReason() == null || request.getRejectionReason().isBlank()) {
                throw new BadRequestException("Rejection reason is required");
            }
            proposal.setStatus("REJECTED");
            proposal.setRejectionReason(request.getRejectionReason());
            group.setStatus(GroupStatus.FORMING); // back to resubmit
        } else {
            throw new BadRequestException("Action must be APPROVE or REJECT");
        }

        proposal.setReviewedAt(LocalDateTime.now());
        projectGroupRepository.save(group);
        return toProposalResponse(projectProposalRepository.save(proposal));
    }

    // ─────────────────────────────────────────────────────────────
    // INSTRUCTOR: ASSIGN PROJECT (missed proposal deadline)
    // ─────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public ProjectGroupResponse assignProject(UUID courseId, UUID groupId, AssignProjectRequest request) {
        Instructor instructor = currentInstructor();
        ProjectGroup group = getOwnedGroup(courseId, groupId, instructor);

        group.setProjectTitle(request.getProjectTitle());
        group.setInstructorAssignedDoc(request.getProjectDoc());
        group.setAssignedByInstructor(true);
        group.setIsProposalApproved(true);
        group.setStatus(GroupStatus.PROPOSAL_APPROVED);

        return toGroupResponse(projectGroupRepository.save(group));
    }

    // ─────────────────────────────────────────────────────────────
    // INSTRUCTOR: LINK GITHUB REPO
    // ─────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public ProjectRepoResponse linkRepo(UUID courseId, UUID groupId, LinkRepoRequest request) {
        Instructor instructor = currentInstructor();
        ProjectGroup group = getOwnedGroup(courseId, groupId, instructor);

        ProjectRepo repo = projectRepoRepository.findByProjectGroupId(groupId)
                .orElse(ProjectRepo.builder().projectGroup(group).instructorOwner(instructor).build());

        repo.setGithubUrl(request.getGithubUrl());
        repo.setRepoName(request.getRepoName());
        repo.setDefaultBranch(request.getDefaultBranch() != null ? request.getDefaultBranch() : "main");

        // Move group to ACTIVE once repo is linked
        group.setStatus(GroupStatus.ACTIVE);
        projectGroupRepository.save(group);

        return toRepoResponse(projectRepoRepository.save(repo));
    }

    // ─────────────────────────────────────────────────────────────
    // GITHUB ACTIVITY — read-only API calls
    // ─────────────────────────────────────────────────────────────

    @Override
    public GitHubActivityResponse getGitHubActivity(UUID courseId, UUID groupId) {
        Instructor instructor = currentInstructor();

        ProjectRepo repo = projectRepoRepository.findByProjectGroupId(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("No GitHub repo linked for this group"));

        String pat = instructor.getGithubPat();
        if (pat == null || pat.isBlank()) {
            throw new BadRequestException("GitHub PAT not configured. Please add it in Settings.");
        }

        // Parse owner/repo from githubUrl
        // Expected format: https://github.com/owner/repo or
        // https://github.com/owner/repo.git
        String url = repo.getGithubUrl().replace(".git", "");
        String[] parts = url.split("/");
        if (parts.length < 2) {
            throw new BadRequestException("Invalid GitHub URL format");
        }
        String owner = parts[parts.length - 2];
        String repoName = parts[parts.length - 1];

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + pat);
        headers.set("Accept", "application/vnd.github+json");
        headers.set("X-GitHub-Api-Version", "2022-11-28");
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        String base = "https://api.github.com/repos/" + owner + "/" + repoName;

        // Fetch branches
        List<GitHubActivityResponse.BranchInfo> branches = fetchBranches(base, entity, owner, repoName);

        // Fetch pull requests (all states)
        List<GitHubActivityResponse.PullRequestInfo> prs = fetchPullRequests(base, entity);

        // Fetch recent commits on default branch
        List<GitHubActivityResponse.CommitInfo> commits = fetchCommits(base, entity, repo.getDefaultBranch());

        return GitHubActivityResponse.builder()
                .repoName(repo.getRepoName())
                .githubUrl(repo.getGithubUrl())
                .defaultBranch(repo.getDefaultBranch())
                .branches(branches)
                .pullRequests(prs)
                .recentCommits(commits)
                .build();
    }

    private List<GitHubActivityResponse.BranchInfo> fetchBranches(String base, HttpEntity<Void> entity, String owner,
            String repoName) {
        try {
            ResponseEntity<String> resp = restTemplate.exchange(base + "/branches?per_page=50", HttpMethod.GET, entity,
                    String.class);
            JsonNode arr = objectMapper.readTree(resp.getBody());
            List<GitHubActivityResponse.BranchInfo> list = new ArrayList<>();
            for (JsonNode b : arr) {
                JsonNode commit = b.path("commit");
                list.add(GitHubActivityResponse.BranchInfo.builder()
                        .name(b.path("name").asText())
                        .lastCommitSha(commit.path("sha").asText())
                        .build());
            }
            return list;
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }

    private List<GitHubActivityResponse.PullRequestInfo> fetchPullRequests(String base, HttpEntity<Void> entity) {
        try {
            ResponseEntity<String> resp = restTemplate.exchange(base + "/pulls?state=all&per_page=50&sort=updated",
                    HttpMethod.GET, entity, String.class);
            JsonNode arr = objectMapper.readTree(resp.getBody());
            List<GitHubActivityResponse.PullRequestInfo> list = new ArrayList<>();
            for (JsonNode pr : arr) {
                String state = pr.path("state").asText();
                String mergedAt = pr.path("merged_at").isNull() ? null : pr.path("merged_at").asText();
                if (mergedAt != null)
                    state = "merged";

                list.add(GitHubActivityResponse.PullRequestInfo.builder()
                        .number(pr.path("number").asInt())
                        .title(pr.path("title").asText())
                        .state(state)
                        .author(pr.path("user").path("login").asText())
                        .sourceBranch(pr.path("head").path("ref").asText())
                        .targetBranch(pr.path("base").path("ref").asText())
                        .createdAt(pr.path("created_at").asText())
                        .mergedAt(mergedAt)
                        .url(pr.path("html_url").asText())
                        .build());
            }
            return list;
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }

    private List<GitHubActivityResponse.CommitInfo> fetchCommits(String base, HttpEntity<Void> entity, String branch) {
        try {
            ResponseEntity<String> resp = restTemplate.exchange(
                    base + "/commits?sha=" + branch + "&per_page=30", HttpMethod.GET, entity, String.class);
            JsonNode arr = objectMapper.readTree(resp.getBody());
            List<GitHubActivityResponse.CommitInfo> list = new ArrayList<>();
            for (JsonNode c : arr) {
                JsonNode commitNode = c.path("commit");
                list.add(GitHubActivityResponse.CommitInfo.builder()
                        .sha(c.path("sha").asText().substring(0, 7))
                        .message(commitNode.path("message").asText().split("\n")[0])
                        .author(commitNode.path("author").path("name").asText())
                        .date(commitNode.path("author").path("date").asText())
                        .url(c.path("html_url").asText())
                        .branch(branch)
                        .build());
            }
            return list;
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }

    // ─────────────────────────────────────────────────────────────
    // STUDENT: SUBMIT INDIVIDUAL REPORT
    // ─────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public IndividualReportResponse submitReport(UUID courseId, SubmitReportRequest request) {
        Student student = currentStudent();
        ProjectGroup group = getStudentGroupForCourse(courseId, student);

        IndividualReport report = individualReportRepository
                .findByStudentIdAndProjectGroupId(student.getId(), group.getId())
                .orElse(IndividualReport.builder().student(student).projectGroup(group).build());

        report.setFileUrl(request.getFileUrl());
        report.setDescription(request.getDescription());

        return toReportResponse(individualReportRepository.save(report));
    }

    // ─────────────────────────────────────────────────────────────
    // SAVE GITHUB PAT
    // ─────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public void saveGithubPat(String pat) {
        Instructor instructor = currentInstructor();
        instructor.setGithubPat(pat);
        instructorRepository.save(instructor);
    }

    // ─────────────────────────────────────────────────────────────
    // HELPERS
    // ─────────────────────────────────────────────────────────────

    private Instructor currentInstructor() {
        UUID userId = securityUtils.getCurrentUser().getId();
        return instructorRepository.findByUserId(userId)
                .orElseThrow(() -> new UnauthorizedException("Instructor not found"));
    }

    private Student currentStudent() {
        UUID userId = securityUtils.getCurrentUser().getId();
        return studentRepository.findByUserId(userId)
                .orElseThrow(() -> new UnauthorizedException("Student not found"));
    }

    private ProjectSpace getOwnedSpace(UUID courseId, Instructor instructor) {
        ProjectSpace space = projectSpaceRepository.findByCourseId(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Project space not found"));
        if (!space.getInstructor().getId().equals(instructor.getId())) {
            throw new UnauthorizedException("You do not own this project space");
        }
        return space;
    }

    private ProjectGroup getOwnedGroup(UUID courseId, UUID groupId, Instructor instructor) {
        ProjectSpace space = getOwnedSpace(courseId, instructor);
        ProjectGroup group = projectGroupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Group not found"));

        if (group.getProjectSpace() == null || !space.getId().equals(group.getProjectSpace().getId())) {
            throw new ResourceNotFoundException("Group not found for this course");
        }

        return group;
    }

    private ProjectGroup getStudentGroupForCourse(UUID courseId, Student student) {
        ProjectSpace space = projectSpaceRepository.findByCourseId(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Project space not found"));

        return projectGroupRepository
                .findByProjectSpaceIdAndStudentId(space.getId(), student.getId())
                .orElseThrow(() -> new ResourceNotFoundException("You are not assigned to any group yet"));
    }

    // ─── Mappers ───

    private void ensureUniversityCourseEnrollments(Course course) {
        if (!Boolean.TRUE.equals(course.getIsUniversityCourse())) {
            return;
        }

        courseAllocationRepository.findByCourseId(course.getId()).forEach(allocation -> {
            if (allocation.getSection() == null) {
                return;
            }

            studentRepository.findBySectionId(allocation.getSection().getId()).forEach(student -> {
                boolean alreadyEnrolled = enrollmentRepository
                        .existsByStudentIdAndCourseId(student.getId(), course.getId());

                if (!alreadyEnrolled) {
                    try {
                        Enrollment enrollment = Enrollment.builder()
                                .student(student)
                                .course(course)
                                .overallProgress(0.0f)
                                .isCompleted(false)
                                .build();
                        enrollmentRepository.save(enrollment);
                    } catch (DataIntegrityViolationException exception) {
                        // Another request may create the enrollment at the same time.
                    }
                }
            });
        });
    }

    private ProjectSpaceResponse toSpaceResponse(ProjectSpace space) {
        List<ProjectGroupResponse> groups = space.getGroups().stream()
                .map(this::toGroupResponse)
                .collect(Collectors.toList());
        return ProjectSpaceResponse.builder()
                .id(space.getId())
                .courseId(space.getCourse().getId())
                .courseTitle(space.getCourse().getTitle())
                .groupSize(space.getGroupSize())
                .proposalDeadline(space.getProposalDeadline())
                .projectDeadline(space.getProjectDeadline())
                .projectDescription(space.getProjectDescription())
                .isGroupsFormed(Boolean.TRUE.equals(space.getIsGroupsFormed()))
                .createdAt(space.getCreatedAt())
                .groups(groups)
                .build();
    }

    private ProjectGroupResponse toGroupResponse(ProjectGroup group) {
        List<ProjectGroupResponse.GroupMemberResponse> members = group.getStudents().stream()
                .map(s -> ProjectGroupResponse.GroupMemberResponse.builder()
                        .studentId(s.getId())
                        .name(s.getUser().getName())
                        .email(s.getUser().getEmail())
                        .rollNumber(s.getRollNumber())
                        .githubUsername(s.getUser().getGithubUsername())
                        .build())
                .collect(Collectors.toList());

        ProjectProposalResponse proposalResp = group.getProposal() != null
                ? toProposalResponse(group.getProposal())
                : null;

        ProjectRepoResponse repoResp = group.getProjectRepo() != null
                ? toRepoResponse(group.getProjectRepo())
                : null;

        List<IndividualReportResponse> reports = group.getIndividualReports().stream()
                .map(this::toReportResponse)
                .collect(Collectors.toList());

        return ProjectGroupResponse.builder()
                .id(group.getId())
                .name(group.getName())
                .status(group.getStatus() != null ? group.getStatus().name() : GroupStatus.FORMING.name())
                .projectTitle(group.getProjectTitle())
                .rejectionReason(group.getRejectionReason())
                .assignedByInstructor(Boolean.TRUE.equals(group.getAssignedByInstructor()))
                .instructorAssignedDoc(group.getInstructorAssignedDoc())
                .isProposalApproved(Boolean.TRUE.equals(group.getIsProposalApproved()))
                .createdAt(group.getCreatedAt())
                .members(members)
                .proposal(proposalResp)
                .repo(repoResp)
                .reports(reports)
                .build();
    }

    private ProjectProposalResponse toProposalResponse(ProjectProposal p) {
        return ProjectProposalResponse.builder()
                .id(p.getId())
                .projectTitle(p.getProjectTitle())
                .description(p.getDescription())
                .docUrl(p.getDocUrl())
                .status(p.getStatus())
                .rejectionReason(p.getRejectionReason())
                .submittedAt(p.getSubmittedAt())
                .reviewedAt(p.getReviewedAt())
                .build();
    }

    private ProjectRepoResponse toRepoResponse(ProjectRepo r) {
        return ProjectRepoResponse.builder()
                .id(r.getId())
                .repoName(r.getRepoName())
                .githubUrl(r.getGithubUrl())
                .defaultBranch(r.getDefaultBranch())
                .createdAt(r.getCreatedAt())
                .build();
    }

    private IndividualReportResponse toReportResponse(IndividualReport r) {
        return IndividualReportResponse.builder()
                .id(r.getId())
                .studentId(r.getStudent().getId())
                .studentName(r.getStudent().getUser().getName())
                .rollNumber(r.getStudent().getRollNumber())
                .fileUrl(r.getFileUrl())
                .description(r.getDescription())
                .submittedAt(r.getSubmittedAt())
                .build();
    }
}
