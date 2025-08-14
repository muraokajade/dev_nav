package com.example.tech.repository;

import com.example.tech.domain.Category;
import com.example.tech.domain.TargetType;
import com.example.tech.domain.ThreadEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ThreadRepository extends JpaRepository<ThreadEntity, Long> {
    Optional<ThreadEntity> findByTargetTypeAndRefIdAndCategory(TargetType targetType, Long refId, Category category);
}
