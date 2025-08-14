package com.example.tech.api;

import com.example.tech.domain.*;

public record ThreadDto(Long id, TargetType type, Long refId, Category category) {}
