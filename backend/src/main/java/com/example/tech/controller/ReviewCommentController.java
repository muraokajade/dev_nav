package com.example.tech.controller;

import com.example.tech.dto.ReviewCommentDTO;
import com.example.tech.dto.request.ReviewCommentRequest;
import com.example.tech.repository.UserRepository;
import com.example.tech.service.FirebaseAuthService;
import com.example.tech.service.ReviewCommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin("http://localhost:3000")
@RequiredArgsConstructor
@RequestMapping("/api/review-comments")
public class ReviewCommentController {

    private final FirebaseAuthService firebaseAuthService;
    private final ReviewCommentService reviewCommentService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<ReviewCommentDTO>> getAllComments(@RequestParam Long articleId)
    {
        List<ReviewCommentDTO> comments = reviewCommentService.getAllCommentsById(articleId);
        return ResponseEntity.ok(comments);
    }

    @PostMapping
    public ResponseEntity<?> postComment(@RequestHeader(name = "Authorization") String token,
                                         @RequestBody ReviewCommentRequest request
                                         )
    {
        String userEmail = firebaseAuthService.verifyAdminAndGetEmail(token);
        reviewCommentService.postComment(request,userEmail);
        return ResponseEntity.ok("コメントしました。");
    }
    @PutMapping("/{id}")
    public ResponseEntity<?> putComment(@RequestHeader(name = "Authorization") String token,
                                        @RequestBody ReviewCommentRequest request,
                                        @PathVariable Long id)
    {
        reviewCommentService.putComment(id, request);
        return ResponseEntity.ok("更新完了");
    }

}
