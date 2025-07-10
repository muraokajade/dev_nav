package com.example.tech.service;

import com.example.tech.dto.request.ArticleRequest;
import com.example.tech.dto.request.SyntaxRequest;
import com.example.tech.entity.ArticleEntity;
import com.example.tech.entity.SyntaxEntity;
import com.example.tech.repository.AdminRepository;
import com.example.tech.repository.SyntaxRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.File;

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
}
