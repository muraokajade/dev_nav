package com.example.tech.service;

import com.example.tech.dto.ArticleDTO;
import com.example.tech.entity.ArticleEntity;
import com.example.tech.entity.UserEntity;
import com.example.tech.repository.ArticleReadRepository;
import com.example.tech.repository.ArticleRepository;
import com.example.tech.repository.LikeRepository;
import com.example.tech.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ArticleService {

    private final ArticleRepository articleRepository;
    private final UserRepository userRepository;
    private final ArticleReadRepository articleReadRepository;
    private final LikeRepository likeRepository;
    public Page<ArticleDTO> getAllArticles(Pageable pageable) {
        Page<ArticleEntity> entities = articleRepository.findByPublishedTrue(pageable);
        return entities.map(this::convertToDTO);
    }

    private ArticleDTO convertToDTO(ArticleEntity entity) {
        return new ArticleDTO(
                entity.getId(),
                entity.getSlug(),
                entity.getTitle(),
                entity.getUserEmail(),
                entity.getUser() != null ? entity.getUser().getDisplayName() : "不明",
                entity.getCategory(),
                entity.getSummary(),
                entity.getContent(),
                entity.getImageUrl(),
                entity.getCreatedAt(),
                entity.getUpdatedAt(),
                entity.isPublished()
        );
    }

    public ArticleDTO getArticleById(Long id) {
        ArticleEntity entity = articleRepository.findById(id)
                .orElseThrow(()-> new RuntimeException("記事が見つかりません。"));

        return convertToArticleDTO(entity);
    }
    private ArticleDTO convertToArticleDTO(ArticleEntity entity) {
        return new ArticleDTO(
                entity.getId(),
                entity.getSlug(),
                entity.getTitle(),
                entity.getUserEmail(),
                entity.getUser() != null ? entity.getUser().getDisplayName() : "不明",
                entity.getCategory(),
                entity.getSummary(),
                entity.getContent(),
                entity.getImageUrl(),
                entity.getCreatedAt(),
                entity.getUpdatedAt(),
                entity.isPublished()
        );
    }

    // Service
    @Transactional(readOnly = true)
    public Page<Long> getReadArticleIds(String userEmail, Pageable pageable) {
        // 未ログイン/空文字 → 空ページで200
        if (userEmail == null || userEmail.isBlank()) {
            return Page.empty(pageable); // 2.5未満なら new PageImpl<>(List.of(), pageable, 0)
        }

        String normalized = userEmail.trim().toLowerCase(Locale.ROOT);

        // ユーザー検索（なければ空ページ）
        Optional<UserEntity> opt = userRepository.findUserByEmail(normalized);
        if (opt.isEmpty()) {
            return Page.empty(pageable);
        }

        Long userId = opt.get().getId();

        // 既読記事IDのページング取得
        return articleReadRepository.findAllArticleIdByUserId(userId, pageable);
    }


    public List<ArticleDTO> findLikedArticlesByUser(String userEmail) {
        LocalDateTime start = LocalDate.now().atStartOfDay();
        LocalDateTime end = LocalDate.now().atTime(LocalTime.MAX);
        UserEntity user = userRepository.findUserByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("ユーザーが見つかりません。"));
        Long userId = user.getId();

        List<Long> articleIds = likeRepository.findArticleIdsByUserId(userId,start,end);
        List<ArticleEntity> articleEntities = articleRepository.findAllById(articleIds);

        return articleEntities
                .stream()
                .map(this::convertToDTO)
                .toList();
    }

    public Boolean isReadArticleById(String userEmail, Long articleId) {
        UserEntity user = userRepository.findUserByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("ユーザーが見つかりません。"));

        Long userId = user.getId();

        return articleReadRepository.existsByUserIdAndArticle_Id(userId,articleId);
    }
}
