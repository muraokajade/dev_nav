package com.example.tech.controller;

import com.example.tech.dto.ArticleDTO;
import com.example.tech.repository.UserRepository;
import com.example.tech.service.ArticleService;
import com.example.tech.service.FirebaseAuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
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
    public ResponseEntity<Page<ArticleDTO>> getAllArticles(@RequestParam int page,
                                                           @RequestParam int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ArticleDTO> articleDTOS = articleService.getAllArticles(pageable);
        return ResponseEntity.ok(articleDTOS);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ArticleDTO> getArticleById(@PathVariable Long id) {
        ArticleDTO article = articleService.getArticleById(id);

        return ResponseEntity.ok(article);
    }
    @GetMapping("/read")
    public ResponseEntity<Page<Long>> getReadArticleIds(@RequestHeader (name = "Authorization") String token,
                                                        @RequestParam int page,
                                                        @RequestParam int size)
    {
        Pageable pageable = PageRequest.of(page, size);
        String userEmail = firebaseAuthService.verifyAndGetEmail(token);
        Page<Long> readArticleIds = articleService.getReadArticleIds(userEmail, pageable);

        return ResponseEntity.ok(readArticleIds);
    }
    @GetMapping("/liked")
    public ResponseEntity<List<ArticleDTO>> geLikedArticles(@RequestHeader(name = "Authorization") String token)
    {
        String userEmail = firebaseAuthService.verifyAndGetEmail(token);
        List<ArticleDTO> likeArticles = articleService.findLikedArticlesByUser(userEmail);
        return ResponseEntity.ok(likeArticles);
    }
    @GetMapping("/read/status")
    public Boolean isReadArticle(@RequestHeader(name = "Authorization") String token,
                                 @RequestParam Long articleId)

    {
        String userEmail = firebaseAuthService.verifyAndGetEmail(token);
        return articleService.isReadArticleById(userEmail, articleId);
    }

}
