package com.example.tech.controller;

import com.example.tech.dto.ArticleDTO;
import com.example.tech.service.ArticleService;
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

}
