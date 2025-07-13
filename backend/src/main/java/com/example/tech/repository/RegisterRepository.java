package com.example.tech.repository;

import com.example.tech.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RegisterRepository extends JpaRepository<UserEntity,Long> {
}
