package com.example.tech.service;

import com.example.tech.dto.request.ArticleReadRequest;
import com.example.tech.entity.ArticleEntity;
import com.example.tech.entity.ArticleReadEntity;
import com.example.tech.entity.UserEntity;
import com.example.tech.repository.ArticleReadRepository;
import com.example.tech.repository.ArticleRepository;
import com.example.tech.repository.UserRepository;
import jakarta.validation.ConstraintViolationException;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ArticleReadService {
    private final ArticleReadRepository articleReadRepository;
    private final UserRepository userRepository;
    private final ArticleRepository articleRepository;
    public Boolean isArticleRead(String userEmail, Long articleId) {
        UserEntity user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("ユーザーが見つかりません。"));

        Long userId = user.getId();

        return articleReadRepository.existsByUserIdAndArticleId(userId,articleId);
    }
    public void postArticleRead(String userEmail, ArticleReadRequest request) {
        UserEntity user = userRepository.findUserByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("ユーザーが見つかりません。"));

        Long userId = user.getId();

        //TODO // ★リレーションのArticleEntityを取得
        ArticleEntity article = articleRepository.findById(request.getArticleId())
                .orElseThrow(() ->new RuntimeException("記事が見つかりません。"));

        try {
            if (!articleReadRepository.existsByUserIdAndArticle_Id(userId, article.getId())) {
                ArticleReadEntity readEntity = new ArticleReadEntity();
                readEntity.setUserId(userId);
                readEntity.setArticle(article);
                readEntity.setReadAt(LocalDateTime.now());
                articleReadRepository.save(readEntity);
            }
        } catch (DataIntegrityViolationException e) {
            // SQLユニーク違反を握りつぶす
            System.out.println("既読登録重複: " + e.getMessage());
            return;
        }

    }

    @Transactional
    public boolean deleteArticleRead(String userEmail, Long articleId) {
        Long userId = userRepository.findUserByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("ユーザーが見つかりません。"))
                .getId();

        // 既読があるかを先に検索
        Optional<ArticleReadEntity> read = articleReadRepository.findByUserIdAndArticle_Id(userId, articleId);
        if (read.isPresent()) {
            articleReadRepository.delete(read.get());
            return true;
        }
        return false; // 無かったら何もしない（冪等）
    }
}
