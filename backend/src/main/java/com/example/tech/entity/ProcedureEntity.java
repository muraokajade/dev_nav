package com.example.tech.entity;

import com.example.tech.utils.StepNumber;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Data
@AllArgsConstructor
@Table(name = "procedures")
@NoArgsConstructor
public class ProcedureEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String stepNumber;
    // 追加（数値で並べ替えるため）
    @Column(name = "step_major", nullable = false)
    private int stepMajor;

    @Column(name = "step_minor", nullable = false)
    private int stepMinor;
    // 変更時に自動同期しておくと楽
    @PrePersist @PreUpdate
    private void syncStepNumbers() {
        int[] p = StepNumber.parse(stepNumber); // 下のユーティリティ
        this.stepMajor = p[0];
        this.stepMinor = p[1];
    }
    @Column(unique = true)
    private String slug;
    private String title;
    //private Long userId;
    @ManyToOne
    @JoinColumn(name = "user_id")
    private UserEntity user;

    private String userEmail;
    private String authorName;  // ←追加
    private String lastEditorName;    // 最終編集者（編集のたびに上書き）
    private String lastEditorEmail;
    private String category;
    @Column(columnDefinition = "TEXT")
    private String content;
    private String imageUrl;
    @Column(name = "is_published", nullable = false)
    private boolean published = true;

    public boolean published() {
        return this.published;
    }
    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;


}

