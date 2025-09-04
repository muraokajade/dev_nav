// src/main/java/com/example/tech/repository/LikeSyntaxRepository.java
package com.example.tech.repository;

import com.example.tech.entity.LikeSyntaxEntity;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

public interface LikeSyntaxRepository extends JpaRepository<LikeSyntaxEntity, Long> {

    // 関連のIDは _ でネスト指定
    boolean existsByUser_IdAndSyntax_Id(Long userId, Long syntaxId);

    long countBySyntax_Id(Long syntaxId);

    @Transactional
    void deleteByUser_IdAndSyntax_Id(Long userId, Long syntaxId);

    // UNIQUE(user_id, syntax_id) を前提に重複無視
    @Modifying
    @Transactional
    @Query(value = """
        INSERT INTO public.like_syntaxes(user_id, syntax_id)
        VALUES (:uid, :sid)
        ON CONFLICT (user_id, syntax_id) DO NOTHING
        """, nativeQuery = true)
    void upsertLike(@Param("uid") Long userId, @Param("sid") Long syntaxId);
}
