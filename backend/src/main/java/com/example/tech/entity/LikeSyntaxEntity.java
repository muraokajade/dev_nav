// src/main/java/com/example/tech/entity/LikeSyntaxEntity.java
package com.example.tech.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(
        schema = "public",
        name = "like_syntaxes",
        uniqueConstraints = @UniqueConstraint(
                name = "uq_likes_user_syntax",
                columnNames = {"user_id", "syntax_id"}
        )
)
@Getter
@Setter
@NoArgsConstructor
public class LikeSyntaxEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** いいねしたユーザー */
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(
            name = "user_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_likes_user")
    )
    private UserEntity user;

    /** いいね対象のSyntax */
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(
            name = "syntax_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_likes_syntax")
    )
    private SyntaxEntity syntax;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    /** 参照だけ差し込む（SELECT不要） */
    public static LikeSyntaxEntity ofUserIdAndSyntaxId(Long userId, Long syntaxId, EntityManager em) {
        LikeSyntaxEntity e = new LikeSyntaxEntity();
        e.setUser(em.getReference(UserEntity.class, userId));
        e.setSyntax(em.getReference(SyntaxEntity.class, syntaxId));
        return e;
    }
}
