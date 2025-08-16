package com.example.tech.service;

import aj.org.objectweb.asm.commons.Remapper;
import com.example.tech.dto.ReviewScoreDTO;
import com.example.tech.dto.request.ReviewScoreRequest;
import com.example.tech.entity.*;
import com.example.tech.enums.TargetType;
import com.example.tech.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ReviewScoreService {
    private final UserRepository userRepository;
    private final ArticleRepository articleRepository;
    private final SyntaxRepository syntaxRepository;
    private final ProcedureRepository procedureRepository;
    private final ReviewScoreRepository reviewScoreRepository;

    public void postReviewScore(ReviewScoreRequest request, String userEmail) {
        UserEntity user = userRepository.findUserByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("ユーザーが見つかりません。"));

        Long userId = user.getId();

        Optional<ReviewScoreEntity> existing = reviewScoreRepository.findByUserIdAndArticle_Id(userId, request.getRefId());

        if (existing.isPresent()) {
            throw new RuntimeException("既にレビュー済みです");
        }

        //
        ArticleEntity article = articleRepository.findById(request.getRefId())
                .orElseThrow(() -> new RuntimeException("記事が見つかりません、"));

        ReviewScoreEntity entity = new ReviewScoreEntity();
        entity.setArticle(article);
        entity.setUser(user);
        entity.setScore(request.getScore());

        reviewScoreRepository.save(entity);
    }

    public ReviewScoreDTO getMyScore(Long articleId, String userEmail) {
        UserEntity user = userRepository.findUserByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("ユーザーが見つかりません。"));
        Long userId = user.getId();

        Optional<ReviewScoreEntity> scoreOpt = reviewScoreRepository.findByUserIdAndArticle_Id(userId, articleId);

        return scoreOpt.map(this::convertToDTO).orElse(null);
    }

    private ReviewScoreDTO convertToDTO(ReviewScoreEntity entity) {
        ReviewScoreDTO dto = new ReviewScoreDTO();
        dto.setId(entity.getId());
        dto.setArticleId(entity.getArticle().getId());
        dto.setUserId(entity.getUser().getId());
        dto.setScore(entity.getScore());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        return dto;

    }

    public List<ReviewScoreDTO> getAllReviewScore(Long articleId) {
        List<ReviewScoreEntity> reviewScoreEntities = reviewScoreRepository.findScoresByArticleId(articleId);

        return reviewScoreEntities
                .stream()
                .map(this::convertToDTO)
                .toList();
    }

    public void putReviewScore(ReviewScoreRequest request, String userEmail) {
        UserEntity userEntity = userRepository.findUserByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("ユーザーが見つかりません。"));

        Long userId = userEntity.getId();

        Optional<ReviewScoreEntity> existingOpt = reviewScoreRepository.findByUserIdAndArticle_Id(userId, request.getRefId());

        if (existingOpt.isPresent()) {
            ReviewScoreEntity entity = existingOpt.get();
            entity.setScore(request.getScore());
            entity.setUpdatedAt(LocalDateTime.now());
            reviewScoreRepository.save(entity);
        } else {
            throw new RuntimeException("レビューが存在しません。");
        }

    }

    public void postReviewScoreForTarget(TargetType type, Long refId, ReviewScoreRequest request, String userEmail) {
        // typeに応じて Article / Syntax / Procedure に分岐
        switch (type) {
            case ARTICLE -> postArticleReviewScore(refId, request, userEmail);
            case SYNTAX -> postSyntaxReviewScore(refId, request, userEmail);
            case PROCEDURE -> postProcedureReviewScore(refId, request, userEmail);
        }
    }

    // Article
    public void postArticleReviewScore(Long refId, ReviewScoreRequest request, String userEmail) {
        UserEntity user = userRepository.findUserByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("ユーザーが存在しません"));

        ArticleEntity article = articleRepository.findById(refId)
                .orElseThrow(() -> new RuntimeException("記事が存在しません"));

        ReviewScoreEntity score = new ReviewScoreEntity();
        score.setUser(user);
        score.setArticle(article);
        score.setTargetType(TargetType.ARTICLE);
        score.setSyntax(null);
        score.setProcedure(null);
        score.setScore(request.getScore());

        reviewScoreRepository.save(score);
    }

    // Syntax
    public void postSyntaxReviewScore(Long refId, ReviewScoreRequest request, String userEmail) {
        UserEntity user = userRepository.findUserByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("ユーザーが存在しません"));

        SyntaxEntity syntax = syntaxRepository.findById(refId)
                .orElseThrow(() -> new RuntimeException("構文記事が存在しません"));

        ReviewScoreEntity score = new ReviewScoreEntity();
        score.setUser(user);
        score.setArticle(null);
        score.setSyntax(syntax);
        score.setTargetType(TargetType.SYNTAX);

        score.setProcedure(null);
        score.setScore(request.getScore());

        reviewScoreRepository.save(score);
    }

    // Procedure
    public void postProcedureReviewScore(Long refId, ReviewScoreRequest request, String userEmail) {
        UserEntity user = userRepository.findUserByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("ユーザーが存在しません"));

        ProcedureEntity procedure = procedureRepository.findById(refId)
                .orElseThrow(() -> new RuntimeException("手順記事が存在しません"));

        ReviewScoreEntity score = new ReviewScoreEntity();
        score.setUser(user);
        score.setArticle(null);
        score.setSyntax(null);
        score.setProcedure(procedure);
        score.setTargetType(TargetType.PROCEDURE);

        score.setScore(request.getScore());

        reviewScoreRepository.save(score);
    }

    public List<ReviewScoreDTO> getReviewScores(TargetType type, Long refId) {
        List<ReviewScoreEntity> entities = switch (type) {
            case ARTICLE -> reviewScoreRepository.findByArticle_Id(refId);
            case SYNTAX -> reviewScoreRepository.findBySyntax_Id(refId);
            case PROCEDURE -> reviewScoreRepository.findByProcedure_Id(refId);
            default -> throw new IllegalArgumentException("Invalid type: " + type);
        };

        return entities.stream()
                .map(rs -> new ReviewScoreDTO(
                        rs.getId(),
                        rs.getScore(),
                        switch (rs.getTargetType()) {
                            case ARTICLE -> rs.getArticle() != null ? rs.getArticle().getId() : null;
                            case SYNTAX -> rs.getSyntax() != null ? rs.getSyntax().getId() : null;
                            case PROCEDURE -> rs.getProcedure() != null ? rs.getProcedure().getId() : null;
                            default -> null;
                        },
                        rs.getTargetType().name()
                ))
                .toList();
    }


    public void updateReviewScoreForTarget(TargetType targetType, Long refId, ReviewScoreRequest request, String userEmail) {
        // 1. userEmail から user を特定
        UserEntity user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 2. 既存レビュー取得
        ReviewScoreEntity score = switch (targetType) {
            case ARTICLE -> reviewScoreRepository
                    .findByTargetTypeAndArticle_IdAndUser_Id(targetType, refId, user.getId())
                    .orElseThrow(() -> new RuntimeException("Review not found"));
            case SYNTAX -> reviewScoreRepository
                    .findByTargetTypeAndSyntax_IdAndUser_Id(targetType, refId, user.getId())
                    .orElseThrow(() -> new RuntimeException("Review not found"));
            case PROCEDURE -> reviewScoreRepository
                    .findByTargetTypeAndProcedure_IdAndUser_Id(targetType, refId, user.getId())
                    .orElseThrow(() -> new RuntimeException("Review not found"));
        };

        // 3. 更新
        score.setScore(request.getScore());
        reviewScoreRepository.save(score);
    }

    public Optional<ReviewScoreEntity> findMyScore(TargetType type, Long refId, String userEmail) {
        UserEntity user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return switch (type) {
            case ARTICLE ->
                    reviewScoreRepository.findByTargetTypeAndArticle_IdAndUser_Id(type, refId, user.getId());
            case SYNTAX ->
                    reviewScoreRepository.findByTargetTypeAndSyntax_IdAndUser_Id(type, refId, user.getId());
            case PROCEDURE ->
                    reviewScoreRepository.findByTargetTypeAndProcedure_IdAndUser_Id(type, refId, user.getId());
        };
    }


}

