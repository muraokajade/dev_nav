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

    private String jwt(String header) {
        return header == null ? null : header.replaceFirst("^Bearer\\s+", "").trim();
    }

    @PostMapping
    public ResponseEntity<Void> likeSyntax(
            @RequestHeader("Authorization") String token,
            @RequestParam(name = "syntaxId", required = false) Long syntaxId,
            @RequestBody(required = false) Map<String, Object> body) {

        if (syntaxId == null && body != null) {
            Object v = body.get("syntaxId");
            if (v != null) {
                try { syntaxId = Long.valueOf(String.valueOf(v)); }
                catch (NumberFormatException e) { return ResponseEntity.badRequest().build(); }
            }
        }
        if (syntaxId == null) return ResponseEntity.badRequest().build();

        final String email = firebaseAuthService.verifyAndGetEmail(jwt(token));
        if (email == null || email.isBlank()) return ResponseEntity.status(401).build();

        likeSyntaxService.likeSyntax(email, syntaxId); // 冪等
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{syntaxId}")
    public ResponseEntity<Void> unlikePath(
            @RequestHeader("Authorization") String token,
            @PathVariable Long syntaxId) {

        final String email = firebaseAuthService.verifyAndGetEmail(jwt(token));
        likeSyntaxService.unlikeSyntax(email, syntaxId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping
    public ResponseEntity<Void> unlikeQuery(
            @RequestHeader("Authorization") String token,
            @RequestParam Long syntaxId) {

        final String email = firebaseAuthService.verifyAndGetEmail(jwt(token));
        likeSyntaxService.unlikeSyntax(email, syntaxId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/status")
    public ResponseEntity<LikeStatusDTO> getStatus(
            @RequestHeader("Authorization") String token,
            @RequestParam Long syntaxId) {

        final String email = firebaseAuthService.verifyAndGetEmail(jwt(token));
        boolean liked = likeSyntaxService.isLiked(email, syntaxId);
        long count = likeSyntaxService.countLikes(syntaxId);
        return ResponseEntity.ok(new LikeStatusDTO(liked, count));
    }
}
