package com.example.tech.entity;

import jakarta.persistence.*;
import jakarta.persistence.EntityManager;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(
        name = "likes_syntax",
        uniqueConstraints = @UniqueConstraint(
                name = "uq_likes_user_syntax",
                columnNames = {"user_id", "syntax_id"}
        )
)
@Getter @Setter @NoArgsConstructor
public class LikeSyntaxEntity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, foreignKey = @ForeignKey(name = "fk_likes_user"))
    private UserEntity user;          // ← ふつうに参照

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "syntax_id", nullable = false, foreignKey = @ForeignKey(name = "fk_likes_syntax"))
    private SyntaxEntity syntax;      // ← ふつうに参照

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public static LikeSyntaxEntity ofUserIdAndSyntaxId(Long userId, Long syntaxId, EntityManager em) {
        LikeSyntaxEntity e = new LikeSyntaxEntity();
        UserEntity uRef   = em.getReference(UserEntity.class, userId);
        SyntaxEntity sRef = em.getReference(SyntaxEntity.class, syntaxId);
        e.setUser(uRef);
        e.setSyntax(sRef);
        return e;
    }
}
