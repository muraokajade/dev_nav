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
 * - スレッド配下のメッセージを CRUD
 * 認証ユーザーIDは SecurityContextHolder から取得（principal = email の運用）。
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ThreadController {

    private final ThreadService threadService;
    private final ThreadMessageRepository threadMessageRepository;

    // Helpers: String → Enum 変換（小文字OK）
    private TargetType parseTargetType(String targetTypeString) {
        return TargetType.valueOf(targetTypeString.toUpperCase());
    }
    private Category parseCategory(String categoryString) {
        return Category.valueOf(categoryString.toUpperCase());
    }

    // 現在のログインユーザーのメール（= userId として保存/比較に使用）
    private String currentUserEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }
        String email = auth.getName(); // FirebaseTokenFilter が principal に email を入れている前提
        if (email == null || email.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "email missing");
        }
        return email;
    }

    // GET /api/{type}/{refId}/{category}/messages
    // スレッド（なければ作成）+ メッセージ一覧の取得（GETはpermitAll推奨）
    @GetMapping("/{type}/{refId}/{category}/messages")
    public ThreadWithMessagesDto getMessages(
            @PathVariable String type,
            @PathVariable Long refId,
            @PathVariable String category
    ) {
        TargetType targetType = parseTargetType(type);     // "article" → ARTICLE
        Category categoryEnum = parseCategory(category);   // "comment" → COMMENT

        ThreadEntity threadEntity = threadService.getOrCreate(targetType, refId, categoryEnum);

        List<MessageDto> messageDtoList = threadMessageRepository
                .findByThreadIdOrderByIdDesc(threadEntity.getId())
                .stream()
                .map(messageEntity -> new MessageDto(
                        messageEntity.getId(),
                        threadEntity.getId(),
                        messageEntity.getUserId(),     // ← email 文字列
                        messageEntity.getBody(),
                        messageEntity.getCreatedAt(),
                        messageEntity.getUpdatedAt()
                ))
                .toList();

        ThreadDto threadDto = new ThreadDto(
                threadEntity.getId(),
                threadEntity.getTargetType(),
                threadEntity.getRefId(),
                threadEntity.getCategory()
        );
        return new ThreadWithMessagesDto(threadDto, messageDtoList);
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
        ThreadEntity threadEntity = threadService.getOrCreate(targetType, refId, categoryEnum);

        String currentEmail = currentUserEmail(); // ← email で保存

        ThreadMessageEntity newMessageEntity = ThreadMessageEntity.builder()
                .thread(threadEntity)
                .userId(currentEmail)            // ← userId=email
                .body(requestBody.body())
                .build();

        ThreadMessageEntity saved = threadMessageRepository.save(newMessageEntity);

        MessageDto response = new MessageDto(
                saved.getId(),
                threadEntity.getId(),
                saved.getUserId(),
                saved.getBody(),
                saved.getCreatedAt(),
                saved.getUpdatedAt()
        );
        return ResponseEntity.status(201).body(response);
    }

    // PUT /api/messages/{id}  … メッセージ更新（本人のみ）
    @PutMapping("/messages/{id}")
    public MessageDto putMessage(
            @PathVariable Long id,
            @RequestBody PostBody requestBody
    ) {
        if (requestBody == null || requestBody.body() == null || requestBody.body().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "body is required");
        }

        ThreadMessageEntity existing = threadMessageRepository.findById(id).orElseThrow();
        String currentEmail = currentUserEmail();

        // 自分の投稿のみ可（大文字小文字差を吸収）
        if (!existing.getUserId().equalsIgnoreCase(currentEmail)) {
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
        String currentEmail = currentUserEmail();

        if (!existing.getUserId().equalsIgnoreCase(currentEmail)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }

        threadMessageRepository.delete(existing);
        return ResponseEntity.noContent().build(); // 204
    }
}
