package com.example.tech.repository;

import com.example.tech.entity.ArticleEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ArticleRepository extends JpaRepository<ArticleEntity,Long> {
    List<ArticleEntity> findByPublishedTrue();
}
