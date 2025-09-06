// src/main/java/com/example/tech/repository/ActionHistoryRepository.java
package com.example.tech.repository;

import com.example.tech.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ActionHistoryRepository extends JpaRepository<UserEntity, Long> {

    /**
     * 返り値は Object[]（DTOにサービスで詰め替える）
     * 列順は: type, content, date, article_title, article_id
     */
    @Query(value = """
        (
          select 'read' as type,
                 null       as content,
                 ar.created_at as date,
                 a.title    as article_title,
                 a.id       as article_id
          from article_reads ar
          join users u on u.id = ar.user_id
          join articles a on a.id = ar.article_id
          where u.email = :email
        )
        union all
        (
          select 'review' as type,
                 cast(rv.score as varchar) as content,
                 rv.created_at as date,
                 a.title as article_title,
                 a.id    as article_id
          from article_reviews rv
          join users u on u.id = rv.user_id
          join articles a on a.id = rv.article_id
          where u.email = :email
        )
        union all
        (
          select 'comment' as type,
                 cm.body  as content,
                 cm.created_at as date,
                 a.title as article_title,
                 a.id    as article_id
          from article_comments cm
          join users u on u.id = cm.user_id
          join articles a on a.id = cm.article_id
          where u.email = :email
        )
        union all
        (
          select 'like' as type,
                 null   as content,
                 lk.created_at as date,
                 a.title as article_title,
                 a.id    as article_id
          from article_likes lk
          join users u on u.id = lk.user_id
          join articles a on a.id = lk.article_id
          where u.email = :email
        )
        order by date desc
        limit :limit
        """, nativeQuery = true)
    List<Object[]> fetchUnifiedHistory(@Param("email") String email,
                                       @Param("limit") int limit);
}
