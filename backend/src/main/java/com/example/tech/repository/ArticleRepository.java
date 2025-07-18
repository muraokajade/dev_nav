package com.example.tech.repository;

import com.example.tech.dto.ArticleDTO;
import com.example.tech.entity.ArticleEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ArticleRepository extends JpaRepository<ArticleEntity,Long> {
    List<ArticleEntity> findByPublishedTrue();

    int countByUserId(Long userId);

    @Query("SELECT new com.example.tech.dto.ArticleDTO(a.id, a.title, a.userEmail) " +
            "FROM LikeEntity l JOIN l.article a WHERE l.user.id = :userId")
    List<ArticleDTO> findLikedArticlesByUserId(@Param("userId") Long userId);


}
