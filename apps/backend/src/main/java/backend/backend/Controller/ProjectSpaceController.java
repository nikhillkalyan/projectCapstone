package backend.backend.Controller;

import backend.backend.Dto.Request.*;
import backend.backend.Dto.Response.*;
import backend.backend.Service.ProjectSpaceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/project-space")
@RequiredArgsConstructor
public class ProjectSpaceController {

    private final ProjectSpaceService projectSpaceService;

    // ── Instructor: create project space for a course ──
    @PostMapping("/{courseId}")
    public ResponseEntity<ProjectSpaceResponse> createProjectSpace(
            @PathVariable UUID courseId,
            @RequestBody CreateProjectSpaceRequest request) {
        return ResponseEntity.ok(projectSpaceService.createProjectSpace(courseId, request));
    }

    // ── Get full project space (instructor sees all groups; student sees via /my-group) ──
    @GetMapping("/{courseId}")
    public ResponseEntity<ProjectSpaceResponse> getProjectSpace(@PathVariable UUID courseId) {
        return ResponseEntity.ok(projectSpaceService.getProjectSpace(courseId));
    }

    // ── Student: get own group in a course ──
    @GetMapping("/{courseId}/my-group")
    public ResponseEntity<ProjectGroupResponse> getMyGroup(@PathVariable UUID courseId) {
        return ResponseEntity.ok(projectSpaceService.getMyGroup(courseId));
    }

    // ── Instructor: form groups randomly ──
    @PostMapping("/{courseId}/groups/random")
    public ResponseEntity<ProjectSpaceResponse> formGroupsRandomly(
            @PathVariable UUID courseId,
            @RequestBody RandomGroupRequest request) {
        return ResponseEntity.ok(projectSpaceService.formGroupsRandomly(courseId, request));
    }

    // ── Instructor: form groups manually ──
    @PostMapping("/{courseId}/groups/manual")
    public ResponseEntity<ProjectSpaceResponse> formGroupsManually(
            @PathVariable UUID courseId,
            @RequestBody ManualGroupRequest request) {
        return ResponseEntity.ok(projectSpaceService.formGroupsManually(courseId, request));
    }

    // ── Student: submit proposal for their group ──
    @DeleteMapping("/{courseId}/groups")
    public ResponseEntity<ProjectSpaceResponse> resetGroups(@PathVariable UUID courseId) {
        return ResponseEntity.ok(projectSpaceService.resetGroups(courseId));
    }

    @PostMapping("/{courseId}/proposal")
    public ResponseEntity<ProjectProposalResponse> submitProposal(
            @PathVariable UUID courseId,
            @RequestBody SubmitProposalRequest request) {
        return ResponseEntity.ok(projectSpaceService.submitProposal(courseId, request));
    }

    // ── Instructor: review a group's proposal ──
    @PutMapping("/{courseId}/groups/{groupId}/proposal/review")
    public ResponseEntity<ProjectProposalResponse> reviewProposal(
            @PathVariable UUID courseId,
            @PathVariable UUID groupId,
            @RequestBody ReviewProposalRequest request) {
        return ResponseEntity.ok(projectSpaceService.reviewProposal(courseId, groupId, request));
    }

    // ── Instructor: assign project to a group (missed deadline) ──
    @PutMapping("/{courseId}/groups/{groupId}/assign")
    public ResponseEntity<ProjectGroupResponse> assignProject(
            @PathVariable UUID courseId,
            @PathVariable UUID groupId,
            @RequestBody AssignProjectRequest request) {
        return ResponseEntity.ok(projectSpaceService.assignProject(courseId, groupId, request));
    }

    // ── Instructor: link GitHub repo to a group ──
    @PutMapping("/{courseId}/groups/{groupId}/repo")
    public ResponseEntity<ProjectRepoResponse> linkRepo(
            @PathVariable UUID courseId,
            @PathVariable UUID groupId,
            @RequestBody LinkRepoRequest request) {
        return ResponseEntity.ok(projectSpaceService.linkRepo(courseId, groupId, request));
    }

    // ── Instructor/Student: fetch live GitHub activity for a group ──
    @GetMapping("/{courseId}/groups/{groupId}/github")
    public ResponseEntity<GitHubActivityResponse> getGitHubActivity(
            @PathVariable UUID courseId,
            @PathVariable UUID groupId) {
        return ResponseEntity.ok(projectSpaceService.getGitHubActivity(courseId, groupId));
    }

    @GetMapping("/{courseId}/groups/{groupId}/messages")
    public ResponseEntity<List<ProjectGroupMessageResponse>> getGroupMessages(
            @PathVariable UUID courseId,
            @PathVariable UUID groupId) {
        return ResponseEntity.ok(projectSpaceService.getGroupMessages(courseId, groupId));
    }

    @PostMapping("/{courseId}/groups/{groupId}/messages")
    public ResponseEntity<ProjectGroupMessageResponse> sendGroupMessage(
            @PathVariable UUID courseId,
            @PathVariable UUID groupId,
            @RequestBody SendProjectGroupMessageRequest request) {
        return ResponseEntity.ok(projectSpaceService.sendGroupMessage(courseId, groupId, request));
    }

    // ── Student: upload individual report ──
    @PostMapping("/{courseId}/report")
    public ResponseEntity<IndividualReportResponse> submitReport(
            @PathVariable UUID courseId,
            @RequestBody SubmitReportRequest request) {
        return ResponseEntity.ok(projectSpaceService.submitReport(courseId, request));
    }

    // ── Instructor: save GitHub PAT (stored in settings) ──
    @PutMapping("/github-pat")
    public ResponseEntity<Void> saveGithubPat(@RequestBody Map<String, String> body) {
        projectSpaceService.saveGithubPat(body.get("pat"));
        return ResponseEntity.ok().build();
    }
}
