package com.example.tech.service;

import com.example.tech.dto.UserStatusDTO;
import com.example.tech.repository.ArticleRepository;
import com.example.tech.repository.LikeRepository;
import com.example.tech.repository.ReviewCommentRepository;
import com.example.tech.repository.ReviewScoreRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@Transactional
@RequiredArgsConstructor
public class UserStatusService {
    private final ArticleRepository articleRepository;
    private final ReviewScoreRepository reviewScoreRepository;
    private final LikeRepository likeRepository;
    private final ReviewCommentRepository reviewCommentRepository;

    public UserStatusDTO getStatus(Long userId) {
        // 1. 各種累計取得
        int articlesRead = articleRepository.countByUserId(userId);
        int reviews = reviewScoreRepository.countByUserId(userId);
        int likes = likeRepository.countByUserId(userId);
        int comments = reviewCommentRepository.countByUserId(userId);

        // 2. レベル・経験値計算例（超シンプルver）
        int exp = articlesRead * 10 + reviews * 10 + likes * 5 + comments * 3; // ポイント合計
        int level = exp / 100 + 1;
        int expPercent = exp % 100;

        // 3. TODO DTOにまとめて返す
        return new UserStatusDTO(articlesRead, reviews, likes, comments, level, expPercent);

    }
}
