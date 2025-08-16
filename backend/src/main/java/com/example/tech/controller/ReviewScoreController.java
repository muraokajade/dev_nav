package com.example.tech.controller;

import com.example.tech.dto.ReviewScoreDTO;
import com.example.tech.dto.request.ReviewScoreRequest;
import com.example.tech.entity.ReviewScoreEntity;
import com.example.tech.entity.UserEntity;
import com.example.tech.enums.TargetType;
import com.example.tech.repository.UserRepository;
import com.example.tech.service.FirebaseAuthService;
import com.example.tech.service.ReviewScoreService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin("http://localhost:3000")
@RequiredArgsConstructor
@RequestMapping("/api/review-scores")
public class ReviewScoreController {

    private final FirebaseAuthService firebaseAuthService;
    private final ReviewScoreService reviewScoreService;
    private final UserRepository userRepository;

    @PostMapping("/{type}/{refId}")
    public ResponseEntity<?> postReviewScoreByType(
            @RequestHeader(name = "Authorization") String token,
            @PathVariable String type,
            @PathVariable Long refId,
            @RequestBody ReviewScoreRequest request
    ) {
        String userEmail = firebaseAuthService.verifyAdminAndGetEmail(token);
        TargetType targetType = TargetType.valueOf(type.toUpperCase());
        reviewScoreService.postReviewScoreForTarget(targetType, refId, request, userEmail);
        return ResponseEntity.ok("レビュー投稿完了");
    }
    @GetMapping("/{type}/{refId}")
    public ResponseEntity<List<ReviewScoreDTO>> getReviewScore(
            @PathVariable String type,
            @PathVariable Long refId
    ) {

        TargetType targetType = TargetType.valueOf((type.toUpperCase()));
        return ResponseEntity.ok(
                reviewScoreService.getReviewScores(targetType,refId)
        );
    }

    @PutMapping("/{type}/{refId}")
    public ResponseEntity<?> putReviewScoreByType(
            @RequestHeader(name = "Authorization") String token,
            @PathVariable String type,
            @PathVariable Long refId,
            @RequestBody ReviewScoreRequest request
    ) {
        TargetType targetType = TargetType.valueOf(type.toUpperCase());
        String userEmail = firebaseAuthService.verifyAdminAndGetEmail(token);
        reviewScoreService.updateReviewScoreForTarget(targetType, refId, request, userEmail);
        return ResponseEntity.ok("レビュー更新完了");
    }

    @GetMapping("/my/{type}/{refId}")
    public ResponseEntity<?> getMyReviewScore(
            @RequestHeader("Authorization") String token,
            @PathVariable String type,
            @PathVariable Long refId
    ) {
        String userEmail = firebaseAuthService.verifyAdminAndGetEmail(token);
        TargetType targetType = TargetType.valueOf(type.toUpperCase());

        return reviewScoreService.findMyScore(targetType, refId, userEmail)
                .map(entity -> {
                    Map<String, Object> body = new HashMap<>();
                    body.put("score", entity.getScore()); // doubleなのでnullにならない
                    return ResponseEntity.ok(body);
                })
                .orElseGet(() -> {
                    Map<String, Object> body = new HashMap<>();
                    body.put("score", null);              // ← ここでnullを安全に返せる
                    return ResponseEntity.ok(body);
                });
    }









    @PostMapping
    public ResponseEntity<?> postReviewScore(@RequestHeader(name = "Authorization")String token,
                                             @RequestBody ReviewScoreRequest request)
    {
        String userEmail = firebaseAuthService.verifyAdminAndGetEmail(token);
        reviewScoreService.postReviewScore(request, userEmail);
        return ResponseEntity.ok("レビュー投稿完了");

    }
    @PutMapping
    public ResponseEntity<?> putReviewScore(@RequestHeader(name = "Authorization")String token,
                                             @RequestBody ReviewScoreRequest request
                                            )
    {
        String userEmail = firebaseAuthService.verifyAdminAndGetEmail(token);
        reviewScoreService.putReviewScore(request, userEmail);
        return ResponseEntity.ok("レビュー更新完了");

    }

    @GetMapping
    public ResponseEntity<ReviewScoreDTO> getMyReviewScore(@RequestHeader(name = "Authorization")String token,
                                                              @RequestParam Long articleId)
    {
        String userEmail = firebaseAuthService.verifyAdminAndGetEmail(token);
        ReviewScoreDTO scoreDTO = reviewScoreService.getMyScore(articleId, userEmail);

        return ResponseEntity.ok(scoreDTO);

    }
    @GetMapping("/all")
    public ResponseEntity<List<ReviewScoreDTO>> getAllReviewScore(@RequestHeader(name = "Authorization")String token,
                                                                  @RequestParam Long articleId)
    {
        List<ReviewScoreDTO> scoreDTOList = reviewScoreService.getAllReviewScore(articleId);
        return ResponseEntity.ok(scoreDTOList);
    }
}
