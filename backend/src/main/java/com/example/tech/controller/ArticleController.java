package com.example.tech.controller;

import com.example.tech.dto.ArticleDTO;
import com.example.tech.repository.UserRepository;
import com.example.tech.service.ArticleService;
import com.example.tech.service.FirebaseAuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin("http://localhost:3000")
@RequiredArgsConstructor
@RequestMapping("/api/articles")
public class ArticleController {

    private final ArticleService articleService;
    private final FirebaseAuthService firebaseAuthService;
    private final UserRepository userRepository;
    @GetMapping
    public ResponseEntity<List<ArticleDTO>> getAllArticles() {
        List<ArticleDTO> articleDTOS = articleService.getAllArticles();
        return ResponseEntity.ok(articleDTOS);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ArticleDTO> getArticleById(@PathVariable Long id) {
        ArticleDTO article = articleService.getArticleById(id);

        return ResponseEntity.ok(article);
    }
    @GetMapping("/read/all")
    public ResponseEntity<List<Long>> getReadArticleIds(@RequestHeader (name = "Authorization") String token)
    {
        String userEmail = firebaseAuthService.verifyAndGetEmail(token);
        List<Long> readArticleIds = articleService.getReadArticleIds(userEmail);

        return ResponseEntity.ok(readArticleIds);
    }
    @GetMapping("/liked")
    public ResponseEntity<List<ArticleDTO>> geLikedArticles(@RequestHeader(name = "Authorization") String token)
    {
        String userEmail = firebaseAuthService.verifyAndGetEmail(token);
        List<ArticleDTO> likeArticles = articleService.findLikedArticlesByUser(userEmail);
        return ResponseEntity.ok(likeArticles);
    }

}
