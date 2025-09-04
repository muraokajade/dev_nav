package com.example.tech.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(schema = "public", name = "users") // 実DBのテーブル名に合わせて変更可
@Getter @Setter @NoArgsConstructor
public class UserEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable=false, length=255, unique=true)
    private String email;

    @Column(name = "display_name", length=255)
    private String displayName;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
