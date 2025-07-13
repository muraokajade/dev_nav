package com.example.tech.repository;

import com.example.tech.entity.LikeEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LikeRepository extends JpaRepository<LikeEntity,Long> {
    Boolean existsByUserIdAndArticleId(Long userId, Long articleId);

    Long countByArticleId(Long articleId);

    void deleteByUserIdAndArticleId(Long userId, Long articleId);
}
