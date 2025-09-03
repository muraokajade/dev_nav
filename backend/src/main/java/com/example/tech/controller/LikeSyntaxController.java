package com.example.tech.controller;

import com.example.tech.dto.LikeStatusDTO;
import com.example.tech.service.LikeSyntaxService;
import com.example.tech.service.FirebaseAuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/syntaxes/likes")
@RequiredArgsConstructor
public class LikeSyntaxController {

    private final LikeSyntaxService likeSyntaxService;
    private final FirebaseAuthService firebaseAuthService;

    @PostMapping
    public ResponseEntity<Void> likeSyntax(@RequestHeader("Authorization") String token,
                                           @RequestParam Long syntaxId) {
        String email = firebaseAuthService.verifyAndGetEmail(token);
        likeSyntaxService.likeSyntax(email, syntaxId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{syntaxId}")
    public ResponseEntity<Void> unlikeSyntax(@RequestHeader("Authorization") String token,
                                             @PathVariable Long syntaxId) {
        String email = firebaseAuthService.verifyAndGetEmail(token);
        likeSyntaxService.unlikeSyntax(email, syntaxId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/status")
    public ResponseEntity<LikeStatusDTO> getStatus(@RequestHeader("Authorization") String token,
                                                   @RequestParam Long syntaxId) {
        String email = firebaseAuthService.verifyAndGetEmail(token);
        boolean liked = likeSyntaxService.isLiked(email, syntaxId);
        long count = likeSyntaxService.countLikes(syntaxId);
        return ResponseEntity.ok(new LikeStatusDTO(liked, count));
    }
}
