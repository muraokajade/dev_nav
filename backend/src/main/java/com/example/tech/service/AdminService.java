package com.example.tech.service;

import com.example.tech.dto.SyntaxDTO;
import com.example.tech.dto.ArticleDTO;
import com.example.tech.dto.request.ArticleRequest;
import com.example.tech.dto.request.SyntaxRequest;
import com.example.tech.entity.ArticleEntity;
import com.example.tech.entity.SyntaxEntity;
import com.example.tech.repository.AdminRepository;
import com.example.tech.repository.SyntaxRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {
    private final AdminRepository adminRepository;
    private final SyntaxRepository syntaxRepository;
    public void postArticles(ArticleRequest request, String adminEmail, String imageUrl) {
        ArticleEntity entity = new ArticleEntity();

        entity.setSlug(request.getSlug());
        entity.setTitle(request.getTitle());
        entity.setUserEmail(adminEmail);
        entity.setSectionTitle(request.getSectionTitle());
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
        entity.setSectionTitle(request.getSectionTitle());
        syntaxRepository.save(entity);
    }

    public List<ArticleDTO> getAllArticles() {
        List<ArticleEntity> entities = adminRepository.findAll();
        return entities.stream().map(this::convertToArticleDTO).toList();
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

    public List<SyntaxDTO> getAllSyntax() {
        List<SyntaxEntity> entities = syntaxRepository.findAll();
        return entities.stream().map(entity-> new SyntaxDTO(
                entity.getId(),
                entity.getSlug(),
                entity.getTitle(),
                entity.getUserEmail(),
                entity.getSectionTitle()
        )).toList();
    }


}
