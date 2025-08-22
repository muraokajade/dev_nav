package com.example.tech.service;

import com.example.tech.dto.SyntaxDTO;
import com.example.tech.entity.SyntaxEntity;
import com.example.tech.repository.SyntaxRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SyntaxService {
    private final SyntaxRepository syntaxRepository;
    public Page<SyntaxDTO> getAllArticles(Pageable pageable) {
        Page<SyntaxEntity> entities = syntaxRepository.findAll(pageable);
        return entities.map(this::convertToDTO);
    }
    private SyntaxDTO convertToDTO(SyntaxEntity entity) {
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

    public SyntaxDTO findById(Long id) {
        SyntaxEntity syntax = syntaxRepository.findByIdWithUser(id)
                .orElseThrow(() -> new RuntimeException("記事が見つかりません。"));

        return convertToDTO(syntax);
    }
}
