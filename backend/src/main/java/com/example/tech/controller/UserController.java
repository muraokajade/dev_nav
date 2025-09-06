// src/main/java/com/example/tech/controller/UserController.java
package com.example.tech.controller;

import com.example.tech.dto.ActionHistoryDTO;
import com.example.tech.dto.CalendarActionDTO;
import com.example.tech.dto.UserDTO;
import com.example.tech.dto.UserStatusDTO;
import com.example.tech.entity.UserEntity;
import com.example.tech.repository.UserRepository;
import com.example.tech.service.ArticleReadService;
import com.example.tech.service.FirebaseAuthService;
import com.example.tech.service.UserStatusService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(
        origins = {
                "http://localhost:3000",
                "https://devnav.tech",
                "https://www.devnav.tech",
                "https://chosen-shelba-chokai-engineering-61f48841.koyeb.app"
        },
        allowCredentials = "true"
)
@RequestMapping("/api")
@RequiredArgsConstructor
public class UserController {

    private final FirebaseAuthService firebaseAuthService;
    private final UserRepository userRepository;
    private final UserStatusService userStatusService;
    private final ArticleReadService articleReadService; // 未使用なら削除してOK

    /** "Bearer xxx" の前置詞を除去 */
    private String stripBearer(String token) {
        if (token == null) return "";
        return token.replaceFirst("^Bearer\\s+", "");
    }

    @GetMapping("/me")
    public ResponseEntity<UserDTO> getMe(@RequestHeader("Authorization") String token) {
        final String email = firebaseAuthService.verifyAndGetEmail(stripBearer(token));
        final UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("該当ユーザーがDBに存在しません"));
        return ResponseEntity.ok(UserDTO.of(user));
    }

    /** 既存：自分のステータス */
    @GetMapping("/status/mine")
    public ResponseEntity<UserStatusDTO> getMyStatus(@RequestHeader("Authorization") String token) {
        final String email = firebaseAuthService.verifyAndGetEmail(stripBearer(token));
        final UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("ユーザーが見つかりません。"));
        final Long userId = user.getId();
        final UserStatusDTO status = userStatusService.getStatus(userId);
        return ResponseEntity.ok(status);
    }

    /** 互換用：/api/user/stats も同じ DTO を返す */
    @GetMapping("/user/stats")
    public ResponseEntity<UserStatusDTO> getMyStatsCompat(@RequestHeader("Authorization") String token) {
        final String email = firebaseAuthService.verifyAndGetEmail(stripBearer(token));
        final UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("ユーザーが見つかりません。"));
        final Long userId = user.getId();
        final UserStatusDTO status = userStatusService.getStatus(userId);
        return ResponseEntity.ok(status);
    }

    @GetMapping("/user/actions/calendar")
    public ResponseEntity<List<CalendarActionDTO>> getCalendarActions(
            @RequestHeader("Authorization") String token,
            @RequestParam int year,
            @RequestParam int month
    ) {
        final String email = firebaseAuthService.verifyAndGetEmail(stripBearer(token));
        final List<CalendarActionDTO> list = userStatusService.getCalendarActions(email, year, month);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/user/actions/history")
    public ResponseEntity<List<ActionHistoryDTO>> getActionHistories(
            @RequestHeader("Authorization") String token,
            @RequestParam(defaultValue = "10") int limit
    ) {
        final String email = firebaseAuthService.verifyAndGetEmail(stripBearer(token));
        final List<ActionHistoryDTO> list = userStatusService.getActionHistories(email, limit);
        return ResponseEntity.ok(list);
    }
}
