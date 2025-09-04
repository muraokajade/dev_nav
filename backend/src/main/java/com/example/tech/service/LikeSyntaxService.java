package com.example.tech.service;

import com.example.tech.entity.LikeSyntaxEntity;
import com.example.tech.entity.UserEntity;
import com.example.tech.repository.LikeSyntaxRepository;
import com.example.tech.repository.UserRepository;
import com.example.tech.repository.SyntaxRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Service
@RequiredArgsConstructor
public class LikeSyntaxService {

    private final LikeSyntaxRepository likeSyntaxRepository;
    private final UserRepository userRepository;
    private final SyntaxRepository syntaxRepository;

    @PersistenceContext
    private EntityManager em;

    private String norm(String email) {
        return email == null ? null : email.trim().toLowerCase(Locale.ROOT);
    }

    @Transactional
    public void likeSyntax(String userEmail, Long syntaxId) {
        final String email = norm(userEmail);
        if (email == null || email.isBlank() || syntaxId == null) return;

        UserEntity user = userRepository.findByEmailIgnoreCase(email).orElse(null);
        if (user == null || !syntaxRepository.existsById(syntaxId)) return;

        Long userId = user.getId();
        if (likeSyntaxRepository.existsByUserIdAndSyntaxId(userId, syntaxId)) return;

        try {
            LikeSyntaxEntity e = LikeSyntaxEntity.ofUserIdAndSyntaxId(userId, syntaxId, em);
            likeSyntaxRepository.save(e);
        } catch (DataIntegrityViolationException ex) {
            if (!likeSyntaxRepository.existsByUserIdAndSyntaxId(userId, syntaxId)) throw ex;
        }
    }

    @Transactional
    public void unlikeSyntax(String userEmail, Long syntaxId) {
        final String email = norm(userEmail);
        if (email == null || email.isBlank() || syntaxId == null) return;
        userRepository.findByEmailIgnoreCase(email).ifPresent(u ->
                likeSyntaxRepository.deleteByUserIdAndSyntaxId(u.getId(), syntaxId)
        );
    }

    @Transactional(readOnly = true)
    public boolean isLiked(String userEmail, Long syntaxId) {
        final String email = norm(userEmail);
        if (email == null || email.isBlank() || syntaxId == null) return false;
        return userRepository.findByEmailIgnoreCase(email)
                .map(u -> likeSyntaxRepository.existsByUserIdAndSyntaxId(u.getId(), syntaxId))
                .orElse(false);
    }

    @Transactional(readOnly = true)
    public long countLikes(Long syntaxId) {
        if (syntaxId == null) return 0L;
        return likeSyntaxRepository.countBySyntaxId(syntaxId);
    }
}
