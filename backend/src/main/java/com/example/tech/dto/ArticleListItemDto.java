// src/main/java/com/example/tech/dto/ArticleListItemDto.java
package com.example.tech.dto;

import java.time.LocalDateTime;

public record ArticleListItemDto(
        Long id,
        String slug,
        String title,
        String authorName,
        LocalDateTime createdAt,
        String summary,     // カードに要るなら残す。不要なら削る
        String imageUrl     // 同上
) {}
