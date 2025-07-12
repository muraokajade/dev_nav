package com.example.tech.controller;


import com.example.tech.dto.UserDTO;
import com.example.tech.entity.UserEntity;
import com.example.tech.repository.UserRepository;
import com.example.tech.service.FirebaseAuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController

@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/api/")
@RequiredArgsConstructor
public class UserController {
    private final FirebaseAuthService firebaseAuthService;
    private final UserRepository userRepository;
    @GetMapping("/me")
    public UserDTO getMe(@RequestHeader("Authorization") String token) {
        String email = firebaseAuthService.verifyAdminAndGetEmail(token);

        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("該当ユーザーがDBに存在しません"));;
        return UserDTO.of(user); // id, email, ... を含む
    }
}
