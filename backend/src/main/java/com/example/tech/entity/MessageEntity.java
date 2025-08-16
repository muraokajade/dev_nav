package com.example.tech.entity;

import com.example.tech.enums.TargetType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * Q&Aメッセージ
 * - targetType: ARTICLE / SYNTAX / PROCEDURE
 * - article / syntax / procedure のいずれか1つだけを関連付け
 */
@Entity
@Table(
        name = "messages",
        indexes = {
                @Index(name = "idx_messages_targettype_article", columnList = "target_type, article_id"),
                @Index(name = "idx_messages_targettype_syntax", columnList = "target_type, syntax_id"),
                @Index(name = "idx_messages_targettype_procedure", columnList = "target_type, procedure_id")
        }
)
@Data
@AllArgsConstructor
@NoArgsConstructor
public class MessageEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 投稿者（必要なければ null 許容） */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private UserEntity user;

    /** 対象種別（ARTICLE / SYNTAX / PROCEDURE） */
    @Enumerated(EnumType.STRING)
    @Column(name = "target_type", nullable = false, length = 20)
    private TargetType targetType;

    /** 管理者メール（割当先） */
    @Column(name = "admin_email")
    private String adminEmail;

    /** 対象（いずれか1つのみ非NULL） */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "article_id")
    private ArticleEntity article;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "syntax_id")
    private SyntaxEntity syntax;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "procedure_id")
    private ProcedureEntity procedure;

    /** タイトル・本文・回答 */
    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String question;

    @Column(columnDefinition = "TEXT")
    private String response;

    @Column(nullable = false)
    private boolean closed = false;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    /* ------------ 便利メソッド（任意） ------------ */

    /** 関連先のID（フロントDTO用） */
    @Transient
    public Long getContentId() {
        return switch (targetType) {
            case ARTICLE -> article != null ? article.getId() : null;
            case SYNTAX -> syntax != null ? syntax.getId() : null;
            case PROCEDURE -> procedure != null ? procedure.getId() : null;
        };
    }

    /** 関連先のタイトル（存在する場合のみ / DTO整形で利用） */
    @Transient
    public String getContentTitle() {
        return switch (targetType) {
            case ARTICLE -> (article != null) ? article.getTitle() : null;
            case SYNTAX -> (syntax != null) ? syntax.getTitle() : null;
            case PROCEDURE -> (procedure != null) ? procedure.getTitle() : null;
        };
    }

    /** 関連先のスラッグ（存在する場合のみ / DTO整形で利用） */
    @Transient
    public String getContentSlug() {
        return switch (targetType) {
            case ARTICLE -> (article != null) ? article.getSlug() : null;
            case SYNTAX -> (syntax != null) ? syntax.getSlug() : null;
            case PROCEDURE -> (procedure != null) ? procedure.getSlug() : null;
        };
    }

    /* ------------ 整合性チェック（任意・有効化推奨） ------------ */

    @PrePersist
    @PreUpdate
    private void validateConsistency() {
        int cnt =
                (article != null ? 1 : 0) +
                        (syntax != null ? 1 : 0) +
                        (procedure != null ? 1 : 0);
        if (cnt != 1) {
            throw new IllegalStateException("Exactly one of article/syntax/procedure must be non-null.");
        }
        // targetType と関連の一致をチェック
        switch (targetType) {
            case ARTICLE -> {
                if (article == null) throw new IllegalStateException("targetType=ARTICLE requires article not null.");
                if (syntax != null || procedure != null) throw new IllegalStateException("Only article must be set for ARTICLE.");
            }
            case SYNTAX -> {
                if (syntax == null) throw new IllegalStateException("targetType=SYNTAX requires syntax not null.");
                if (article != null || procedure != null) throw new IllegalStateException("Only syntax must be set for SYNTAX.");
            }
            case PROCEDURE -> {
                if (procedure == null) throw new IllegalStateException("targetType=PROCEDURE requires procedure not null.");
                if (article != null || syntax != null) throw new IllegalStateException("Only procedure must be set for PROCEDURE.");
            }
        }
    }
}
