// src/main/java/com/example/tech/domain/ThreadMessageEntity.java
package com.example.tech.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "thread_messages")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ThreadMessageEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "thread_id", nullable = false)
    private ThreadEntity thread;

    @Column(name = "user_id", nullable = false)
    private Long userId;
    @Column(name = "body", nullable = false, columnDefinition = "TEXT")
    private String body;

    @CreationTimestamp @Column(name = "created_at", nullable = false) private LocalDateTime createdAt;
    @UpdateTimestamp  @Column(name = "updated_at") private LocalDateTime updatedAt;
}
