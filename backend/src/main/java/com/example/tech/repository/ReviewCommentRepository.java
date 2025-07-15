package com.example.tech.repository;

import com.example.tech.dto.CalendarActionDTO;
import com.example.tech.entity.ReviewCommentEntity;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ReviewCommentRepository extends JpaRepository<ReviewCommentEntity,Long> {

    List<ReviewCommentEntity> findAllCommentsByArticleId(Long articleId);

    int countByUserId(Long userId);

    @Query("""
            SELECT new com.example.tech.dto.CalendarActionDTO(
                DATE(r.createdAt), COUNT(r)
            )
            FROM ReviewCommentEntity r
            WHERE r.userId = :userId
                AND r.createdAt BETWEEN :start AND :end
            GROUP BY DATE(r.createdAt)
            """)
    List<CalendarActionDTO> findDailyReviewCommentActions(@Param("userId") Long userId,
                                                          @Param("start") LocalDateTime start,
                                                          @Param("end") LocalDateTime end);

    List<ReviewCommentEntity> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
}
