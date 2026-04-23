package backend.backend.Service;

import backend.backend.Dto.Request.CreateLiveTestRequest;
import backend.backend.Dto.Request.SubmitLiveTestRequest;
import backend.backend.Dto.Response.LiveTestResponse;
import backend.backend.Dto.Response.LiveTestResultResponse;

import java.util.List;
import java.util.UUID;

public interface LiveTestService {

    LiveTestResponse createLiveTest(UUID courseId, CreateLiveTestRequest request, String email);

    LiveTestResponse launchLiveTest(UUID liveTestId, String email);

    LiveTestResponse closeLiveTest(UUID liveTestId, String email);

    void deleteLiveTest(UUID liveTestId, String email);

    List<LiveTestResponse> getLiveTestsForCourse(UUID courseId, String email);

    LiveTestResponse getLiveTestWithSubmissions(UUID liveTestId, String email);

    LiveTestResponse getActiveLiveTest(UUID courseId, String email);

    LiveTestResultResponse submitLiveTest(UUID liveTestId, SubmitLiveTestRequest request, String email);
}
