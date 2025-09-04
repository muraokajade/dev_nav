package com.example.tech.controller;

import com.example.tech.dto.LikeStatusDTO;
import com.example.tech.service.LikeSyntaxService;
import com.example.tech.service.FirebaseAuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/syntaxes/likes")
@RequiredArgsConstructor
public class LikeSyntaxController {

    private final LikeSyntaxService likeSyntaxService;
    private final FirebaseAuthService firebaseAuthService;

    @PostMapping
    public ResponseEntity<Void> likeSyntax(
            @RequestHeader("Authorization") String token,
            @RequestParam(name="syntaxId", required=false) Long syntaxId,
            @RequestBody(required=false) Map<String, Object> body) {

        if (syntaxId == null && body != null) {
            Object v = body.get("syntaxId");
            if (v != null) syntaxId = Long.valueOf(String.valueOf(v));
        }
        if (syntaxId == null) return ResponseEntity.badRequest().build();

        String email = firebaseAuthService.verifyAndGetEmail(token);
        likeSyntaxService.likeSyntax(email, syntaxId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{syntaxId}")
    public ResponseEntity<Void> unlikePath(
            @RequestHeader("Authorization") String token,
            @PathVariable Long syntaxId) {

        String raw = token.replaceFirst("^Bearer\\s+", "");
        String email = firebaseAuthService.verifyAndGetEmail(raw);

        // 存在しなくても 204 を返す（冪等）
        likeSyntaxService.unlikeSyntax(email, syntaxId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/status")
    public ResponseEntity<LikeStatusDTO> getStatus(@RequestHeader("Authorization") String token,
                                                   @RequestParam Long syntaxId) {
        String email = firebaseAuthService.verifyAndGetEmail(token);
        boolean liked = likeSyntaxService.isLiked(email, syntaxId);
        long count = likeSyntaxService.countLikes(syntaxId);
        return ResponseEntity.ok(new LikeStatusDTO(liked, count));
    }
    @DeleteMapping
    public ResponseEntity<Void> unlikeQuery(
            @RequestHeader("Authorization") String token,
            @RequestParam Long syntaxId) {

        String raw = token.replaceFirst("^Bearer\\s+", "");
        String email = firebaseAuthService.verifyAndGetEmail(raw);

        likeSyntaxService.unlikeSyntax(email, syntaxId);
        return ResponseEntity.noContent().build();
    }
}
