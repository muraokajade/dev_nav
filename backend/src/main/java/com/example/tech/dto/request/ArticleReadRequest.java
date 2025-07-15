package com.example.tech.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ArticleReadRequest {
    private Long articleId;
    private Long userId;
    private LocalDateTime readAt;
}
