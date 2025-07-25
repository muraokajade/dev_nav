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
}