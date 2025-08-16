package com.example.tech.controller;

import com.example.tech.entity.ReadStatus;
import com.example.tech.repository.UserRepository;
import com.example.tech.service.FirebaseAuthService;
import com.example.tech.service.ReadStatusService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ReadStatusController {
    private final ReadStatusService readStatusService;
    private final FirebaseAuthService firebaseAuthService; // verifyAndGetEmail を持つ
    private final UserRepository userRepository;
    // 認証ユーザーID取得（例：JWTのsub→DBユーザーIDに解決）
    private Long currentUserId(String authHeader){
        if (authHeader == null || !authHeader.startsWith("Bearer ")) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        String token = authHeader.substring("Bearer ".length());
        String email = firebaseAuthService.verifyAndGetEmail(token);
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED))
                .getId();
    }

    // 一括取得（フロントの /api/{target}/read/all に対応）
    @GetMapping("/{target}/read/all")
    public List<Long> getAll(
            @PathVariable ReadStatus.Target target,
            @RequestHeader(name="Authorization") String authHeader) {
        return readStatusService.getAll(currentUserId(authHeader), target);
    }

    @PostMapping("/{target}/read") // 例: /api/procedures/read
    public ResponseEntity<Void> markReadBody(
            @PathVariable ReadStatus.Target target,
            @RequestHeader("Authorization") String authHeader,
            @RequestBody Map<String, Long> body
    ){
        Long id = body.getOrDefault("contentId",
                body.getOrDefault("procedureId",
                        body.getOrDefault("articleId",
                                body.get("syntaxId"))));
        if (id == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"missing id");
        readStatusService.mark(currentUserId(authHeader), target, id);
        return ResponseEntity.noContent().build();
    }
    // ★ 追加: 単体ステータス
    // GET /api/{target}/read/status?contentId=123
    // 互換のため procedureId/articleId/syntaxId も受け入れます
    @GetMapping("/{target}/read/status")
    public Map<String, Boolean> getStatus(
            @PathVariable ReadStatus.Target target,
            @RequestHeader(name="Authorization") String authHeader,
            @RequestParam(name="contentId", required=false) Long contentId,
            @RequestParam(name="procedureId", required=false) Long procedureId,
            @RequestParam(name="articleId", required=false) Long articleId,
            @RequestParam(name="syntaxId", required=false) Long syntaxId,
            @RequestParam(name="id", required=false) Long id // 汎用 alias
    ){
        Long resolved = contentId != null ? contentId
                : procedureId != null ? procedureId
                : articleId != null ? articleId
                : syntaxId != null ? syntaxId
                : id;
        if (resolved == null)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "missing content id");

        boolean read = readStatusService.isRead(currentUserId(authHeader), target, resolved);
        return Map.of("read", read);
    }

    @DeleteMapping("/{target}/read/{contentId}")
    public ResponseEntity<Void> unmarkRead(
            @PathVariable ReadStatus.Target target,
            @PathVariable Long contentId,
            @RequestHeader("Authorization") String authHeader) {
        readStatusService.unmark(currentUserId(authHeader), target, contentId);
        return ResponseEntity.noContent().build();
    }
}
