// src/main/java/com/example/tech/controller/ThreadController.java
package com.example.tech.controller;

import com.example.tech.api.MessageDto;
import com.example.tech.api.ThreadDto;
import com.example.tech.api.ThreadWithMessagesDto;
import com.example.tech.domain.Category;
import com.example.tech.domain.TargetType;
import com.example.tech.domain.ThreadEntity;
import com.example.tech.domain.ThreadMessageEntity;
import com.example.tech.repository.ThreadMessageRepository;
import com.example.tech.service.ThreadService;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

/**
 * ThreadController
 * - 対象(type/refId) × カテゴリ(category) のスレッドを find-or-create
 * - スレッド配下のメッセージ CRUD
 * 認証ユーザーIDは SecurityContextHolder（principal=email）から取得。
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ThreadController {

    private final ThreadService threadService;
    private final ThreadMessageRepository threadMessageRepository;

    // ========================= Helpers =========================
    /** "articles" / "syntaxes" / "procedures" / 大文字小文字 を吸収して Enum 化 */
    private TargetType parseTargetType(String raw) {
        if (raw == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "type is required");
        String s = raw.trim().toUpperCase();
        switch (s) {
            case "ARTICLES": s = "ARTICLE"; break;
            case "PROCEDURES": s = "PROCEDURE"; break;
            case "SYNTAXES": s = "SYNTAX"; break;
            default:
                if (s.endsWith("S")) s = s.substring(0, s.length() - 1);
        }
        try {
            return TargetType.valueOf(s);
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "unknown type: " + raw);
        }
    }

    /** "comments" / "qas" / 大文字小文字 を吸収して Enum 化 */
    private Category parseCategory(String raw) {
        if (raw == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "category is required");
        String s = raw.trim().toUpperCase();
        switch (s) {
            case "COMMENTS": s = "COMMENT"; break;
            case "QAS": s = "QA"; break;
            default:
                if (s.endsWith("S")) s = s.substring(0, s.length() - 1);
        }
        try {
            return Category.valueOf(s);
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "unknown category: " + raw);
        }
    }

    /** 現在のログインユーザーの email を principal から取得 */
    private String currentUserEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        String email = auth.getName();
        if (email == null || email.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "email missing");
        }
        return email;
    }

    // ========================= APIs =========================

    // GET /api/{type}/{refId}/{category}/messages
    // スレッド（なければ空で返す）+ メッセージ一覧（新しい順）
    @GetMapping("/{type}/{refId}/{category}/messages")
    public ThreadWithMessagesDto getMessages(
            @PathVariable String type,
            @PathVariable Long refId,
            @PathVariable String category
    ) {
        TargetType targetType = parseTargetType(type);
        Category categoryEnum = parseCategory(category);

        var threadOpt = threadService.find(targetType, refId, categoryEnum);
        if (threadOpt.isEmpty()) {
            return new ThreadWithMessagesDto(
                    new ThreadDto(null, targetType, refId, categoryEnum),
                    List.of()
            );
        }
        var thread = threadOpt.get();

        List<MessageDto> messages = threadMessageRepository
                .findByThreadIdOrderByIdDesc(thread.getId())
                .stream()
                .map(m -> new MessageDto(
                        m.getId(),
                        thread.getId(),
                        m.getUserId(),          // email 文字列
                        m.getBody(),
                        m.getCreatedAt(),
                        m.getUpdatedAt()
                ))
                .toList();

        ThreadDto threadDto = new ThreadDto(
                thread.getId(),
                thread.getTargetType(),
                thread.getRefId(),
                thread.getCategory()
        );

        // ThreadWithMessagesDto は { thread, messages } の形
        return new ThreadWithMessagesDto(threadDto, messages);
    }

    // POST /api/{type}/{refId}/{category}/messages  … メッセージ作成
    public record PostBody(@NotBlank String body) {}

    @PostMapping("/{type}/{refId}/{category}/messages")
    public ResponseEntity<MessageDto> postMessage(
            @PathVariable String type,
            @PathVariable Long refId,
            @PathVariable String category,
            @RequestBody PostBody requestBody
    ) {
        if (requestBody == null || requestBody.body() == null || requestBody.body().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "body is required");
        }

        TargetType targetType = parseTargetType(type);
        Category categoryEnum = parseCategory(category);

        ThreadEntity thread = threadService.getOrCreate(targetType, refId, categoryEnum);
        String email = currentUserEmail();

        ThreadMessageEntity entity = ThreadMessageEntity.builder()
                .thread(thread)
                .userId(email)
                .body(requestBody.body())
                .build();

        ThreadMessageEntity saved = threadMessageRepository.save(entity);

        MessageDto response = new MessageDto(
                saved.getId(),
                thread.getId(),
                saved.getUserId(),
                saved.getBody(),
                saved.getCreatedAt(),
                saved.getUpdatedAt()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // PUT /api/messages/{id}  … メッセージ更新（本人のみ）
    @PutMapping("/messages/{id}")
    public MessageDto putMessage(@PathVariable Long id, @RequestBody PostBody requestBody) {
        if (requestBody == null || requestBody.body() == null || requestBody.body().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "body is required");
        }
        ThreadMessageEntity existing = threadMessageRepository.findById(id).orElseThrow();
        String email = currentUserEmail();

        if (!existing.getUserId().equalsIgnoreCase(email)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }
        existing.setBody(requestBody.body());
        ThreadMessageEntity saved = threadMessageRepository.save(existing);

        return new MessageDto(
                saved.getId(),
                saved.getThread().getId(),
                saved.getUserId(),
                saved.getBody(),
                saved.getCreatedAt(),
                saved.getUpdatedAt()
        );
    }

    // DELETE /api/messages/{id}  … メッセージ削除（本人のみ）
    @DeleteMapping("/messages/{id}")
    public ResponseEntity<?> deleteMessage(@PathVariable Long id) {
        ThreadMessageEntity existing = threadMessageRepository.findById(id).orElseThrow();
        String email = currentUserEmail();
        if (!existing.getUserId().equalsIgnoreCase(email)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }
        threadMessageRepository.delete(existing);
        return ResponseEntity.noContent().build();
    }
}
