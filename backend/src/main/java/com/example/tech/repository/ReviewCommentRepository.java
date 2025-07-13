package com.example.tech.repository;

import com.example.tech.entity.ReviewCommentEntity;
import com.example.tech.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewCommentRepository extends JpaRepository<ReviewCommentEntity,Long> {

    List<ReviewCommentEntity> findAllCommentsByArticleId(Long articleId);

    int countByUserId(Long userId);
}
