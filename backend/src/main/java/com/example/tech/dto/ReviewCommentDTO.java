package com.example.tech.dto;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ReviewCommentDTO {
    private Long id;
    private Long userId;
    private Long articleId;
    private String comment;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
