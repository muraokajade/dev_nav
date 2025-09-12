package com.example.tech.service;

import com.example.tech.dto.ArticleDTO;
import com.example.tech.dto.SyntaxDTO;
import com.example.tech.dto.request.ArticleRequest;
import com.example.tech.dto.request.SyntaxRequest;
import com.example.tech.entity.ArticleEntity;
import com.example.tech.entity.SyntaxEntity;
import com.example.tech.entity.UserEntity;
import com.example.tech.repository.AdminRepository;
import com.example.tech.repository.ArticleRepository;
import com.example.tech.repository.SyntaxRepository;
import com.example.tech.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

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
        entity.setSummary(request.getSummary());
        entity.setImageUrl(imageUrl);
        entity.setPublished(true);
        articleRepository.save(entity);

    }

    @Transactional
    public void postSyntax(SyntaxRequest request, String adminEmail) {
        SyntaxEntity entity = new SyntaxEntity();
        UserEntity user = userRepository.findUserByEmail(adminEmail)
                        .orElseThrow(() -> new RuntimeException("ユーザーが存在しません。"));
        entity.setSlug(request.getSlug());
        entity.setTitle(request.getTitle());
        entity.setUserEmail(adminEmail);
        entity.setDisplayName(user.getDisplayName());
        entity.setCategory(request.getCategory());
        entity.setSummary(request.getSummary());
        entity.setContent(request.getContent());
        entity.setPublished(true);
        syntaxRepository.saveAndFlush(entity); // ← ここで即INSERTさせて例外を表面化
    }

    public Page<ArticleDTO> getAllArticles(Pageable pageable) {
        Page<ArticleEntity> entities = articleRepository.findAll(pageable);
        return entities.map(this::convertToArticleDTO);
    }


    public Page<SyntaxDTO> getAllSyntax(Pageable pageable) {
        Page<SyntaxEntity> entities = syntaxRepository.findAll(pageable);
        return entities.map(this::convertToSyntaxDTO);
    }


    @Transactional
    public void togglePublished(long id) {
        ArticleEntity a = articleRepository.findById(id).orElseThrow();
        a.setPublished(!a.isPublished());

        // ★ ログ/監査で getUser().getDisplayName() を直叩きしない
        String author = resolveAuthor(a);

        articleRepository.save(a);
    }


    private static String resolveAuthor(ArticleEntity e) {
        UserEntity u = e.getUser();
        if (e.getAuthorName() != null && !e.getAuthorName().isBlank()) return e.getAuthorName();
        if (u != null && u.getDisplayName() != null && !u.getDisplayName().isBlank()) return u.getDisplayName();
        if (e.getUserEmail() != null && !e.getUserEmail().isBlank()) return e.getUserEmail();
        return "不明";
    }


    public void toggleSyntaxPublished(Long id) {
        SyntaxEntity entity = syntaxRepository.findById(id)
                .orElseThrow(()-> new RuntimeException("項目が見つかりません"));

        entity.setPublished(!entity.published());

        syntaxRepository.save(entity);
    }

    public ArticleDTO getArticleById(Long id) {
        ArticleEntity entity = adminRepository.findArticleById(id)
                .orElseThrow(() -> new RuntimeException("記事が見つかりません。"));

        return convertToArticleDTO(entity);
    }
    // AdminService.java
    private static boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }

    private static String firstNonBlank(String... arr) {
        if (arr == null) return "不明";
        for (String s : arr) {
            if (!isBlank(s)) return s;
        }
        return "不明";
    }

    private ArticleDTO convertToArticleDTO(ArticleEntity e) {
        if (e == null) throw new IllegalArgumentException("ArticleEntity is null");

        // ★ 1回だけ呼ぶ（nullの可能性あり）
        UserEntity u = e.getUser();

        // ★ ここで絶対にチェーン呼び出しをしない
        String author = firstNonBlank(
                e.getAuthorName(),
                (u != null ? u.getDisplayName() : null),
                e.getUserEmail()
        );

        return new ArticleDTO(
                e.getId(),
                e.getSlug(),
                e.getTitle(),
                e.getUserEmail(), // submitterEmail等の意味ならそのまま
                author,
                e.getCategory(),
                e.getSummary(),
                e.getContent(),
                e.getImageUrl(),
                e.getCreatedAt(),
                e.getUpdatedAt(),
                e.isPublished()
        );
    }

    private SyntaxDTO convertToSyntaxDTO(SyntaxEntity entity) {
        return new SyntaxDTO(
                entity.getId(),
                entity.getSlug(),
                entity.getTitle(),
                entity.getUserEmail(),
                entity.getUser() != null ? entity.getUser().getDisplayName() : "不明",
                entity.getDisplayName(),
                entity.getCategory(),
                entity.getSummary(),
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
        entity.setSummary(request.getSummary());
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
        entity.setSummary(request.getSummary());
        entity.setContent(request.getContent());
        entity.setPublished(true);

        syntaxRepository.save(entity);
    }

    public void deleteById(Long id) {
        ArticleEntity entity = articleRepository.findById(id)
                .orElseThrow(() ->new RuntimeException("記事が見つかりません。"));

        articleRepository.deleteById(id);
    }

    public void deleteSyntaxById(Long id) {
        SyntaxEntity entity = syntaxRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("記事が見つかりません。"));

        syntaxRepository.deleteById(id);
    }
}
