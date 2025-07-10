package com.example.tech.repository;

import com.example.tech.entity.ArticleEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AdminRepository extends JpaRepository<ArticleEntity, Long> {
}
