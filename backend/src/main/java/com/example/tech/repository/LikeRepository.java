package com.example.tech.repository;

import com.example.tech.dto.CalendarActionDTO;
import com.example.tech.entity.LikeEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface LikeRepository extends JpaRepository<LikeEntity,Long> {
    Boolean existsByUserIdAndArticleId(Long userId, Long articleId);

    Long countByArticleId(Long articleId);

    void deleteByUserIdAndArticleId(Long userId, Long articleId);

    int countByUserId(Long userId);

    @Query("""
            SELECT new com.example.tech.dto.CalendarActionDTO(
                DATE(l.createdAt), COUNT(l)
            )
            FROM LikeEntity l
            WHERE l.userId = :userId
                AND l.createdAt BETWEEN :start AND :end
            GROUP BY DATE(l.createdAt)
            """)
    List<CalendarActionDTO> findDailyLikesActions(@Param("userId") Long userId,
                                                  @Param("start") LocalDateTime start,
                                                  @Param("end") LocalDateTime end);
}
