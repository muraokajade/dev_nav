package com.example.tech.repository;

import com.example.tech.domain.ThreadMessageEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ThreadMessageRepository extends JpaRepository<ThreadMessageEntity, Long> {
    List<ThreadMessageEntity> findByThreadIdOrderByIdDesc(Long threadId);
}
