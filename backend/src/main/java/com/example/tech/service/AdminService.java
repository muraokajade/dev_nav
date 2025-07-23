package com.example.tech.service;

import com.example.tech.dto.SyntaxDTO;
import com.example.tech.dto.ArticleDTO;
import com.example.tech.dto.request.ArticleRequest;
import com.example.tech.dto.request.SyntaxRequest;
import com.example.tech.entity.ArticleEntity;
import com.example.tech.entity.SyntaxEntity;
import com.example.tech.entity.UserEntity;
import com.example.tech.repository.AdminRepository;
import com.example.tech.repository.ArticleRepository;
import com.example.tech.repository.SyntaxRepository;
import com.example.tech.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {
    private final AdminRepository adminRepository;
    private final SyntaxRepository syntaxRepository;
    private final UserRepository userRepository;
    private final ArticleRepository articleRepository;



    public void postArticles(ArticleRequest request, String adminEmail, String imageUrl) {
        ArticleEntity entity = new ArticleEntity();

        UserEntity user = userRepository.findUserByEmail(adminEmail)
                        .orElseThrow(() -> new RuntimeException("ユーザーが見つかりません。"));

        entity.setSlug(request.getSlug());
        entity.setTitle(request.getTitle());
        entity.setUserEmail(adminEmail);
        entity.setUser(user);
        entity.setCategory(request.getCategory());
        entity.setContent(request.getContent());
        entity.setImageUrl(imageUrl);
        entity.setPublished(true);
        adminRepository.save(entity);

    }

    public void postSyntax(SyntaxRequest request, String adminEmail) {
        SyntaxEntity entity = new SyntaxEntity();
        entity.setSlug(request.getSlug());
        entity.setTitle(request.getTitle());
        entity.setUserEmail(adminEmail);
        entity.setCategory(request.getCategory());
        entity.setContent(request.getContent());
        entity.setPublished(true);
        syntaxRepository.save(entity);
    }

    public List<ArticleDTO> getAllArticles() {
        List<ArticleEntity> entities = adminRepository.findAll();
        return entities.stream().map(this::convertToArticleDTO).toList();
    }


    public List<SyntaxDTO> getAllSyntax() {
        List<SyntaxEntity> entities = syntaxRepository.findAll();
        return entities.stream().map(entity-> new SyntaxDTO(
                entity.getId(),
                entity.getSlug(),
                entity.getTitle(),
                entity.getUserEmail(),
                entity.getUser() != null ? entity.getUser().getDisplayName() : "不明",
                entity.getCategory(),
                entity.getContent(),
                entity.getCreatedAt(),
                entity.getUpdatedAt(),
                entity.isPublished()

        )).toList();
    }


    public void togglePublished(String slug) {
        ArticleEntity entity = adminRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("記事が見つかりません。"));
        entity.setPublished(!entity.published());//boolean反転

        adminRepository.save(entity);
    }

    public void toggleSyntaxPublished(String slug) {
        SyntaxEntity entity = syntaxRepository.findBySlug(slug)
                .orElseThrow(()-> new RuntimeException("項目が見つかりません"));

        entity.setPublished(!entity.published());

        syntaxRepository.save(entity);
    }

    public ArticleDTO getArticleById(Long id) {
        ArticleEntity entity = adminRepository.findArticleById(id)
                .orElseThrow(() -> new RuntimeException("記事が見つかりません。"));

        return convertToArticleDTO(entity);
    }
    private ArticleDTO convertToArticleDTO(ArticleEntity entity) {
        return new ArticleDTO(
                entity.getId(),
                entity.getSlug(),
                entity.getTitle(),
                entity.getUserEmail(),
                entity.getUser().getDisplayName(),
                entity.getCategory(),
                entity.getContent(),
                entity.getImageUrl(),
                entity.getCreatedAt(),
                entity.getUpdatedAt(),
                entity.isPublished()
        );
    }
    private SyntaxDTO convertToSyntaxDTO(SyntaxEntity entity) {
        return new SyntaxDTO(
                entity.getId(),
                entity.getSlug(),
                entity.getTitle(),
                entity.getUserEmail(),
                entity.getUser() != null ? entity.getUser().getDisplayName() : "不明",
                entity.getCategory(),
                entity.getContent(),
                entity.getCreatedAt(),
                entity.getUpdatedAt(),
                entity.isPublished()
        );
    }

    public SyntaxDTO getSyntaxById(Long id) {
        SyntaxEntity entity = syntaxRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("投稿がありません。"));

        return convertToSyntaxDTO(entity);
    }

    public void putArticle(Long id, ArticleRequest request, String adminEmail, String imageUrl) {
        ArticleEntity entity = adminRepository.findArticleById(id)
                .orElseThrow(() ->new RuntimeException("見つかりません。"));

        entity.setSlug(request.getSlug());
        entity.setTitle(request.getTitle());
        entity.setUserEmail(adminEmail);
        entity.setCategory(request.getCategory());
        entity.setContent(request.getContent());
        entity.setImageUrl(imageUrl);
        entity.setPublished(true);
        adminRepository.save(entity);
    }

    public void putSyntax(Long id, SyntaxRequest request, String adminEmail) {
        SyntaxEntity entity = syntaxRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("見つかりません。"));

        entity.setSlug(request.getSlug());
        entity.setTitle(request.getTitle());
        entity.setUserEmail(adminEmail);
        entity.setCategory(request.getCategory());

        syntaxRepository.save(entity);
    }

    public void deleteById(Long id) {
        ArticleEntity entity = articleRepository.findById(id)
                .orElseThrow(() ->new RuntimeException("記事が見つかりません。"));

        adminRepository.deleteById(id);
    }
}
