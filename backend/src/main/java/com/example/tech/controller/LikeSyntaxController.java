// src/main/java/com/example/tech/controller/LikeSyntaxController.java
package com.example.tech.controller;

import com.example.tech.dto.LikeStatusDTO;
import com.example.tech.service.FirebaseAuthService;
import com.example.tech.service.LikeSyntaxService;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/syntaxes/likes")
@RequiredArgsConstructor
public class LikeSyntaxController {

    private final LikeSyntaxService likeSyntaxService;
    private final FirebaseAuthService firebaseAuthService;

    private String stripBearer(String token) {
        return token == null ? "" : token.replaceFirst("^Bearer\\s+", "");
    }

    /** Firebase検証を行い、失敗時はUnauthorizedExceptionを投げる（→ GlobalExceptionHandlerで401） */
    private String verifyOrThrow401(String token) {
        try {
            String email = firebaseAuthService.verifyAndGetEmail(stripBearer(token));
            if (email == null || email.isBlank()) throw new UnauthorizedException();
            return email;
        } catch (Exception e) {
            throw new UnauthorizedException();
        }
    }

    @PostMapping
    public ResponseEntity<Void> likeSyntax(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestParam(name = "syntaxId", required = false) Long syntaxId,
            @RequestBody(required = false) Map<String, Object> body) {

        // syntaxId を body/param どちらからでも受け取る
        if (syntaxId == null && body != null) {
            Object v = body.get("syntaxId");
            if (v != null) {
                try { syntaxId = Long.valueOf(String.valueOf(v)); }
                catch (NumberFormatException e) { return ResponseEntity.badRequest().build(); }
            }
        }
        if (syntaxId == null) return ResponseEntity.badRequest().build();

        final String email = verifyOrThrow401(authorization);

        try {
            // 既にLIKE済みならno-opになる実装（冪等）
            likeSyntaxService.likeSyntax(email, syntaxId);
            return ResponseEntity.ok().build();
        } catch (DataIntegrityViolationException ex) {
            // 一意制約/外部キー制約など
            return ResponseEntity.status(409).build();
        } catch (Exception ex) {
            // 想定外
            return ResponseEntity.status(500).build();
        }
    }

    @DeleteMapping("/{syntaxId}")
    public ResponseEntity<Void> unlikePath(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable Long syntaxId) {

        final String email = verifyOrThrow401(authorization);
        try {
            likeSyntaxService.unlikeSyntax(email, syntaxId); // 無ければno-op想定
            return ResponseEntity.noContent().build();
        } catch (Exception ex) {
            return ResponseEntity.status(500).build();
        }
    }

    @DeleteMapping
    public ResponseEntity<Void> unlikeQuery(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestParam Long syntaxId) {

        final String email = verifyOrThrow401(authorization);
        try {
            likeSyntaxService.unlikeSyntax(email, syntaxId);
            return ResponseEntity.noContent().build();
        } catch (Exception ex) {
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/status")
    public ResponseEntity<LikeStatusDTO> getStatus(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestParam Long syntaxId) {

        // 未ログインでも count は返したいなら ↓を分岐させてもOK
        final String email = verifyOrThrow401(authorization);

        boolean liked = likeSyntaxService.isLiked(email, syntaxId);
        long count = likeSyntaxService.countLikes(syntaxId);
        return ResponseEntity.ok(new LikeStatusDTO(liked, count));
    }

    /** 401用の内部例外 */
    static class UnauthorizedException extends RuntimeException {}
}
