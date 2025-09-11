// src/main/java/com/example/tech/repository/ThreadMessageRepository.java
package com.example.tech.repository;

import com.example.tech.domain.ThreadMessageEntity;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ThreadMessageRepository extends JpaRepository<ThreadMessageEntity, Long> {

    // ★ これに変更（ManyToOneのIDを辿る）
    List<ThreadMessageEntity> findByThread_IdOrderByIdDesc(Long threadId);

    // ★ userId は Long でカウント
    long countByUserId(Long userId);

    // 任意：最近の投稿を取りたい等
    List<ThreadMessageEntity> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
}
