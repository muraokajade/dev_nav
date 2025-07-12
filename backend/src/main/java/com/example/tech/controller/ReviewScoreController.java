package com.example.tech.controller;

import com.example.tech.dto.ReviewScoreDTO;
import com.example.tech.dto.request.ReviewScoreRequest;
import com.example.tech.entity.ReviewScoreEntity;
import com.example.tech.repository.UserRepository;
import com.example.tech.service.FirebaseAuthService;
import com.example.tech.service.ReviewScoreService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin("http://localhost:3000")
@RequiredArgsConstructor
@RequestMapping("/api/review-scores")
public class ReviewScoreController {

    private final FirebaseAuthService firebaseAuthService;
    private final ReviewScoreService reviewScoreService;
    private final UserRepository userRepository;
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
