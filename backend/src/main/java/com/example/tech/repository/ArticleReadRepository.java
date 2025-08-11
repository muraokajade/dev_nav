package com.example.tech.repository;

import com.example.tech.entity.ArticleReadEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ArticleReadRepository extends JpaRepository<ArticleReadEntity, Long> {
    Boolean existsByUserIdAndArticleId(Long userId, Long articleId);

    int countByUserId(Long userId);

    List<ArticleReadEntity> findByUserIdOrderByReadAtDesc(Long userId, Pageable pageable);

    @Query("SELECT ar.article.id FROM ArticleReadEntity ar WHERE ar.userId = :userId")
    Page<Long> findAllArticleIdByUserId(@Param("userId") Long userId, Pageable pageable);

    // 例: JPAリポジトリで用意
    boolean existsByUserIdAndArticle_Id(Long userId, Long articleId);

    Optional<ArticleReadEntity> findByUserIdAndArticle_Id(Long userId, Long articleId);
}
