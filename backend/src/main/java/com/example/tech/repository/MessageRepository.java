package com.example.tech.repository;

import com.example.tech.entity.MessageEntity;
import com.example.tech.enums.TargetType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<MessageEntity,Long> {
    List<MessageEntity> findByArticleId(Long articleId);


    Page<MessageEntity> findByTargetTypeAndArticle_IdOrderByCreatedAtDesc(
            TargetType type, Long articleId, Pageable pageable);

    Page<MessageEntity> findByTargetTypeAndSyntax_IdOrderByCreatedAtDesc(
            TargetType type, Long syntaxId, Pageable pageable);

    Page<MessageEntity> findByTargetTypeAndProcedure_IdOrderByCreatedAtDesc(
            TargetType type, Long procedureId, Pageable pageable);

    // MessageRepository.java
    @Query(
            value = """
    select m from MessageEntity m
      left join fetch m.article a
      left join fetch m.syntax s
      left join fetch m.procedure p
    order by m.createdAt desc
  """,
            countQuery = "select count(m) from MessageEntity m"
    )
    Page<MessageEntity> findAllWithRefs(Pageable pageable);
}
