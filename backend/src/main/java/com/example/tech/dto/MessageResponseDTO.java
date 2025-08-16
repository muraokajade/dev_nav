package com.example.tech.dto;

import com.example.tech.enums.TargetType;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class MessageResponseDTO {
    private Long id;
    private String title;
    private String question;
    private String displayName;
    private String response;
    private String adminEmail;
    private boolean closed;
    private LocalDateTime createdAt;

    // ★ 追加: 紐づき情報（どの対象のどのIDか）
    private TargetType targetType;   // ARTICLE / SYNTAX / PROCEDURE
    private Long contentId;          // 紐づくエンティティのID
    private String contentTitle;     // （任意）タイトル
    private String contentSlug;      // （任意）スラッグ

    // 便利: フロント直リンク用（必要なら）
    public String getLinkPath() {
        if (targetType == null || contentId == null) return null;
        String base = switch (targetType) {
            case ARTICLE -> "/articles/";
            case SYNTAX -> "/syntaxes/";
            case PROCEDURE -> "/procedures/";
        };
        return base + contentId + (contentSlug != null && !contentSlug.isBlank() ? "-" + contentSlug : "");
    }
}
