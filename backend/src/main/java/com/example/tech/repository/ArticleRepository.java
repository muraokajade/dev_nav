package com.example.tech.repository;

import com.example.tech.dto.ArticleListItemDto;
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

    // 一覧（公開・新着）
    @Query("""
    SELECT new com.example.tech.dto.ArticleListItemDto(
      a.id, a.slug, a.title, a.user.displayName, a.createdAt, a.summary, a.imageUrl
    )
    FROM ArticleEntity a
    WHERE a.published = true
    ORDER BY a.createdAt DESC
  """)
    Page<ArticleListItemDto> findPublishedList(Pageable pageable);

    // いいね一覧（公開のみ）
    @Query("""
    SELECT new com.example.tech.dto.ArticleListItemDto(
      a.id, a.slug, a.title, a.user.displayName, a.createdAt, a.summary, a.imageUrl
    )
    FROM LikeEntity l JOIN l.article a
    WHERE l.user.id = :userId AND a.published = true
    ORDER BY a.createdAt DESC
  """)
    List<ArticleListItemDto> findLikedList(@Param("userId") Long userId);


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
