package com.example.tech.repository;

import com.example.tech.entity.SyntaxEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface SyntaxRepository extends JpaRepository<SyntaxEntity,Long> {
    @Query("SELECT s FROM SyntaxEntity s LEFT JOIN FETCH s.user WHERE s.id = :id")
    Optional<SyntaxEntity> findByIdWithUser(@Param("id") Long id);

}
