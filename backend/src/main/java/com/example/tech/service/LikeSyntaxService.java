// src/main/java/com/example/tech/service/LikeSyntaxService.java
package com.example.tech.service;

import com.example.tech.entity.LikeSyntaxEntity;
import com.example.tech.entity.UserEntity;
import com.example.tech.repository.LikeSyntaxRepository;
import com.example.tech.repository.SyntaxRepository;
import com.example.tech.repository.UserRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Slf4j
@Service
@RequiredArgsConstructor
public class LikeSyntaxService {

    private final LikeSyntaxRepository likeSyntaxRepository;
    private final UserRepository userRepository;
    private final SyntaxRepository syntaxRepository;

    @PersistenceContext
    private EntityManager em; // saveフォールバック時に使う

    private String norm(String s) { return s == null ? null : s.trim().toLowerCase(Locale.ROOT); }

    /** 冪等：ユーザー無し/対象無し/重複でも 500 を出さない */
    @Transactional
    public void likeSyntax(String userEmail, Long syntaxId) {
        final String email = norm(userEmail);
        if (email == null || email.isBlank() || syntaxId == null) return;

        UserEntity user = userRepository.findByEmailIgnoreCase(email).orElse(null);
        if (user == null) { log.warn("likeSyntax: user not found email={}", email); return; }
        if (!syntaxRepository.existsById(syntaxId)) { log.warn("likeSyntax: syntax not found id={}", syntaxId); return; }

        try {
            // 正常系：UNIQUE 前提のUPSERT（重複でも例外にしない）
            likeSyntaxRepository.upsertLike(user.getId(), syntaxId);
        } catch (org.springframework.dao.InvalidDataAccessResourceUsageException ex) {
            // 例：42P10（ユニーク無し環境）→ フォールバック
            if (!likeSyntaxRepository.existsByUser_IdAndSyntax_Id(user.getId(), syntaxId)) {
                try {
                    LikeSyntaxEntity e = LikeSyntaxEntity.ofUserIdAndSyntaxId(user.getId(), syntaxId, em);
                    likeSyntaxRepository.save(e);
                } catch (org.springframework.dao.DataIntegrityViolationException dup) {
                    // 競合は握りつぶし（Wチェック）
                    if (!likeSyntaxRepository.existsByUser_IdAndSyntax_Id(user.getId(), syntaxId)) throw dup;
                }
            }
        }
    }

    /** 冪等：無ければ何もしない */
    @Transactional
    public void unlikeSyntax(String userEmail, Long syntaxId) {
        final String email = norm(userEmail);
        if (email == null || email.isBlank() || syntaxId == null) return;
        userRepository.findByEmailIgnoreCase(email).ifPresent(u ->
                likeSyntaxRepository.deleteByUser_IdAndSyntax_Id(u.getId(), syntaxId)
        );
    }

    @Transactional(readOnly = true)
    public boolean isLiked(String userEmail, Long syntaxId) {
        final String email = norm(userEmail);
        if (email == null || email.isBlank() || syntaxId == null) return false;
        return userRepository.findByEmailIgnoreCase(email)
                .map(u -> likeSyntaxRepository.existsByUser_IdAndSyntax_Id(u.getId(), syntaxId))
                .orElse(false);
    }

    @Transactional(readOnly = true)
    public long countLikes(Long syntaxId) {
        if (syntaxId == null) return 0L;
        return likeSyntaxRepository.countBySyntax_Id(syntaxId);
    }
}
