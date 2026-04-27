package backend.backend.Service.Impl;

import backend.backend.Dto.Request.*;
import backend.backend.Dto.Response.*;
import backend.backend.Entity.*;
import backend.backend.Enums.GroupStatus;
import backend.backend.Enums.Role;
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
import java.util.stream.Stream;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectSpaceServiceImpl implements ProjectSpaceService {

    private final ProjectSpaceRepository projectSpaceRepository;
    private final ProjectGroupRepository projectGroupRepository;
    private final ProjectProposalRepository projectProposalRepository;
    private final ProjectRepoRepository projectRepoRepository;
    private final IndividualReportRepository individualReportRepository;
    private final ProjectActivityEventRepository projectActivityEventRepository;
    private final ProjectGroupMessageRepository projectGroupMessageRepository;
    private final ProjectGroupChatReadRepository projectGroupChatReadRepository;
    private final GitHubBranchSnapshotRepository gitHubBranchSnapshotRepository;
    private final GitHubPullRequestSnapshotRepository gitHubPullRequestSnapshotRepository;
    private final GitHubCommitSnapshotRepository gitHubCommitSnapshotRepository;
    private final InstructorRepository instructorRepository;
    private final StudentRepository studentRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final CourseRepository courseRepository;
    private final CourseAllocationRepository courseAllocationRepository;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final SecurityUtils securityUtils;

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

        ProjectSpace space = projectSpaceRepository.save(ProjectSpace.builder()
                .course(course)
                .instructor(instructor)
                .groupSize(request.getGroupSize())
                .proposalDeadline(request.getProposalDeadline())
                .projectDeadline(request.getProjectDeadline())
                .projectDescription(request.getProjectDescription())
                .build());

        recordEvent(space, null, "SPACE_CREATED", "Project space created",
                "Project space was opened for " + course.getTitle(), null);

        return toSpaceResponse(space, true, true);
    }

    @Override
    @Transactional(readOnly = true)
    public ProjectSpaceResponse getProjectSpace(UUID courseId) {
        ProjectSpace space = projectSpaceRepository.findByCourseId(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Project space not found for this course"));

        User currentUser = securityUtils.getCurrentUser();
        boolean includeGroups;

        if (currentUser.getRole() == Role.INSTRUCTOR) {
            includeGroups = ownsCourse(space.getCourse(), currentUser.getId());
            if (!includeGroups) {
                throw new UnauthorizedException("You do not have access to this project space");
            }
        } else if (currentUser.getRole() == Role.STUDENT) {
            Student student = currentStudent();
            ensureStudentEnrolledInCourse(student, courseId);
            includeGroups = false;
        } else {
            throw new UnauthorizedException("You do not have access to this project space");
        }

        ensureUniversityCourseEnrollments(space.getCourse());
        return toSpaceResponse(space, includeGroups, includeGroups);
    }

    @Override
    @Transactional(readOnly = true)
    public ProjectGroupResponse getMyGroup(UUID courseId) {
        Student student = currentStudent();
        return toGroupResponse(getStudentGroupForCourse(courseId, student));
    }

    @Override
    @Transactional
    public ProjectSpaceResponse formGroupsRandomly(UUID courseId, RandomGroupRequest request) {
        Instructor instructor = currentInstructor();
        ProjectSpace space = getOwnedSpace(courseId, instructor);
        ensureUniversityCourseEnrollments(space.getCourse());

        if (Boolean.TRUE.equals(space.getIsGroupsFormed())) {
            throw new BadRequestException("Groups have already been formed for this course");
        }

        List<Student> students = getEnrolledStudents(space.getCourse());
        if (students.isEmpty()) {
            throw new BadRequestException("No students enrolled in this course");
        }

        Collections.shuffle(students);

        int size = request.getGroupSize() != null ? request.getGroupSize() : space.getGroupSize();
        if (size < 1) {
            throw new BadRequestException("Group size must be at least 1");
        }

        int groupNumber = 1;
        for (int i = 0; i < students.size(); i += size) {
            List<Student> chunk = students.subList(i, Math.min(i + size, students.size()));
            projectGroupRepository.save(ProjectGroup.builder()
                    .name("Group " + groupNumber++)
                    .course(space.getCourse())
                    .projectSpace(space)
                    .status(GroupStatus.FORMING)
                    .students(new ArrayList<>(chunk))
                    .build());
        }

        space.setIsGroupsFormed(true);
        projectSpaceRepository.save(space);

        recordEvent(space, null, "GROUPS_FORMED_RANDOM", "Groups formed randomly",
                "Instructor generated project groups for this course", metadata("groupSize", size));

        return toSpaceResponse(projectSpaceRepository.findByCourseId(courseId).orElseThrow(), true, true);
    }

    @Override
    @Transactional
    public ProjectSpaceResponse resetGroups(UUID courseId) {
        Instructor instructor = currentInstructor();
        ProjectSpace space = getOwnedSpace(courseId, instructor);
        ensureUniversityCourseEnrollments(space.getCourse());

        List<ProjectGroup> existingGroups = projectGroupRepository.findByProjectSpaceId(space.getId());
        if (!existingGroups.isEmpty()) {
            List<UUID> groupIds = existingGroups.stream()
                    .map(ProjectGroup::getId)
                    .collect(Collectors.toList());

            projectActivityEventRepository.deleteByProjectGroupIdIn(groupIds);
            projectGroupMessageRepository.deleteByProjectGroupIdIn(groupIds);
            projectGroupChatReadRepository.deleteByProjectGroupIdIn(groupIds);
            gitHubBranchSnapshotRepository.deleteByProjectGroupIdIn(groupIds);
            gitHubPullRequestSnapshotRepository.deleteByProjectGroupIdIn(groupIds);
            gitHubCommitSnapshotRepository.deleteByProjectGroupIdIn(groupIds);
            projectGroupRepository.deleteAll(existingGroups);
        }

        space.setIsGroupsFormed(false);
        projectSpaceRepository.save(space);

        recordEvent(space, null, "GROUPS_RESET", "Groups reset",
                "Instructor cleared all project groups for this course", null);

        return toSpaceResponse(projectSpaceRepository.findByCourseId(courseId).orElseThrow(), true, true);
    }

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

        Map<UUID, Student> enrolledStudents = getEnrolledStudents(space.getCourse()).stream()
                .collect(Collectors.toMap(Student::getId, student -> student));

        Set<UUID> allStudentIds = new HashSet<>();
        for (ManualGroupRequest.GroupDefinition definition : request.getGroups()) {
            if (definition.getStudentIds() == null || definition.getStudentIds().isEmpty()) {
                throw new BadRequestException("Each manual group must contain at least one student");
            }
            if (definition.getName() == null || definition.getName().isBlank()) {
                throw new BadRequestException("Each manual group must have a name");
            }

            for (UUID studentId : definition.getStudentIds()) {
                if (!allStudentIds.add(studentId)) {
                    throw new BadRequestException("Student " + studentId + " is assigned to multiple groups");
                }
                if (!enrolledStudents.containsKey(studentId)) {
                    throw new BadRequestException("Student " + studentId + " is not enrolled in this course");
                }
            }
        }

        for (ManualGroupRequest.GroupDefinition definition : request.getGroups()) {
            List<Student> members = definition.getStudentIds().stream()
                    .map(enrolledStudents::get)
                    .collect(Collectors.toList());

            projectGroupRepository.save(ProjectGroup.builder()
                    .name(definition.getName().trim())
                    .course(space.getCourse())
                    .projectSpace(space)
                    .status(GroupStatus.FORMING)
                    .students(members)
                    .build());
        }

        space.setIsGroupsFormed(true);
        projectSpaceRepository.save(space);

        recordEvent(space, null, "GROUPS_FORMED_MANUAL", "Groups formed manually",
                "Instructor assigned students into custom project groups",
                metadata("groupCount", request.getGroups().size()));

        return toSpaceResponse(projectSpaceRepository.findByCourseId(courseId).orElseThrow(), true, true);
    }

    @Override
    @Transactional
    public ProjectProposalResponse submitProposal(UUID courseId, SubmitProposalRequest request) {
        Student student = currentStudent();
        ProjectGroup group = getStudentGroupForCourse(courseId, student);

        if (Boolean.TRUE.equals(group.getIsProposalApproved())) {
            throw new BadRequestException("Proposal already approved, cannot resubmit");
        }

        ProjectProposal proposal = projectProposalRepository.findByProjectGroupId(group.getId())
                .orElse(ProjectProposal.builder().projectGroup(group).build());

        proposal.setProjectTitle(request.getProjectTitle());
        proposal.setDescription(request.getDescription());
        proposal.setDocUrl(request.getDocUrl());
        proposal.setStatus("PENDING");
        proposal.setRejectionReason(null);

        group.setStatus(GroupStatus.PROPOSAL_PENDING);
        projectGroupRepository.save(group);

        ProjectProposal savedProposal = projectProposalRepository.save(proposal);
        recordEvent(group.getProjectSpace(), group, "PROPOSAL_SUBMITTED", "Proposal submitted",
                student.getUser().getName() + " submitted a project proposal for " + group.getName(),
                metadata("projectTitle", request.getProjectTitle()));

        return toProposalResponse(savedProposal);
    }

    @Override
    @Transactional
    public ProjectProposalResponse reviewProposal(UUID courseId, UUID groupId, ReviewProposalRequest request) {
        Instructor instructor = currentInstructor();
        ProjectGroup group = getOwnedGroup(courseId, groupId, instructor);

        ProjectProposal proposal = projectProposalRepository.findByProjectGroupId(group.getId())
                .orElseThrow(() -> new ResourceNotFoundException("No proposal found for this group"));

        String action = request.getAction() == null ? "" : request.getAction().trim();
        if ("APPROVE".equalsIgnoreCase(action)) {
            proposal.setStatus("APPROVED");
            proposal.setRejectionReason(null);
            group.setIsProposalApproved(true);
            group.setProjectTitle(proposal.getProjectTitle());
            group.setStatus(GroupStatus.PROPOSAL_APPROVED);
            group.setRejectionReason(null);
        } else if ("REJECT".equalsIgnoreCase(action)) {
            if (request.getRejectionReason() == null || request.getRejectionReason().isBlank()) {
                throw new BadRequestException("Rejection reason is required");
            }
            proposal.setStatus("REJECTED");
            proposal.setRejectionReason(request.getRejectionReason());
            group.setIsProposalApproved(false);
            group.setRejectionReason(request.getRejectionReason());
            group.setStatus(GroupStatus.FORMING);
        } else {
            throw new BadRequestException("Action must be APPROVE or REJECT");
        }

        proposal.setReviewedAt(LocalDateTime.now());
        projectGroupRepository.save(group);
        ProjectProposal savedProposal = projectProposalRepository.save(proposal);

        recordEvent(group.getProjectSpace(), group,
                "APPROVE".equalsIgnoreCase(action) ? "PROPOSAL_APPROVED" : "PROPOSAL_REJECTED",
                "APPROVE".equalsIgnoreCase(action) ? "Proposal approved" : "Proposal rejected",
                "APPROVE".equalsIgnoreCase(action)
                        ? "Instructor approved the proposal for " + group.getName()
                        : "Instructor rejected the proposal for " + group.getName(),
                metadata("projectTitle", proposal.getProjectTitle()));

        return toProposalResponse(savedProposal);
    }

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
        group.setRejectionReason(null);

        ProjectGroup savedGroup = projectGroupRepository.save(group);
        recordEvent(group.getProjectSpace(), group, "PROJECT_ASSIGNED", "Project assigned by instructor",
                "Instructor assigned a project directly to " + group.getName(),
                metadata("projectTitle", request.getProjectTitle()));

        return toGroupResponse(savedGroup);
    }

    @Override
    @Transactional
    public ProjectRepoResponse linkRepo(UUID courseId, UUID groupId, LinkRepoRequest request) {
        Instructor instructor = currentInstructor();
        ProjectGroup group = getOwnedGroup(courseId, groupId, instructor);

        ProjectRepo repo = projectRepoRepository.findByProjectGroupId(group.getId())
                .orElse(ProjectRepo.builder()
                        .projectGroup(group)
                        .instructorOwner(instructor)
                        .build());

        repo.setGithubUrl(request.getGithubUrl());
        repo.setRepoName(request.getRepoName());
        repo.setDefaultBranch(request.getDefaultBranch() != null && !request.getDefaultBranch().isBlank()
                ? request.getDefaultBranch().trim()
                : "main");

        group.setStatus(GroupStatus.ACTIVE);
        projectGroupRepository.save(group);

        ProjectRepo savedRepo = projectRepoRepository.save(repo);
        recordEvent(group.getProjectSpace(), group, "REPO_LINKED", "GitHub repository linked",
                "Instructor linked a GitHub repository for " + group.getName(),
                metadata("repoName", request.getRepoName()));

        return toRepoResponse(savedRepo);
    }

    @Override
    @Transactional
    public GitHubActivityResponse getGitHubActivity(UUID courseId, UUID groupId) {
        ProjectGroup group = getAccessibleGroup(courseId, groupId);
        ProjectRepo repo = projectRepoRepository.findByProjectGroupId(group.getId())
                .orElseThrow(() -> new ResourceNotFoundException("No GitHub repo linked for this group"));

        String pat = group.getCourse().getInstructor().getGithubPat();
        if (pat == null || pat.isBlank()) {
            throw new BadRequestException("GitHub PAT not configured. Please add it in Settings.");
        }

        String[] repoCoordinates = parseRepoCoordinates(repo.getGithubUrl());
        String owner = repoCoordinates[0];
        String repoName = repoCoordinates[1];

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + pat);
        headers.set("Accept", "application/vnd.github+json");
        headers.set("X-GitHub-Api-Version", "2022-11-28");
        HttpEntity<Void> entity = new HttpEntity<>(headers);
        String base = "https://api.github.com/repos/" + owner + "/" + repoName;

        try {
            List<GitHubActivityResponse.BranchInfo> branches = fetchBranches(base, entity);
            List<GitHubActivityResponse.PullRequestInfo> pullRequests = fetchPullRequests(base, entity);
            List<GitHubActivityResponse.CommitInfo> commits = fetchCommits(base, entity, repo.getDefaultBranch());

            LocalDateTime syncedAt = persistGitHubSnapshots(group, repo, branches, pullRequests, commits);
            return buildGitHubActivityResponse(repo, "LIVE", syncedAt, branches, pullRequests, commits);
        } catch (RuntimeException exception) {
            GitHubActivityResponse cached = buildCachedGitHubActivityResponse(group, repo);
            if (cached != null) {
                return cached;
            }
            throw new BadRequestException("Failed to fetch GitHub activity from GitHub");
        }
    }

    @Override
    @Transactional
    public List<ProjectGroupMessageResponse> getGroupMessages(UUID courseId, UUID groupId) {
        ProjectGroup group = getAccessibleGroup(courseId, groupId);
        User currentUser = securityUtils.getCurrentUser();

        List<ProjectGroupMessageResponse> messages = projectGroupMessageRepository
                .findByProjectGroupIdOrderBySentAtAsc(group.getId())
                .stream()
                .map(message -> toMessageResponse(message, currentUser.getId()))
                .collect(Collectors.toList());

        markGroupMessagesRead(group, currentUser);
        return messages;
    }

    @Override
    @Transactional
    public ProjectGroupMessageResponse sendGroupMessage(UUID courseId, UUID groupId, SendProjectGroupMessageRequest request) {
        User currentUser = securityUtils.getCurrentUser();
        if (currentUser.getRole() != Role.STUDENT) {
            throw new UnauthorizedException("Only group students can send project chat messages");
        }

        Student student = currentStudent();
        ProjectGroup group = getStudentGroupForCourse(courseId, student);
        if (!group.getId().equals(groupId)) {
            throw new UnauthorizedException("You do not have access to this group");
        }

        String text = request.getMessageText() == null ? "" : request.getMessageText().trim();
        if (text.isEmpty()) {
            throw new BadRequestException("Message cannot be empty");
        }
        if (text.length() > 4000) {
            throw new BadRequestException("Message must be 4000 characters or less");
        }

        ProjectGroupMessage savedMessage = projectGroupMessageRepository.save(ProjectGroupMessage.builder()
                .course(group.getCourse())
                .projectSpace(group.getProjectSpace())
                .projectGroup(group)
                .senderUser(currentUser)
                .messageText(text)
                .build());

        markGroupMessagesRead(group, currentUser);
        recordEvent(group.getProjectSpace(), group, "CHAT_MESSAGE_SENT", "New group message",
                currentUser.getName() + " posted a message in " + group.getName(), null);

        return toMessageResponse(savedMessage, currentUser.getId());
    }

    private List<GitHubActivityResponse.BranchInfo> fetchBranches(String base, HttpEntity<Void> entity) {
        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    base + "/branches?per_page=50", HttpMethod.GET, entity, String.class);

            JsonNode array = objectMapper.readTree(response.getBody());
            List<GitHubActivityResponse.BranchInfo> branches = new ArrayList<>();
            for (JsonNode branch : array) {
                JsonNode commit = branch.path("commit");
                branches.add(GitHubActivityResponse.BranchInfo.builder()
                        .name(branch.path("name").asText())
                        .lastCommitSha(commit.path("sha").asText())
                        .build());
            }
            return branches;
        } catch (Exception exception) {
            throw new RuntimeException("Failed to fetch branches", exception);
        }
    }

    private List<GitHubActivityResponse.PullRequestInfo> fetchPullRequests(String base, HttpEntity<Void> entity) {
        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    base + "/pulls?state=all&per_page=50&sort=updated", HttpMethod.GET, entity, String.class);

            JsonNode array = objectMapper.readTree(response.getBody());
            List<GitHubActivityResponse.PullRequestInfo> pullRequests = new ArrayList<>();
            for (JsonNode pr : array) {
                String state = pr.path("state").asText();
                String mergedAt = pr.path("merged_at").isNull() ? null : pr.path("merged_at").asText();
                if (mergedAt != null) {
                    state = "merged";
                }

                pullRequests.add(GitHubActivityResponse.PullRequestInfo.builder()
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
            return pullRequests;
        } catch (Exception exception) {
            throw new RuntimeException("Failed to fetch pull requests", exception);
        }
    }

    private List<GitHubActivityResponse.CommitInfo> fetchCommits(String base, HttpEntity<Void> entity, String branch) {
        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    base + "/commits?sha=" + branch + "&per_page=30", HttpMethod.GET, entity, String.class);

            JsonNode array = objectMapper.readTree(response.getBody());
            List<GitHubActivityResponse.CommitInfo> commits = new ArrayList<>();
            for (JsonNode commitNode : array) {
                JsonNode commit = commitNode.path("commit");
                String fullSha = commitNode.path("sha").asText();
                commits.add(GitHubActivityResponse.CommitInfo.builder()
                        .sha(fullSha.length() > 7 ? fullSha.substring(0, 7) : fullSha)
                        .message(commit.path("message").asText().split("\n")[0])
                        .author(commit.path("author").path("name").asText())
                        .date(commit.path("author").path("date").asText())
                        .url(commitNode.path("html_url").asText())
                        .branch(branch)
                        .build());
            }
            return commits;
        } catch (Exception exception) {
            throw new RuntimeException("Failed to fetch commits", exception);
        }
    }

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

        IndividualReport savedReport = individualReportRepository.save(report);
        recordEvent(group.getProjectSpace(), group, "REPORT_SUBMITTED", "Individual report submitted",
                student.getUser().getName() + " submitted an individual project report",
                metadata("studentId", student.getId().toString()));

        return toReportResponse(savedReport);
    }

    @Override
    @Transactional
    public void saveGithubPat(String pat) {
        Instructor instructor = currentInstructor();
        instructor.setGithubPat(pat);
        instructorRepository.save(instructor);
    }

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

    private boolean ownsCourse(Course course, UUID userId) {
        return course.getInstructor() != null && course.getInstructor().getId().equals(userId);
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
        return projectGroupRepository.findByIdAndProjectSpaceId(groupId, space.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Group not found for this course"));
    }

    private ProjectGroup getAccessibleGroup(UUID courseId, UUID groupId) {
        User currentUser = securityUtils.getCurrentUser();

        if (currentUser.getRole() == Role.INSTRUCTOR) {
            return getOwnedGroup(courseId, groupId, currentInstructor());
        }

        if (currentUser.getRole() == Role.STUDENT) {
            Student student = currentStudent();
            ensureStudentEnrolledInCourse(student, courseId);
            ProjectGroup group = getStudentGroupForCourse(courseId, student);
            if (!group.getId().equals(groupId)) {
                throw new UnauthorizedException("You do not have access to this group");
            }
            return group;
        }

        throw new UnauthorizedException("You do not have access to this group");
    }

    private ProjectGroup getStudentGroupForCourse(UUID courseId, Student student) {
        ensureStudentEnrolledInCourse(student, courseId);

        ProjectSpace space = projectSpaceRepository.findByCourseId(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Project space not found"));

        return projectGroupRepository.findByProjectSpaceIdAndStudentId(space.getId(), student.getId())
                .orElseThrow(() -> new ResourceNotFoundException("You are not assigned to any group yet"));
    }

    private void ensureStudentEnrolledInCourse(Student student, UUID courseId) {
        if (!enrollmentRepository.existsByStudentIdAndCourseId(student.getId(), courseId)) {
            throw new UnauthorizedException("You are not enrolled in this course");
        }
    }

    private List<Student> getEnrolledStudents(Course course) {
        return enrollmentRepository.findByCourseId(course.getId()).stream()
                .map(Enrollment::getStudent)
                .distinct()
                .collect(Collectors.toList());
    }

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
                        enrollmentRepository.save(Enrollment.builder()
                                .student(student)
                                .course(course)
                                .overallProgress(0.0f)
                                .isCompleted(false)
                                .build());
                    } catch (DataIntegrityViolationException exception) {
                        // Another request may create the enrollment at the same time.
                    }
                }
            });
        });
    }

    private void recordEvent(ProjectSpace space, ProjectGroup group, String eventType, String title, String description,
                             Map<String, Object> metadata) {
        String metadataJson = null;
        if (metadata != null && !metadata.isEmpty()) {
            try {
                metadataJson = objectMapper.writeValueAsString(metadata);
            } catch (Exception ignored) {
                metadataJson = null;
            }
        }

        projectActivityEventRepository.save(ProjectActivityEvent.builder()
                .course(space.getCourse())
                .projectSpace(space)
                .projectGroup(group)
                .actorUser(securityUtils.getCurrentUser())
                .eventType(eventType)
                .title(title)
                .description(description)
                .metadataJson(metadataJson)
                .build());
    }

    private Map<String, Object> metadata(Object... pairs) {
        Map<String, Object> values = new LinkedHashMap<>();
        for (int index = 0; index + 1 < pairs.length; index += 2) {
            Object key = pairs[index];
            Object value = pairs[index + 1];
            if (key != null && value != null) {
                values.put(String.valueOf(key), value);
            }
        }
        return values.isEmpty() ? null : values;
    }

    private LocalDateTime persistGitHubSnapshots(ProjectGroup group, ProjectRepo repo,
                                                 List<GitHubActivityResponse.BranchInfo> branches,
                                                 List<GitHubActivityResponse.PullRequestInfo> pullRequests,
                                                 List<GitHubActivityResponse.CommitInfo> commits) {
        gitHubBranchSnapshotRepository.deleteByProjectGroupId(group.getId());
        gitHubPullRequestSnapshotRepository.deleteByProjectGroupId(group.getId());
        gitHubCommitSnapshotRepository.deleteByProjectGroupId(group.getId());

        for (GitHubActivityResponse.BranchInfo branch : branches) {
            gitHubBranchSnapshotRepository.save(GitHubBranchSnapshot.builder()
                    .projectGroup(group)
                    .projectRepo(repo)
                    .branchName(branch.getName())
                    .lastCommitSha(branch.getLastCommitSha())
                    .lastCommitMessage(branch.getLastCommitMessage())
                    .lastCommitAuthor(branch.getLastCommitAuthor())
                    .lastCommitDate(branch.getLastCommitDate())
                    .build());
        }

        for (GitHubActivityResponse.PullRequestInfo pullRequest : pullRequests) {
            gitHubPullRequestSnapshotRepository.save(GitHubPullRequestSnapshot.builder()
                    .projectGroup(group)
                    .projectRepo(repo)
                    .prNumber(pullRequest.getNumber())
                    .title(pullRequest.getTitle())
                    .state(pullRequest.getState())
                    .author(pullRequest.getAuthor())
                    .sourceBranch(pullRequest.getSourceBranch())
                    .targetBranch(pullRequest.getTargetBranch())
                    .createdAtRemote(pullRequest.getCreatedAt())
                    .mergedAtRemote(pullRequest.getMergedAt())
                    .url(pullRequest.getUrl())
                    .changedFiles(pullRequest.getChangedFiles())
                    .additions(pullRequest.getAdditions())
                    .deletions(pullRequest.getDeletions())
                    .build());
        }

        for (GitHubActivityResponse.CommitInfo commit : commits) {
            gitHubCommitSnapshotRepository.save(GitHubCommitSnapshot.builder()
                    .projectGroup(group)
                    .projectRepo(repo)
                    .sha(commit.getSha())
                    .shortSha(commit.getSha())
                    .message(commit.getMessage())
                    .author(commit.getAuthor())
                    .committedAt(commit.getDate())
                    .branchName(commit.getBranch())
                    .url(commit.getUrl())
                    .build());
        }

        return LocalDateTime.now();
    }

    private GitHubActivityResponse buildCachedGitHubActivityResponse(ProjectGroup group, ProjectRepo repo) {
        List<GitHubBranchSnapshot> branchSnapshots = gitHubBranchSnapshotRepository
                .findByProjectGroupIdOrderByBranchNameAsc(group.getId());
        List<GitHubPullRequestSnapshot> pullRequestSnapshots = gitHubPullRequestSnapshotRepository
                .findByProjectGroupIdOrderBySyncedAtDescPrNumberDesc(group.getId());
        List<GitHubCommitSnapshot> commitSnapshots = gitHubCommitSnapshotRepository
                .findTop30ByProjectGroupIdOrderBySyncedAtDesc(group.getId());

        if (branchSnapshots.isEmpty() && pullRequestSnapshots.isEmpty() && commitSnapshots.isEmpty()) {
            return null;
        }

        LocalDateTime syncedAt = Stream.concat(
                        Stream.concat(branchSnapshots.stream().map(GitHubBranchSnapshot::getSyncedAt),
                                pullRequestSnapshots.stream().map(GitHubPullRequestSnapshot::getSyncedAt)),
                        commitSnapshots.stream().map(GitHubCommitSnapshot::getSyncedAt))
                .filter(Objects::nonNull)
                .max(LocalDateTime::compareTo)
                .orElse(null);

        List<GitHubActivityResponse.BranchInfo> branches = branchSnapshots.stream()
                .map(snapshot -> GitHubActivityResponse.BranchInfo.builder()
                        .name(snapshot.getBranchName())
                        .lastCommitSha(snapshot.getLastCommitSha())
                        .lastCommitMessage(snapshot.getLastCommitMessage())
                        .lastCommitAuthor(snapshot.getLastCommitAuthor())
                        .lastCommitDate(snapshot.getLastCommitDate())
                        .build())
                .collect(Collectors.toList());

        List<GitHubActivityResponse.PullRequestInfo> pullRequests = pullRequestSnapshots.stream()
                .map(snapshot -> GitHubActivityResponse.PullRequestInfo.builder()
                        .number(snapshot.getPrNumber())
                        .title(snapshot.getTitle())
                        .state(snapshot.getState())
                        .author(snapshot.getAuthor())
                        .sourceBranch(snapshot.getSourceBranch())
                        .targetBranch(snapshot.getTargetBranch())
                        .createdAt(snapshot.getCreatedAtRemote())
                        .mergedAt(snapshot.getMergedAtRemote())
                        .url(snapshot.getUrl())
                        .changedFiles(snapshot.getChangedFiles())
                        .additions(snapshot.getAdditions())
                        .deletions(snapshot.getDeletions())
                        .build())
                .collect(Collectors.toList());

        List<GitHubActivityResponse.CommitInfo> commits = commitSnapshots.stream()
                .map(snapshot -> GitHubActivityResponse.CommitInfo.builder()
                        .sha(snapshot.getShortSha())
                        .message(snapshot.getMessage())
                        .author(snapshot.getAuthor())
                        .date(snapshot.getCommittedAt())
                        .branch(snapshot.getBranchName())
                        .url(snapshot.getUrl())
                        .build())
                .collect(Collectors.toList());

        return buildGitHubActivityResponse(repo, "CACHE", syncedAt, branches, pullRequests, commits);
    }

    private GitHubActivityResponse buildGitHubActivityResponse(ProjectRepo repo, String source, LocalDateTime syncedAt,
                                                              List<GitHubActivityResponse.BranchInfo> branches,
                                                              List<GitHubActivityResponse.PullRequestInfo> pullRequests,
                                                              List<GitHubActivityResponse.CommitInfo> commits) {
        return GitHubActivityResponse.builder()
                .repoName(repo.getRepoName())
                .githubUrl(repo.getGithubUrl())
                .defaultBranch(repo.getDefaultBranch())
                .source(source)
                .syncedAt(syncedAt)
                .cachedBranchCount(branches.size())
                .cachedPullRequestCount(pullRequests.size())
                .cachedCommitCount(commits.size())
                .branches(branches)
                .pullRequests(pullRequests)
                .recentCommits(commits)
                .build();
    }

    private String[] parseRepoCoordinates(String githubUrl) {
        if (githubUrl == null || githubUrl.isBlank()) {
            throw new BadRequestException("Invalid GitHub URL format");
        }

        String cleaned = githubUrl.trim().replace(".git", "");
        String[] parts = cleaned.split("/");
        if (parts.length < 2) {
            throw new BadRequestException("Invalid GitHub URL format");
        }

        return new String[]{parts[parts.length - 2], parts[parts.length - 1]};
    }

    private ProjectSpaceResponse toSpaceResponse(ProjectSpace space, boolean includeGroups, boolean includeActivity) {
        List<ProjectGroup> allGroups = projectGroupRepository.findByProjectSpaceId(space.getId());
        List<ProjectGroupResponse> groups = includeGroups
                ? allGroups.stream().map(this::toGroupResponse).collect(Collectors.toList())
                : Collections.emptyList();

        int totalStudents = enrollmentRepository.findByCourseId(space.getCourse().getId()).size();
        int approvedGroupCount = (int) allGroups.stream()
                .filter(group -> Boolean.TRUE.equals(group.getIsProposalApproved()))
                .count();
        int repoLinkedGroupCount = (int) allGroups.stream()
                .filter(group -> group.getProjectRepo() != null)
                .count();

        return ProjectSpaceResponse.builder()
                .id(space.getId())
                .courseId(space.getCourse().getId())
                .courseTitle(space.getCourse().getTitle())
                .groupSize(space.getGroupSize())
                .totalStudents(totalStudents)
                .totalGroups(allGroups.size())
                .approvedGroupCount(approvedGroupCount)
                .repoLinkedGroupCount(repoLinkedGroupCount)
                .proposalDeadline(space.getProposalDeadline())
                .projectDeadline(space.getProjectDeadline())
                .projectDescription(space.getProjectDescription())
                .isGroupsFormed(Boolean.TRUE.equals(space.getIsGroupsFormed()))
                .createdAt(space.getCreatedAt())
                .groups(groups)
                .recentActivity(includeActivity
                        ? projectActivityEventRepository.findTop12ByProjectSpaceIdOrderByCreatedAtDesc(space.getId())
                        .stream()
                        .map(this::toActivityEventResponse)
                        .collect(Collectors.toList())
                        : Collections.emptyList())
                .build();
    }

    private ProjectGroupResponse toGroupResponse(ProjectGroup group) {
        List<ProjectGroupResponse.GroupMemberResponse> members = group.getStudents().stream()
                .map(student -> ProjectGroupResponse.GroupMemberResponse.builder()
                        .studentId(student.getId())
                        .name(student.getUser().getName())
                        .email(student.getUser().getEmail())
                        .rollNumber(student.getRollNumber())
                        .githubUsername(student.getUser().getGithubUsername())
                        .build())
                .collect(Collectors.toList());

        ProjectProposalResponse proposalResponse = group.getProposal() != null
                ? toProposalResponse(group.getProposal())
                : null;

        ProjectRepoResponse repoResponse = group.getProjectRepo() != null
                ? toRepoResponse(group.getProjectRepo())
                : null;

        List<IndividualReportResponse> reports = group.getIndividualReports().stream()
                .map(this::toReportResponse)
                .collect(Collectors.toList());

        User currentUser = securityUtils.getCurrentUser();
        ProjectGroupMessageResponse lastMessage = projectGroupMessageRepository
                .findTopByProjectGroupIdOrderBySentAtDesc(group.getId())
                .map(message -> toMessageResponse(message, currentUser.getId()))
                .orElse(null);

        return ProjectGroupResponse.builder()
                .id(group.getId())
                .courseId(group.getCourse().getId())
                .projectSpaceId(group.getProjectSpace().getId())
                .name(group.getName())
                .status(group.getStatus() != null ? group.getStatus().name() : GroupStatus.FORMING.name())
                .memberCount(members.size())
                .projectTitle(group.getProjectTitle())
                .rejectionReason(group.getRejectionReason())
                .assignedByInstructor(Boolean.TRUE.equals(group.getAssignedByInstructor()))
                .instructorAssignedDoc(group.getInstructorAssignedDoc())
                .isProposalApproved(Boolean.TRUE.equals(group.getIsProposalApproved()))
                .createdAt(group.getCreatedAt())
                .members(members)
                .proposal(proposalResponse)
                .repo(repoResponse)
                .reports(reports)
                .recentActivity(projectActivityEventRepository.findTop5ByProjectGroupIdOrderByCreatedAtDesc(group.getId())
                        .stream()
                        .map(this::toActivityEventResponse)
                        .collect(Collectors.toList()))
                .lastMessage(lastMessage)
                .unreadMessageCount(countUnreadMessages(group, currentUser))
                .build();
    }

    private ProjectGroupMessageResponse toMessageResponse(ProjectGroupMessage message, UUID currentUserId) {
        User sender = message.getSenderUser();
        return ProjectGroupMessageResponse.builder()
                .id(message.getId())
                .courseId(message.getCourse().getId())
                .projectSpaceId(message.getProjectSpace().getId())
                .groupId(message.getProjectGroup().getId())
                .senderUserId(sender.getId())
                .senderName(sender.getName())
                .senderEmail(sender.getEmail())
                .senderAvatar(sender.getAvatarUrl())
                .senderRole(sender.getRole() != null ? sender.getRole().name() : null)
                .messageText(message.getMessageText())
                .isMine(sender.getId().equals(currentUserId))
                .isEdited(Boolean.TRUE.equals(message.getIsEdited()))
                .sentAt(message.getSentAt())
                .build();
    }

    private long countUnreadMessages(ProjectGroup group, User currentUser) {
        Optional<ProjectGroupChatRead> readState = projectGroupChatReadRepository
                .findByProjectGroupIdAndUserId(group.getId(), currentUser.getId());

        if (readState.isEmpty()) {
            return projectGroupMessageRepository.countUnreadWithoutReadState(group.getId(), currentUser.getId());
        }

        return projectGroupMessageRepository.countUnreadAfter(
                group.getId(), currentUser.getId(), readState.get().getLastReadAt());
    }

    private void markGroupMessagesRead(ProjectGroup group, User currentUser) {
        ProjectGroupChatRead readState = projectGroupChatReadRepository
                .findByProjectGroupIdAndUserId(group.getId(), currentUser.getId())
                .orElse(ProjectGroupChatRead.builder()
                        .projectGroup(group)
                        .user(currentUser)
                        .build());

        readState.setLastReadAt(LocalDateTime.now());
        projectGroupChatReadRepository.save(readState);
    }

    private ProjectActivityEventResponse toActivityEventResponse(ProjectActivityEvent event) {
        return ProjectActivityEventResponse.builder()
                .id(event.getId())
                .courseId(event.getCourse().getId())
                .projectSpaceId(event.getProjectSpace().getId())
                .groupId(event.getProjectGroup() != null ? event.getProjectGroup().getId() : null)
                .groupName(event.getProjectGroup() != null ? event.getProjectGroup().getName() : null)
                .eventType(event.getEventType())
                .title(event.getTitle())
                .description(event.getDescription())
                .actorUserId(event.getActorUser() != null ? event.getActorUser().getId() : null)
                .actorName(event.getActorUser() != null ? event.getActorUser().getName() : null)
                .createdAt(event.getCreatedAt())
                .build();
    }

    private ProjectProposalResponse toProposalResponse(ProjectProposal proposal) {
        return ProjectProposalResponse.builder()
                .id(proposal.getId())
                .projectTitle(proposal.getProjectTitle())
                .description(proposal.getDescription())
                .docUrl(proposal.getDocUrl())
                .status(proposal.getStatus())
                .rejectionReason(proposal.getRejectionReason())
                .submittedAt(proposal.getSubmittedAt())
                .reviewedAt(proposal.getReviewedAt())
                .build();
    }

    private ProjectRepoResponse toRepoResponse(ProjectRepo repo) {
        return ProjectRepoResponse.builder()
                .id(repo.getId())
                .repoName(repo.getRepoName())
                .githubUrl(repo.getGithubUrl())
                .defaultBranch(repo.getDefaultBranch())
                .createdAt(repo.getCreatedAt())
                .build();
    }

    private IndividualReportResponse toReportResponse(IndividualReport report) {
        return IndividualReportResponse.builder()
                .id(report.getId())
                .studentId(report.getStudent().getId())
                .studentName(report.getStudent().getUser().getName())
                .rollNumber(report.getStudent().getRollNumber())
                .fileUrl(report.getFileUrl())
                .description(report.getDescription())
                .submittedAt(report.getSubmittedAt())
                .build();
    }
}
