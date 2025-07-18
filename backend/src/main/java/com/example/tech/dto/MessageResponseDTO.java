package com.example.tech.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MessageResponseDTO {
    private Long id;
    private Long articleId;
    private String title;
    private String question;
    private String displayName;
    private String response;
    private String adminEmail;
    private boolean closed;
    private LocalDateTime createdAt;
}
