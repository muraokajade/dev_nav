package com.example.tech.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@Table(name = "syntaxes")
@AllArgsConstructor
public class SyntaxEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String slug;
    private String title;
    @ManyToOne
    @JoinColumn(name = "user_id")
    private UserEntity user;
    private String userEmail;
    private String authorName;
    private String category;
    @Column(columnDefinition = "TEXT")
    private String content;
    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;


    @Column(name = "is_published", nullable = false)
    private boolean published = true;

    public boolean published() {
        return this.published;
    }
}
