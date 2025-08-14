package com.example.tech.service;

import com.example.tech.domain.Category;
import com.example.tech.domain.TargetType;
import com.example.tech.domain.ThreadEntity;
import com.example.tech.repository.ThreadRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ThreadService {
    private final ThreadRepository threadRepository;

    public ThreadEntity getOrCreate(TargetType type, Long refId, Category category)
    {
        return threadRepository.findByTargetTypeAndRefIdAndCategory(type, refId, category)
                .orElseGet(() -> {
                    try {
                        return threadRepository.save(
                                ThreadEntity.builder()
                                        .targetType(type)
                                        .refId(refId)
                                        .category(category)
                                        .build()
                        );
                    } catch (DataIntegrityViolationException e) {
                        return threadRepository.findByTargetTypeAndRefIdAndCategory(type, refId, category)
                                .orElseThrow();
                    }
                });
    }
}
