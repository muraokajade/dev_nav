package com.example.tech.repository;

import com.example.tech.projection.ContentBrief;
import com.example.tech.dto.ArticleDTO;
import com.example.tech.entity.ArticleEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface ArticleRepository extends JpaRepository<ArticleEntity,Long> {
    Page<ArticleEntity> findByPublishedTrue(Pageable pageable);

    int countByUserId(Long userId);

    @Query("SELECT new com.example.tech.dto.ArticleDTO(a.id, a.title, a.userEmail,a.user.displayName) " +
            "FROM LikeEntity l JOIN l.article a WHERE l.user.id = :userId")
    List<ArticleDTO> findLikedArticlesByUserId(@Param("userId") Long userId);

    @Query("""
      select a.id as id, a.title as title, a.slug as slug
      from ArticleEntity a
      where a.id in :ids
    """)
    List<ContentBrief> findBriefsByIdIn(@Param("ids") Collection<Long> ids);


}
