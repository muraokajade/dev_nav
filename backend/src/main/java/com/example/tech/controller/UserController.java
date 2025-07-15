package com.example.tech.controller;


import com.example.tech.dto.*;
import com.example.tech.dto.CalendarActionDTO;
import com.example.tech.dto.request.ArticleReadRequest;
import com.example.tech.entity.ArticleReadEntity;
import com.example.tech.entity.UserEntity;
import com.example.tech.repository.UserRepository;
import com.example.tech.service.ArticleReadService;
import com.example.tech.service.ArticleService;
import com.example.tech.service.FirebaseAuthService;
import com.example.tech.service.UserStatusService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController

@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/api/")
@RequiredArgsConstructor
public class UserController {
    private final FirebaseAuthService firebaseAuthService;
    private final UserRepository userRepository;
    private final UserStatusService userStatusService;
    private final ArticleReadService articleReadService;

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
    @GetMapping("/user/actions/calender")
    public List<CalendarActionDTO> getCalenderActions(@RequestHeader("Authorization") String token,
                                                      @RequestParam int year,
                                                      @RequestParam int month)
    {
        String userEmail = firebaseAuthService.verifyAndGetEmail(token);
        return userStatusService.getCalendarActions(userEmail, year, month);
    }

    @GetMapping("/user/actions/history")
    public List<ActionHistoryDTO> getActionHistories(@RequestHeader("Authorization") String token,
                                                     @RequestParam(defaultValue = "10") int limit)
    {
        String userEmail = firebaseAuthService.verifyAndGetEmail(token);
        return  userStatusService.getActionHistories(userEmail, limit);
    }

    @GetMapping("/articles/read/status")
    public Boolean isArticleRead(@RequestHeader("Authorization") String token,
                                 @RequestParam Long articleId)
    {
        String userEmail = firebaseAuthService.verifyAndGetEmail(token);
        return articleReadService.isArticleRead(userEmail,articleId);
    }

    @PostMapping("/articles/read")
    public ResponseEntity<?> registerArticleRead(@RequestHeader("Authorization") String token,
                                                 @RequestBody ArticleReadRequest request)
    {
        String userEmail = firebaseAuthService.verifyAndGetEmail(token);
        articleReadService.postArticleRead(userEmail,request);
        return ResponseEntity.ok("読了しました。");
    }


}
