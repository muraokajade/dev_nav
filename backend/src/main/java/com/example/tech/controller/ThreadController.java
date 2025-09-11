// src/main/java/com/example/tech/controller/ThreadController.java
package com.example.tech.controller;

import com.example.tech.api.MessageDto;
import com.example.tech.api.ThreadDto;
import com.example.tech.api.ThreadWithMessagesDto;
import com.example.tech.domain.Category;
import com.example.tech.domain.TargetType;
import com.example.tech.domain.ThreadEntity;
import com.example.tech.domain.ThreadMessageEntity;
import com.example.tech.entity.UserEntity;
import com.example.tech.repository.ThreadMessageRepository;
import com.example.tech.repository.UserRepository;
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
import java.util.Optional;

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
    private final UserRepository userRepository;

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
                .findByThread_IdOrderByIdDesc(thread.getId())
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
        Optional<UserEntity> userOpt = userRepository.findByEmail(email);

        if (userOpt.isEmpty()) {
            return ResponseEntity.ok().build();  // 認証は通ってるが未登録
            // return ResponseEntity.status(404).build();                    // 見つからない
            // return ResponseEntity.ok().build();                           // 200で空返し（UIで無視）
        }

        Long userId = userOpt.get().getId();

        ThreadMessageEntity entity = ThreadMessageEntity.builder()
                .thread(thread)
                .userId(userId)
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

        // 対象メッセージ
        ThreadMessageEntity existing = threadMessageRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        // 現在ユーザー（email → User → Long id）
        String email = currentUserEmail();
        var userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            // 認証は通っているがアプリ側ユーザー未登録
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "user not registered");
        }
        Long currentUserId = userOpt.get().getId();

        // 自分のメッセージ以外は 403（※管理者は許可したいなら isAdmin() で例外）
        if (!currentUserId.equals(existing.getUserId()) && !isAdmin()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }

        // 更新
        existing.setBody(requestBody.body());
        ThreadMessageEntity saved = threadMessageRepository.save(existing);

        return new MessageDto(
                saved.getId(),
                saved.getThread().getId(),
                saved.getUserId(), // Long のまま返す or DTOをStringにしたいなら String.valueOf(...)
                saved.getBody(),
                saved.getCreatedAt(),
                saved.getUpdatedAt()
        );
    }

    // 例：管理者判定（任意）
    private boolean isAdmin() {
        return SecurityContextHolder.getContext().getAuthentication() != null &&
                SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream()
                        .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }


    // DELETE /api/messages/{id}  … メッセージ削除（本人のみ）
    @DeleteMapping("/messages/{id}")
    public ResponseEntity<Void> deleteMessage(@PathVariable Long id) {
        // 対象メッセージ取得（なければ 404）
        ThreadMessageEntity existing = threadMessageRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        // 現在ユーザー（email → User → Long id）
        String email = currentUserEmail();
        var userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            // 認証は通ってるがアプリ側ユーザー未登録
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "user not registered");
        }
        Long currentUserId = userOpt.get().getId();

        // 自分の投稿でなければ 403（管理者は許可したいなら isAdmin() で例外）
        if (!currentUserId.equals(existing.getUserId()) && !isAdmin()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }

        threadMessageRepository.delete(existing);
        return ResponseEntity.noContent().build();
    }
}
