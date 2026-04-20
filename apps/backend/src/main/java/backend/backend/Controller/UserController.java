package backend.backend.Controller;

import backend.backend.Dto.Request.UpdateProfileRequest;
import backend.backend.Dto.Response.UserResponse;
import backend.backend.Service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getMyProfile() {
        return ResponseEntity.ok(userService.getCurrentUserProfile());
    }

    @PutMapping("/me")
    public ResponseEntity<UserResponse> updateMyProfile(
            @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(userService.updateCurrentUserProfile(request));
    }

    @PutMapping("/me/university/join")
    public ResponseEntity<Void> joinUniversity(
            @RequestBody backend.backend.Dto.Request.JoinUniversityRequest request) {
        userService.joinUniversity(request);
        return ResponseEntity.ok().build();
    }
}