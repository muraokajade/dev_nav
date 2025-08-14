package com.example.tech.api;

import java.time.LocalDateTime;

public record MessageDto(
        Long id,
        Long threadId,
        String userId,
        String body,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
