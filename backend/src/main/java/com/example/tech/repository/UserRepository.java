package com.example.tech.repository;
import com.example.tech.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<UserEntity, Long> {
    Optional<UserEntity> findByEmail(String email);              // 既存呼び出し用
    Optional<UserEntity> findByEmailIgnoreCase(String email);    // 新実装用
    boolean existsByEmailIgnoreCase(String email);

    Optional<UserEntity> findUserByEmail(String userEmail);
}
