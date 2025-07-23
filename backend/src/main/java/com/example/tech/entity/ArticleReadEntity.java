package com.example.tech.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor

//1人が1記事を何回読んでも、DB上は「1回だけしか記録されない」（=重複記録防止）
@Table(name = "article_reads", uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "article_id"}))

public class ArticleReadEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    //private Long articleId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "article_id", referencedColumnName = "id", nullable = false)
    private ArticleEntity article;
    private LocalDateTime readAt;

}
