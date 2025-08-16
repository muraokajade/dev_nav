package com.example.tech.entity;

import com.example.tech.enums.TargetType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "review_scores",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"user_id", "article_id"}),
                @UniqueConstraint(columnNames = {"user_id", "syntax_id"}),
                @UniqueConstraint(columnNames = {"user_id", "procedure_id"})
        }
)
@AllArgsConstructor
@NoArgsConstructor
@Data
public class ReviewScoreEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", insertable = false, updatable = false)
    private Long userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;


    /** 追加: 対象種別（ARTICLE / SYNTAX / PROCEDURE） */
    @Enumerated(EnumType.STRING)
    @Column(name = "target_type", nullable = false, length = 20)
    private TargetType targetType;

    /** 各対象への外部キー（nullableに変更） */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "article_id", nullable = true)
    private ArticleEntity article;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "syntax_id", nullable = true)
    private SyntaxEntity syntax;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "procedure_id", nullable = true)
    private ProcedureEntity procedure;


    private double score;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
