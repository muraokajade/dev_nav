package com.example.tech.controller;

import com.example.tech.dto.request.LikeRequest;
import com.example.tech.dto.response.LikeStatusResponse;
import com.example.tech.service.FirebaseAuthService;
import com.example.tech.service.LikeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin("http://localhost:3000")
@RequiredArgsConstructor
@RequestMapping("/api/likes")
public class LikeController {

    private final LikeService likeService;
    private final FirebaseAuthService firebaseAuthService;
    @PostMapping
    public ResponseEntity<?> registerLike(@RequestHeader(name = "Authorization")String token,
                                          @RequestBody LikeRequest request)
    {
        String userEmail = firebaseAuthService.verifyAdminAndGetEmail(token);
        likeService.registerLike(userEmail, request.getArticleId());
        return ResponseEntity.ok("いいね!");
    }
    @DeleteMapping("/{articleId}")
    public ResponseEntity<?> deleteLike(@RequestHeader(name = "Authorization")String token,
                                        @PathVariable Long articleId)
    {
        String userEmail = firebaseAuthService.verifyAdminAndGetEmail(token);
        likeService.deleteLike(userEmail, articleId);
        return ResponseEntity.ok("よくないね");
    }

    @GetMapping("/status")
    public LikeStatusResponse getStatusResponse(@RequestHeader(name = "Authorization")String token,
                                                @RequestParam Long articleId)
    {
        String userEmail = firebaseAuthService.verifyAndGetEmail(token);
        boolean liked = likeService.findByUserIdAndArticleId(userEmail, articleId);
        Long count = likeService.countByArticleId(articleId);
        return new LikeStatusResponse(liked,count);
    }

    @GetMapping("/count")
    public Long getLikeCount(@RequestParam Long articleId)
    {
        return likeService.countOnlyByArticleId(articleId);
    }
}
