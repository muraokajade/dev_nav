package com.example.tech.dto;

import jakarta.persistence.Column;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProcedureDTO {
    private Long id;
    private String stepNumber;
    private String slug;
    private String title;
    private String userEmail;
    private String authorName;  // ←追加
    private String category;
    private String content;
    private String imageUrl;
    private boolean published;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

}
