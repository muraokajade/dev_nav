package com.example.tech.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SyntaxDTO {
    private Long id;
    private String slug;
    private String title;
    private String userEmail;
    private String sectionTitle;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private boolean published;
}
