package com.example.tech.repository;

import com.example.tech.entity.SyntaxEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SyntaxRepository extends JpaRepository<SyntaxEntity,Long> {
}
