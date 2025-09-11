package com.example.tech.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ArticleDTO {
    private Long id;
    private String slug;
    private String title;
    private String userEmail;
    private String authorName;  // ←追加
    private String category;
    private String summary;
    private String content;
    private String imageUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private boolean published;
    public ArticleDTO(Long id, String title, String userEmail,String authorName) {
        this.id = id;
        this.title = title;
        this.userEmail = userEmail;
        this.authorName = authorName;
    }

    // ArticleDTO に追加（順序はJPQLと完全一致させる）
    public ArticleDTO(
            Long id,
            String slug,
            String title,
            String summary,
            String imageUrl,
            String authorName,
            String category,
            LocalDateTime createdAt,
            LocalDateTime updatedAt,
            boolean published,
            String userEmail // ←必要なら最後に
    ) {
        this.id = id;
        this.slug = slug;
        this.title = title;
        this.summary = summary;
        this.imageUrl = imageUrl;
        this.authorName = authorName;
        this.category = category;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.published = published;
        this.userEmail = userEmail;
    }

}