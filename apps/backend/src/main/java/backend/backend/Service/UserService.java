package backend.backend.Service;

import backend.backend.Dto.Request.UpdateProfileRequest;
import backend.backend.Dto.Response.UserResponse;

import backend.backend.Dto.Request.JoinUniversityRequest;

public interface UserService {
    UserResponse getCurrentUserProfile();
    UserResponse updateCurrentUserProfile(UpdateProfileRequest request);
    void joinUniversity(JoinUniversityRequest request);
}