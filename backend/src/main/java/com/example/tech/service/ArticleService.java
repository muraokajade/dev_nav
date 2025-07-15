package com.example.tech.service;

import com.example.tech.dto.ArticleDTO;
import com.example.tech.entity.ArticleEntity;
import com.example.tech.entity.UserEntity;
import com.example.tech.repository.ArticleReadRepository;
import com.example.tech.repository.ArticleRepository;
import com.example.tech.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ArticleService {

    private final ArticleRepository articleRepository;
    private final UserRepository userRepository;
    private final ArticleReadRepository articleReadRepository;
    public List<ArticleDTO> getAllArticles() {
        List<ArticleEntity> entities = articleRepository.findByPublishedTrue();
        return entities.stream().map(this::convertToDTO).toList();
    }

    private ArticleDTO convertToDTO(ArticleEntity entity) {
        return new ArticleDTO(
                entity.getId(),
                entity.getSlug(),
                entity.getTitle(),
                entity.getUserEmail(),
                entity.getSectionTitle(),
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
                entity.getSectionTitle(),
                entity.getContent(),
                entity.getImageUrl(),
                entity.getCreatedAt(),
                entity.getUpdatedAt(),
                entity.isPublished()
        );
    }


    public List<Long> getReadArticleIds(String userEmail) {
        UserEntity user = userRepository.findUserByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("ユーザーが見つかりません。"));

        Long userId = user.getId();

        return articleReadRepository.findAllArticleIdByUserId(userId);
    }
}
