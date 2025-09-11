package com.example.tech.service;

import com.example.tech.dto.ArticleDTO;
import com.example.tech.entity.ArticleEntity;
import com.example.tech.entity.LikeEntity;
import com.example.tech.entity.UserEntity;
import com.example.tech.repository.ArticleRepository;
import com.example.tech.repository.LikeRepository;
import com.example.tech.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class LikeService {
    private final LikeRepository likeRepository;
    private final UserRepository userRepository;
    private final ArticleRepository articleRepository;

    public void registerLike(String userEmail, Long articleId) {
        UserEntity user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("ユーザーが見つかりません。"));
        ArticleEntity article = articleRepository.findById(articleId)
                .orElseThrow(() -> new RuntimeException("記事が見つかりません。"));

        // すでにLikeがあるかチェック
        if (likeRepository.existsByUserIdAndArticleId(user.getId(), articleId)) {
            // 既にLike済みなら何もしない
            return;
        }

        LikeEntity like = new LikeEntity();

        like.setUser(user);
        like.setArticle(article);

        likeRepository.save(like);
    }

    public boolean findByUserIdAndArticleId(String userEmail, Long articleId) {
        UserEntity entity = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("ユーザーが見つかりません。"));

        Long userId = entity.getId();

        return likeRepository.existsByUserIdAndArticleId(userId, articleId);
    }

    public Long countByArticleId(Long articleId) {
        return likeRepository.countByArticleId(articleId);
    }

    public void deleteLike(String userEmail, Long articleId) {
        UserEntity entity = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("ユーザーが見つかりません。"));

        Long userId = entity.getId();
        likeRepository.deleteByUserIdAndArticleId(userId,articleId);
    }

    public Long countOnlyByArticleId(Long articleId) {
        return likeRepository.countByArticleId(articleId);
    }

    public List<ArticleDTO> likedArticles(String email) {
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() ->new RuntimeException("ユーザーが見つかりません"));
        Long userId = user.getId();
        return likeRepository.findLikedArticles(userId);
    }
}
