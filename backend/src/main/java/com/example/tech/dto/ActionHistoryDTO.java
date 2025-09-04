package com.example.tech.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ActionHistoryDTO {
    private String type; // "review", "comment", "read" など
    private String content; // コメントやレビュー本文、記事タイトルなど
    private LocalDateTime date; // 実行日時
    private String articleTitle; // 対象記事タイトルなど（あれば）
    private Long articleId;      // 対象記事IDなど（あれば）

    public String getText() { return content; }
    public void setText(String text) { this.content = text; }
}
