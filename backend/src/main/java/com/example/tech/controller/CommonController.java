package com.example.tech.controller;

import com.example.tech.dto.UserDTO;
import com.example.tech.dto.UserStatusDTO;
import com.example.tech.dto.request.RegisterRequest;
import com.example.tech.entity.UserEntity;
import com.example.tech.repository.UserRepository;
import com.example.tech.service.FirebaseAuthService;
import com.example.tech.service.RegisterService;
import com.example.tech.service.UserStatusService;
import lombok.RequiredArgsConstructor;
import org.apache.catalina.User;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin("http://localhost:3000")
@RequiredArgsConstructor
@RequestMapping("/api")
public class CommonController {

    private final RegisterService registerService;
    private final FirebaseAuthService firebaseAuthService;
    private final UserRepository userRepository;
    private final UserStatusService userStatusService;
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest request)
    {
        registerService.registUser(request);
        return ResponseEntity.ok("登録完了");
    }

}
