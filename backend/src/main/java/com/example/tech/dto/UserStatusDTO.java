package com.example.tech.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserStatusDTO {
    private Long articlesRead;
    private Long reviews;
    private Long likes;
    private Long comments;
    private Long level;
    private Long expPercent;
    private List<ArticleDTO> likedArticles;
}

