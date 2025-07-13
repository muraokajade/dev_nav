package com.example.tech.controller;


import com.example.tech.dto.UserDTO;
import com.example.tech.dto.UserStatusDTO;
import com.example.tech.entity.UserEntity;
import com.example.tech.repository.UserRepository;
import com.example.tech.service.FirebaseAuthService;
import com.example.tech.service.UserStatusService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController

@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/api/")
@RequiredArgsConstructor
public class UserController {
    private final FirebaseAuthService firebaseAuthService;
    private final UserRepository userRepository;
    private final UserStatusService userStatusService;
    @GetMapping("/me")
    public UserDTO getMe(@RequestHeader("Authorization") String token) {
        String email = firebaseAuthService.verifyAndGetEmail(token);

        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("該当ユーザーがDBに存在しません"));;
        return UserDTO.of(user); // id, email, ... を含む
    }

    @GetMapping("/status/mine")
    public UserStatusDTO getMyStatus(@RequestHeader("Authorization") String token)
    {
        String email = firebaseAuthService.verifyAndGetEmail(token);
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("ユーザーが見つかりません。"));

        Long userId = user.getId();
        UserStatusDTO status = userStatusService.getStatus(userId);
        return status;
    }
}
