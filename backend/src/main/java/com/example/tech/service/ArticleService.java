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

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

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
                entity.getContent(),
                entity.getImageUrl(),
                entity.getCreatedAt(),
                entity.getUpdatedAt(),
                entity.isPublished()
        );
    }


    public Page<Long> getReadArticleIds(String userEmail,Pageable pageable) {
        UserEntity user = userRepository.findUserByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("ユーザーが見つかりません。"));

        Long userId = user.getId();

        return articleReadRepository.findAllArticleIdByUserId(userId,pageable);
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
