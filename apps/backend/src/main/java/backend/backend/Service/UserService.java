package backend.backend.Service;

import backend.backend.Dto.Request.UpdateProfileRequest;
import backend.backend.Dto.Response.UserResponse;

public interface UserService {
    UserResponse getCurrentUserProfile();
    UserResponse updateCurrentUserProfile(UpdateProfileRequest request);
}