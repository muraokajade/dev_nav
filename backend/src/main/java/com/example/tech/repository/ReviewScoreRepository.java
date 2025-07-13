package com.example.tech.repository;

import com.example.tech.entity.ReviewScoreEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewScoreRepository extends JpaRepository<ReviewScoreEntity,Long> {

    Optional<ReviewScoreEntity> findByUserIdAndArticleId(Long userId, Long articleId);

    List<ReviewScoreEntity> findScoresByArticleId(Long articleId);

    int countByUserId(Long userId);
}
