package com.example.tech.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserStatusDTO {
    private int articlesRead;
    private int reviews;
    private int likes;
    private int comments;
    private int level;
    private int expPercent;
    private List<ArticleDTO> likedArticles;
    // 必要に応じて「いいねした記事一覧」など追加
}

