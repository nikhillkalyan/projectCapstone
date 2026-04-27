package backend.backend.Service;

import backend.backend.Dto.Request.*;
import backend.backend.Dto.Response.*;

import java.util.List;
import java.util.UUID;

public interface ProjectSpaceService {

    // Instructor creates the project space for a course
    ProjectSpaceResponse createProjectSpace(UUID courseId, CreateProjectSpaceRequest request);

    // Get full project space with all groups (instructor view)
    ProjectSpaceResponse getProjectSpace(UUID courseId);

    // Get student's own group in a course
    ProjectGroupResponse getMyGroup(UUID courseId);

    // Form groups randomly from enrolled students
    ProjectSpaceResponse formGroupsRandomly(UUID courseId, RandomGroupRequest request);

    // Instructor manually defines groups
    ProjectSpaceResponse formGroupsManually(UUID courseId, ManualGroupRequest request);

    // Instructor clears existing groups so they can be formed again
    ProjectSpaceResponse resetGroups(UUID courseId);

    // Student submits proposal for their group
    ProjectProposalResponse submitProposal(UUID courseId, SubmitProposalRequest request);

    // Instructor approves or rejects a group's proposal
    ProjectProposalResponse reviewProposal(UUID courseId, UUID groupId, ReviewProposalRequest request);

    // Instructor assigns a project to a group that missed the proposal deadline
    ProjectGroupResponse assignProject(UUID courseId, UUID groupId, AssignProjectRequest request);

    // Instructor links a GitHub repo to a group
    ProjectRepoResponse linkRepo(UUID courseId, UUID groupId, LinkRepoRequest request);

    // Fetch live GitHub activity for a group's repo
    GitHubActivityResponse getGitHubActivity(UUID courseId, UUID groupId);

    // Fetch group collaboration messages and mark them read for the current user
    List<ProjectGroupMessageResponse> getGroupMessages(UUID courseId, UUID groupId);

    // Send a text message to a project group
    ProjectGroupMessageResponse sendGroupMessage(UUID courseId, UUID groupId, SendProjectGroupMessageRequest request);

    // Student submits individual report
    IndividualReportResponse submitReport(UUID courseId, SubmitReportRequest request);

    // Instructor saves GitHub PAT
    void saveGithubPat(String pat);
}
