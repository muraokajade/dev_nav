package com.example.tech.service;

import com.example.tech.dto.MessageResponseDTO;
import com.example.tech.dto.request.AnswerRequest;
import com.example.tech.dto.request.MessageRequest;
import com.example.tech.dto.response.MessagePageResponse;
import com.example.tech.entity.ArticleEntity;
import com.example.tech.entity.MessageEntity;
import com.example.tech.entity.UserEntity;
import com.example.tech.enums.TargetType;
import com.example.tech.projection.ContentBrief;
import com.example.tech.repository.ArticleRepository;
import com.example.tech.repository.MessageRepository;
import com.example.tech.repository.ProcedureRepository;
import com.example.tech.repository.SyntaxRepository;
import com.example.tech.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

import static com.example.tech.enums.TargetType.*;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final ArticleRepository articleRepository;
    private final SyntaxRepository syntaxRepository;
    private final ProcedureRepository procedureRepository;

    // ========== 投稿 ==========
    public void postMessage(String userEmail, MessageRequest request) {
        UserEntity user = userRepository.findUserByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("ユーザーが見つかりません。"));

        MessageEntity message = new MessageEntity();

        ArticleEntity article = articleRepository.findById(request.getArticleId())
                .orElseThrow(() -> new RuntimeException("記事が見つかりません。"));

        message.setUser(user);
        message.setArticle(article);
        message.setTitle(request.getTitle());
        message.setQuestion(request.getQuestion());
        message.setClosed(false);

        messageRepository.save(message);
    }

    // ========== 記事単位 ==========
    public List<MessageResponseDTO> getMessageByArticleId(Long articleId) {
        List<MessageEntity> messageEntities = messageRepository.findByArticleId(articleId);
        return messageEntities.stream().map(this::toSimpleDto).toList();
    }

    // ========== 管理用全件取得（★ここを置き換え） ==========
    public List<MessageResponseDTO> getAllMessages(String adminEmail, Pageable pageable) {
        // 管理者割当で絞る場合（なければ findAll(pageable) に戻してOK）
        Page<MessageEntity> page = messageRepository.findAllWithRefs(pageable);
        List<MessageEntity> list = page.getContent();

        // targetType ごとに関連IDを収集
        Set<Long> articleIds = new HashSet<>();
        Set<Long> syntaxIds = new HashSet<>();
        Set<Long> procedureIds = new HashSet<>();
        for (MessageEntity m : list) {
            if (m.getTargetType() == null) continue;
            switch (m.getTargetType()) {
                case ARTICLE -> {
                    if (m.getArticle() != null) articleIds.add(m.getArticle().getId());
                }
                case SYNTAX -> {
                    if (m.getSyntax() != null) syntaxIds.add(m.getSyntax().getId());
                }
                case PROCEDURE -> {
                    if (m.getProcedure() != null) procedureIds.add(m.getProcedure().getId());
                }
            }
        }

        // 各ターゲットの title/slug を一括取得して Map 化（N+1回避）

// …

        Map<Long, ContentBrief> articleMap = articleIds.isEmpty() ? Map.of() :
                articleRepository.findBriefsByIdIn(articleIds).stream()
                        .collect(Collectors.toMap(
                                ContentBrief::getId,
                                (ContentBrief b) -> b,
                                (a, b) -> a,
                                LinkedHashMap::new
                        ));

        Map<Long, ContentBrief> syntaxMap = syntaxIds.isEmpty() ? Map.of() :
                syntaxRepository.findBriefsByIdIn(syntaxIds).stream()
                        .collect(Collectors.toMap(
                                ContentBrief::getId,
                                (ContentBrief b) -> b,
                                (a, b) -> a,
                                LinkedHashMap::new
                        ));

        Map<Long, ContentBrief> procedureMap = procedureIds.isEmpty() ? Map.of() :
                procedureRepository.findBriefsByIdIn(procedureIds).stream()
                        .collect(Collectors.toMap(
                                ContentBrief::getId,
                                (ContentBrief b) -> b,
                                (a, b) -> a,
                                LinkedHashMap::new
                        ));


        // DTO 化（title/slug を補完）
        return list.stream()
                .map(e -> toDto(e, articleMap, syntaxMap, procedureMap))
                .toList();
    }

    // ========== DTO化（管理用：title/slug補完あり） ==========
    private MessageResponseDTO toDto(
            MessageEntity e,
            Map<Long, ContentBrief> articleMap,
            Map<Long, ContentBrief> syntaxMap,
            Map<Long, ContentBrief> procedureMap
    ) {
        MessageResponseDTO dto = new MessageResponseDTO();
        dto.setId(e.getId());
        dto.setTitle(e.getTitle());
        dto.setQuestion(e.getQuestion());
        dto.setDisplayName(e.getUser() != null ? e.getUser().getDisplayName() : "匿名");
        dto.setResponse(e.getResponse());
        dto.setAdminEmail(e.getAdminEmail());
        dto.setClosed(e.isClosed());
        dto.setCreatedAt(e.getCreatedAt());
        dto.setTargetType(e.getTargetType());

        if (e.getTargetType() != null) {
            switch (e.getTargetType()) {
                case ARTICLE -> {
                    Long id = (e.getArticle() != null) ? e.getArticle().getId() : null;
                    dto.setContentId(id);
                    if (id != null) {
                        ContentBrief b = articleMap.get(id);
                        if (b != null) {
                            dto.setContentTitle(b.getTitle());
                            dto.setContentSlug(b.getSlug());
                        }
                    }
                }
                case SYNTAX -> {
                    Long id = (e.getSyntax() != null) ? e.getSyntax().getId() : null;
                    dto.setContentId(id);
                    if (id != null) {
                        ContentBrief b = syntaxMap.get(id);
                        if (b != null) {
                            dto.setContentTitle(b.getTitle());
                            dto.setContentSlug(b.getSlug());
                        }
                    }
                }
                case PROCEDURE -> {
                    Long id = (e.getProcedure() != null) ? e.getProcedure().getId() : null;
                    dto.setContentId(id);
                    if (id != null) {
                        ContentBrief b = procedureMap.get(id);
                        if (b != null) {
                            dto.setContentTitle(b.getTitle());
                            dto.setContentSlug(b.getSlug());
                        }
                    }
                }
            }
        }
        return dto;
    }

    // ========== DTO化（簡易：単体取得の既存互換） ==========
    private MessageResponseDTO toSimpleDto(MessageEntity e) {
        MessageResponseDTO dto = new MessageResponseDTO();
        dto.setId(e.getId());
        dto.setTitle(e.getTitle());
        dto.setQuestion(e.getQuestion());
        dto.setDisplayName(e.getUser() != null ? e.getUser().getDisplayName() : "匿名");
        dto.setResponse(e.getResponse());
        dto.setAdminEmail(e.getAdminEmail());
        dto.setClosed(e.isClosed());
        dto.setCreatedAt(e.getCreatedAt());
        dto.setTargetType(e.getTargetType());
        // 紐付きがある場合は最低限のIDだけ
        if (e.getTargetType() != null) {
            switch (e.getTargetType()) {
                case ARTICLE -> { if (e.getArticle() != null) dto.setContentId(e.getArticle().getId()); }
                case SYNTAX -> { if (e.getSyntax() != null) dto.setContentId(e.getSyntax().getId()); }
                case PROCEDURE -> { if (e.getProcedure() != null) dto.setContentId(e.getProcedure().getId()); }
            }
        }
        return dto;
    }

    // ========== 回答確定 ==========
    public void answerMessage(Long id, String adminEmail, AnswerRequest req) {
        MessageEntity m = messageRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        // 必要なら adminEmail での権限チェックを追加
        m.setResponse(req.getAnswer());
        m.setAdminEmail(adminEmail);
        m.setClosed(true);
        messageRepository.save(m);
    }

    // ========== 対象別一覧 ==========
    public MessagePageResponse list(TargetType type, Long refId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<MessageEntity> result = switch (type) {
            case ARTICLE ->
                    messageRepository.findByTargetTypeAndArticle_IdOrderByCreatedAtDesc(type, refId, pageable);
            case SYNTAX  ->
                    messageRepository.findByTargetTypeAndSyntax_IdOrderByCreatedAtDesc(type, refId, pageable);
            case PROCEDURE ->
                    messageRepository.findByTargetTypeAndProcedure_IdOrderByCreatedAtDesc(type, refId, pageable);
        };

        List<MessageResponseDTO> content = result.getContent().stream()
                .map(this::toSimpleDto)
                .toList();

        return new MessagePageResponse(
                content,
                result.getTotalPages(),
                result.getTotalElements(),
                result.getNumber(),
                result.getSize()
        );
    }

    public void add(TargetType type, Long refId, MessageRequest req, String userEmailOrNull) {
        MessageEntity m = new MessageEntity();
        m.setTargetType(type);
        m.setTitle(req.getTitle());
        m.setQuestion(req.getQuestion());

        if (userEmailOrNull != null) {
            userRepository.findByEmail(userEmailOrNull).ifPresent(m::setUser);
        }

        switch (type) {
            case ARTICLE   -> m.setArticle(articleRepository.getReferenceById(refId));
            case SYNTAX    -> m.setSyntax(syntaxRepository.getReferenceById(refId));
            case PROCEDURE -> m.setProcedure(procedureRepository.getReferenceById(refId));
        }

        messageRepository.save(m);
    }

}
