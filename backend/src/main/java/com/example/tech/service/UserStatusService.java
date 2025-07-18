package com.example.tech.service;

import com.example.tech.dto.ActionHistoryDTO;
import com.example.tech.dto.ArticleDTO;
import com.example.tech.dto.CalendarActionDTO;
import com.example.tech.dto.UserStatusDTO;
import com.example.tech.dto.request.ArticleReadRequest;
import com.example.tech.entity.ArticleReadEntity;
import com.example.tech.entity.ReviewCommentEntity;
import com.example.tech.entity.UserEntity;
import com.example.tech.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Stream;

@Service
@Transactional
@RequiredArgsConstructor
public class UserStatusService {
    private final ArticleRepository articleRepository;
    private final ReviewScoreRepository reviewScoreRepository;
    private final LikeRepository likeRepository;
    private final ReviewCommentRepository reviewCommentRepository;
    private final UserRepository userRepository;
    private final ArticleReadRepository articleReadRepository;
    public UserStatusDTO getStatus(Long userId) {
        // 1. 各種累計取得
        int articlesRead = articleReadRepository.countByUserId(userId);
        int reviews = reviewScoreRepository.countByUserId(userId);
        int likes = likeRepository.countByUserId(userId);
        int comments = reviewCommentRepository.countByUserId(userId);

        // 2. レベル・経験値計算例（超シンプルver）
        int exp = articlesRead * 10 + reviews * 10 + likes * 5 + comments * 3; // ポイント合計
        int level = exp / 100 + 1;
        int expPercent = exp % 100;

        List<ArticleDTO> likedArticles = articleRepository.findLikedArticlesByUserId(userId);

        // 3. TODO DTOにまとめて返す
        return new UserStatusDTO(articlesRead, reviews, likes, comments, level, expPercent,likedArticles);

    }

    public List<CalendarActionDTO> getCalendarActions(String userEmail, int year, int month) {
        UserEntity entity = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("ユーザーが見つかりません。"));

        Long userId = entity.getId();

        // 例: year=2024, month=7 なら 2024-07-01 となる
        LocalDate start = LocalDate.of(year, month, 1);
        // 例: start=2024-07-01 なら start.lengthOfMonth() は31 -> 2024-07-31
        LocalDate end = start.withDayOfMonth(start.lengthOfMonth());

        // ② 各アクションの「日付ごと集計」List<CalendarActionDTO>を取得
        List<CalendarActionDTO> reviewScores = reviewScoreRepository
                .findDailyReviewScoreActions(userId,start.atStartOfDay(),end.atTime(23,59,59));
        List<CalendarActionDTO> reviewComments = reviewCommentRepository
                .findDailyReviewCommentActions(userId, start.atStartOfDay(), end.atTime(23,59,59));
        List<CalendarActionDTO> likes = likeRepository
                .findDailyLikesActions(userId,start.atStartOfDay(), end.atTime(23,59,59));

        // ③ 日付ごとに合算（Mapで(Map<LocalDate, Integer>)日付単位に足し合わせ）
        Map<LocalDate, Integer> dateActionMap = new HashMap<>();
        for(var dto: reviewScores) dateActionMap.merge(dto.getDate(), dto.getActions(), Integer::sum);
        for (var dto : reviewComments) dateActionMap.merge(dto.getDate(), dto.getActions(), Integer::sum);
        for (var dto : likes)    dateActionMap.merge(dto.getDate(), dto.getActions(), Integer::sum);
        // ④ カレンダー表示のため、月の日付全てに対して「0埋め」しておく（任意）
        List<CalendarActionDTO> result = new ArrayList<>();
        for(int day = 1; day <= start.lengthOfMonth(); day++) {
            LocalDate d = LocalDate.of(year,month,day);
            int actions = dateActionMap.getOrDefault(d,0);
            result.add(new CalendarActionDTO(d, (long)actions));
        }
        return result;
    }

    public List<ActionHistoryDTO> getActionHistories(String userEmail, int limit) {
        UserEntity user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("ユーザーがいません。"));
        Long userId = user.getId();

        PageRequest pageRequest = PageRequest.of(0, limit); // limit件だけ
        List<ReviewCommentEntity> reviewCommentEntities = reviewCommentRepository
                .findByUserIdOrderByCreatedAtDesc(userId, pageRequest);
        List<ArticleReadEntity> articleReadEntities = articleReadRepository
                .findByUserIdOrderByReadAtDesc(userId,pageRequest);

        List<ActionHistoryDTO> readHistoryList = articleReadEntities
                .stream()
                .map(r -> new ActionHistoryDTO(
                        "read",
                        null,
                        r.getReadAt(),
                        r.getArticle().getTitle(),
                        r.getArticle().getId()
                )).toList();

        List<ActionHistoryDTO> commentHistoryDTOList = reviewCommentEntities
                .stream()
                .map(r -> new ActionHistoryDTO(
                        "comment",
                        r.getComment(),
                        r.getCreatedAt(),
                        r.getArticle().getTitle(),
                        r.getArticle().getId()
                ))
                .toList();

        //TODOさっぱりわからんの出現
        List<ActionHistoryDTO> merged = Stream.concat(commentHistoryDTOList.stream(),readHistoryList.stream())
                .sorted(Comparator.comparing(ActionHistoryDTO::getDate).reversed())
                .limit(limit)
                .toList();

        return merged;


    }

}
