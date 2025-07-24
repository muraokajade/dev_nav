package com.example.tech.service;

import com.example.tech.dto.ReviewCommentDTO;
import com.example.tech.dto.request.ReviewCommentRequest;
import com.example.tech.entity.ArticleEntity;
import com.example.tech.entity.ReviewCommentEntity;
import com.example.tech.entity.UserEntity;
import com.example.tech.repository.ArticleRepository;
import com.example.tech.repository.ReviewCommentRepository;
import com.example.tech.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewCommentService {
    private final ReviewCommentRepository reviewCommentRepository;
    private final UserRepository userRepository;
    private final ArticleRepository articleRepository;

    public void postComment(ReviewCommentRequest request, String userEmail) {
        ReviewCommentEntity entity = new ReviewCommentEntity();
        UserEntity userEntity = userRepository.findUserByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("ユーザーが見つかりません。"));

        //TODO ReviewCommentEntity ManyToOne ArticleEntityリレーションにしたのでArticleEntityがあるかわからない
        //TODO Articleを下記でセットしなければならない。リレーションセット
        ArticleEntity article = articleRepository.findById(request.getArticleId())
                .orElseThrow(() -> new RuntimeException("記事が見つかりません。"));

        Long userId = userEntity.getId();

        //TODO　これはNPE
        //entity.getArticle().setId(request.getArticleId());
        entity.setArticle(article); //Idも含めてオブジェクトでarticleがセットされるのでリレーションを担保できた

        entity.setUserId(userId);
        entity.setComment(request.getComment());
        reviewCommentRepository.save(entity);
    }

    public List<ReviewCommentDTO> getAllCommentsById(Long articleId) {
        List<ReviewCommentEntity> entities = reviewCommentRepository.findAllCommentsByArticleId(articleId);

        return entities.stream().map(this::convertToDTO).toList();
    }

    private ReviewCommentDTO convertToDTO(ReviewCommentEntity entity) {
        ReviewCommentDTO dto = new ReviewCommentDTO();
        dto.setId(entity.getId());
        dto.setUserId(entity.getUserId());
        dto.setArticleId(entity.getArticle().getId());
        dto.setComment(entity.getComment());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        return dto;
    }

    public void putComment(Long id, ReviewCommentRequest request) {
        ReviewCommentEntity existing = reviewCommentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("コメントが見つかりません。"));

        existing.setComment(request.getComment());
        existing.setUpdatedAt(LocalDateTime.now());

        reviewCommentRepository.save(existing);
    }

    public void deleteComment(Long id) {
        ReviewCommentEntity existing = reviewCommentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("コメントが見つかりません。"));

        reviewCommentRepository.delete(existing);
    }
}
