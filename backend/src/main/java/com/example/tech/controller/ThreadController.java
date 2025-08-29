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
import org.springframework.data.domain.PageRequest;
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

        var threadEntity = threadService.find(targetType, refId, categoryEnum);
        // スレッド未作成 → 200 OK + 空で返す（500にしない）
        if (threadEntity.isEmpty()) {
            return new ThreadWithMessagesDto(
                    new ThreadDto(null,targetType, refId, categoryEnum),
                    List.of()
            );
        }

        var thread = threadEntity.get();


        List<MessageDto> messageDtoList = threadMessageRepository
                .findByThreadIdOrderByIdDesc(thread.getId())
                .stream()
                .map(messageEntity -> new MessageDto(
                        messageEntity.getId(),
                        thread.getId(),
                        messageEntity.getUserId(),     // ← email 文字列
                        messageEntity.getBody(),
                        messageEntity.getCreatedAt(),
                        messageEntity.getUpdatedAt()
                ))
                .toList();

        ThreadDto threadDto = new ThreadDto(
                thread.getId(),
                thread.getTargetType(),
                thread.getRefId(),
                thread.getCategory()
        );
        return new ThreadWithMessagesDto(threadDto, messageDtoList);
    }

    // POST /api/{type}/{refId}/{category}/messages  … メッセージ作成
    public record PostBody(@NotBlank String body) {}

    /**
     * メッセージを指定されたスレッド（targetType + refId + category）に追加する。
     * スレッドが存在しなければ新規作成してからメッセージを追加。
     */
    @PostMapping("/{type}/{refId}/{category}/messages")
    public ResponseEntity<MessageDto> postMessage(
            @PathVariable String type,        // URLパスの {type}（例: "ARTICLE"）を受け取る
            @PathVariable Long refId,         // URLパスの {refId}（対象記事や手順のID）
            @PathVariable String category,    // URLパスの {category}（例: "COMMENT"）
            @RequestBody PostBody requestBody // リクエスト本文 {"body": "コメント内容"}
    ) {
        // --- 入力バリデーション ---
        // requestBody自体がnull、bodyがnull、または空文字の場合は400 Bad Request
        if (requestBody == null || requestBody.body() == null || requestBody.body().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "body is required");
        }

        // --- String → Enum変換 ---
        // パス変数で受け取った文字列をEnum型（TargetType, Category）に変換
        // 無効な値の場合はparseXxx内で例外（400や422など）を投げる想定
        TargetType targetType = parseTargetType(type);
        Category categoryEnum = parseCategory(category);

        // --- スレッド（会話の箱）の取得 or 作成 ---
        // 同じ targetType + refId + category のスレッドがあれば取得、なければ新規作成
        ThreadEntity threadEntity = threadService.getOrCreate(targetType, refId, categoryEnum);

        // --- 投稿者情報の取得 ---
        // 現在ログイン中のユーザーのメールアドレスを取得（認証情報から）
        String currentEmail = currentUserEmail();

        // --- メッセージエンティティの生成 ---
        // ThreadEntity（箱）に紐づく新しいメッセージ（本文＋投稿者）を作成
        ThreadMessageEntity newMessageEntity = ThreadMessageEntity.builder()
                .thread(threadEntity)      // 紐づけるスレッド
                .userId(currentEmail)      // 投稿者のID（ここではメールアドレス）
                .body(requestBody.body())  // メッセージ本文
                .build();

        // --- メッセージの保存 ---
        ThreadMessageEntity saved = threadMessageRepository.save(newMessageEntity);

        // --- レスポンスDTOの生成 ---
        // 保存されたエンティティの情報をクライアント向けDTOに詰め直す
        MessageDto response = new MessageDto(
                saved.getId(),             // メッセージID
                threadEntity.getId(),      // 紐づくスレッドID
                saved.getUserId(),         // 投稿者ID
                saved.getBody(),           // 本文
                saved.getCreatedAt(),      // 作成日時
                saved.getUpdatedAt()       // 更新日時
        );

        // --- 201 Createdでレスポンス返却 ---
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
