package com.example.tech.repository;

import com.example.tech.dto.CalendarActionDTO;
import com.example.tech.entity.ReviewScoreEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewScoreRepository extends JpaRepository<ReviewScoreEntity,Long> {

    //Optional<ReviewScoreEntity> findByUserIdAndArticleId(Long userId, Long articleId);

    List<ReviewScoreEntity> findScoresByArticleId(Long articleId);

    int countByUserId(Long userId);

    @Query("""
            SELECT new com.example.tech.dto.CalendarActionDTO(
                    DATE(r.createdAt), COUNT(r)
            )
            FROM ReviewScoreEntity r
            WHERE r.userId = :userId
                AND r.createdAt BETWEEN :start AND :end
            GROUP BY DATE(r.createdAt)
            """)
    List<CalendarActionDTO> findDailyReviewScoreActions(
            @Param("userId") Long userId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);

    Optional<ReviewScoreEntity> findByUserIdAndArticle_Id(Long userId, Long articleId);
}
