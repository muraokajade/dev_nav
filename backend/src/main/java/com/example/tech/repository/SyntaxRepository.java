package com.example.tech.repository;

import com.example.tech.entity.SyntaxEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SyntaxRepository extends JpaRepository<SyntaxEntity,Long> {
    Optional<SyntaxEntity> findBySlug(String slug);
}
