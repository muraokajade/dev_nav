package com.example.tech.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ReviewScoreDTO {
    private Long id;
    private Long userId;
    private Long articleId;
    private double score;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
