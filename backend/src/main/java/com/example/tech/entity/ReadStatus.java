package com.example.tech.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(
        name = "read_status",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id","target","content_id"})
)
@Getter
@Setter
public class ReadStatus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name="user_id", nullable=false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable=false, length=32)
    private Target target;

    @Column(name="content_id", nullable=false)
    private Long contentId;

    public enum Target {
        articles, syntaxes, procedures
    }
}

