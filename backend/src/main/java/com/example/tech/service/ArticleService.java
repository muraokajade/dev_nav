package com.example.tech.service;

import com.example.tech.dto.ArticleDTO;
import com.example.tech.entity.ArticleEntity;
import com.example.tech.repository.ArticleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ArticleService {

    private final ArticleRepository articleRepository;
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
}
