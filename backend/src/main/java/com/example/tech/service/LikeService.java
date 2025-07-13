package com.example.tech.service;

import com.example.tech.entity.LikeEntity;
import com.example.tech.entity.UserEntity;
import com.example.tech.repository.LikeRepository;
import com.example.tech.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@Transactional
@RequiredArgsConstructor
public class LikeService {
    private final LikeRepository likeRepository;
    private final UserRepository userRepository;
    public void registerLike(String userEmail, Long articleId) {
        UserEntity user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("ユーザーが見つかりません。"));

        Long userId = user.getId();

        LikeEntity like = new LikeEntity();
        like.setUserId(userId);
        like.setArticleId(articleId);

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
        //TODO下記はだめな理由
//        LikeEntity likeEntity = new LikeEntity();
//        likeEntity.setUserId(userId);
//        likeEntity.setArticleId(articleId);
//
//        likeRepository.delete(likeEntity);
    }

    public Long countOnlyByArticleId(Long articleId) {
        return likeRepository.countByArticleId(articleId);
    }
}
