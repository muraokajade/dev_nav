package com.example.tech.service;

import com.example.tech.controller.MessageController;
import com.example.tech.dto.MessageDTO;
import com.example.tech.dto.MessageResponseDTO;
import com.example.tech.dto.request.AnswerRequest;
import com.example.tech.dto.request.MessageRequest;
import com.example.tech.entity.ArticleEntity;
import com.example.tech.entity.MessageEntity;
import com.example.tech.entity.UserEntity;
import com.example.tech.repository.ArticleRepository;
import com.example.tech.repository.MessageRepository;
import com.example.tech.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.sql.Struct;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MessageService {
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final ArticleRepository articleRepository;
    public void postMessage(String userEmail, MessageRequest request) {
        UserEntity user = userRepository.findUserByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("ユーザーが見つかりません。"));
        Long userId = user.getId();

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

    //articleId毎のArticle取得ロジック
    public List<MessageResponseDTO> getMessageByArticleId(Long articleId) {
        List<MessageEntity> messageEntities = messageRepository.findByArticleId(articleId);

        return messageEntities
                .stream()
                .map(this::convertToDTO)
                .toList();
    }

    //全件取得ロジック　@GetMapping("/admin/questions")
    public List<MessageResponseDTO> getAllMessages(String adminEmail, Pageable pageable) {
        Page<MessageEntity> messages = messageRepository.findAll(pageable);

        return messages.stream()
                .map(this::convertToDTO)
                .toList();
    }

    //Entity DTO変換
    private MessageResponseDTO convertToDTO(MessageEntity entity) {
        String displayName = entity.getUser() != null ? entity.getUser().getDisplayName() : "匿名";
        MessageResponseDTO message = new MessageResponseDTO();
        message.setId(entity.getId());
        message.setArticleId(entity.getArticle().getId());
        message.setTitle(entity.getTitle());
        message.setQuestion(entity.getQuestion());
        message.setDisplayName(displayName);
        message.setResponse(entity.getResponse());
        message.setAdminEmail(entity.getAdminEmail());
        message.setClosed(entity.isClosed());
        message.setCreatedAt(entity.getCreatedAt());
        return message;
    }

    public void answerMessage(Long id, String adminEmail, AnswerRequest request) {
        MessageEntity message = messageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("質問が見つかりません。"));

        // --- ここで各種リレーションを取得・利用 ---
        Long articleId = message.getArticle().getId();
        Long userId = message.getUser().getId();

        // --- 回答内容の保存やメタデータのセット ---// クローズフラグなど
        message.getId();
        message.setResponse(request.getAnswer());
        message.setAdminEmail(adminEmail);
        message.setClosed(true);

        // 必要なら「回答履歴エンティティ」などにarticleId, userIdも渡して保存
        messageRepository.save(message);
    }
}
