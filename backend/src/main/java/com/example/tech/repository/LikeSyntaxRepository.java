package com.example.tech.repository;

import com.example.tech.entity.LikeSyntaxEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

public interface LikeSyntaxRepository extends JpaRepository<LikeSyntaxEntity, Long> {

    boolean existsByUserIdAndSyntaxId(Long userId, Long syntaxId);

    long countBySyntaxId(Long syntaxId);

    @Transactional
    void deleteByUserIdAndSyntaxId(Long userId, Long syntaxId);
}
