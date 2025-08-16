package com.example.tech.service;

import com.example.tech.entity.LikeSyntaxEntity;
import com.example.tech.entity.SyntaxEntity;
import com.example.tech.entity.UserEntity;
import com.example.tech.repository.LikeSyntaxRepository;
import com.example.tech.repository.SyntaxRepository;
import com.example.tech.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class LikeSyntaxService {

    private final LikeSyntaxRepository likeSyntaxRepository;
    private final SyntaxRepository syntaxRepository;
    private final UserRepository userRepository;

    @Transactional
    public void likeSyntax(String userEmail, Long syntaxId) {
        UserEntity user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        SyntaxEntity syntax = syntaxRepository.findById(syntaxId)
                .orElseThrow(() -> new IllegalArgumentException("Syntax not found"));

        if (!likeSyntaxRepository.existsByUserAndSyntax(user, syntax)) {
            LikeSyntaxEntity like = new LikeSyntaxEntity();
            like.setUser(user);
            like.setSyntax(syntax);
            likeSyntaxRepository.save(like);
        }
    }

    @Transactional
    public void unlikeSyntax(String userEmail, Long syntaxId) {
        UserEntity user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        SyntaxEntity syntax = syntaxRepository.findById(syntaxId)
                .orElseThrow(() -> new IllegalArgumentException("Syntax not found"));

        likeSyntaxRepository.findAll().stream()
                .filter(l -> l.getUser().equals(user) && l.getSyntax().equals(syntax))
                .findFirst()
                .ifPresent(likeSyntaxRepository::delete);
    }

    public boolean isLiked(String userEmail, Long syntaxId) {
        UserEntity user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        SyntaxEntity syntax = syntaxRepository.findById(syntaxId)
                .orElseThrow(() -> new IllegalArgumentException("Syntax not found"));
        return likeSyntaxRepository.existsByUserAndSyntax(user, syntax);
    }

    public long countLikes(Long syntaxId) {
        SyntaxEntity syntax = syntaxRepository.findById(syntaxId)
                .orElseThrow(() -> new IllegalArgumentException("Syntax not found"));
        return likeSyntaxRepository.countBySyntax(syntax);
    }
}
