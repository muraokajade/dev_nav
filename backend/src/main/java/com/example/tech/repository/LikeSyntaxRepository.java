package com.example.tech.repository;

import com.example.tech.entity.LikeSyntaxEntity;
import com.example.tech.entity.SyntaxEntity;
import com.example.tech.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LikeSyntaxRepository extends JpaRepository<LikeSyntaxEntity, Long> {
    boolean existsByUserAndSyntax(UserEntity user, SyntaxEntity syntax);
    long countBySyntax(SyntaxEntity syntax);
}

